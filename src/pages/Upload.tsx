
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useStyle } from "@/contexts/StyleContext";
import PageContainer from "@/components/PageContainer";
import AnalysisResult from "@/components/AnalysisResult";
import DragAndDrop from "@/components/upload/DragAndDrop";
import FeedbackToneSelector from "@/components/upload/FeedbackToneSelector";
import { useImageAnalysis } from "@/hooks/useImageAnalysis";
import { useUserPlan } from "@/hooks/useUserPlan";
import { useToast } from "@/hooks/use-toast";
import { 
  Dialog,
  DialogContent, 
  DialogTitle, 
  DialogDescription,
  DialogHeader,
  DialogFooter
} from "@/components/ui/dialog";

const Upload = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const paymentSuccess = searchParams.get("payment_success");
  const { tone, setTone } = useStyle();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const { isAnalyzing, analysisResult, analyzeImage, setAnalysisResult } = useImageAnalysis();
  const { hasAccess, useCredit, getDisplayText, refreshPlanStatus, loading: planLoading } = useUserPlan();
  const { toast } = useToast();
  const [showDialog, setShowDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshingPlan, setIsRefreshingPlan] = useState(false);

  useEffect(() => {
    // If user is not logged in, redirect to login
    if (!user) {
      navigate("/login?next=/upload");
      return;
    }

    // Handle payment success
    if (sessionId && paymentSuccess) {
      console.log("Payment successful, refreshing plan status");
      setIsRefreshingPlan(true);
      
      // Show success message
      toast({
        title: "Payment Successful!",
        description: "Your payment was successful. Refreshing your plan status..."
      });
      
      // Refresh plan status after payment with retry logic
      const refreshWithRetry = async (attempts = 0) => {
        try {
          await refreshPlanStatus();
          setIsRefreshingPlan(false);
          
          // Clear URL parameters after successful refresh
          const newUrl = window.location.pathname;
          window.history.replaceState({}, '', newUrl);
          
          toast({
            title: "Plan Updated!",
            description: "You can now analyze your outfit."
          });
        } catch (error) {
          console.error("Error refreshing plan:", error);
          if (attempts < 3) {
            // Retry after a delay
            setTimeout(() => refreshWithRetry(attempts + 1), 2000);
          } else {
            setIsRefreshingPlan(false);
            toast({
              title: "Plan refresh failed",
              description: "Please refresh the page or contact support if the issue persists.",
              variant: "destructive"
            });
          }
        }
      };
      
      // Delay initial refresh to allow webhook processing
      setTimeout(() => refreshWithRetry(), 1000);
    }
  }, [user, navigate, sessionId, paymentSuccess, toast, refreshPlanStatus]);

  const resetState = () => {
    setPreview(null);
    setAnalysisResult(null);
    setCurrentFile(null);
    setIsSubmitting(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFile = (file: File) => {
    if (!file.type.match(/^image\/(jpeg|jpg|png|gif|webp)$/)) {
      setDialogMessage("Please upload a supported image format (JPG, PNG, GIF, or WebP).");
      setShowDialog(true);
      return;
    }

    // Reset analysis result when changing image
    setAnalysisResult(null);
    setCurrentFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setPreview(base64);
    };
    reader.readAsDataURL(file);
  };

  const openFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handlePurchase = () => {
    navigate('/pricing');
  };

  const handleAnalyze = async () => {
    if (!preview || !currentFile || isSubmitting || isAnalyzing) {
      toast({
        title: "Please wait",
        description: "Your outfit is already being analyzed"
      });
      return;
    }
    
    // Check if user has access before proceeding
    if (!hasAccess()) {
      setDialogMessage("You need to purchase a plan to analyze outfits.");
      setShowDialog(true);
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Use credit first
      const creditUsed = await useCredit();
      if (!creditUsed) {
        setDialogMessage("Unable to use credit. Please try again or contact support.");
        setShowDialog(true);
        return;
      }
      
      // Proceed with analysis
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

  if (planLoading || isRefreshingPlan) {
    return (
      <PageContainer>
        <div className="flex justify-center items-center h-64">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-neonBlue mx-auto"></div>
            <p className="text-muted-foreground">
              {isRefreshingPlan ? "Processing your payment..." : "Loading..."}
            </p>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer showBackButton>
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-satoshi font-bold mb-2">Upload Your Fit</h1>
        <p className="text-muted-foreground">Let's see what you're wearing today</p>
        
        {/* Display plan status */}
        <div className="mt-4 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg inline-block">
          <span className="text-sm font-medium">{getDisplayText()}</span>
        </div>
      </div>

      {!analysisResult ? (
        <div className="max-w-2xl mx-auto">
          {!hasAccess() && !analysisResult ? (
            <div className="text-center space-y-6 p-8 glass-card rounded-xl">
              <h2 className="text-xl font-semibold">No Credits Available</h2>
              <p className="text-muted-foreground">
                You need to purchase a plan to analyze your outfit.
              </p>
              <Button 
                onClick={handlePurchase}
                className="bg-gradient-to-r from-lilac to-neonBlue text-white rounded-full"
              >
                Purchase Plan
              </Button>
            </div>
          ) : (
            <>
              <DragAndDrop
                preview={preview}
                isAnalyzing={isAnalyzing || isSubmitting}
                onFileChange={handleFile}
                openFileInput={openFileInput}
                onAnalyze={handleAnalyze}
              />
              <div className="my-8">
                <FeedbackToneSelector tone={tone} setTone={setTone} />
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <AnalysisResult {...analysisResult} />
          <div className="flex gap-4 justify-center">
            <Button
              onClick={resetState}
              className="bg-lilac hover:bg-lilac/90 text-white py-6 h-auto text-lg rounded-full"
            >
              Upload Another Fit
            </Button>
            {!hasAccess() && (
              <Button
                onClick={handlePurchase}
                variant="outline"
                className="py-6 h-auto text-lg rounded-full border-neonBlue text-neonBlue hover:bg-neonBlue hover:text-white"
              >
                Get More Credits
              </Button>
            )}
          </div>
        </div>
      )}
      
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Image Analysis Error</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            {dialogMessage || "Error analyzing your image. Please try a JPG/PNG."}
          </DialogDescription>
          <DialogFooter>
            <Button onClick={() => setShowDialog(false)}>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
};

export default Upload;
