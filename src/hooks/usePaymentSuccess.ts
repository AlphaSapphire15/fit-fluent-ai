
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useUserPlan } from '@/hooks/useUserPlan';
import { checkCreditsAfterPayment, clearPaymentUrlParams } from '@/services/paymentService';
import type { PaymentSuccessParams } from '@/types/payment';

export const usePaymentSuccess = (userId: string | undefined) => {
  const { toast } = useToast();
  const { refreshPlanStatus } = useUserPlan();
  const [isRefreshingPlan, setIsRefreshingPlan] = useState(false);

  const handlePaymentSuccess = async ({ sessionId, paymentSuccess }: PaymentSuccessParams) => {
    if (!userId) return;

    console.log("=== PAYMENT SUCCESS DETECTED ===");
    console.log("Session ID:", sessionId);
    setIsRefreshingPlan(true);
    
    // Show success message
    toast({
      title: "Payment Successful!",
      description: "Your payment was successful. Refreshing your plan status..."
    });
    
    // Clear URL parameters immediately
    clearPaymentUrlParams();
    
    // Enhanced refresh with more aggressive retries
    const refreshWithRetry = async (attempts = 0) => {
      try {
        console.log(`=== REFRESH ATTEMPT ${attempts + 1} ===`);
        await refreshPlanStatus();
        
        // Check if credits were actually updated by querying directly
        const creditsData = await checkCreditsAfterPayment(userId);
        
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
  };

  return {
    isRefreshingPlan,
    handlePaymentSuccess
  };
};
