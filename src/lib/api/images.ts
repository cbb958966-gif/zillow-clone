// Image API functions for the unlimited image system

const API_BASE = '/api';

// Bulk upload images
export const uploadBulkImages = async (propertyId: string, formData: FormData) => {
  const response = await fetch(`${API_BASE}/upload/bulk`, {
    method: 'POST',
    headers: {
      // Don't set Content-Type header for FormData (browser sets it with boundary)
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to upload images');
  }

  return response.json();
};

// Get property images
export const getPropertyImages = async (propertyId: string) => {
  const response = await fetch(`${API_BASE}/upload/bulk?propertyId=${propertyId}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch images');
  }

  const result = await response.json();
  return result.data;
};

// Delete images
export const deleteImages = async (imageIds: string[], propertyId?: string) => {
  const response = await fetch(`${API_BASE}/upload/bulk/manage`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      imageIds,
      propertyId,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete images');
  }

  return response.json();
};

// Update image metadata
export const updateImageMetadata = async (imageId: string, metadata: any) => {
  const response = await fetch(`${API_BASE}/upload/bulk/manage`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      imageId,
      metadata,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update image metadata');
  }

  const result = await response.json();
  return result.data;
};

// Reorder property images
export const reorderPropertyImages = async (propertyId: string, imageOrder: string[]) => {
  const response = await fetch(`${API_BASE}/upload/reorder`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      propertyId,
      imageOrder,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to reorder images');
  }

  return response.json();
};

// Get media library
export const getMediaLibrary = async (params: {
  page?: number;
  limit?: number;
  search?: string;
  tags?: string[];
  folder?: string;
  format?: string;
  sortBy?: string;
  sortOrder?: string;
}) => {
  const queryParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        value.forEach(v => queryParams.append(key, v));
      } else {
        queryParams.append(key, value.toString());
      }
    }
  });

  const response = await fetch(`${API_BASE}/media/library?${queryParams}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch media library');
  }

  return response.json();
};

// Update media library item
export const updateMediaLibraryItem = async (publicId: string, updates: any) => {
  const response = await fetch(`${API_BASE}/media/library`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      publicId,
      updates,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update media item');
  }

  return response.json();
};

// Upload single image (for general use)
export const uploadSingleImage = async (file: File, folder?: string) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE}/upload/image`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to upload image');
  }

  return response.json();
};

// Delete single image from Cloudinary
export const deleteCloudinaryImage = async (publicId: string) => {
  const response = await fetch(`${API_BASE}/upload/cloudinary/${publicId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete image from Cloudinary');
  }

  return response.json();
};

// Get image optimization stats
export const getImageOptimizationStats = async () => {
  const response = await fetch(`${API_BASE}/upload/stats`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch image stats');
  }

  return response.json();
};