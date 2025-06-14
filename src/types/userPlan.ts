
export interface UserPlanStatus {
  planType: 'free_trial' | 'unlimited' | 'expired';
  hasUsedFreeTrial: boolean;
  subscriptionActive: boolean;
  subscriptionEndDate: string | null;
  loading: boolean;
}
