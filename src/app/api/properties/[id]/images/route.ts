import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'
import { jwtVerify } from 'jose'

async function getUser() {
  try {
    const headersList = await headers()
    const authHeader = headersList.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null
    }
    
    const token = authHeader.split(' ')[1]
    const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-key')
    const { payload } = await jwtVerify(token, JWT_SECRET)
    
    return {
      id: payload.sub as string,
      email: payload.email as string,
      role: payload.role as string,
    }
  } catch (error) {
    return null
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: propertyId } = await params
    const body = await request.json()
    const { url, publicId, isPrimary, order } = body

    if (!url) {
      return NextResponse.json({ error: 'Image URL is required' }, { status: 400 })
    }

    // Check if property exists
    const property = await prisma.property.findUnique({
      where: { id: propertyId }
    })

    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }

    // If this image is being set as primary, unset all other primary images
    if (isPrimary) {
      await prisma.propertyImage.updateMany({
        where: { propertyId },
        data: { isPrimary: false }
      })
    }

    // Create the image
    const image = await prisma.propertyImage.create({
      data: {
        propertyId,
        url,
        publicId: publicId || '',
        isPrimary: isPrimary || false,
        order: order || 0,
        alt: body.alt || null,
        description: body.description || null
      }
    })

    return NextResponse.json(image, { status: 201 })
  } catch (error) {
    console.error('Error adding property image:', error)
    return NextResponse.json({ error: 'Failed to add image' }, { status: 500 })
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: propertyId } = await params

    const images = await prisma.propertyImage.findMany({
      where: { propertyId },
      orderBy: { order: 'asc' }
    })

    return NextResponse.json(images)
  } catch (error) {
    console.error('Error fetching property images:', error)
    return NextResponse.json({ error: 'Failed to fetch images' }, { status: 500 })
  }
}
