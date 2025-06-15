
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useAnalysisUsage } from '@/hooks/useAnalysisUsage';
import type { UserPlanStatus } from '@/types/userPlan';

export const useUserPlan = () => {
  const { user } = useAuth();
  const { useAnalysis: useAnalysisHook } = useAnalysisUsage();
  const [planStatus, setPlanStatus] = useState<UserPlanStatus>({
    planType: 'free_trial',
    hasUsedFreeTrial: false,
    subscriptionActive: false,
    subscriptionEndDate: null,
    loading: true,
  });

  const fetchPlanStatus = async () => {
    if (!user) {
      console.log("No user, setting expired status");
      setPlanStatus({
        planType: 'expired',
        hasUsedFreeTrial: false,
        subscriptionActive: false,
        subscriptionEndDate: null,
        loading: false,
      });
      return;
    }

    try {
      console.log("=== FETCHING PLAN STATUS ===");
      console.log("User ID:", user.id);
      
      // Check user credits
      const { data: creditsData, error: creditsError } = await supabase
        .from('user_credits')
        .select('credits')
        .eq('user_id', user.id)
        .maybeSingle();

      console.log("Credits query result:", { creditsData, creditsError });

      const creditsCount = creditsData?.credits || 0;
      const hasCredits = creditsCount > 0;
      const hasCreditsRecord = !!creditsData;

      console.log("=== PLAN CALCULATION ===");
      console.log("Has credits record:", hasCreditsRecord);
      console.log("Credits count:", creditsCount);
      console.log("Has credits:", hasCredits);

      // Simple logic:
      // - If no credits record exists: free_trial (will get 3 credits on first analysis)
      // - If has credits > 0: unlimited (can analyze)
      // - If has credits = 0: expired (used up free trial)
      let planType: UserPlanStatus['planType'];
      
      if (!hasCreditsRecord) {
        planType = 'free_trial'; // New user, will get 3 credits
      } else if (hasCredits) {
        planType = 'unlimited'; // Has credits to use
      } else {
        planType = 'expired'; // Used up all credits
      }

      const newPlanStatus = {
        planType,
        hasUsedFreeTrial: hasCreditsRecord, // If they have a record, they've used trial
        subscriptionActive: false, // Simplified - no subscription logic for now
        subscriptionEndDate: null,
        loading: false,
      };

      console.log("=== FINAL PLAN STATUS ===");
      console.log("New plan status:", newPlanStatus);

      setPlanStatus(newPlanStatus);
    } catch (error) {
      console.error('Error fetching plan status:', error);
      setPlanStatus({
        planType: 'expired',
        hasUsedFreeTrial: false,
        subscriptionActive: false,
        subscriptionEndDate: null,
        loading: false,
      });
    }
  };

  const useAnalysis = async (): Promise<boolean> => {
    return useAnalysisHook(fetchPlanStatus);
  };

  const hasAccess = (): boolean => {
    const access = planStatus.planType === 'unlimited' || planStatus.planType === 'free_trial';
    console.log("=== ACCESS CHECK ===");
    console.log("Plan type:", planStatus.planType);
    console.log("Has access:", access);
    return access;
  };

  const getDisplayTextForPlan = (): string => {
    if (planStatus.loading) return 'Loading...';
    
    switch (planStatus.planType) {
      case 'unlimited':
        return 'Credits Available';
      case 'free_trial':
        return '3 Free Credits Available';
      case 'expired':
        return 'No credits remaining';
      default:
        return 'Unknown plan';
    }
  };

  useEffect(() => {
    console.log("useUserPlan effect triggered, user:", user?.id);
    fetchPlanStatus();
  }, [user]);

  return {
    ...planStatus,
    hasAccess,
    useAnalysis,
    refreshPlanStatus: fetchPlanStatus,
    getDisplayText: getDisplayTextForPlan,
  };
};
