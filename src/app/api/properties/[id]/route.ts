import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'
import { jwtVerify } from 'jose'

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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const property = await prisma.property.findUnique({
      where: { id: id },
      include: {
        images: {
          orderBy: [
            { isPrimary: 'desc' },
            { order: 'asc' }
          ]
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
    })

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(property)
  } catch (error) {
    console.error('Error fetching property:', error)
    return NextResponse.json(
      { error: 'Failed to fetch property' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  // Verify authentication and admin role
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  if (user.role !== 'ADMIN' && user.role !== 'admin') {
    return NextResponse.json({ error: 'Permission denied. Admin only.' }, { status: 403 });
  }
  
  try {
    const body = await request.json()
    
    const property = await prisma.property.update({
      where: { id: id },
      data: {
        ...body,
        price: parseFloat(body.price),
        lat: parseFloat(body.lat),
        lng: parseFloat(body.lng),
        beds: body.beds ? parseInt(body.beds) : null,
        baths: body.baths ? parseFloat(body.baths) : null,
        sqft: body.sqft ? parseInt(body.sqft) : null,
        lotSize: body.lotSize ? parseFloat(body.lotSize) : null,
        yearBuilt: body.yearBuilt ? parseInt(body.yearBuilt) : null,
      },
      include: {
        images: true,
        agent: true
      }
    })

    return NextResponse.json(property)
  } catch (error) {
    console.error('Error updating property:', error)
    return NextResponse.json(
      { error: 'Failed to update property' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  // Verify authentication and admin role
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  if (user.role !== 'ADMIN' && user.role !== 'admin') {
    return NextResponse.json({ error: 'Permission denied. Admin only.' }, { status: 403 });
  }
  
  try {
    await prisma.property.delete({
      where: { id: id }
    })

    return NextResponse.json({ message: 'Property deleted successfully' })
  } catch (error) {
    console.error('Error deleting property:', error)
    return NextResponse.json(
      { error: 'Failed to delete property' },
      { status: 500 }
    )
  }
}