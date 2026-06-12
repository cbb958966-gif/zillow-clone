import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract filter parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const search = searchParams.get('search') || '';
    const propertyType = searchParams.get('propertyType');
    const status = searchParams.get('status');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const minBeds = searchParams.get('minBeds');
    const maxBeds = searchParams.get('maxBeds');
    const minBaths = searchParams.get('minBaths');
    const maxBaths = searchParams.get('maxBaths');
    const minSqft = searchParams.get('minSqft');
    const maxSqft = searchParams.get('maxSqft');
    const city = searchParams.get('city');
    const state = searchParams.get('state');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build where clause
    const where: any = {};

    if (search) {
      const searchTrimmed = search.trim()
      const searchLower = searchTrimmed.toLowerCase()
      const isNumeric = /^\d+$/.test(searchTrimmed)
      
      where.OR = [
        { title: { contains: searchTrimmed, mode: 'insensitive' } },
        { description: { contains: searchTrimmed, mode: 'insensitive' } },
        { address: { contains: searchTrimmed, mode: 'insensitive' } },
        { city: { contains: searchTrimmed, mode: 'insensitive' } },
        { state: { contains: searchTrimmed, mode: 'insensitive' } },
      ]
      
      // Add exact match for zip code if it's numeric
      if (isNumeric) {
        where.OR.push({ zipCode: searchTrimmed })
      }
      
      // Also search by exact city/state match for better results
      where.OR.push({ city: { equals: searchTrimmed, mode: 'insensitive' } })
      where.OR.push({ state: { equals: searchTrimmed, mode: 'insensitive' } })
    }

    if (propertyType) {
      where.propertyType = propertyType;
    }

    // Default to only show ACTIVE properties if no status is specified
    if (status) {
      where.status = status;
    } else {
      where.status = 'ACTIVE';
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    if (minBeds || maxBeds) {
      where.beds = {};
      if (minBeds) where.beds.gte = parseInt(minBeds);
      if (maxBeds) where.beds.lte = parseInt(maxBeds);
    }

    if (minBaths || maxBaths) {
      where.baths = {};
      if (minBaths) where.baths.gte = parseFloat(minBaths);
      if (maxBaths) where.baths.lte = parseFloat(maxBaths);
    }

    if (minSqft || maxSqft) {
      where.sqft = {};
      if (minSqft) where.sqft.gte = parseInt(minSqft);
      if (maxSqft) where.sqft.lte = parseInt(maxSqft);
    }

    if (city) {
      where.city = { contains: city, mode: 'insensitive' };
    }

    if (state) {
      where.state = { contains: state, mode: 'insensitive' };
    }

    // Build order clause
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query with filters
    const [properties, totalCount] = await Promise.all([
      prisma.property.findMany({
        where,
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
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.property.count({ where })
    ]);

    return NextResponse.json({
      properties,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
        hasNext: page < Math.ceil(totalCount / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching properties:', error);
    return NextResponse.json(
      { error: 'Failed to fetch properties' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const headersList = await import('next/headers');
    const headers = headersList.headers();
    const authHeader = (await headers).get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const jwt = await import('jose');
    const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-key');
    
    try {
      const { payload } = await jwt.jwtVerify(token, JWT_SECRET);
      if (!payload || !payload.userId) {
        return NextResponse.json(
          { error: 'Invalid token' },
          { status: 401 }
        );
      }
    } catch {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const body = await request.json()
    
    const property = await prisma.property.create({
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

    return NextResponse.json(property, { status: 201 })
  } catch (error) {
    console.error('Error creating property:', error)
    return NextResponse.json(
      { error: 'Failed to create property' },
      { status: 500 }
    )
  }
}