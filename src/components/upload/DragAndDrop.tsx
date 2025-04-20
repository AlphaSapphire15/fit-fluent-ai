
import React, { useRef, useState } from "react";
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
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();
  const [isMobile, setIsMobile] = useState(false);

  // Check if device is mobile
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    };
    checkMobile();
  }, []);

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

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileChange(file);
    }
  };

  const handleTakePhoto = () => {
    if (!fileInputRef.current) return;
    
    if (isMobile) {
      // For mobile devices, use camera
      fileInputRef.current.setAttribute('capture', 'environment');
      fileInputRef.current.setAttribute('accept', 'image/*');
    } else {
      // For desktop, just open file picker with image filter
      fileInputRef.current.removeAttribute('capture');
      fileInputRef.current.setAttribute('accept', 'image/*');
      
      toast({
        title: "Desktop detected",
        description: "Opening file browser since camera may not be available.",
      });
    }
    
    fileInputRef.current.click();
  };

  return (
    <div
      className={`glass-card rounded-xl p-4 mb-6 ${
        isDragging ? "border-2 border-lilac glow-border" : ""
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
              className="text-sm hover:bg-lilac/10 hover:border-lilac/30"
            >
              Browse Files
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-sm hover:bg-lilac/10 hover:border-lilac/30"
              onClick={handleTakePhoto}
            >
              <Camera size={14} className="mr-1" /> {isMobile ? "Take Photo" : "Choose Image"}
            </Button>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileInputChange}
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
