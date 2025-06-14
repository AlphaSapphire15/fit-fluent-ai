
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
      console.log("Fetching plan status for user:", user.id);
      
      // Check user credits (this acts as our plan system for now)
      const { data: creditsData, error: creditsError } = await supabase
        .from('user_credits')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      console.log("Credits data:", creditsData, "Error:", creditsError);

      // Check if user has made any uploads (to determine if free trial was used)
      const { data: uploadsData, error: uploadsError } = await supabase
        .from('uploads')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);

      console.log("Uploads data:", uploadsData, "Error:", uploadsError);

      const hasUsedFreeTrial = !uploadsError && uploadsData && uploadsData.length > 0;
      const hasCredits = !creditsError && creditsData && creditsData.credits > 0;

      // Determine plan type based on credits and usage
      let planType: 'free_trial' | 'unlimited' | 'expired' = 'expired';
      if (hasCredits) {
        planType = 'unlimited'; // User has credits, so they have unlimited access
      } else if (!hasUsedFreeTrial) {
        planType = 'free_trial'; // User hasn't used their free trial yet
      }

      console.log("Final plan status:", { planType, hasUsedFreeTrial, hasCredits });

      setPlanStatus({
        planType,
        hasUsedFreeTrial,
        subscriptionActive: hasCredits,
        subscriptionEndDate: null, // We don't have subscription end dates in current schema
        loading: false,
      });
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
    if (!user) return false;

    try {
      console.log("Attempting to use analysis, current status:", planStatus);
      
      // Check if user has access
      if (!hasAccess()) {
        console.log("No access available");
        return false;
      }

      // If user has credits, use the Supabase function to deduct a credit
      if (planStatus.subscriptionActive) {
        console.log("User has credits - using credit system");
        const { data, error } = await supabase.rpc('use_analysis_credit', {
          user_uuid: user.id
        });

        if (error) {
          console.error('Error using credit:', error);
          return false;
        }

        if (!data) {
          console.log("No credits available");
          return false;
        }

        // Refresh plan status after using credit
        await fetchPlanStatus();
        return true;
      }

      // If user has free trial available, record usage in uploads
      if (planType === 'free_trial') {
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

        // Refresh plan status after using free trial
        await fetchPlanStatus();
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error using analysis:', error);
      return false;
    }
  };

  const hasAccess = (): boolean => {
    const access = planStatus.planType === 'unlimited' || planStatus.planType === 'free_trial';
    console.log("Has access check:", access, "Plan type:", planStatus.planType);
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
