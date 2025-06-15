
import { supabase } from '@/integrations/supabase/client';

export const fetchUserSubscription = async (userId: string) => {
  try {
    const { data: subscriptionData, error: subscriptionError } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .gte('current_period_end', new Date().toISOString())
      .maybeSingle();

    return { subscriptionData, subscriptionError };
  } catch (error) {
    console.error('Error in fetchUserSubscription:', error);
    // If table doesn't exist, return no subscription
    return { subscriptionData: null, subscriptionError: null };
  }
};

export const checkSubscriptionStatus = async (userId: string) => {
  try {
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
  } catch (error) {
    console.error('Error checking subscription status:', error);
    // If there's any error (like table not existing), assume no subscription
    return false;
  }
};
