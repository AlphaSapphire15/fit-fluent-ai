
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AnalysisResult {
  score: number;
  styleCore: string;
  strengths: string[];
  suggestion: string;
}

/**
 * Converts a File/Blob to a PNG base64 string.
 * Returns a data URL ("data:image/png;base64,...")
 */
async function toPngBase64(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = function (e) {
      const img = new window.Image();
      img.onload = function () {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas 2D context error"));
        ctx.drawImage(img, 0, 0);
        try {
          const pngDataUrl = canvas.toDataURL("image/png");
          resolve(pngDataUrl);
        } catch (e) {
          reject(e);
        }
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export const useImageAnalysis = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const { toast } = useToast();

  const analyzeImage = async (inputBase64OrFile: string | File) => {
    const startTime = Date.now();
    setIsAnalyzing(true);

    try {
      let imageUrl: string;

      // If it's a base64 string and already has a supported prefix
      if (typeof inputBase64OrFile === "string" && /^data:image\/(jpeg|jpg|png|gif|webp);base64,/.test(inputBase64OrFile)) {
        imageUrl = inputBase64OrFile;
      } else if (inputBase64OrFile instanceof File) {
        // If the file is in a supported format, get its base64
        const fileType = inputBase64OrFile.type;
        if (/^image\/(jpeg|jpg|png|gif|webp)$/.test(fileType)) {
          imageUrl = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = e => resolve(e.target?.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(inputBase64OrFile);
          });
        } else {
          // Convert to PNG and get base64
          imageUrl = await toPngBase64(inputBase64OrFile);
        }
      } else if (typeof inputBase64OrFile === "string" && inputBase64OrFile.startsWith("data:")) {
        // It's a base64 of unsupported format
        // Convert to image, then back to png base64
        const img = new window.Image();
        img.src = inputBase64OrFile;
        await new Promise((res, rej) => {
          img.onload = res;
          img.onerror = rej;
        });
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("No canvas context");
        ctx.drawImage(img, 0, 0);
        imageUrl = canvas.toDataURL("image/png");
      } else {
        throw new Error("Unsupported image type");
      }

      // Safety: Only allow allowed formats (jpeg/jpg/png/gif/webp)
      if (!/^data:image\/(jpeg|jpg|png|gif|webp);base64,/.test(imageUrl)) {
        // Fallback: use PNG
        imageUrl = imageUrl.replace(/^data:image\/[^;]+/, 'data:image/png');
      }

      const { data, error } = await supabase.functions.invoke('analyze-outfit', {
        body: { imageUrl }
      });

      if (error) {
        console.error('Function invocation error:', error);
        throw error;
      }

      const roundTripTime = Date.now() - startTime;
      if (roundTripTime < 300) {
        toast({
          title: "Notice",
          description: "Duplicate result loaded",
        });
      }

      const analysis = data.analysis;
      const matches = {
        score: parseInt(analysis.match(/(\d+)(?=\/100)/)?.[0] || "0"),
        styleCore: analysis.match(/core style description.*?:\s*(.*?)(?=\n|$)/i)?.[1] || "",
        strengths: (analysis.match(/key strengths:(.*?)(?=potential improvements|\n\n)/is)?.[1] || "")
          .split('\n')
          .filter((s: string) => s.trim())
          .map((s: string) => s.replace(/^[•\-\s]+/, '').trim()),
        suggestion: (analysis.match(/specific styling suggestion:(.*?)(?=\n|$)/i)?.[1] || "").trim()
      };

      setAnalysisResult(matches);
    } catch (err) {
      console.error('Analysis error:', err);
      toast({
        variant: "destructive",
        title: "Analysis failed",
        description: "Please try again with a different JPG/PNG image.",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return {
    isAnalyzing,
    analysisResult,
    analyzeImage,
    setAnalysisResult
  };
};
