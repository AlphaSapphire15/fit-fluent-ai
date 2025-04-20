
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useStyle } from "@/contexts/StyleContext";
import PageContainer from "@/components/PageContainer";
import AnalysisResult from "@/components/AnalysisResult";
import DragAndDrop from "@/components/upload/DragAndDrop";
import FeedbackToneSelector from "@/components/upload/FeedbackToneSelector";
import { useImageAnalysis } from "@/hooks/useImageAnalysis";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const Upload = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const plan = searchParams.get("plan");
  const { tone, setTone } = useStyle();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const { isAnalyzing, analysisResult, analyzeImage, setAnalysisResult } = useImageAnalysis();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      navigate("/login?next=/upload");
    }
  }, [user, navigate]);

  // If user has a plan parameter, show a welcome toast
  useEffect(() => {
    if (plan && user) {
      toast({
        title: "Welcome to DresAI!",
        description: plan === "subscription" 
          ? "You've chosen the Unlimited Plan. Upload as many outfits as you want!" 
          : "You've chosen the One-Time Scan. Let's analyze your outfit!"
      });
    }
  }, [plan, user, toast]);

  const resetState = () => {
    setPreview(null);
    setAnalysisResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please upload an image file.",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = (e.target?.result as string).split(',')[1];
      setPreview(e.target?.result as string);
      try {
        await analyzeImage(base64);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Analysis failed",
          description: "Please try again with a different image.",
        });
        setPreview(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const openFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <PageContainer showBackButton>
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-satoshi font-bold mb-2">Upload Your Fit</h1>
        <p className="text-muted-foreground">Let's see what you're wearing today</p>
      </div>

      {!analysisResult ? (
        <>
          <DragAndDrop
            preview={preview}
            isAnalyzing={isAnalyzing}
            onFileChange={handleFile}
            openFileInput={openFileInput}
          />
          <FeedbackToneSelector tone={tone} setTone={setTone} />
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
