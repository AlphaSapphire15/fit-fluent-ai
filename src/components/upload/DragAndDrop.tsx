
import React, { useRef } from "react";
import { Camera, Upload as UploadIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DragAndDropProps {
  preview: string | null;
  isAnalyzing: boolean;
  onFileChange: (file: File) => void;
  openFileInput: () => void;
}

const DragAndDrop: React.FC<DragAndDropProps> = ({
  preview,
  isAnalyzing,
  onFileChange,
  openFileInput,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) onFileChange(file);
  };

  return (
    <div
      className={`glass-card rounded-xl p-4 mb-6 ${
        isDragging ? "glow-border" : ""
      } ${!preview ? "h-64" : ""}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {!preview ? (
        <div className="h-full flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-lilac/10 flex items-center justify-center mb-4">
            <UploadIcon size={24} className="text-lilac" />
          </div>
          <p className="mb-2 font-medium">Drag and drop your photo here</p>
          <p className="text-sm text-muted-foreground mb-4">
            Or click below to select a file
          </p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={openFileInput}
              className="text-sm"
            >
              Browse Files
            </Button>
            <Button variant="outline" size="sm" className="text-sm">
              <Camera size={14} className="mr-1" /> Take Photo
            </Button>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => e.target.files?.[0] && onFileChange(e.target.files[0])}
            accept="image/*"
            className="hidden"
          />
        </div>
      ) : (
        <div className="relative">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-auto rounded-lg object-cover aspect-[4/5]"
          />
          <Button
            variant="secondary"
            size="sm"
            className="absolute bottom-3 right-3 text-xs"
            onClick={openFileInput}
          >
            Change Photo
          </Button>
        </div>
      )}
    </div>
  );
};

export default DragAndDrop;
