import { v2 as cloudinary } from 'cloudinary';

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export { cloudinary };

// Upload configuration optimized for free tier
export const uploadConfig = {
  folder: 'real-estate-properties',
  allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'avif'],
  max_file_size: 10000000, // 10MB
  transformation: [
    { quality: 'auto:good' },
    { fetch_format: 'auto' },
    { crop: 'limit', width: 1920, height: 1080 }, // Limit dimensions
  ],
  // Free tier optimization presets
  presets: {
    thumbnail: { width: 300, height: 200, crop: 'fill', quality: 'auto:good' },
    medium: { width: 800, height: 600, crop: 'limit', quality: 'auto:good' },
    large: { width: 1920, height: 1080, crop: 'limit', quality: 'auto:good' },
  }
};

// Helper function to upload image with optimization
export async function uploadImage(file: File, folder = uploadConfig.folder, options = {}) {
  try {
    const buffer = await file.arrayBuffer();
    const base64String = Buffer.from(buffer).toString('base64');
    const dataUrl = `data:${file.type};base64,${base64String}`;

    // Enhanced upload options for free tier optimization
    const uploadOptions = {
      folder,
      resource_type: 'auto' as const,
      transformation: uploadConfig.transformation,
      // Free tier optimization settings
      quality_analysis: true,
      colors: true,
      exif: true,
      faces: false, // Save credits
      ocr: false,   // Save credits
      use_filename: true,
      unique_filename: true,
      ...options
    };

    const result = await cloudinary.uploader.upload(dataUrl, uploadOptions);

    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      size: result.bytes,
      // Additional metadata
      filename: result.original_filename,
      createdAt: result.created_at,
      resourceType: result.resource_type,
    };
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error('Failed to upload image');
  }
}

// Helper function to delete image
export async function deleteImage(publicId: string) {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === 'ok';
  } catch (error) {
    console.error('Error deleting image:', error);
    throw new Error('Failed to delete image');
  }
}

// Generate optimized image URL with free tier optimization
export function getOptimizedImageUrl(
  publicId: string,
  options: {
    width?: number;
    height?: number;
    quality?: string;
    crop?: string;
    format?: string;
    aspectRatio?: string;
    gravity?: string;
  } = {}
) {
  const {
    width = 800,
    height = 600,
    quality = 'auto:good',
    crop = 'fill',
    format = 'auto',
    aspectRatio,
    gravity = 'auto',
  } = options;

  const transformationOptions: any = {
    width,
    height,
    quality,
    crop,
    fetch_format: format,
    secure: true,
  };

  // Add aspect ratio if specified
  if (aspectRatio) {
    transformationOptions.aspect_ratio = aspectRatio;
  }

  // Add gravity if specified
  if (gravity) {
    transformationOptions.gravity = gravity;
  }

  return cloudinary.url(publicId, transformationOptions);
}

// Generate multiple sizes for responsive images
export function generateResponsiveImageUrls(publicId: string) {
  return {
    thumbnail: getOptimizedImageUrl(publicId, { width: 300, height: 200, crop: 'fill' }),
    medium: getOptimizedImageUrl(publicId, { width: 800, height: 600, crop: 'limit' }),
    large: getOptimizedImageUrl(publicId, { width: 1200, height: 800, crop: 'limit' }),
    xl: getOptimizedImageUrl(publicId, { width: 1920, height: 1080, crop: 'limit' }),
  };
}

// Get Cloudinary usage statistics (for free tier monitoring)
export async function getUsageStats() {
  try {
    const result = await cloudinary.api.usage({ resource_type: 'image' });
    return {
      used: result.resources,
      limit: result.limit || 1000000, // Default limit if not available
      credits: result.credits,
      bandwidth: result.bandwidth,
      transformations: result.transformations,
    };
  } catch (error) {
    console.error('Error fetching usage stats:', error);
    return null;
  }
}