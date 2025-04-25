
import React, { useRef, useState } from "react";
import { Camera, Upload as UploadIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import LoadingOverlay from "./LoadingOverlay";

interface DragAndDropProps {
  preview: string | null;
  isAnalyzing: boolean;
  onFileChange: (file: File) => void;
  openFileInput: () => void;
  onAnalyze: () => void;
  score?: number;
}

const DragAndDrop: React.FC<DragAndDropProps> = ({
  preview,
  isAnalyzing,
  onFileChange,
  openFileInput,
  onAnalyze,
  score
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();
  const [isMobile, setIsMobile] = useState(false);

  // Check if device is mobile
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(/iPhone|iPad|iPod/i.test(navigator.userAgent));
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
      // For iPhones, specifically request camera access
      fileInputRef.current.setAttribute('capture', 'environment');
      fileInputRef.current.setAttribute('accept', 'image/*');
    } else {
      // For desktop, just open file picker with image filter
      fileInputRef.current.removeAttribute('capture');
      fileInputRef.current.setAttribute('accept', 'image/*');
    }
    
    fileInputRef.current.click();
  };

  return (
    <div
      className={`glass-card rounded-xl p-4 mb-6 relative ${
        isDragging ? "border-2 border-neonBlue glow-border" : ""
      } ${!preview ? "h-64" : ""}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {!preview ? (
        <div className="h-full flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-neonBlue/10 flex items-center justify-center mb-4">
            <UploadIcon size={24} className="text-neonBlue" />
          </div>
          <p className="mb-2 font-medium">Drag and drop your photo here</p>
          <p className="text-sm text-muted-foreground mb-4">
            Or use one of the options below
          </p>
          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
            <Button 
              variant="gradient"
              size="sm"
              className="text-sm w-full"
              onClick={handleTakePhoto}
            >
              <Camera size={14} className="mr-1" /> Take Picture
            </Button>
            <Button
              variant="gradient"
              size="sm"
              onClick={openFileInput}
              className="text-sm w-full"
            >
              Browse Files
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
          {score && (
            <div className="absolute top-4 right-4 w-16 h-16 rounded-full flex items-center justify-center bg-black/80 backdrop-blur-sm text-white border border-lilac">
              <div className="text-center">
                <span className="text-xl font-bold">{score}</span>
                <span className="text-sm">/100</span>
              </div>
            </div>
          )}
          {isAnalyzing ? (
            <LoadingOverlay />
          ) : (
            <div className="absolute bottom-0 left-0 right-0 p-3 flex flex-col gap-2 bg-black/50 backdrop-blur-sm">
              <Button
                variant="gradient"
                size="sm"
                className="text-sm w-full"
                onClick={onAnalyze}
              >
                Analyze Fit
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-sm w-full bg-white/80"
                onClick={openFileInput}
              >
                Change Photo
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DragAndDrop;
