
import type { UserPlanStatus } from '@/types/userPlan';

export const calculatePlanType = (
  hasActiveSubscription: boolean,
  hasCredits: boolean,
  hasUsedFreeTrial: boolean
): UserPlanStatus['planType'] => {
  // Priority 1: Active subscription = unlimited access
  if (hasActiveSubscription && !hasCredits) {
    // True unlimited subscription (no credits needed)
    return 'unlimited';
  }
  
  // Priority 2: Credits available (including from free trial)
  if (hasCredits) {
    return 'unlimited'; // Credits give access until depleted
  }
  
  // Priority 3: Free trial available (user gets 3 credits)
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
      return '3 Free Credits Available';
    case 'expired':
      return 'No credits remaining';
    default:
      return 'Unknown plan';
  }
};

export const checkHasAccess = (planType: UserPlanStatus['planType']): boolean => {
  return planType === 'unlimited' || planType === 'free_trial';
};
