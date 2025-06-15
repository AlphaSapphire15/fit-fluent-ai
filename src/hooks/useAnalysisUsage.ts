
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const useAnalysisUsage = () => {
  const { user } = useAuth();

  const useAnalysis = async (refreshPlanStatus: () => Promise<void>): Promise<boolean> => {
    if (!user) {
      console.log("No user for analysis");
      return false;
    }

    try {
      console.log("=== STARTING ANALYSIS ATTEMPT ===");
      console.log("User ID:", user.id);
      
      // First check if user has any credits record
      const { data: creditsData, error: creditsError } = await supabase
        .from('user_credits')
        .select('credits')
        .eq('user_id', user.id)
        .maybeSingle();

      console.log("Credits check result:", { creditsData, creditsError });

      // If no credits record exists, this is a new user - give them 3 free credits
      if (!creditsData) {
        console.log("New user detected - granting 3 free trial credits");
        
        const { error: insertError } = await supabase
          .from('user_credits')
          .insert({
            user_id: user.id,
            credits: 3
          });

        if (insertError) {
          console.error('Error creating credits record:', insertError);
          return false;
        }

        console.log("Successfully granted 3 free credits to new user");
      }

      // Now attempt to use one credit
      console.log("Attempting to use analysis credit...");
      const { data: success, error: useError } = await supabase.rpc('use_analysis_credit', {
        user_uuid: user.id
      });

      console.log("Use credit result:", { success, useError });

      if (useError) {
        console.error('Error using credit:', useError);
        return false;
      }

      if (!success) {
        console.log("No credits available - user needs to purchase more");
        return false;
      }

      console.log("Successfully used analysis credit");
      
      // Refresh plan status to update UI
      await refreshPlanStatus();
      
      return true;

    } catch (error) {
      console.error('Error in useAnalysis:', error);
      return false;
    }
  };

  return { useAnalysis };
};
