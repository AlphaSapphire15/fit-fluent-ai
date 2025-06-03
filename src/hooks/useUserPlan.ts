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
      // For now, just check user_credits table since it exists
      const { data: creditsData, error: creditsError } = await supabase
        .from('user_credits')
        .select('credits')
        .eq('user_id', user.id)
        .single();

      let credits = 0;
      if (!creditsError && creditsData) {
        credits = creditsData.credits || 0;
      }

      // TODO: Add subscription check once user_subscriptions table is created
      const hasActiveSubscription = false;
      const subscriptionEndDate = null;

      let planType: 'none' | 'credits' | 'unlimited' = 'none';
      if (hasActiveSubscription) {
        planType = 'unlimited';
      } else if (credits > 0) {
        planType = 'credits';
      }

      setPlanStatus({
        planType,
        credits,
        subscriptionActive: hasActiveSubscription,
        subscriptionEndDate,
        loading: false,
      });
    } catch (error) {
      console.error('Error fetching plan status:', error);
      // Set default state if tables don't exist yet
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
      // First check if user has access
      if (!hasAccess()) return false;

      // If user has unlimited subscription, allow usage without deducting credits
      if (planStatus.planType === 'unlimited') {
        return true;
      }

      // If user has credits, deduct one
      if (planStatus.credits > 0) {
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
    return planStatus.planType === 'unlimited' || planStatus.credits > 0;
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