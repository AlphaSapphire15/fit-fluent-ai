
import { useAuth } from '@/contexts/AuthContext';
import { fetchUserCredits, fetchUserUploads, useAnalysisCredit, recordFreeTrialUsage } from '@/services/userPlanService';
import { checkSubscriptionStatus } from '@/services/subscriptionService';

export const useAnalysisUsage = () => {
  const { user } = useAuth();

  const useAnalysis = async (refreshPlanStatus: () => Promise<void>): Promise<boolean> => {
    if (!user) {
      console.log("No user for analysis");
      return false;
    }

    try {
      console.log("=== ATTEMPTING TO USE ANALYSIS ===");
      
      // Refresh plan status first to get latest info
      console.log("Refreshing plan status before analysis...");
      await refreshPlanStatus();
      
      // Wait a moment for state to update
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Check for active subscription FIRST (unlimited access)
      const hasActiveSubscription = await checkSubscriptionStatus(user.id);
      console.log("Has active subscription:", hasActiveSubscription);

      if (hasActiveSubscription) {
        // Check if it's truly unlimited (subscription) or just credits
        const { creditsData } = await fetchUserCredits(user.id);
        const hasCredits = creditsData && creditsData.credits > 0;
        
        // If user has credits, use them. If unlimited subscription, allow free usage
        if (hasCredits) {
          console.log("User has credits - using credit system");
          const { data, error } = await useAnalysisCredit(user.id);

          if (error) {
            console.error('Error using credit:', error);
            return false;
          }

          if (!data) {
            console.log("No credits available (RPC returned false)");
            return false;
          }

          console.log("Successfully used credit");
          await refreshPlanStatus();
          return true;
        } else {
          // This would be for unlimited subscription users
          console.log("User has unlimited subscription - allowing analysis");
          return true;
        }
      }

      // Check if user has used free trial (now 3 credits instead of 1 analysis)
      const { creditsData } = await fetchUserCredits(user.id);
      const { uploadsData } = await fetchUserUploads(user.id);

      const hasUsedFreeTrial = uploadsData && uploadsData.length > 0;
      const hasCredits = creditsData && creditsData.credits > 0;

      console.log("Fresh check - Has credits:", hasCredits, "Credits count:", creditsData?.credits);
      console.log("Fresh check - Has used trial:", hasUsedFreeTrial);

      // If user has credits, use them
      if (hasCredits) {
        console.log("User has credits - using credit system");
        const { data, error } = await useAnalysisCredit(user.id);

        if (error) {
          console.error('Error using credit:', error);
          return false;
        }

        if (!data) {
          console.log("No credits available (RPC returned false)");
          return false;
        }

        console.log("Successfully used credit");
        await refreshPlanStatus();
        return true;
      }

      // If user hasn't used free trial, give them 3 credits
      if (!hasUsedFreeTrial) {
        console.log("Giving user 3 free trial credits");
        
        // Add 3 credits for free trial
        const { error: addCreditsError } = await supabase.rpc('add_user_credits', {
          user_uuid: user.id,
          amount: 3
        });

        if (addCreditsError) {
          console.error('Error adding free trial credits:', addCreditsError);
          return false;
        }

        // Record that free trial was used
        const { error: recordError } = await recordFreeTrialUsage(user.id);
        if (recordError) {
          console.error('Error recording free trial usage:', recordError);
        }

        // Now use one credit
        const { data, error } = await useAnalysisCredit(user.id);

        if (error) {
          console.error('Error using credit after free trial setup:', error);
          return false;
        }

        if (!data) {
          console.log("No credits available after free trial setup");
          return false;
        }

        console.log("Successfully used credit from free trial");
        await refreshPlanStatus();
        return true;
      }

      console.log("No access method available");
      return false;
    } catch (error) {
      console.error('Error using analysis:', error);
      return false;
    }
  };

  return { useAnalysis };
};
