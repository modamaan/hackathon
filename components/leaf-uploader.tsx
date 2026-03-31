"use client";

import { useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Camera, X, ImageIcon } from "lucide-react";

interface Props {
  onImageSelect: (file: File, preview: string) => void;
}

export default function LeafUploader({ onImageSelect }: Props) {
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) return;
      const url = URL.createObjectURL(file);
      setPreview(url);
      onImageSelect(file, url);
    },
    [onImageSelect]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const clear = () => {
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  if (preview) {
    return (
      <div className="relative rounded-xl overflow-hidden border border-border group">
        <img
          src={preview}
          alt="Leaf preview"
          className="w-full h-56 object-cover"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => fileInputRef.current?.click()}
          >
            Change Photo
          </Button>
          <Button size="icon" variant="destructive" onClick={clear}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="absolute top-2 right-2">
          <Button
            size="icon"
            variant="destructive"
            className="w-7 h-7"
            onClick={clear}
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
      </div>
    );
  }

  return (
    <div
      className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
        dragging
          ? "border-primary bg-primary/5 scale-105"
          : "border-border hover:border-primary/60 hover:bg-primary/3"
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
        <ImageIcon className="w-7 h-7 text-primary" />
      </div>
      <p className="font-semibold text-foreground mb-1 font-malayalam">
        ഇലയുടെ ഫോട്ടോ അപ്ലോഡ് ചെയ്യൂ
      </p>
      <p className="text-sm text-muted-foreground mb-5">
        Drag & drop or click to upload · JPG, PNG, WEBP
      </p>
      <div className="flex gap-2 justify-center">
        <Button
          size="sm"
          variant="outline"
          onClick={(e) => {
            e.stopPropagation();
            fileInputRef.current?.click();
          }}
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload Photo
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={(e) => {
            e.stopPropagation();
            cameraInputRef.current?.click();
          }}
        >
          <Camera className="w-4 h-4 mr-2" />
          Open Camera
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
    </div>
  );
}
