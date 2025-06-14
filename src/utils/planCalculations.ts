
import type { UserPlanStatus } from '@/types/userPlan';

export const calculatePlanType = (
  hasCredits: boolean,
  hasUsedFreeTrial: boolean
): UserPlanStatus['planType'] => {
  if (hasCredits) {
    return 'unlimited';
  } else if (!hasUsedFreeTrial) {
    return 'free_trial';
  } else {
    return 'expired';
  }
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
