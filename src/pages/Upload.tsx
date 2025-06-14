
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useStyle } from "@/contexts/StyleContext";
import PageContainer from "@/components/PageContainer";
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
import { Button } from "@/components/ui/button";
import UploadHeader from "@/components/upload/UploadHeader";
import PlanPurchasePrompt from "@/components/upload/PlanPurchasePrompt";
import UploadInterface from "@/components/upload/UploadInterface";
import ResultsDisplay from "@/components/upload/ResultsDisplay";
import LoadingScreen from "@/components/upload/LoadingScreen";

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
  const { hasAccess, useAnalysis, getDisplayText, refreshPlanStatus, loading: planLoading, planType } = useUserPlan();
  const { toast } = useToast();
  const [showDialog, setShowDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshingPlan, setIsRefreshingPlan] = useState(false);

  useEffect(() => {
    // If user is not logged in, redirect to login with return path
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
      
      // Clear URL parameters immediately
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
      
      // Refresh plan status after payment with multiple retries and longer delays
      const refreshWithRetry = async (attempts = 0) => {
        try {
          console.log(`Refreshing plan status, attempt ${attempts + 1}`);
          await refreshPlanStatus();
          
          // Wait a bit and check if the plan was actually updated
          setTimeout(async () => {
            await refreshPlanStatus();
            setIsRefreshingPlan(false);
            
            toast({
              title: "Plan Updated!",
              description: "You now have unlimited access to analyze your outfits."
            });
          }, 1000);
          
        } catch (error) {
          console.error("Error refreshing plan:", error);
          if (attempts < 5) {
            // Retry with increasing delays
            const delay = (attempts + 1) * 3000; // 3s, 6s, 9s, 12s, 15s
            setTimeout(() => refreshWithRetry(attempts + 1), delay);
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
      
      // Delay initial refresh to allow webhook processing (longer delay)
      setTimeout(() => refreshWithRetry(), 3000);
    }
  }, [user, navigate, sessionId, paymentSuccess, toast, refreshPlanStatus]);

  // Auto-refresh plan status every 30 seconds if on upload page
  useEffect(() => {
    if (!user) return;
    
    const interval = setInterval(() => {
      console.log("Auto-refreshing plan status");
      refreshPlanStatus();
    }, 30000);

    return () => clearInterval(interval);
  }, [user, refreshPlanStatus]);

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
    
    // Refresh plan status before checking access
    await refreshPlanStatus();
    
    // Check if user has access after refreshing
    if (!hasAccess()) {
      setDialogMessage("You need to purchase the unlimited plan to analyze more outfits.");
      setShowDialog(true);
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Use analysis credit first
      const analysisUsed = await useAnalysis();
      if (!analysisUsed) {
        setDialogMessage("Unable to process analysis. Please try again or contact support.");
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
      <LoadingScreen 
        message={isRefreshingPlan ? "Processing your payment and updating your plan..." : "Loading..."}
      />
    );
  }

  const getStatusDisplay = () => {
    switch (planType) {
      case 'unlimited':
        return { text: 'Unlimited Plan', color: 'text-green-600' };
      case 'free_trial':
        return { text: 'Free Trial Available', color: 'text-blue-600' };
      case 'expired':
        return { text: 'Free Trial Used', color: 'text-red-600' };
      default:
        return { text: 'Loading...', color: 'text-gray-600' };
    }
  };

  const statusDisplay = getStatusDisplay();

  return (
    <PageContainer showBackButton>
      <UploadHeader planStatus={statusDisplay} />

      {/* Add manual refresh button for debugging */}
      <div className="text-center mb-4">
        <Button 
          onClick={refreshPlanStatus} 
          variant="outline" 
          size="sm"
          className="text-xs"
        >
          Refresh Plan Status
        </Button>
      </div>

      {!analysisResult ? (
        <div className="max-w-2xl mx-auto">
          {!hasAccess() ? (
            <PlanPurchasePrompt onPurchase={handlePurchase} />
          ) : (
            <UploadInterface
              preview={preview}
              isAnalyzing={isAnalyzing}
              tone={tone}
              setTone={setTone}
              onFileChange={handleFile}
              openFileInput={openFileInput}
              onAnalyze={handleAnalyze}
              isSubmitting={isSubmitting}
            />
          )}
        </div>
      ) : (
        <ResultsDisplay
          analysisResult={analysisResult}
          onReset={resetState}
          onPurchase={handlePurchase}
          hasAccess={hasAccess()}
        />
      )}
      
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Analysis Status</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            {dialogMessage || "Error analyzing your image. Please try again."}
          </DialogDescription>
          <DialogFooter>
            <Button onClick={() => setShowDialog(false)}>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            handleFile(file);
          }
        }}
        accept="image/*"
        className="hidden"
      />
    </PageContainer>
  );
};

export default Upload;
