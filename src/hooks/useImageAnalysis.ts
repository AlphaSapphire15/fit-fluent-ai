
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AnalysisResult {
  score: number;
  styleCore: string;
  strengths: string[];
  suggestion: string;
}

export const useImageAnalysis = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const { toast } = useToast();

  const analyzeImage = async (base64: string) => {
    const startTime = Date.now();
    setIsAnalyzing(true);

    try {
      // Make sure we're sending the full base64 string with data URI prefix
      const imageUrl = base64.startsWith('data:') ? base64 : `data:image/jpeg;base64,${base64}`;
      
      console.log("Calling analyze-outfit function with image data");
      
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
      console.log("Received analysis:", analysis);
      
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
        description: "Please try again with a different image",
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
