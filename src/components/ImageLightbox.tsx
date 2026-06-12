import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X, Download, Share2, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { generateResponsiveImageUrls, getOptimizedImageUrl } from '@/lib/cloudinary';

interface LightboxImage {
  id: string;
  url: string;
  publicId?: string;
  alt?: string;
  description?: string;
}

interface ImageLightboxProps {
  images: LightboxImage[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
}

export const ImageLightbox = ({
  images,
  initialIndex = 0,
  isOpen,
  onClose
}: ImageLightboxProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showThumbnails, setShowThumbnails] = useState(true);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowLeft':
          navigatePrevious();
          break;
        case 'ArrowRight':
        case ' ':
          navigateNext();
          break;
        case 'Escape':
          onClose();
          break;
        case '+':
        case '=':
          handleZoom(0.1);
          break;
        case '-':
        case '_':
          handleZoom(-0.1);
          break;
        case 'Enter':
          toggleFullscreen();
          break;
        case 't':
        case 'T':
          setShowThumbnails(prev => !prev);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex]);

  if (!isOpen || images.length === 0) return null;

  const currentImage = images[currentIndex];
  const canGoPrevious = currentIndex > 0;
  const canGoNext = currentIndex < images.length - 1;

  const navigatePrevious = () => {
    if (canGoPrevious) {
      setCurrentIndex(prev => prev - 1);
      setZoomLevel(1);
    }
  };

  const navigateNext = () => {
    if (canGoNext) {
      setCurrentIndex(prev => prev + 1);
      setZoomLevel(1);
    }
  };

  const handleZoom = (delta: number) => {
    setZoomLevel(prev => Math.max(0.5, Math.min(3, prev + delta)));
  };

  const toggleFullscreen = () => {
    setIsFullscreen(prev => !prev);
  };

  const downloadImage = () => {
    const link = document.createElement('a');
    link.href = currentImage.url;
    link.download = currentImage.alt || `property-image-${currentIndex + 1}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const shareImage = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Property Image',
          text: currentImage.description || `Property image ${currentIndex + 1}`,
          url: currentImage.url,
        });
      } catch (error) {
        console.error('Share failed:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(currentImage.url);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-95 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black bg-opacity-50">
        <div className="flex items-center gap-4">
          <h3 className="text-white font-medium">
            {currentImage.alt || `Image ${currentIndex + 1}`}
          </h3>
          <span className="text-gray-300 text-sm">
            {currentIndex + 1} / {images.length}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={downloadImage}
            className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            title="Download image"
          >
            <Download className="w-5 h-5" />
          </button>
          <button
            onClick={shareImage}
            className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            title="Share image"
          >
            <Share2 className="w-5 h-5" />
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            title="Toggle fullscreen"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowThumbnails(prev => !prev)}
            className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            title="Toggle thumbnails (T)"
          >
            <div className="w-5 h-5 flex items-center justify-center text-xs">T</div>
          </button>
          <button
            onClick={onClose}
            className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Image Container */}
      <div className="flex-1 flex items-center justify-center relative overflow-hidden">
        {/* Previous Button */}
        {canGoPrevious && (
          <button
            onClick={navigatePrevious}
            className="absolute left-4 z-10 p-3 bg-white bg-opacity-10 hover:bg-opacity-20 text-white rounded-full transition-all"
            title="Previous image (←)"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Next Button */}
        {canGoNext && (
          <button
            onClick={navigateNext}
            className="absolute right-4 z-10 p-3 bg-white bg-opacity-10 hover:bg-opacity-20 text-white rounded-full transition-all"
            title="Next image (→)"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}

        {/* Image */}
        <div className="relative max-w-full max-h-full flex items-center justify-center">
          <img
            src={currentImage.url}
            alt={currentImage.alt || 'Property image'}
            className="max-w-full max-h-full object-contain transition-transform"
            style={{
              transform: `scale(${zoomLevel})`,
              cursor: zoomLevel > 1 ? 'move' : 'default'
            }}
            draggable={false}
          />
        </div>

        {/* Zoom Controls */}
        <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 rounded-lg p-2 flex items-center gap-2">
          <button
            onClick={() => handleZoom(-0.1)}
            className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded transition-colors"
            title="Zoom out (-)"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-white text-sm min-w-12 text-center">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            onClick={() => handleZoom(0.1)}
            className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded transition-colors"
            title="Zoom in (+)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoomLevel(1)}
            className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded transition-colors"
            title="Reset zoom"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Image Description */}
      {currentImage.description && (
        <div className="p-4 bg-black bg-opacity-50 text-center">
          <p className="text-white text-sm">{currentImage.description}</p>
        </div>
      )}

      {/* Thumbnails */}
      {showThumbnails && images.length > 1 && (
        <div className="bg-black bg-opacity-50 p-4">
          <div className="flex gap-2 overflow-x-auto justify-center max-w-full">
            {images.map((image, index) => (
              <button
                key={image.id}
                onClick={() => {
                  setCurrentIndex(index);
                  setZoomLevel(1);
                }}
                className={`
                  flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all
                  ${index === currentIndex 
                    ? 'border-blue-500 ring-2 ring-blue-500 ring-opacity-50' 
                    : 'border-transparent hover:border-gray-400'
                  }
                `}
              >
                <img
                  src={image.url}
                  alt={image.alt || `Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Help */}
      <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 rounded-lg p-2 text-white text-xs">
        <div className="space-y-1">
          <div>← → Navigate</div>
          <div>Space Next</div>
          <div>Esc Close</div>
          <div>+ - Zoom</div>
          <div>T Thumbnails</div>
        </div>
      </div>
    </div>
  );
};

export default ImageLightbox;