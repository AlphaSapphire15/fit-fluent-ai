
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { fetchUserCredits, fetchUserUploads } from '@/services/userPlanService';
import { checkSubscriptionStatus } from '@/services/subscriptionService';
import { calculatePlanType, getDisplayText, checkHasAccess } from '@/utils/planCalculations';
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
      console.log("User Email:", user.email);
      
      // Check for active subscription FIRST
      const hasActiveSubscription = await checkSubscriptionStatus(user.id);
      console.log("Has active subscription:", hasActiveSubscription);

      // Check user credits
      const { creditsData, creditsError } = await fetchUserCredits(user.id);
      console.log("Credits query result:", { creditsData, creditsError });

      // Check if user has made any uploads (free trial usage)
      const { uploadsData, uploadsError } = await fetchUserUploads(user.id);
      console.log("Uploads query result:", { uploadsData, uploadsError });

      const hasUsedFreeTrial = !uploadsError && uploadsData && uploadsData.length > 0;
      const creditsCount = creditsData?.credits || 0;
      const hasCredits = creditsCount > 0;

      console.log("=== PLAN CALCULATION ===");
      console.log("Has active subscription:", hasActiveSubscription);
      console.log("Has used free trial:", hasUsedFreeTrial);
      console.log("Credits count:", creditsCount);
      console.log("Has credits:", hasCredits);

      const planType = calculatePlanType(hasActiveSubscription, hasCredits, hasUsedFreeTrial);

      const newPlanStatus = {
        planType,
        hasUsedFreeTrial,
        subscriptionActive: hasActiveSubscription,
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
    const access = checkHasAccess(planStatus.planType);
    console.log("=== ACCESS CHECK ===");
    console.log("Plan type:", planStatus.planType);
    console.log("Has access:", access);
    console.log("Subscription active:", planStatus.subscriptionActive);
    return access;
  };

  const getDisplayTextForPlan = (): string => {
    return getDisplayText(planStatus.planType, planStatus.loading);
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
