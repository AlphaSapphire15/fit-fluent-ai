
import { useToast } from "@/hooks/use-toast";
import { useImageAnalysis } from "@/hooks/useImageAnalysis";
import { useUserPlan } from "@/hooks/useUserPlan";

export const useUploadLogic = () => {
  const { toast } = useToast();
  const { isAnalyzing, analysisResult, analyzeImage, setAnalysisResult } = useImageAnalysis();
  const { useAnalysis, refreshPlanStatus } = useUserPlan();

  const handleAnalyze = async (
    currentFile: File | null,
    tone: string,
    setIsSubmitting: (value: boolean) => void,
    setDialogMessage: (message: string) => void,
    setShowDialog: (show: boolean) => void,
    setPreview: (preview: string | null) => void
  ) => {
    if (!currentFile || isAnalyzing) {
      toast({
        title: "Please wait",
        description: "Your outfit is already being analyzed"
      });
      return;
    }
    
    console.log("=== STARTING ANALYSIS ===");
    
    try {
      setIsSubmitting(true);
      
      // Use analysis credit first
      console.log("Attempting to use analysis credit...");
      const analysisUsed = await useAnalysis();
      console.log("Analysis credit used:", analysisUsed);
      
      if (!analysisUsed) {
        setDialogMessage("Unable to process analysis. Please try again or contact support if you have an active subscription.");
        setShowDialog(true);
        return;
      }
      
      // Proceed with analysis
      console.log("Proceeding with image analysis...");
      await analyzeImage(currentFile, tone);
      
      toast({
        title: "Analysis Complete!",
        description: "Your outfit has been analyzed successfully."
      });
      
    } catch (error) {
      console.error("Analysis error:", error);
      setDialogMessage("Unable to analyze this image. Please try with a different photo.");
      setShowDialog(true);
      setPreview(null);
      // Refresh plan status in case there was an error
      refreshPlanStatus();
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isAnalyzing,
    analysisResult,
    setAnalysisResult,
    handleAnalyze
  };
};
