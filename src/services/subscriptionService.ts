
import { supabase } from '@/integrations/supabase/client';

export const fetchUserSubscription = async (userId: string) => {
  try {
    // For now, since user_subscriptions table doesn't exist in the types,
    // we'll return null for subscription data
    // This will be updated when the subscription table is properly set up
    return { subscriptionData: null, subscriptionError: null };
  } catch (error) {
    console.error('Error in fetchUserSubscription:', error);
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
