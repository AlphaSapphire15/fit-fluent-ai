
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { prepareImageForAnalysis } from "@/utils/imagePreparation";
import { findMatchingStyleCore } from "@/utils/styleCore";
import { parseAnalysisResponse, type AnalysisResult } from "@/utils/analysisParser";

export const useImageAnalysis = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const { toast } = useToast();

  const analyzeImage = async (inputBase64OrFile: string | File, tone: string = 'straightforward') => {
    setIsAnalyzing(true);

    try {
      console.log("Starting image analysis process");
      
      console.log("Preparing image for analysis");
      const imageUrl = await prepareImageForAnalysis(inputBase64OrFile);
      
      console.log("Calling analyze-outfit function with image data and tone:", tone);
      
      const { data, error } = await supabase.functions.invoke('analyze-outfit', {
        body: { imageUrl, tone }
      });

      if (error) {
        console.error('Function invocation error:', error);
        throw new Error(`Analysis failed: ${error.message || 'Unknown error'}`);
      }

      if (!data || !data.analysis) {
        throw new Error('No analysis data received from server');
      }

      console.log("Received analysis:", data.analysis);
      
      // Parse the analysis response
      const parsedResult = parseAnalysisResponse(data.analysis);
      
      // Find matching style core from database
      const matchedStyle = await findMatchingStyleCore(parsedResult.styleCore);
      
      // Get formatted style core text using the matched database entry if available
      const result = {
        ...parsedResult,
        styleCore: matchedStyle ? matchedStyle.full_label : parsedResult.styleCore
      };

      console.log("Processed analysis result:", result);
      
      setAnalysisResult(result);
      
      toast({
        title: "Analysis Complete!",
        description: "Your outfit has been analyzed successfully."
      });
      
    } catch (err) {
      console.error('Analysis error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      
      toast({
        variant: "destructive",
        title: "Analysis failed",
        description: errorMessage,
      });
      throw err;
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
