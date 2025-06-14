
import { useAuth } from '@/contexts/AuthContext';
import { fetchUserCredits, fetchUserUploads, useAnalysisCredit, recordFreeTrialUsage } from '@/services/userPlanService';

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
      
      // Re-fetch the latest status after refresh
      const { creditsData } = await fetchUserCredits(user.id);
      const { uploadsData } = await fetchUserUploads(user.id);

      const hasUsedFreeTrial = uploadsData && uploadsData.length > 0;
      const hasCredits = creditsData && creditsData.credits > 0;

      console.log("Fresh check - Has credits:", hasCredits, "Credits count:", creditsData?.credits);
      console.log("Fresh check - Has used trial:", hasUsedFreeTrial);

      // Check if user has access
      if (!hasCredits && hasUsedFreeTrial) {
        console.log("No access available - no credits and trial used");
        return false;
      }

      // If user has credits, use the Supabase function to deduct a credit
      if (hasCredits) {
        console.log("User has credits - using credit system");
        const { data, error } = await useAnalysisCredit(user.id);

        console.log("Credit usage result:", { data, error });

        if (error) {
          console.error('Error using credit:', error);
          return false;
        }

        if (!data) {
          console.log("No credits available (RPC returned false)");
          return false;
        }

        console.log("Successfully used credit");
        // Refresh plan status after using credit
        await refreshPlanStatus();
        return true;
      }

      // If user has free trial available, record usage in uploads
      if (!hasUsedFreeTrial) {
        console.log("Using free trial");
        const { error } = await recordFreeTrialUsage(user.id);

        if (error) {
          console.error('Error recording free trial usage:', error);
          return false;
        }

        console.log("Successfully used free trial");
        // Refresh plan status after using free trial
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
