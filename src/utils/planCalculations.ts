
import type { UserPlanStatus } from '@/types/userPlan';

export const calculatePlanType = (
  hasActiveSubscription: boolean,
  hasCredits: boolean,
  hasUsedFreeTrial: boolean
): UserPlanStatus['planType'] => {
  // Priority 1: Active subscription = unlimited access
  if (hasActiveSubscription) {
    return 'unlimited';
  }
  
  // Priority 2: Credits available = limited access with credits
  if (hasCredits) {
    return 'unlimited'; // Credits also give unlimited access until depleted
  }
  
  // Priority 3: Free trial available
  if (!hasUsedFreeTrial) {
    return 'free_trial';
  }
  
  // No access
  return 'expired';
};

export const getDisplayText = (planType: UserPlanStatus['planType'], loading: boolean): string => {
  if (loading) return 'Loading...';
  
  switch (planType) {
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

export const checkHasAccess = (planType: UserPlanStatus['planType']): boolean => {
  return planType === 'unlimited' || planType === 'free_trial';
};
