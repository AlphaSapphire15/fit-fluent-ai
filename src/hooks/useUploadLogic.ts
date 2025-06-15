
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
        setDialogMessage("You don't have access to analyze outfits. You can use your free trial or purchase credits/subscription to continue.");
        setShowDialog(true);
        return;
      }
      
      // Proceed with analysis
      console.log("Proceeding with image analysis...");
      await analyzeImage(currentFile, tone);
      
    } catch (error) {
      console.error("Analysis error:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setDialogMessage(`Analysis failed: ${errorMessage}. Please try with a different photo or contact support.`);
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
