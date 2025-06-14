
import { supabase } from '@/integrations/supabase/client';

export const fetchUserCredits = async (userId: string) => {
  const { data: creditsData, error: creditsError } = await supabase
    .from('user_credits')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  return { creditsData, creditsError };
};

export const fetchUserUploads = async (userId: string) => {
  const { data: uploadsData, error: uploadsError } = await supabase
    .from('uploads')
    .select('id')
    .eq('user_id', userId)
    .limit(1);

  return { uploadsData, uploadsError };
};

export const useAnalysisCredit = async (userId: string) => {
  const { data, error } = await supabase.rpc('use_analysis_credit', {
    user_uuid: userId
  });

  return { data, error };
};

export const recordFreeTrialUsage = async (userId: string) => {
  const { error } = await supabase
    .from('uploads')
    .insert({
      user_id: userId,
      file_hash: 'free_trial_placeholder',
      score: null
    });

  return { error };
};
