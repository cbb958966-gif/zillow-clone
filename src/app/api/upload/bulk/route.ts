import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { uploadImage } from '@/lib/cloudinary';
import { headers } from 'next/headers';
import { jwtVerify } from 'jose';

async function getUser() {
  try {
    const headersList = await headers();
    const authHeader = headersList.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    
    const token = authHeader.split(' ')[1];
    const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-key');
    const { payload } = await jwtVerify(token, JWT_SECRET);
    
    return {
      id: payload.sub as string,
      email: payload.email as string,
      role: payload.role as string,
    };
  } catch (error) {
    console.error('Auth error:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const user = await getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const propertyId = formData.get('propertyId') as string;
    const files = formData.getAll('files') as File[];
    const primaryIndex = parseInt(formData.get('primaryIndex') as string || '0');
    const tags = JSON.parse(formData.get('tags') as string || '[]');
    const descriptions = JSON.parse(formData.get('descriptions') as string || '{}');

    if (!propertyId) {
      return NextResponse.json(
        { error: 'Property ID is required' },
        { status: 400 }
      );
    }

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    // Check if property exists and user has permission
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      include: { agent: true }
    });

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    // Check permissions (admin or property owner)
    const canEdit = user.role === 'ADMIN' || user.role === 'admin' || 
                   (property.agentId && property.agent?.userId === user.id);

    if (!canEdit) {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      );
    }

    const uploadedImages = [];
    const errors = [];

    // Upload each image
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      try {
        // Enhanced validation
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
        if (!allowedTypes.includes(file.type)) {
          throw new Error(`Invalid file type for ${file.name}. Only JPEG, PNG, WebP, and AVIF are allowed.`);
        }

        // Optimized file size for free tier (5MB per image)
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`File ${file.name} is too large. Maximum size is 5MB for optimal performance.`);
        }

        // Optimized folder structure for organization
        const folderPath = `real-estate-properties/${propertyId}/gallery`;
        
        const result = await uploadImage(file, folderPath, {
          context: { 
            property_id: propertyId,
            uploaded_by: user.id,
            upload_index: i.toString()
          },
          tags: tags[i] || '',
          caption: descriptions[i] || ''
        });
        
        const propertyImage = await prisma.propertyImage.create({
          data: {
            propertyId,
            url: result.url,
            publicId: result.publicId,
            filename: result.filename,
            size: result.size,
            format: result.format,
            width: result.width,
            height: result.height,
            isPrimary: i === primaryIndex,
            order: i,
            tags: tags[i] || null,
            alt: descriptions[i] || null,
            description: descriptions[i] || null,
            uploadedBy: user.id,
            metadata: JSON.stringify({
              uploadDate: new Date().toISOString(),
              uploaderRole: user.role,
              originalSize: file.size,
              compressedSize: result.size,
              compressionRatio: ((file.size - result.size) / file.size * 100).toFixed(2) + '%'
            })
          },
        });

        uploadedImages.push({
          ...propertyImage,
          uploadInfo: result,
        });

      } catch (error) {
        console.error(`Error uploading file ${file.name}:`, error);
        errors.push({
          filename: file.name,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Update media library
    for (const image of uploadedImages) {
      await prisma.mediaLibrary.create({
        data: {
          publicId: image.publicId || '',
          url: image.url,
          filename: image.filename || '',
          size: image.size || 0,
          format: image.format || '',
          width: image.width || 0,
          height: image.height || 0,
          tags: image.tags || null,
          metadata: image.metadata || null,
          folder: `real-estate-properties/${propertyId}`,
          uploadedBy: user.id,
        }
      });
    }

    const response = {
      success: true,
      data: uploadedImages,
      message: `${uploadedImages.length} images uploaded successfully`,
      uploadedCount: uploadedImages.length,
      errors,
      totalCount: files.length,
      creditsUsed: uploadedImages.length, // Estimate for free tier monitoring
    };

    if (errors.length > 0) {
      response.message += `, ${errors.length} files failed`;
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('Bulk upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload images', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Get bulk upload status and queue
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId');

    if (!propertyId) {
      return NextResponse.json(
        { error: 'Property ID is required' },
        { status: 400 }
      );
    }

    const images = await prisma.propertyImage.findMany({
      where: { propertyId },
      orderBy: [
        { isPrimary: 'desc' },
        { order: 'asc' }
      ],
      include: {
        property: {
          select: {
            id: true,
            title: true,
            address: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: images,
      count: images.length,
      primaryImage: images.find(img => img.isPrimary),
      galleryImages: images.filter(img => !img.isPrimary),
    });

  } catch (error) {
    console.error('Error fetching bulk upload status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch upload status' },
      { status: 500 }
    );
  }
}