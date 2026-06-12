import React, { useState, useCallback } from 'react';
import { X, Save, Upload, Download, RotateCcw, Crop, Palette, Type, Maximize2, Info } from 'lucide-react';
import { toast } from 'react-toastify';
import { updateImageMetadata } from '@/lib/api/images';

interface ImageEditorProps {
  image: {
    id: string;
    url: string;
    filename?: string;
    alt?: string;
    description?: string;
    tags?: string;
    isPrimary?: boolean;
    featured?: boolean;
    width?: number;
    height?: number;
    size?: number;
    format?: string;
    publicId?: string;
  };
  onClose: () => void;
  onSave: (updatedImage: any) => void;
}

const suggestedTags = [
  'living room', 'bedroom', 'kitchen', 'bathroom', 'dining room', 
  'exterior', 'garden', 'garage', 'pool', 'balcony', 'office', 
  'basement', 'attic', 'laundry', 'storage', 'modern', 'traditional',
  'renovated', 'new', 'spacious', 'bright', 'view', 'sunny'
];

export const ImageEditor = ({ image, onClose, onSave }: ImageEditorProps) => {
  const [formData, setFormData] = useState({
    alt: image.alt || '',
    description: image.description || '',
    tags: image.tags || '',
    isPrimary: image.isPrimary || false,
    featured: image.featured || false
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTagsChange = (value: string) => {
    setFormData(prev => ({ ...prev, tags: value }));
  };

  const addTag = (tag: string) => {
    const currentTags = formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(t => t) : [];
    if (!currentTags.includes(tag)) {
      const newTags = [...currentTags, tag].join(', ');
      handleTagsChange(newTags);
    }
  };

  const removeTag = (tagToRemove: string) => {
    const currentTags = formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(t => t) : [];
    const newTags = currentTags.filter(tag => tag !== tagToRemove).join(', ');
    handleTagsChange(newTags);
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      const updatedImage = await updateImageMetadata(image.id, formData);
      onSave(updatedImage);
      toast.success('Image updated successfully');
      onClose();
    } catch (error) {
      toast.error('Failed to update image');
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const currentTags = formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(t => t) : [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Edit Image</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex h-[calc(90vh-140px)]">
          {/* Image Preview */}
          <div className="w-1/2 p-6 border-r bg-gray-50">
            <div className="relative rounded-lg overflow-hidden">
              <img
                src={image.url}
                alt={formData.alt || image.filename || 'Property image'}
                className="w-full h-full object-contain max-h-[400px]"
              />
              {image.width && image.height && (
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                  {image.width} × {image.height}
                </div>
              )}
            </div>
            
            {/* Image Info */}
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Info className="w-4 h-4" />
                <span>File: {image.filename}</span>
              </div>
              {image.format && (
                <div className="text-sm text-gray-600">
                  Format: {image.format.toUpperCase()}
                </div>
              )}
              {image.size && (
                <div className="text-sm text-gray-600">
                  Size: {(image.size / 1024).toFixed(1)} KB
                </div>
              )}
            </div>
          </div>

          {/* Editor Controls */}
          <div className="w-1/2 flex flex-col">
            {/* Tabs */}
            <div className="flex border-b">
              <button
                onClick={() => setActiveTab('details')}
                className={`px-6 py-3 font-medium transition-colors ${
                  activeTab === 'details'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Details
              </button>
              <button
                onClick={() => setActiveTab('tags')}
                className={`px-6 py-3 font-medium transition-colors ${
                  activeTab === 'tags'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Tags & Labels
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`px-6 py-3 font-medium transition-colors ${
                  activeTab === 'settings'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Settings
              </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === 'details' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Alt Text (for accessibility)
                    </label>
                    <textarea
                      value={formData.alt}
                      onChange={(e) => handleInputChange('alt', e.target.value)}
                      placeholder="Describe this image for screen readers..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Add a detailed description of this image..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={4}
                    />
                  </div>
                </div>
              )}

              {activeTab === 'tags' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tags
                    </label>
                    <input
                      type="text"
                      value={formData.tags}
                      onChange={(e) => handleTagsChange(e.target.value)}
                      placeholder="Enter tags separated by commas..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Separate tags with commas (e.g., kitchen, modern, renovated)
                    </p>
                  </div>

                  {currentTags.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Tags
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {currentTags.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                          >
                            {tag}
                            <button
                              onClick={() => removeTag(tag)}
                              className="hover:bg-blue-200 rounded-full p-0.5"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Suggested Tags
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {suggestedTags.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => addTag(tag)}
                          className="px-3 py-1 text-sm border border-gray-300 rounded-full hover:bg-gray-50 hover:border-gray-400 transition-colors"
                        >
                          + {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b">
                    <div>
                      <div className="font-medium">Primary Image</div>
                      <div className="text-sm text-gray-500">
                        This will be the main image for the property
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isPrimary}
                        onChange={(e) => handleInputChange('isPrimary', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b">
                    <div>
                      <div className="font-medium">Featured</div>
                      <div className="text-sm text-gray-500">
                        Highlight this image in galleries
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.featured}
                        onChange={(e) => handleInputChange('featured', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-2">Quick Actions</h4>
                    <div className="space-y-2">
                      <button className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-3">
                        <Download className="w-4 h-4" />
                        Download Original
                      </button>
                      <button className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-3">
                        <Crop className="w-4 h-4" />
                        Crop & Resize
                      </button>
                      <button className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-3">
                        <RotateCcw className="w-4 h-4" />
                        Rotate Image
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
              <button
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageEditor;