'use client';

import { Share2, Check } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface ShareButtonProps {
  productId: string;
  productName: string;
  className?: string;
}

export function ShareButton({ productId, productName, className = '' }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = `${window.location.origin}/product/${productId}`;
    
    // Check if Web Share API is available (mobile/modern browsers)
    if (navigator.share) {
      try {
        await navigator.share({
          title: productName,
          text: `Check out this baby product: ${productName}`,
          url: url,
        });
        return;
      } catch (err) {
        // User canceled or share failed, fall back to copy
      }
    }

    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleShare}
      className={`inline-flex items-center gap-1.5 p-2 text-[#7a7a7a] hover:text-[#d4a574] transition-colors ${className}`}
      title="Share product"
    >
      {copied ? (
        <Check className="w-4 h-4" />
      ) : (
        <Share2 className="w-4 h-4" />
      )}
    </button>
  );
}