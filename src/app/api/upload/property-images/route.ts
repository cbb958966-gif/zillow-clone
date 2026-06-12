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

    // Check if property exists
    const property = await prisma.property.findUnique({
      where: { id: propertyId }
    });

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    // Check permissions (admin or agent)
    const canEdit = user.role === 'ADMIN' || user.role === 'admin';
    if (!canEdit) {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      );
    }

    const uploadedImages = [];

    // Upload each image
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          { error: `Invalid file type for ${file.name}. Only JPEG, PNG, and WebP are allowed.` },
          { status: 400 }
        );
      }

      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json(
          { error: `File ${file.name} is too large. Maximum size is 10MB.` },
          { status: 400 }
        );
      }

      const result = await uploadImage(file, `real-estate-properties/${propertyId}`);
      
      const propertyImage = await prisma.propertyImage.create({
        data: {
          propertyId,
          url: result.url,
          isPrimary: i === primaryIndex,
          order: i,
        },
      });

      uploadedImages.push({
        ...propertyImage,
        uploadInfo: result,
      });
    }

    return NextResponse.json({
      success: true,
      data: uploadedImages,
      message: `${uploadedImages.length} images uploaded successfully`,
    });

  } catch (error) {
    console.error('Property images upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload property images' },
      { status: 500 }
    );
  }
}

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
    });

    return NextResponse.json({
      success: true,
      data: images,
    });

  } catch (error) {
    console.error('Error fetching property images:', error);
    return NextResponse.json(
      { error: 'Failed to fetch property images' },
      { status: 500 }
    );
  }
}