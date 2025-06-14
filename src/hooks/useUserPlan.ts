
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface UserPlanStatus {
  planType: 'free_trial' | 'unlimited' | 'expired';
  hasUsedFreeTrial: boolean;
  subscriptionActive: boolean;
  subscriptionEndDate: string | null;
  loading: boolean;
}

export const useUserPlan = () => {
  const { user } = useAuth();
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
      
      // Check user credits (this acts as our plan system for now)
      const { data: creditsData, error: creditsError } = await supabase
        .from('user_credits')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      console.log("Credits query result:", { creditsData, creditsError });

      // Check if user has made any uploads (to determine if free trial was used)
      const { data: uploadsData, error: uploadsError } = await supabase
        .from('uploads')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);

      console.log("Uploads query result:", { uploadsData, uploadsError });

      const hasUsedFreeTrial = !uploadsError && uploadsData && uploadsData.length > 0;
      const creditsCount = creditsData?.credits || 0;
      const hasCredits = creditsCount > 0;

      console.log("=== PLAN CALCULATION ===");
      console.log("Has used free trial:", hasUsedFreeTrial);
      console.log("Credits count:", creditsCount);
      console.log("Has credits:", hasCredits);

      // Determine plan type based on credits and usage
      let planType: 'free_trial' | 'unlimited' | 'expired' = 'expired';
      if (hasCredits) {
        planType = 'unlimited'; // User has credits, so they have unlimited access
        console.log("User has unlimited plan (has credits)");
      } else if (!hasUsedFreeTrial) {
        planType = 'free_trial'; // User hasn't used their free trial yet
        console.log("User has free trial available");
      } else {
        console.log("User plan expired (no credits, trial used)");
      }

      const newPlanStatus = {
        planType,
        hasUsedFreeTrial,
        subscriptionActive: hasCredits,
        subscriptionEndDate: null, // We don't have subscription end dates in current schema
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
    if (!user) {
      console.log("No user for analysis");
      return false;
    }

    try {
      console.log("=== ATTEMPTING TO USE ANALYSIS ===");
      console.log("Current plan status:", planStatus);
      
      // Refresh plan status first to get latest info
      console.log("Refreshing plan status before analysis...");
      await fetchPlanStatus();
      
      // Wait a moment for state to update
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Re-fetch the latest status after refresh
      const { data: creditsData } = await supabase
        .from('user_credits')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      const { data: uploadsData } = await supabase
        .from('uploads')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);

      const hasUsedFreeTrial = uploadsData && uploadsData.length > 0;
      const hasCredits = creditsData && creditsData.credits > 0;

      console.log("Fresh check - Has credits:", hasCredits, "Credits count:", creditsData?.credits);
      console.log("Fresh check - Has used trial:", hasUsedFreeTrial);

      // Check if user has access
      if (!hasCredits && hasUsedFreeTrial) {
        console.log("No access available - no credits and trial used");
        return false;
      }

      // If user has credits, use the Supabase function to deduct a credit
      if (hasCredits) {
        console.log("User has credits - using credit system");
        const { data, error } = await supabase.rpc('use_analysis_credit', {
          user_uuid: user.id
        });

        console.log("Credit usage result:", { data, error });

        if (error) {
          console.error('Error using credit:', error);
          return false;
        }

        if (!data) {
          console.log("No credits available (RPC returned false)");
          return false;
        }

        console.log("Successfully used credit");
        // Refresh plan status after using credit
        await fetchPlanStatus();
        return true;
      }

      // If user has free trial available, record usage in uploads
      if (!hasUsedFreeTrial) {
        console.log("Using free trial");
        const { error } = await supabase
          .from('uploads')
          .insert({
            user_id: user.id,
            file_hash: 'free_trial_placeholder',
            score: null
          });

        if (error) {
          console.error('Error recording free trial usage:', error);
          return false;
        }

        console.log("Successfully used free trial");
        // Refresh plan status after using free trial
        await fetchPlanStatus();
        return true;
      }

      console.log("No access method available");
      return false;
    } catch (error) {
      console.error('Error using analysis:', error);
      return false;
    }
  };

  const hasAccess = (): boolean => {
    const access = planStatus.planType === 'unlimited' || planStatus.planType === 'free_trial';
    console.log("=== ACCESS CHECK ===");
    console.log("Plan type:", planStatus.planType);
    console.log("Has access:", access);
    console.log("Subscription active:", planStatus.subscriptionActive);
    return access;
  };

  const getDisplayText = (): string => {
    if (planStatus.loading) return 'Loading...';
    
    switch (planStatus.planType) {
      case 'unlimited':
        return 'Unlimited Plan';
      case 'free_trial':
        return 'Free Trial Available';
      case 'expired':
        return 'No active plan';
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
    getDisplayText,
  };
};
