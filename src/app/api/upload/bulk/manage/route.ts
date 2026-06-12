import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { deleteImage } from '@/lib/cloudinary';
import { headers } from 'next/headers';
import { jwtVerify } from 'jose';
import { auth } from '@/lib/auth';

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

export async function DELETE(request: NextRequest) {
  try {
    // Verify authentication
    const user = await getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { imageIds, propertyId } = body;

    if (!imageIds || !Array.isArray(imageIds) || imageIds.length === 0) {
      return NextResponse.json(
        { error: 'Image IDs array is required' },
        { status: 400 }
      );
    }

    // Get property for permission check
    let canEdit = false;
    if (propertyId) {
      const property = await prisma.property.findUnique({
        where: { id: propertyId },
        include: { agent: true }
      });

      if (property) {
        canEdit = user.role === 'ADMIN' || !!(
                  property.agentId && property.agent?.userId === user.id);
      }
    } else {
      // Admin can delete any images
      canEdit = user.role === 'ADMIN';
    }

    if (!canEdit && propertyId) {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      );
    }

    const deletedImages = [];
    const errors = [];

    for (const imageId of imageIds) {
      try {
        // Get image data before deletion
        const image = await prisma.propertyImage.findUnique({
          where: { id: imageId }
        });

        if (!image) {
          errors.push({ imageId, error: 'Image not found' });
          continue;
        }

        // Verify user owns this image if not admin
        if (user.role !== 'ADMIN' && image.uploadedBy !== user.id) {
          errors.push({ imageId, error: 'Permission denied for this image' });
          continue;
        }

        // Delete from Cloudinary
        if (image.publicId) {
          const cloudinaryResult = await deleteImage(image.publicId);
          if (!cloudinaryResult) {
            console.warn(`Failed to delete image from Cloudinary: ${image.publicId}`);
          }
        }

        // Delete from database
        await prisma.propertyImage.delete({
          where: { id: imageId }
        });

        // Also delete from media library
        await prisma.mediaLibrary.deleteMany({
          where: { publicId: image.publicId }
        });

        deletedImages.push({
          id: imageId,
          publicId: image.publicId,
          url: image.url
        });

      } catch (error) {
        console.error(`Error deleting image ${imageId}:`, error);
        errors.push({
          imageId,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return NextResponse.json({
      success: true,
      deletedCount: deletedImages.length,
      deletedImages,
      errors,
      totalRequested: imageIds.length,
      message: `Successfully deleted ${deletedImages.length} image(s)`
    });

  } catch (error) {
    console.error('Bulk delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete images', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Update image metadata
export async function PUT(request: NextRequest) {
  try {
    const user = await auth();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { imageId, metadata } = body;

    if (!imageId || !metadata) {
      return NextResponse.json(
        { error: 'Image ID and metadata are required' },
        { status: 400 }
      );
    }

    // Get image for permission check
    const existingImage = await prisma.propertyImage.findUnique({
      where: { id: imageId },
      include: { property: { include: { agent: true } } }
    });

    if (!existingImage) {
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      );
    }

    // Check permissions
    const canEdit = user.role === 'ADMIN' || 
                   (existingImage.property.agentId && existingImage.property.agent?.userId === user.id) ||
                   existingImage.uploadedBy === user.id;

    if (!canEdit) {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      );
    }

    const updatedImage = await prisma.propertyImage.update({
      where: { id: imageId },
      data: {
        tags: metadata.tags || existingImage.tags,
        alt: metadata.alt || existingImage.alt,
        description: metadata.description || existingImage.description,
        isPrimary: metadata.isPrimary !== undefined ? metadata.isPrimary : existingImage.isPrimary,
        featured: metadata.featured !== undefined ? metadata.featured : existingImage.featured,
        order: metadata.order !== undefined ? metadata.order : existingImage.order,
        updatedAt: new Date()
      }
    });

    // Update media library if publicId exists
    if (existingImage.publicId) {
      await prisma.mediaLibrary.updateMany({
        where: { publicId: existingImage.publicId },
        data: {
          tags: metadata.tags || existingImage.tags,
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: updatedImage,
      message: 'Image metadata updated successfully'
    });

  } catch (error) {
    console.error('Update image metadata error:', error);
    return NextResponse.json(
      { error: 'Failed to update image metadata', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}