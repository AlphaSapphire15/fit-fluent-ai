
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
      console.log("=== PAYMENT SUCCESS DETECTED ===");
      console.log("Session ID:", sessionId);
      setIsRefreshingPlan(true);
      
      // Show success message
      toast({
        title: "Payment Successful!",
        description: "Your payment was successful. Refreshing your plan status..."
      });
      
      // Clear URL parameters immediately
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
      
      // Enhanced refresh with more aggressive retries
      const refreshWithRetry = async (attempts = 0) => {
        try {
          console.log(`=== REFRESH ATTEMPT ${attempts + 1} ===`);
          await refreshPlanStatus();
          
          // Check if credits were actually updated by querying directly
          const { data: creditsData } = await supabase
            .from('user_credits')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle();
          
          console.log("Credits after refresh attempt:", creditsData);
          
          if (creditsData && creditsData.credits > 0) {
            console.log("Credits found! Plan updated successfully");
            setIsRefreshingPlan(false);
            toast({
              title: "Plan Updated!",
              description: "You now have unlimited access to analyze your outfits."
            });
            return;
          }
          
          // If no credits found and we haven't hit max attempts, retry
          if (attempts < 8) {
            const delay = Math.min((attempts + 1) * 2000, 10000); // 2s, 4s, 6s, 8s, 10s, 10s, 10s, 10s
            console.log(`No credits found, retrying in ${delay}ms...`);
            setTimeout(() => refreshWithRetry(attempts + 1), delay);
          } else {
            console.log("Max retry attempts reached");
            setIsRefreshingPlan(false);
            toast({
              title: "Plan refresh taking longer than expected",
              description: "Your payment was successful. Please wait a moment and refresh the page, or contact support if the issue persists.",
              variant: "default"
            });
          }
          
        } catch (error) {
          console.error(`Error on refresh attempt ${attempts + 1}:`, error);
          if (attempts < 8) {
            const delay = Math.min((attempts + 1) * 2000, 10000);
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
      
      // Start refresh immediately, then with delay
      setTimeout(() => refreshWithRetry(), 1000);
    }
  }, [user, navigate, sessionId, paymentSuccess, toast, refreshPlanStatus]);

  // More frequent auto-refresh when user is on upload page
  useEffect(() => {
    if (!user) return;
    
    // Immediate refresh on mount
    refreshPlanStatus();
    
    const interval = setInterval(() => {
      console.log("Auto-refreshing plan status");
      refreshPlanStatus();
    }, 15000); // Every 15 seconds instead of 30

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

      {/* Enhanced debugging section */}
      <div className="text-center mb-4 space-y-2">
        <Button 
          onClick={refreshPlanStatus} 
          variant="outline" 
          size="sm"
          className="text-xs"
        >
          Refresh Plan Status
        </Button>
        <div className="text-xs text-gray-500">
          Debug: Plan Type = {planType}, Has Access = {hasAccess().toString()}
        </div>
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
