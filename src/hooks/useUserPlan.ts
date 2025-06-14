
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
      
      // Check subscription status using raw query since types may not be updated
      const { data: subscriptionData, error: subscriptionError } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      console.log("Subscription data:", subscriptionData, "Error:", subscriptionError);

      let hasActiveSubscription = false;
      let subscriptionEndDate = null;

      if (!subscriptionError && subscriptionData) {
        const now = new Date();
        const endDate = subscriptionData.current_period_end ? new Date(subscriptionData.current_period_end) : null;
        
        hasActiveSubscription = subscriptionData.status === 'active' && 
          endDate && 
          endDate > now;
        
        subscriptionEndDate = subscriptionData.current_period_end;
        
        console.log("Subscription status:", subscriptionData.status, "End date:", endDate, "Active:", hasActiveSubscription);
      }

      // Check if user has used their free trial
      const { data: analysesData, error: analysesError } = await supabase
        .from('user_analyses')
        .select('id')
        .eq('user_id', user.id);

      console.log("Analyses data:", analysesData, "Error:", analysesError);

      const hasUsedFreeTrial = !analysesError && analysesData && analysesData.length > 0;

      // Determine plan type
      let planType: 'free_trial' | 'unlimited' | 'expired' = 'expired';
      if (hasActiveSubscription) {
        planType = 'unlimited';
      } else if (!hasUsedFreeTrial) {
        planType = 'free_trial';
      }

      console.log("Final plan status:", { planType, hasUsedFreeTrial, hasActiveSubscription });

      setPlanStatus({
        planType,
        hasUsedFreeTrial,
        subscriptionActive: hasActiveSubscription,
        subscriptionEndDate,
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

      // If user has unlimited subscription, allow usage without recording
      if (planStatus.planType === 'unlimited') {
        console.log("Unlimited plan - allowing usage");
        return true;
      }

      // If user has free trial available, record usage using direct insert
      if (planStatus.planType === 'free_trial') {
        console.log("Using free trial");
        const { error } = await supabase
          .from('user_analyses')
          .insert({
            user_id: user.id,
            image_url: null,
            analysis_result: null
          });

        if (error) {
          console.error('Error recording analysis:', error);
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
