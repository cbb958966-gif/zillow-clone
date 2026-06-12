import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { getUsageStats } from '@/lib/cloudinary';

export async function GET(request: NextRequest) {
  try {
    const user = await auth();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const tags = searchParams.get('tags')?.split(',') || [];
    const folder = searchParams.get('folder') || '';
    const format = searchParams.get('format') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const skip = (page - 1) * limit;

    // Build search filters
    const whereClause: any = {
      uploadedBy: user.role === 'ADMIN' ? undefined : user.id, // Admin sees all, users see only their uploads
    };

    if (search) {
      whereClause.OR = [
        { filename: { contains: search, mode: 'insensitive' } },
        { tags: { contains: search } },
        { folder: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (tags.length > 0) {
      whereClause.tags = { has: tags };
    }

    if (folder) {
      whereClause.folder = { contains: folder, mode: 'insensitive' };
    }

    if (format) {
      whereClause.format = format;
    }

    // Get media library items with pagination
    const [media, totalCount] = await Promise.all([
      prisma.mediaLibrary.findMany({
        where: whereClause,
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.mediaLibrary.count({ where: whereClause })
    ]);

    // Get usage statistics from Cloudinary
    const usageStats = await getUsageStats();

    // Get unique tags and folders for filters
    const [uniqueTags, uniqueFolders, uniqueFormats] = await Promise.all([
      prisma.mediaLibrary.findMany({
        where: { tags: { not: null } },
        select: { tags: true },
        distinct: ['tags']
      }),
      prisma.mediaLibrary.findMany({
        select: { folder: true },
        distinct: ['folder']
      }),
      prisma.mediaLibrary.findMany({
        select: { format: true },
        distinct: ['format']
      })
    ]);

    const allTags = uniqueTags.flatMap(item => item.tags ? JSON.parse(item.tags) : []).filter(Boolean);
    const allFolders = uniqueFolders.map(item => item.folder).filter(Boolean);
    const allFormats = uniqueFormats.map(item => item.format).filter(Boolean);

    return NextResponse.json({
      success: true,
      data: media,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: page * limit < totalCount,
        hasPrev: page > 1
      },
      filters: {
        tags: [...new Set(allTags)],
        folders: [...new Set(allFolders)],
        formats: [...new Set(allFormats)]
      },
      usageStats: usageStats ? {
        creditsUsed: usageStats.credits?.usage || 0,
        creditsLimit: usageStats.credits?.limit || 25,
        bandwidthUsed: usageStats.bandwidth?.usage || 0,
        storageUsed: usageStats.credits?.usage || 0,
        storageLimit: usageStats.credits?.limit || 25,
        percentageUsed: usageStats.credits ? 
          ((usageStats.credits.usage / usageStats.credits.limit) * 100).toFixed(1) : 0
      } : null
    });

  } catch (error) {
    console.error('Media library fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch media library', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Update media library item
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
    const { publicId, updates } = body;

    if (!publicId || !updates) {
      return NextResponse.json(
        { error: 'Public ID and updates are required' },
        { status: 400 }
      );
    }

    // Check permissions
    const existingMedia = await prisma.mediaLibrary.findUnique({
      where: { publicId }
    });

    if (!existingMedia) {
      return NextResponse.json(
        { error: 'Media item not found' },
        { status: 404 }
      );
    }

    const canEdit = user.role === 'ADMIN' || existingMedia.uploadedBy === user.id;

    if (!canEdit) {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      );
    }

    const updatedMedia = await prisma.mediaLibrary.update({
      where: { publicId },
      data: {
        ...updates,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedMedia,
      message: 'Media item updated successfully'
    });

  } catch (error) {
    console.error('Update media library error:', error);
    return NextResponse.json(
      { error: 'Failed to update media item', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}