'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';

interface ImageUploadProps {
  currentImage?: string | null;
  onImageChange: (imageUrl: string) => void;
  onUploadStart?: () => void;
  onUploadEnd?: () => void;
}

/** Compress image client-side before upload. Returns a Blob. */
async function compressImage(file: File, maxWidth = 2000, maxHeight = 2000, quality = 0.92): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas not supported'));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Compression failed'));
        },
        'image/jpeg',
        quality
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image for compression'));
    };
    img.src = url;
  });
}

export default function ImageUpload({ 
  currentImage, 
  onImageChange,
  onUploadStart,
  onUploadEnd
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    setError('');
    setUploading(true);
    if (onUploadStart) onUploadStart();

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    try {
      // Compress if file is larger than 1MB
      let uploadBlob: Blob = file;
      let uploadName = file.name;
      if (file.size > 1024 * 1024) {
        uploadBlob = await compressImage(file);
        uploadName = file.name.replace(/\.[^.]+$/, '.jpg');
      }

      const formData = new FormData();
      formData.append('image', uploadBlob, uploadName);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        let msg = 'Upload failed';
        try {
          const data = await response.json();
          msg = data.error || `Upload failed (${response.status})`;
        } catch {
          msg = `Upload failed (${response.status})`;
        }
        throw new Error(msg);
      }

      const data = await response.json();
      onImageChange(data.url);
      setPreview(data.url);
    } catch (error) {
      console.error('[ImageUpload] Upload error:', error);
      setError(error instanceof Error ? error.message : 'Upload failed. Please try again.');
      setPreview(currentImage || null);
    } finally {
      setUploading(false);
      if (onUploadEnd) onUploadEnd();
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onImageChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-[#7a7a7a]">
        Product Image
      </label>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-xl text-sm">
          {error}
        </div>
      )}

      <div className="space-y-3">
        {preview && (
          <div className="relative w-full max-w-sm">
            <div className="relative aspect-square rounded-xl overflow-hidden border border-[#F0E6DD]">
              <Image
                src={preview}
                alt="Product preview"
                fill
                className="object-cover"
              />
            </div>
            {!uploading && (
              <button
                type="button"
                onClick={handleRemove}
                className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        )}

        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={uploading}
            className="hidden"
            id="image-upload"
            formNoValidate
          />
          <label
            htmlFor="image-upload"
            className={`inline-flex items-center px-6 py-3 bg-[#FFF0F5] text-[#FF6B9D] font-semibold rounded-full cursor-pointer hover:bg-[#ede0d1] transition-colors ${
              uploading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {uploading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Uploading...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                {preview ? 'Change Image' : 'Upload Image'}
              </>
            )}
          </label>
          <p className="mt-1 text-xs text-[#7a7a7a]">
            PNG, JPG, WEBP — auto-compressed if large
          </p>
        </div>
      </div>
    </div>
  );
}
