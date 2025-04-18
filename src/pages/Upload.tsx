import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, Upload as UploadIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import PageContainer from "@/components/PageContainer";
import { useStyle } from "@/contexts/StyleContext";

const Upload = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { image, setImage, tone, setTone } = useStyle();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    handleFile(file);
  };

  const handleFile = (file?: File) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please upload an image file.",
      });
      return;
    }

    setImage(file);
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

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
    handleFile(file);
  };

  const openFileInput = () => {
    fileInputRef.current?.click();
  };

  const toneOptions = [
    { value: "chill", label: "Chill", description: "Laid back and friendly" },
    { value: "straightforward", label: "Straightforward", description: "Clear and direct" },
    { value: "creative", label: "Creative", description: "Artful and expressive" },
  ];

  const handleContinue = () => {
    if (!image) {
      toast({
        variant: "destructive",
        title: "No image selected",
        description: "Please upload an outfit photo to continue.",
      });
      return;
    }
    navigate("/payment");
  };

  return (
    <PageContainer showBackButton>
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-satoshi font-bold mb-2">Upload Your Fit</h1>
        <p className="text-muted-foreground">Let's see what you're wearing today</p>
      </div>

      <div className="mb-10">
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
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
        </div>
      </div>

      <div className="mb-10">
        <h2 className="text-lg font-medium mb-4">How would you like your feedback?</h2>
        <RadioGroup value={tone} onValueChange={(value) => setTone(value as any)}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {toneOptions.map((option) => (
              <div key={option.value} className="space-y-2">
                <div className={`glass-card rounded-full p-4 cursor-pointer border-2 transition-all hover:border-lilac/30 ${tone === option.value ? "border-lilac" : "border-transparent"}`}>
                  <RadioGroupItem
                    value={option.value}
                    id={option.value}
                    className="sr-only"
                  />
                  <Label
                    htmlFor={option.value}
                    className="flex flex-col cursor-pointer"
                  >
                    <span className="font-medium text-center">{option.label}</span>
                    <span className="text-muted-foreground text-xs mt-1 text-center">
                      {option.description}
                    </span>
                  </Label>
                </div>
              </div>
            ))}
          </div>
        </RadioGroup>
      </div>

      <Button
        onClick={handleContinue}
        className="w-full bg-lilac hover:bg-lilac/90 text-white py-6 h-auto text-lg rounded-full"
      >
        Continue to Style Analysis
      </Button>
    </PageContainer>
  );
};

export default Upload;
