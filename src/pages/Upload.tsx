import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import React, { useRef, useState } from "react";
import { Camera, Upload as UploadIcon, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import PageContainer from "@/components/PageContainer";
import { useStyle } from "@/contexts/StyleContext";
import { supabase } from "@/integrations/supabase/client";
import AnalysisResult from "@/components/AnalysisResult";

const Upload = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { tone, setTone } = useStyle();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{
    score: number;
    styleCore: string;
    strengths: string[];
    suggestion: string;
  } | null>(null);

  useEffect(() => {
    if (!user) {
      navigate("/login?next=/upload");
    }
  }, [user, navigate]);

  const resetState = () => {
    setPreview(null);
    setAnalysisResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const analyzeImage = async (base64: string) => {
    const startTime = Date.now();
    setIsAnalyzing(true);

    try {
      const { data, error } = await supabase.functions.invoke('analyze-outfit', {
        body: { imageUrl: `data:image/jpeg;base64,${base64}` }
      });

      if (error) throw error;

      // Check for duplicate result
      const roundTripTime = Date.now() - startTime;
      if (roundTripTime < 300) {
        toast({
          title: "Notice",
          description: "Duplicate result loaded",
        });
      }

      // Parse the analysis response
      const analysis = data.analysis;
      const matches = {
        score: parseInt(analysis.match(/(\d+)(?=\/100)/)?.[0] || "0"),
        styleCore: analysis.match(/core style description.*?:\s*(.*?)(?=\n|$)/i)?.[1] || "",
        strengths: (analysis.match(/key strengths:(.*?)(?=potential improvements|\n\n)/is)?.[1] || "")
          .split('\n')
          .filter(s => s.trim())
          .map(s => s.replace(/^[•\-\s]+/, '').trim()),
        suggestion: (analysis.match(/specific styling suggestion:(.*?)(?=\n|$)/i)?.[1] || "").trim()
      };

      setAnalysisResult(matches);
    } catch (err) {
      console.error('Analysis error:', err);
      toast({
        variant: "destructive",
        title: "Analysis failed",
        description: "Please try again",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFile = async (file?: File) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please upload an image file.",
      });
      return;
    }

    // Read and display preview
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = (e.target?.result as string).split(',')[1];
      setPreview(e.target?.result as string);
      await analyzeImage(base64);
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
    { value: "chill", label: "Chill", description: "Casual and friendly vibes" },
    { value: "straightforward", label: "Straightforward", description: "Clear and direct feedback" },
    { value: "creative", label: "Creative", description: "Artistic and expressive" }
  ];

  return (
    <PageContainer showBackButton>
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-satoshi font-bold mb-2">Upload Your Fit</h1>
        <p className="text-muted-foreground">Let's see what you're wearing today</p>
      </div>

      {!analysisResult ? (
        <>
          <div className="mb-10">
            <div
              className={`glass-card rounded-xl p-4 mb-6 ${
                isDragging ? "glow-border" : ""
              } ${!preview ? "h-64" : ""}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {isAnalyzing ? (
                <div className="h-full flex flex-col items-center justify-center">
                  <Loader className="w-8 h-8 animate-spin text-lilac mb-4" />
                  <p className="text-lg font-medium">Analyzing your outfit...</p>
                </div>
              ) : !preview ? (
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
                onChange={(e) => handleFile(e.target.files?.[0])}
                accept="image/*"
                className="hidden"
              />
            </div>
          </div>

          <div className="mb-10">
            <h2 className="text-lg font-medium mb-4">How would you like your feedback?</h2>
            <RadioGroup value={tone} onValueChange={(value) => setTone(value as any)}>
              <div className="flex flex-col gap-3">
                {toneOptions.map((option) => (
                  <div key={option.value} className="w-full">
                    <div 
                      className={`glass-card rounded-full p-4 cursor-pointer border-2 transition-all 
                        hover:border-lilac/30 hover:shadow-[0_0_15px_rgba(167,139,250,0.3)]
                        ${tone === option.value ? "border-lilac shadow-[0_0_15px_rgba(167,139,250,0.3)]" : "border-transparent"}`}
                    >
                      <RadioGroupItem
                        value={option.value}
                        id={option.value}
                        className="sr-only"
                      />
                      <Label
                        htmlFor={option.value}
                        className="flex flex-col cursor-pointer"
                      >
                        <span className="font-medium text-lg">{option.label}</span>
                        <span className="text-muted-foreground text-sm mt-1">
                          {option.description}
                        </span>
                      </Label>
                    </div>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>
        </>
      ) : (
        <div className="space-y-6">
          <AnalysisResult {...analysisResult} />
          <Button
            onClick={resetState}
            className="w-full bg-lilac hover:bg-lilac/90 text-white py-6 h-auto text-lg rounded-full"
          >
            Upload Another Fit
          </Button>
        </div>
      )}
    </PageContainer>
  );
};

export default Upload;
