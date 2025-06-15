
import { supabase } from '@/integrations/supabase/client';

export const fetchUserSubscription = async (userId: string) => {
  // Use any to bypass TypeScript errors until types are regenerated
  const { data: subscriptionData, error: subscriptionError } = await (supabase as any)
    .from('user_subscriptions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .gte('current_period_end', new Date().toISOString())
    .maybeSingle();

  return { subscriptionData, subscriptionError };
};

export const checkSubscriptionStatus = async (userId: string) => {
  const { subscriptionData, subscriptionError } = await fetchUserSubscription(userId);
  
  if (subscriptionError) {
    console.error('Error fetching subscription:', subscriptionError);
    return false;
  }

  const hasActiveSubscription = subscriptionData && 
    subscriptionData.status === 'active' && 
    new Date(subscriptionData.current_period_end) > new Date();

  console.log('Subscription check:', {
    hasSubscription: !!subscriptionData,
    status: subscriptionData?.status,
    periodEnd: subscriptionData?.current_period_end,
    hasActiveSubscription
  });

  return hasActiveSubscription;
};
