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
      newImages[index] = data.url;
      onImagesChange(newImages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploadingIndex(null);
      if (onUploadEnd) onUploadEnd();
      // Clear the input so the same file can be selected again if needed
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

  const slots = Array.from({ length: maxImages }, (_, i) => i);

  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-[#7a7a7a]">
        Product Images <span className="text-[#b0b0b0] font-normal">({images.length}/{maxImages})</span>
      </label>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-xl text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {slots.map((slotIndex) => {
          const imageUrl = images[slotIndex];
          const isUploading = uploadingIndex === slotIndex;

          return (
            <div key={slotIndex} className="relative">
              <input
                ref={(el) => setRef(el, slotIndex)}
                type="file"
                accept="image/*"
                onChange={(e) => handleFileSelect(e, slotIndex)}
                disabled={isUploading}
                className="hidden"
                id={`image-upload-${slotIndex}`}
              />
              
              {imageUrl ? (
                <div className="relative aspect-square rounded-xl overflow-hidden border border-[#e8e4df] bg-[#f5f1ec]">
                  <Image
                    src={imageUrl}
                    alt={`Product image ${slotIndex + 1}`}
                    fill
                    className="object-cover"
                  />
                  {/* Overlay actions */}
                  <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-colors flex items-center justify-center gap-2 opacity-0 hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => document.getElementById(`image-upload-${slotIndex}`)?.click()}
                      className="p-2 bg-white rounded-full hover:bg-[#f5f1ec] transition-colors"
                      title="Replace"
                    >
                      <svg className="w-4 h-4 text-[#2d2d2d]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemove(slotIndex)}
                      className="p-2 bg-white rounded-full hover:bg-red-50 transition-colors"
                      title="Remove"
                    >
                      <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  {slotIndex === 0 && (
                    <div className="absolute top-2 left-2 bg-[#d4a574] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      COVER
                    </div>
                  )}
                </div>
              ) : (
                <label
                  htmlFor={`image-upload-${slotIndex}`}
                  className={`flex flex-col items-center justify-center aspect-square rounded-xl border-2 border-dashed border-[#e8e4df] bg-[#faf8f5] cursor-pointer hover:border-[#d4a574] hover:bg-[#f5ebe0] transition-colors ${
                    isUploading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isUploading ? (
                    <svg className="animate-spin h-6 w-6 text-[#d4a574]" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <>
                      <svg className="w-6 h-6 text-[#b0b0b0] mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span className="text-xs text-[#b0b0b0]">{slotIndex === 0 ? 'Cover' : `Photo ${slotIndex + 1}`}</span>
                    </>
                  )}
                </label>
              )}
            </div>
          );
        })}
      </div>
      <p className="text-xs text-[#7a7a7a]">
        First image is the cover photo. PNG, JPG, WEBP up to 5MB each.
      </p>
    </div>
  );
}
