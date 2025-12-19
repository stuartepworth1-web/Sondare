import { useState, useRef } from 'react';
import { Upload, Loader2, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ImageUploadProps {
  currentUrl?: string;
  onImageUploaded: (url: string) => void;
}

export function ImageUpload({ currentUrl, onImageUploaded }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(currentUrl || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }

      setUploading(true);

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
        onImageUploaded(reader.result as string);
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image');
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreviewUrl('');
    onImageUploaded('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-white/80">Image</label>

      {previewUrl ? (
        <div className="relative aspect-video bg-black/40 rounded-lg overflow-hidden">
          <img
            src={previewUrl}
            alt="Preview"
            className="w-full h-full object-cover"
          />
          <button
            onClick={handleRemove}
            className="absolute top-2 right-2 p-1.5 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full aspect-video bg-black/40 rounded-lg border-2 border-dashed border-white/20 hover:border-orange-500 transition-colors flex flex-col items-center justify-center gap-2 disabled:opacity-50"
        >
          {uploading ? (
            <>
              <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
              <span className="text-sm text-white/60">Uploading...</span>
            </>
          ) : (
            <>
              <Upload className="w-8 h-8 text-white/40" />
              <span className="text-sm text-white/60">Click to upload image</span>
              <span className="text-xs text-white/40">Max 5MB</span>
            </>
          )}
        </button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      <div className="text-xs text-white/40">
        Supported formats: JPG, PNG, GIF, WebP
      </div>
    </div>
  );
}
