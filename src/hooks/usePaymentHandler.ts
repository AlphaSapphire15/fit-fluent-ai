
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useUserPlan } from '@/hooks/useUserPlan';
import { supabase } from '@/integrations/supabase/client';

export const usePaymentHandler = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { refreshPlanStatus } = useUserPlan();
  const [isRefreshingPlan, setIsRefreshingPlan] = useState(false);

  useEffect(() => {
    // If user is not logged in, redirect to login with return path
    if (!user) {
      navigate("/login?next=/upload");
      return;
    }

    const sessionId = searchParams.get("session_id");
    const paymentSuccess = searchParams.get("payment_success");

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
  }, [user, navigate, searchParams, toast, refreshPlanStatus]);

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

  return { isRefreshingPlan };
};
