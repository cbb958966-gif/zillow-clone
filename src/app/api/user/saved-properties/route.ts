import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { authOptions } from '@/lib/auth';

// Helper function to get user from token
async function getUserFromRequest(request: NextRequest) {
  // First try JWT token
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');
  
  if (token && token !== 'google-oauth') {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
      return decoded.userId;
    } catch (error) {
      // Token invalid, try session
    }
  }

  // Try NextAuth session - use the request to get session
  try {
    const { getServerSession } = await import('next-auth');
    const session = await getServerSession(authOptions);
    if (session?.user?.id) {
      return session.user.id as string;
    }
  } catch (error) {
    console.error('Session error:', error);
  }

  return null;
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserFromRequest(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const savedProperties = await prisma.savedProperty.findMany({
      where: { userId },
      include: {
        property: {
          include: {
            images: {
              where: { isPrimary: true },
              take: 1
            },
            agent: {
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                    email: true,
                    phone: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      data: savedProperties.map(sp => sp.property)
    });
  } catch (error) {
    console.error('Error fetching saved properties:', error);
    return NextResponse.json(
      { error: 'Failed to fetch saved properties' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserFromRequest(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { propertyId } = await request.json();

    if (!propertyId) {
      return NextResponse.json(
        { error: 'Property ID is required' },
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

    // Check if already saved
    const existingSaved = await prisma.savedProperty.findUnique({
      where: {
        userId_propertyId: {
          userId,
          propertyId
        }
      }
    });

    if (existingSaved) {
      return NextResponse.json(
        { error: 'Property already saved' },
        { status: 409 }
      );
    }

    // Save property
    const savedProperty = await prisma.savedProperty.create({
      data: {
        userId,
        propertyId
      }
    });

    return NextResponse.json({
      success: true,
      data: savedProperty,
      message: 'Property saved successfully'
    });
  } catch (error) {
    console.error('Error saving property:', error);
    return NextResponse.json(
      { error: 'Failed to save property' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = await getUserFromRequest(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId');

    if (!propertyId) {
      return NextResponse.json(
        { error: 'Property ID is required' },
        { status: 400 }
      );
    }

    await prisma.savedProperty.delete({
      where: {
        userId_propertyId: {
          userId,
          propertyId
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Property removed from saved list'
    });
  } catch (error) {
    console.error('Error removing saved property:', error);
    return NextResponse.json(
      { error: 'Failed to remove saved property' },
      { status: 500 }
    );
  }
}