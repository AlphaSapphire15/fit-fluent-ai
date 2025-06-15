
import { supabase } from '@/integrations/supabase/client';

export const fetchUserSubscription = async (userId: string) => {
  try {
    // Try to query user_subscriptions table directly with raw SQL to avoid TypeScript issues
    const { data: subscriptionData, error: subscriptionError } = await supabase
      .rpc('sql', { 
        query: `
          SELECT * FROM user_subscriptions 
          WHERE user_id = $1 
          AND status = 'active' 
          AND current_period_end > NOW()
        `,
        params: [userId]
      });

    return { subscriptionData: subscriptionData?.[0] || null, subscriptionError };
  } catch (error) {
    console.error('Error in fetchUserSubscription:', error);
    // If table doesn't exist or function doesn't exist, return no subscription
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

    // Check if user has credits as the primary method for now
    const { data: creditsData } = await supabase
      .from('user_credits')
      .select('credits')
      .eq('user_id', userId)
      .maybeSingle();

    const hasCredits = creditsData && creditsData.credits > 0;
    const hasActiveSubscription = subscriptionData || hasCredits;

    console.log('Subscription check:', {
      hasSubscription: !!subscriptionData,
      hasCredits,
      creditsCount: creditsData?.credits || 0,
      hasActiveSubscription
    });

    return hasActiveSubscription;
  } catch (error) {
    console.error('Error checking subscription status:', error);
    // If there's any error, check if user has credits as fallback
    try {
      const { data: creditsData } = await supabase
        .from('user_credits')
        .select('credits')
        .eq('user_id', userId)
        .maybeSingle();
      
      return creditsData && creditsData.credits > 0;
    } catch {
      return false;
    }
  }
};
