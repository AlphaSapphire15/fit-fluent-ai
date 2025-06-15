
import { useNavigate } from "react-router-dom";
import { useStyle } from "@/contexts/StyleContext";
import PageContainer from "@/components/PageContainer";
import { useUserPlan } from "@/hooks/useUserPlan";
import UploadHeader from "@/components/upload/UploadHeader";
import PlanPurchasePrompt from "@/components/upload/PlanPurchasePrompt";
import UploadInterface from "@/components/upload/UploadInterface";
import ResultsDisplay from "@/components/upload/ResultsDisplay";
import LoadingScreen from "@/components/upload/LoadingScreen";
import AnalysisDialog from "@/components/upload/AnalysisDialog";
import FileInput from "@/components/upload/FileInput";
import { usePaymentHandler } from "@/hooks/usePaymentHandler";
import { useUploadState } from "@/hooks/useUploadState";
import { useUploadLogic } from "@/hooks/useUploadLogic";

const Upload = () => {
  const navigate = useNavigate();
  const { tone, setTone } = useStyle();
  const { hasAccess, refreshPlanStatus, loading: planLoading, planType, subscriptionActive } = useUserPlan();
  const { isRefreshingPlan } = usePaymentHandler();
  
  const {
    fileInputRef,
    preview,
    currentFile,
    isSubmitting,
    setIsSubmitting,
    showDialog,
    setShowDialog,
    dialogMessage,
    setDialogMessage,
    resetState,
    handleFile,
    openFileInput
  } = useUploadState();

  const {
    isAnalyzing,
    analysisResult,
    setAnalysisResult,
    handleAnalyze: performAnalyze
  } = useUploadLogic();

  const handleAnalyze = async () => {
    await performAnalyze(
      currentFile,
      tone,
      setIsSubmitting,
      setDialogMessage,
      setShowDialog,
      () => {} // setPreview - not needed in this context
    );
  };

  const handlePurchase = () => {
    navigate('/pricing');
  };

  const resetStateAndClearAnalysis = () => {
    resetState();
    setAnalysisResult(null);
  };

  if (planLoading || isRefreshingPlan) {
    return (
      <LoadingScreen 
        message={isRefreshingPlan ? "Processing your payment and updating your plan..." : "Loading..."}
      />
    );
  }

  const getStatusDisplay = () => {
    // Show subscription status if active
    if (subscriptionActive) {
      return { text: 'Unlimited Plan', color: 'text-green-600' };
    }
    
    switch (planType) {
      case 'unlimited':
        return { text: 'Credits Available', color: 'text-blue-600' };
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
          onReset={resetStateAndClearAnalysis}
          onPurchase={handlePurchase}
          hasAccess={hasAccess()}
          uploadedImage={preview} // Pass the preview image
        />
      )}
      
      <AnalysisDialog
        isOpen={showDialog}
        message={dialogMessage}
        onClose={() => setShowDialog(false)}
      />

      <FileInput onFileChange={handleFile} />
    </PageContainer>
  );
};

export default Upload;
