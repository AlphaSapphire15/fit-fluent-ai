
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
import { useToast } from "@/hooks/use-toast";
import { 
  Dialog,
  DialogContent, 
  DialogTitle, 
  DialogDescription,
  DialogHeader,
  DialogFooter
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";

const Upload = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const { tone, setTone } = useStyle();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const { isAnalyzing, analysisResult, analyzeImage, setAnalysisResult } = useImageAnalysis();
  const { toast } = useToast();
  const [showDialog, setShowDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasCredits, setHasCredits] = useState<boolean | null>(null);
  const [isLoadingCredits, setIsLoadingCredits] = useState(true);

  useEffect(() => {
    // If user is not logged in, redirect to login
    if (!user) {
      navigate("/login?next=/upload");
      return;
    }

    // If we have a session_id in the URL, show a welcome toast and add credits
    if (sessionId) {
      toast({
        title: "Payment Successful!",
        description: "Your payment was successful. You can now analyze your outfit."
      });
    }

    // Check if user has credits
    const checkCredits = async () => {
      try {
        setIsLoadingCredits(true);
        const { data, error } = await supabase.rpc('has_available_credits', {
          user_uuid: user.id
        });
        
        if (error) {
          console.error('Error checking credits:', error);
          return;
        }
        
        setHasCredits(data);
      } catch (err) {
        console.error('Failed to check credits:', err);
      } finally {
        setIsLoadingCredits(false);
      }
    };
    
    checkCredits();
  }, [user, navigate, sessionId, toast]);

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
    
    // Check if user has credits before proceeding
    if (hasCredits === false) {
      setDialogMessage("You need to purchase a plan to analyze outfits.");
      setShowDialog(true);
      return;
    }
    
    try {
      setIsSubmitting(true);
      await analyzeImage(currentFile, tone);
      
      // After successful analysis, recheck credits status
      const { data, error } = await supabase.rpc('has_available_credits', {
        user_uuid: user?.id
      });
      
      if (!error) {
        setHasCredits(data);
      }
    } catch (error) {
      if (error instanceof Error && error.message === 'No available credits') {
        setHasCredits(false);
      } else {
        setDialogMessage("Unable to analyze this image. Please try with a different photo.");
        setShowDialog(true);
        setPreview(null);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingCredits) {
    return (
      <PageContainer>
        <div className="flex justify-center items-center h-64">
          <p>Checking your account...</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer showBackButton>
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-satoshi font-bold mb-2">Upload Your Fit</h1>
        <p className="text-muted-foreground">Let's see what you're wearing today</p>
      </div>

      {!analysisResult ? (
        <div className="max-w-2xl mx-auto">
          {hasCredits === false && !analysisResult ? (
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
        <div className="space-y-6 max-w-2xl mx-auto">
          <DragAndDrop
            preview={preview}
            isAnalyzing={isAnalyzing || isSubmitting}
            onFileChange={handleFile}
            openFileInput={openFileInput}
            onAnalyze={handleAnalyze}
            score={analysisResult.score}
          />
          <AnalysisResult {...analysisResult} />
          <div className="flex justify-center mt-6 gap-4">
            <Button
              onClick={resetState}
              className="bg-neonBlue hover:bg-neonBlue/90 text-white py-2 px-6 h-auto text-base rounded-full max-w-xs"
            >
              Upload Another Fit
            </Button>
            {hasCredits === false && (
              <Button
                onClick={handlePurchase}
                className="bg-gradient-to-r from-lilac to-neonBlue text-white py-2 px-6 h-auto text-base rounded-full max-w-xs"
              >
                Purchase More Credits
              </Button>
            )}
          </div>
        </div>
      )}
      
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogMessage.includes("need to purchase") ? "Purchase Required" : "Image Analysis Error"}
            </DialogTitle>
            <DialogDescription>
              {dialogMessage}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-2">
            {dialogMessage.includes("need to purchase") ? (
              <>
                <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
                <Button onClick={() => { setShowDialog(false); navigate('/pricing'); }}>
                  View Plans
                </Button>
              </>
            ) : (
              <Button onClick={() => setShowDialog(false)}>OK</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
};

export default Upload;
