
import { supabase } from '@/integrations/supabase/client';

export const checkCreditsAfterPayment = async (userId: string) => {
  const { data: creditsData } = await supabase
    .from('user_credits')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  
  console.log("Credits after refresh attempt:", creditsData);
  return creditsData;
};

export const clearPaymentUrlParams = () => {
  const newUrl = window.location.pathname;
  window.history.replaceState({}, '', newUrl);
};
