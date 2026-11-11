'use client';

import { useState, useRef, type ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { UploadCloud, X, Image as ImageIcon, CheckCircle } from 'lucide-react';

export type ImageSlot = 'thumbnail' | 'backview' | 'gallery';

export interface ImageSlotUploaderProps {
  slot: ImageSlot;
  label?: string;
  description?: string;
  currentUrl?: string | null;
  currentUrls?: string[];
  maxFiles?: number;
  onFileSelect?: (file: File) => void;
  onFilesSelect?: (files: File[]) => void;
  onRemove?: (index?: number) => void;
  disabled?: boolean;
}

export function ImageSlotUploader({
  slot,
  label,
  description,
  currentUrl,
  currentUrls = [],
  maxFiles = 6,
  onFileSelect,
  onFilesSelect,
  onRemove,
  disabled = false,
}: ImageSlotUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const defaultTitles: Record<ImageSlot, string> = {
    thumbnail: 'Thumbnail (Front View)',
    backview: 'Back View Image',
    gallery: 'Gallery Images (Up to 6)',
  };

  const defaultDescriptions: Record<ImageSlot, string> = {
    thumbnail: 'Primary catalog and search card display image. Max 2MB (WebP, JPEG).',
    backview: 'Secondary hover view for apparel catalog. Max 2MB.',
    gallery: 'Additional detail, model, and lifestyle shots. Up to 6 slots.',
  };

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    if (slot === 'gallery') {
      const validFiles = Array.from(files).filter(f => f.size <= 2 * 1024 * 1024);
      if (onFilesSelect) onFilesSelect(validFiles);
    } else {
      const file = files[0];
      if (file && file.size <= 2 * 1024 * 1024) {
        if (onFileSelect) onFileSelect(file);
      }
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  return (
    <div className="space-y-2 rounded-2xl border border-border bg-card p-4 shadow-2xs">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-xs font-semibold text-foreground">
            {label || defaultTitles[slot]}
          </h4>
          <p className="text-[11px] text-muted-foreground">
            {description || defaultDescriptions[slot]}
          </p>
        </div>
        {slot !== 'gallery' && currentUrl && (
          <span className="flex items-center gap-1 rounded-full bg-pastel-softgreen px-2 py-0.5 text-[10px] font-semibold text-primary-deep">
            <CheckCircle className="h-3 w-3" /> Uploaded
          </span>
        )}
      </div>

      {/* Single Slot: Thumbnail or Backview */}
      {slot !== 'gallery' ? (
        currentUrl ? (
          <div className="relative group flex h-40 w-full items-center justify-center overflow-hidden rounded-xl border border-border bg-muted/20">
            <img
              src={currentUrl}
              alt={label || slot}
              className="h-full w-full object-contain"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => onRemove && onRemove()}
                disabled={disabled}
                className="h-8 gap-1.5 rounded-lg text-xs"
              >
                <X className="h-3.5 w-3.5" /> Remove
              </Button>
            </div>
          </div>
        ) : (
          <div
            onDragOver={e => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={e => {
              e.preventDefault();
              setDragActive(false);
              handleFiles(e.dataTransfer.files);
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`flex h-36 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors ${
              dragActive
                ? 'border-primary bg-mint/20'
                : 'border-border bg-muted/10 hover:border-primary/50 hover:bg-mint/10'
            }`}
          >
            <UploadCloud className="h-8 w-8 text-muted-foreground mb-1.5" />
            <span className="text-xs font-semibold text-foreground">Click to upload or drag image</span>
            <span className="text-[10px] text-muted-foreground mt-0.5">Max 2MB — WebP, PNG, JPG</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/webp,image/png,image/jpeg"
              onChange={handleChange}
              className="hidden"
              disabled={disabled}
            />
          </div>
        )
      ) : (
        /* Multi Slot: Gallery */
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-6">
            {currentUrls.map((url, idx) => (
              <div
                key={idx}
                className="group relative flex h-24 w-full items-center justify-center overflow-hidden rounded-xl border border-border bg-muted/20"
              >
                <img src={url} alt={`Gallery item ${idx + 1}`} className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => onRemove && onRemove(idx)}
                  className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove image"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}

            {currentUrls.length < maxFiles && (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex h-24 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/10 hover:border-primary/50 hover:bg-mint/10 transition-colors"
              >
                <ImageIcon className="h-5 w-5 text-muted-foreground" />
                <span className="text-[10px] font-medium text-muted-foreground mt-1">Add Image</span>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/webp,image/png,image/jpeg"
            multiple
            onChange={handleChange}
            className="hidden"
            disabled={disabled}
          />
        </div>
      )}
    </div>
  );
}
