import React, { useState, useCallback, useRef } from 'react';
import Image from 'next/image';
import { useDropzone } from 'react-dropzone';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { X, Upload, Image as ImageIcon, RotateCcw, Download, Edit3, Trash2, Star, Eye } from 'lucide-react';
import { toast } from 'react-toastify';
import { uploadBulkImages, deleteImages, updateImageMetadata, reorderPropertyImages } from '@/lib/api/images';

// Types
interface PropertyImage {
  id: string;
  url: string;
  publicId: string;
  filename?: string;
  size?: number;
  format?: string;
  width?: number;
  height?: number;
  isPrimary: boolean;
  featured: boolean;
  order: number;
  tags?: string;
  alt?: string;
  description?: string;
  uploadedBy?: string;
  createdAt: string;
  updatedAt: string;
}

interface ImageGalleryProps {
  propertyId: string;
  initialImages?: PropertyImage[];
  maxImages?: number;
  canEdit?: boolean;
  onImagesChange?: (images: PropertyImage[]) => void;
  className?: string;
}

// Draggable Image Item Component
const DraggableImageItem = ({
  image,
  index,
  moveImage,
  onSelect,
  isSelected,
  canEdit,
  onEdit,
  onDelete,
  onSetPrimary,
  onToggleFeatured
}: {
  image: PropertyImage;
  index: number;
  moveImage: (dragIndex: number, hoverIndex: number) => void;
  onSelect: () => void;
  isSelected: boolean;
  canEdit: boolean;
  onEdit: (image: PropertyImage) => void;
  onDelete: (image: PropertyImage) => void;
  onSetPrimary: (image: PropertyImage) => void;
  onToggleFeatured: (image: PropertyImage) => void;
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag({
    type: 'image',
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'image',
    hover: (item: { index: number }) => {
      if (!ref.current) return;
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) return;

      moveImage(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  drag(drop(ref));

  return (
    <div
      ref={ref}
      className={`
        relative group border-2 rounded-lg overflow-hidden transition-all
        ${isDragging ? 'opacity-50' : ''}
        ${isSelected ? 'border-blue-500 shadow-lg' : 'border-gray-200 hover:border-gray-300'}
        ${image.isPrimary ? 'ring-2 ring-yellow-400' : ''}
      `}
      onClick={onSelect}
    >
      {/* Image */}
      <div className="relative aspect-square">
        <Image
          src={image.url}
          alt={image.alt || image.filename || 'Property image'}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        
        {/* Overlay Controls */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
          {canEdit && (
            <div className="flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(image);
                }}
                className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                title="Edit details"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFeatured(image);
                }}
                className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                title={image.featured ? "Remove from featured" : "Add to featured"}
              >
                <Star className={`w-4 h-4 ${image.featured ? 'fill-yellow-400 text-yellow-400' : ''}`} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(image);
                }}
                className="p-2 bg-white rounded-full hover:bg-red-100 transition-colors"
                title="Delete image"
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>
            </div>
          )}
        </div>

        {/* Status Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {image.isPrimary && (
            <span className="px-2 py-1 bg-yellow-400 text-black text-xs font-semibold rounded-full">
              Primary
            </span>
          )}
          {image.featured && (
            <span className="px-2 py-1 bg-blue-500 text-white text-xs font-semibold rounded-full">
              Featured
            </span>
          )}
        </div>

        {/* View Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            window.open(image.url, '_blank');
          }}
          className="absolute top-2 right-2 p-2 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-100"
          title="View full size"
        >
          <Eye className="w-4 h-4" />
        </button>
      </div>

      {/* Image Info */}
      <div className="p-2 bg-white">
        <p className="text-xs text-gray-600 truncate">{image.filename}</p>
        <p className="text-xs text-gray-400">
          {image.width && image.height && `${image.width}x${image.height}`}
          {image.size && ` • ${(image.size / 1024).toFixed(1)}KB`}
        </p>
      </div>
    </div>
  );
};

// Main Gallery Component
export const ImageGallery = ({
  propertyId,
  initialImages = [],
  maxImages = 50,
  canEdit = true,
  onImagesChange,
  className = ''
}: ImageGalleryProps) => {
  const [images, setImages] = useState<PropertyImage[]>(initialImages);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [editingImage, setEditingImage] = useState<PropertyImage | null>(null);
  const [showBulkEditor, setShowBulkEditor] = useState(false);

  // Handle image reordering
  const moveImage = useCallback((dragIndex: number, hoverIndex: number) => {
    setImages((prevImages) => {
      const newImages = [...prevImages];
      const draggedImage = newImages[dragIndex];
      newImages.splice(dragIndex, 1);
      newImages.splice(hoverIndex, 0, draggedImage);
      
      // Update order values
      return newImages.map((img, index) => ({ ...img, order: index }));
    });
  }, []);

  // Save new order to database
  const saveImageOrder = async () => {
    try {
      await reorderPropertyImages(propertyId, images.map(img => img.id));
      toast.success('Image order saved successfully');
    } catch (error) {
      toast.error('Failed to save image order');
      console.error('Reorder error:', error);
    }
  };

  // Handle file upload
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.avif']
    },
    maxFiles: maxImages - images.length,
    maxSize: 5 * 1024 * 1024, // 5MB for free tier optimization
    onDrop: async (acceptedFiles) => {
      if (!canEdit) {
        toast.error('You do not have permission to upload images');
        return;
      }

      setIsUploading(true);
      setUploadProgress({});

      try {
        const formData = new FormData();
        acceptedFiles.forEach((file, index) => {
          formData.append('files', file);
          setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));
        });

        const result = await uploadBulkImages(propertyId, formData);
        
        if (result.success) {
          setImages(prev => [...prev, ...result.data]);
          onImagesChange?.([...images, ...result.data]);
          toast.success(`${result.uploadedCount} images uploaded successfully`);
        } else {
          toast.error('Failed to upload images');
        }
      } catch (error) {
        toast.error('Upload failed');
        console.error('Upload error:', error);
      } finally {
        setIsUploading(false);
        setUploadProgress({});
      }
    }
  });

  // Handle image selection
  const toggleImageSelection = (imageId: string) => {
    setSelectedImages(prev => 
      prev.includes(imageId) 
        ? prev.filter(id => id !== imageId)
        : [...prev, imageId]
    );
  };

  // Select all images
  const selectAll = () => {
    setSelectedImages(images.map(img => img.id));
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedImages([]);
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedImages.length === 0) return;

    if (!confirm(`Are you sure you want to delete ${selectedImages.length} image(s)?`)) {
      return;
    }

    try {
      const result = await deleteImages(selectedImages);
      
      if (result.success) {
        setImages(prev => prev.filter(img => !selectedImages.includes(img.id)));
        setSelectedImages([]);
        onImagesChange?.(images.filter(img => !selectedImages.includes(img.id)));
        toast.success(`${result.deletedCount} images deleted successfully`);
      }
    } catch (error) {
      toast.error('Failed to delete images');
      console.error('Delete error:', error);
    }
  };

  // Set primary image
  const setPrimaryImage = async (image: PropertyImage) => {
    try {
      await updateImageMetadata(image.id, { isPrimary: true });
      
      setImages(prev => prev.map(img => ({
        ...img,
        isPrimary: img.id === image.id
      })));
      
      toast.success('Primary image updated');
    } catch (error) {
      toast.error('Failed to set primary image');
      console.error('Set primary error:', error);
    }
  };

  // Toggle featured status
  const toggleFeatured = async (image: PropertyImage) => {
    try {
      await updateImageMetadata(image.id, { featured: !image.featured });
      
      setImages(prev => prev.map(img => 
        img.id === image.id ? { ...img, featured: !img.featured } : img
      ));
      
      toast.success(`Image ${image.featured ? 'removed from' : 'added to'} featured`);
    } catch (error) {
      toast.error('Failed to update featured status');
      console.error('Toggle featured error:', error);
    }
  };

  // Delete single image
  const deleteImage = async (image: PropertyImage) => {
    if (!confirm('Are you sure you want to delete this image?')) {
      return;
    }

    try {
      const result = await deleteImages([image.id]);
      
      if (result.success) {
        setImages(prev => prev.filter(img => img.id !== image.id));
        setSelectedImages(prev => prev.filter(id => id !== image.id));
        onImagesChange?.(images.filter(img => img.id !== image.id));
        toast.success('Image deleted successfully');
      }
    } catch (error) {
      toast.error('Failed to delete image');
      console.error('Delete error:', error);
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className={`image-gallery ${className}`}>
        {/* Upload Area */}
        {canEdit && (
          <div className="mb-6">
            <div
              {...getRootProps()}
              className={`
                border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
                ${isUploading ? 'pointer-events-none opacity-50' : ''}
              `}
            >
              <input {...getInputProps()} />
              <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold mb-2">
                {isUploading ? 'Uploading...' : 'Drop images here or click to browse'}
              </h3>
              <p className="text-gray-600">
                {isUploading 
                  ? 'Please wait while we process your images...'
                  : `Upload up to ${maxImages - images.length} more images (Max 5MB each)`
                }
              </p>
            </div>
          </div>
        )}

        {/* Bulk Actions */}
        {canEdit && selectedImages.length > 0 && (
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg mb-6">
            <span className="text-blue-800 font-medium">
              {selectedImages.length} image(s) selected
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleBulkDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Delete Selected
              </button>
              <button
                onClick={clearSelection}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Clear Selection
              </button>
            </div>
          </div>
        )}

        {/* Gallery Controls */}
        {images.length > 0 && (
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">
              Property Images ({images.length}/{maxImages})
            </h2>
            <div className="flex gap-2">
              {canEdit && (
                <>
                  <button
                    onClick={selectAll}
                    className="px-3 py-1 text-sm bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Select All
                  </button>
                  <button
                    onClick={saveImageOrder}
                    className="px-3 py-1 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Save Order
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Image Grid */}
        {images.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {images
              .sort((a, b) => a.order - b.order)
              .map((image, index) => (
                <DraggableImageItem
                  key={image.id}
                  image={image}
                  index={index}
                  moveImage={moveImage}
                  onSelect={() => toggleImageSelection(image.id)}
                  isSelected={selectedImages.includes(image.id)}
                  canEdit={canEdit}
                  onEdit={setEditingImage}
                  onDelete={deleteImage}
                  onSetPrimary={setPrimaryImage}
                  onToggleFeatured={toggleFeatured}
                />
              ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">No images yet</h3>
            <p className="text-gray-500">
              Upload images to showcase this property
            </p>
          </div>
        )}

        {/* Upload Progress */}
        {Object.keys(uploadProgress).length > 0 && (
          <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 min-w-64">
            <h4 className="font-medium mb-2">Upload Progress</h4>
            {Object.entries(uploadProgress).map(([filename, progress]) => (
              <div key={filename} className="mb-2">
                <div className="flex justify-between text-sm mb-1">
                  <span className="truncate">{filename}</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DndProvider>
  );
};

export default ImageGallery;