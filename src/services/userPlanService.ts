
import { supabase } from '@/integrations/supabase/client';

export const fetchUserCredits = async (userId: string) => {
  const { data: creditsData, error: creditsError } = await supabase
    .from('user_credits')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  return { creditsData, creditsError };
};

export const useAnalysisCredit = async (userId: string) => {
  const { data, error } = await supabase.rpc('use_analysis_credit', {
    user_uuid: userId
  });

  return { data, error };
};

// Simplified - we don't need these complex functions anymore
export const fetchUserUploads = async (userId: string) => {
  return { uploadsData: [], uploadsError: null };
};

export const recordFreeTrialUsage = async (userId: string) => {
  return { error: null };
};
