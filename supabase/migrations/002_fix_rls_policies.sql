
-- Fix RLS policies for user_credits table

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own credits" ON public.user_credits;
DROP POLICY IF EXISTS "Users can update their own credits" ON public.user_credits;

-- Create proper RLS policies for user_credits
CREATE POLICY "Users can view their own credits" ON public.user_credits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own credits" ON public.user_credits
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own credits" ON public.user_credits
  FOR UPDATE USING (auth.uid() = user_id);

-- Allow service role to bypass RLS for credit operations
CREATE POLICY "Service role can manage all credits" ON public.user_credits
  FOR ALL USING (current_setting('role') = 'service_role');

-- Update the use_analysis_credit function to handle the case where no credits record exists
CREATE OR REPLACE FUNCTION public.use_analysis_credit(user_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  credits_available INTEGER;
BEGIN
  -- Check if user has credits record
  SELECT credits INTO credits_available
  FROM public.user_credits
  WHERE user_id = user_uuid;
  
  -- If no record exists, create one with 3 free trial credits
  IF credits_available IS NULL THEN
    INSERT INTO public.user_credits (user_id, credits)
    VALUES (user_uuid, 3);
    credits_available := 3;
  END IF;
  
  -- Return false if no credits available
  IF credits_available <= 0 THEN
    RETURN false;
  END IF;
  
  -- Deduct 1 credit
  UPDATE public.user_credits
  SET credits = credits - 1,
      last_updated = now()
  WHERE user_id = user_uuid;
  
  RETURN true;
END;
$$;

-- Grant necessary permissions
GRANT ALL ON public.user_credits TO service_role;
