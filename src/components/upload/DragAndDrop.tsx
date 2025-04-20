
import React, { useRef } from "react";
import { Camera, Upload as UploadIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();

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
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast({
          variant: "destructive",
          title: "Invalid file type",
          description: "Please upload an image file.",
        });
        return;
      }
      onFileChange(file);
    }
  };

  const handleTakePhoto = () => {
    if (!fileInputRef.current) return;
    
    // Set accept attribute to capture from camera when possible
    fileInputRef.current.setAttribute('capture', 'environment');
    fileInputRef.current.setAttribute('accept', 'image/*');
    fileInputRef.current.click();
    
    // Reset to normal file input afterwards
    setTimeout(() => {
      if (fileInputRef.current) {
        fileInputRef.current.removeAttribute('capture');
      }
    }, 1000);
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
            <Button 
              variant="outline" 
              size="sm" 
              className="text-sm"
              onClick={handleTakePhoto}
            >
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
          <div className="absolute bottom-3 right-3 flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              className="text-xs"
              onClick={openFileInput}
            >
              Change Photo
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DragAndDrop;
