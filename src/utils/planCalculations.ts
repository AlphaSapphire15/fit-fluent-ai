
import type { UserPlanStatus } from '@/types/userPlan';

export const calculatePlanType = (
  hasCreditsRecord: boolean,
  creditsCount: number
): UserPlanStatus['planType'] => {
  // Simplified logic:
  // - No credits record = free_trial (new user)
  // - Has credits > 0 = unlimited (can analyze)
  // - Has credits = 0 = expired (used up free trial)
  
  if (!hasCreditsRecord) {
    return 'free_trial';
  }
  
  if (creditsCount > 0) {
    return 'unlimited';
  }
  
  return 'expired';
};

export const getDisplayText = (planType: UserPlanStatus['planType'], loading: boolean): string => {
  if (loading) return 'Loading...';
  
  switch (planType) {
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

export const checkHasAccess = (planType: UserPlanStatus['planType']): boolean => {
  return planType === 'unlimited' || planType === 'free_trial';
};
