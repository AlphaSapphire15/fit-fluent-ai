
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface UserPlanStatus {
  planType: 'none' | 'credits' | 'unlimited';
  credits: number;
  subscriptionActive: boolean;
  subscriptionEndDate: string | null;
  loading: boolean;
}

export const useUserPlan = () => {
  const { user } = useAuth();
  const [planStatus, setPlanStatus] = useState<UserPlanStatus>({
    planType: 'none',
    credits: 0,
    subscriptionActive: false,
    subscriptionEndDate: null,
    loading: true,
  });

  const fetchPlanStatus = async () => {
    if (!user) {
      setPlanStatus({
        planType: 'none',
        credits: 0,
        subscriptionActive: false,
        subscriptionEndDate: null,
        loading: false,
      });
      return;
    }

    try {
      console.log("Fetching plan status for user:", user.id);
      
      // Check subscription status first
      const { data: subscriptionData, error: subscriptionError } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      console.log("Subscription data:", subscriptionData, "Error:", subscriptionError);

      let hasActiveSubscription = false;
      let subscriptionEndDate = null;

      if (!subscriptionError && subscriptionData) {
        // Check if subscription is active and not expired
        const now = new Date();
        const endDate = subscriptionData.current_period_end ? new Date(subscriptionData.current_period_end) : null;
        
        hasActiveSubscription = subscriptionData.status === 'active' && 
          endDate && 
          endDate > now;
        
        subscriptionEndDate = subscriptionData.current_period_end;
        
        console.log("Subscription status:", subscriptionData.status, "End date:", endDate, "Active:", hasActiveSubscription);
      }

      // Check credits
      const { data: creditsData, error: creditsError } = await supabase
        .from('user_credits')
        .select('credits')
        .eq('user_id', user.id)
        .single();

      console.log("Credits data:", creditsData, "Error:", creditsError);

      let credits = 0;
      if (!creditsError && creditsData) {
        credits = creditsData.credits || 0;
      }

      // Determine plan type
      let planType: 'none' | 'credits' | 'unlimited' = 'none';
      if (hasActiveSubscription) {
        planType = 'unlimited';
      } else if (credits > 0) {
        planType = 'credits';
      }

      console.log("Final plan status:", { planType, credits, hasActiveSubscription });

      setPlanStatus({
        planType,
        credits,
        subscriptionActive: hasActiveSubscription,
        subscriptionEndDate,
        loading: false,
      });
    } catch (error) {
      console.error('Error fetching plan status:', error);
      // Set default state if there's an error
      setPlanStatus({
        planType: 'none',
        credits: 0,
        subscriptionActive: false,
        subscriptionEndDate: null,
        loading: false,
      });
    }
  };

  const useCredit = async (): Promise<boolean> => {
    if (!user) return false;

    try {
      console.log("Attempting to use credit, current status:", planStatus);
      
      // First check if user has access
      if (!hasAccess()) {
        console.log("No access available");
        return false;
      }

      // If user has unlimited subscription, allow usage without deducting credits
      if (planStatus.planType === 'unlimited') {
        console.log("Unlimited plan - allowing usage");
        return true;
      }

      // If user has credits, deduct one
      if (planStatus.credits > 0) {
        console.log("Deducting credit");
        const { error } = await supabase
          .from('user_credits')
          .update({ 
            credits: planStatus.credits - 1,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);

        if (error) {
          console.error('Error using credit:', error);
          return false;
        }

        // Refresh plan status after using credit
        await fetchPlanStatus();
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error using credit:', error);
      return false;
    }
  };

  const hasAccess = (): boolean => {
    const access = planStatus.planType === 'unlimited' || planStatus.credits > 0;
    console.log("Has access check:", access, "Plan type:", planStatus.planType, "Credits:", planStatus.credits);
    return access;
  };

  const getDisplayText = (): string => {
    if (planStatus.loading) return 'Loading...';
    
    switch (planStatus.planType) {
      case 'unlimited':
        return 'Unlimited Plan';
      case 'credits':
        return `${planStatus.credits} credit${planStatus.credits !== 1 ? 's' : ''} remaining`;
      case 'none':
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
    useCredit,
    refreshPlanStatus: fetchPlanStatus,
    getDisplayText,
  };
};
