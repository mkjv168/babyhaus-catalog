'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';

interface MultiImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  onUploadStart?: () => void;
  onUploadEnd?: () => void;
  maxImages?: number;
}

export default function MultiImageUpload({ 
  images, 
  onImagesChange,
  onUploadStart,
  onUploadEnd,
  maxImages = 4
}: MultiImageUploadProps) {
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    setError('');
    setUploadingIndex(index);
    if (onUploadStart) onUploadStart();

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Upload failed');
      }

      const data = await response.json();
      const newImages = [...images];
      // If uploading to an existing slot, replace; otherwise append
      if (index < images.length) {
        newImages[index] = data.url;
      } else {
        newImages.push(data.url);
      }
      onImagesChange(newImages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploadingIndex(null);
      if (onUploadEnd) onUploadEnd();
      if (fileInputRefs.current[index]) {
        fileInputRefs.current[index]!.value = '';
      }
    }
  };

  const handleRemove = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    onImagesChange(newImages);
  };

  const setRef = useCallback((el: HTMLInputElement | null, index: number) => {
    fileInputRefs.current[index] = el;
  }, []);

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', String(index));
    e.dataTransfer.effectAllowed = 'move';
    // Add a small delay so the drag image isn't the semi-transparent element
    setTimeout(() => {
      (e.target as HTMLElement).classList.add('opacity-40');
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    (e.target as HTMLElement).classList.remove('opacity-40');
    setDragOverIndex(null);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, toIndex: number) => {
    e.preventDefault();
    const fromIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
    setDragOverIndex(null);

    if (fromIndex === toIndex || isNaN(fromIndex)) return;

    const newImages = [...images];
    const [moved] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, moved);
    onImagesChange(newImages);
  };

  // Total slots = uploaded images + up to maxImages empty slots
  const totalSlots = Math.max(images.length, 0) + (images.length < maxImages ? 1 : 0);
  const displaySlots = Math.min(totalSlots, maxImages);

  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-[#7a7a7a]">
        Product Images <span className="text-[#b0b0b0] font-normal">({images.length}/{maxImages})</span>
        {images.length > 1 && (
          <span className="ml-2 text-[10px] text-[#d4a574] font-normal">drag to reorder</span>
        )}
      </label>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-xl text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Uploaded images — draggable */}
        {images.map((imageUrl, index) => {
          const isUploading = uploadingIndex === index;
          const isDragOver = dragOverIndex === index;

          return (
            <div
              key={`img-${imageUrl}-${index}`}
              className="relative"
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
            >
              <div 
                className={`relative aspect-square rounded-xl overflow-hidden border-2 bg-[#f5f1ec] cursor-move transition-all ${
                  isDragOver ? 'border-[#d4a574] ring-2 ring-[#d4a574]/30 scale-105' : 'border-[#e8e4df]'
                }`}
              >
                <Image
                  src={imageUrl}
                  alt={`Product image ${index + 1}`}
                  fill
                  className="object-cover pointer-events-none"
                  draggable={false}
                />
                {/* Overlay actions */}
                <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-colors flex items-center justify-center gap-2 opacity-0 hover:opacity-100">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      document.getElementById(`image-upload-${index}`)?.click();
                    }}
                    className="p-2 bg-white rounded-full hover:bg-[#f5f1ec] transition-colors"
                    title="Replace"
                  >
                    <svg className="w-4 h-4 text-[#2d2d2d]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(index);
                    }}
                    className="p-2 bg-white rounded-full hover:bg-red-50 transition-colors"
                    title="Remove"
                  >
                    <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                {index === 0 && (
                  <div className="absolute top-2 left-2 bg-[#d4a574] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    COVER
                  </div>
                )}
                {/* Drag handle indicator */}
                <div className="absolute bottom-2 right-2 p-1.5 bg-black/40 rounded-full opacity-0 hover:opacity-100 transition-opacity">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </div>
              </div>
              <input
                ref={(el) => setRef(el, index)}
                type="file"
                accept="image/*"
                onChange={(e) => handleFileSelect(e, index)}
                disabled={isUploading}
                className="hidden"
                id={`image-upload-${index}`}
              />
            </div>
          );
        })}

        {/* Empty upload slots */}
        {images.length < maxImages && (
          <div className="relative">
            <input
              ref={(el) => setRef(el, images.length)}
              type="file"
              accept="image/*"
              onChange={(e) => handleFileSelect(e, images.length)}
              disabled={uploadingIndex === images.length}
              className="hidden"
              id={`image-upload-${images.length}`}
            />
            <label
              htmlFor={`image-upload-${images.length}`}
              className={`flex flex-col items-center justify-center aspect-square rounded-xl border-2 border-dashed border-[#e8e4df] bg-[#faf8f5] cursor-pointer hover:border-[#d4a574] hover:bg-[#f5ebe0] transition-colors ${
                uploadingIndex === images.length ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {uploadingIndex === images.length ? (
                <svg className="animate-spin h-6 w-6 text-[#d4a574]" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <>
                  <svg className="w-6 h-6 text-[#b0b0b0] mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="text-xs text-[#b0b0b0]">{images.length === 0 ? 'Cover' : `Photo ${images.length + 1}`}</span>
                </>
              )}
            </label>
          </div>
        )}
      </div>
      <p className="text-xs text-[#7a7a7a]">
        First image is the cover photo. Drag images to reorder. PNG, JPG, WEBP up to 5MB each.
      </p>
    </div>
  );
}
