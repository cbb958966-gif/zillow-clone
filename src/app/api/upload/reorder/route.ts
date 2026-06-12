import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
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
    const user = await getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { propertyId, imageOrder } = body;

    if (!propertyId || !Array.isArray(imageOrder) || imageOrder.length === 0) {
      return NextResponse.json(
        { error: 'Property ID and image order array are required' },
        { status: 400 }
      );
    }

    // Check property permissions
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

    const canEdit = user.role === 'ADMIN' || 
                   (property.agentId && property.agent?.userId === user.id);

    if (!canEdit) {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      );
    }

    const updates = [];
    const errors = [];

    for (let i = 0; i < imageOrder.length; i++) {
      try {
        const imageId = imageOrder[i];
        
        await prisma.propertyImage.update({
          where: { id: imageId },
          data: { order: i }
        });

        updates.push({ id: imageId, newOrder: i });

      } catch (error) {
        errors.push({
          imageId: imageOrder[i],
          error: error instanceof Error ? error.message : 'Failed to update'
        });
      }
    }

    return NextResponse.json({
      success: true,
      updatedCount: updates.length,
      updates,
      errors,
      message: `Successfully reordered ${updates.length} images`
    });

  } catch (error) {
    console.error('Reorder images error:', error);
    return NextResponse.json(
      { error: 'Failed to reorder images', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}