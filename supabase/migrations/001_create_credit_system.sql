-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create user_credits table to track one-time purchase credits
CREATE TABLE IF NOT EXISTS public.user_credits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  credits INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT user_credits_user_id_unique UNIQUE (user_id),
  CONSTRAINT credits_non_negative CHECK (credits >= 0)
);

-- Create user_subscriptions table to track monthly unlimited plans
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  stripe_subscription_id TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'inactive', -- active, canceled, past_due, etc.
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT user_subscriptions_user_id_unique UNIQUE (user_id)
);

-- Create analyses table to track usage
CREATE TABLE IF NOT EXISTS public.user_analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT,
  analysis_result JSONB,
  credits_used INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_analyses ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_credits
CREATE POLICY "Users can view their own credits" ON public.user_credits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own credits" ON public.user_credits
  FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for user_subscriptions
CREATE POLICY "Users can view their own subscriptions" ON public.user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Create RLS policies for user_analyses
CREATE POLICY "Users can view their own analyses" ON public.user_analyses
  FOR ALL USING (auth.uid() = user_id);

-- Function to get user's current plan status
CREATE OR REPLACE FUNCTION public.get_user_plan_status(p_user_id UUID)
RETURNS TABLE(
  plan_type TEXT,
  credits INTEGER,
  subscription_active BOOLEAN,
  subscription_end_date TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    CASE 
      WHEN us.status = 'active' AND us.current_period_end > NOW() THEN 'unlimited'
      WHEN uc.credits > 0 THEN 'credits'
      ELSE 'none'
    END as plan_type,
    COALESCE(uc.credits, 0) as credits,
    CASE 
      WHEN us.status = 'active' AND us.current_period_end > NOW() THEN true
      ELSE false
    END as subscription_active,
    us.current_period_end as subscription_end_date
  FROM auth.users u
  LEFT JOIN public.user_credits uc ON u.id = uc.user_id
  LEFT JOIN public.user_subscriptions us ON u.id = us.user_id
  WHERE u.id = p_user_id;
END;
$$;

-- Function to add credits to user (used by webhook after payment)
CREATE OR REPLACE FUNCTION public.add_user_credits(p_user_id UUID, p_credits INTEGER)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_credits (user_id, credits)
  VALUES (p_user_id, p_credits)
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    credits = user_credits.credits + p_credits,
    updated_at = NOW();
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$;

-- Function to use a credit (called during analysis)
CREATE OR REPLACE FUNCTION public.use_credit(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_plan RECORD;
BEGIN
  -- Get user's current plan status
  SELECT * FROM public.get_user_plan_status(p_user_id) INTO user_plan;
  
  -- If user has unlimited subscription, allow usage
  IF user_plan.subscription_active THEN
    RETURN TRUE;
  END IF;
  
  -- If user has credits, deduct one
  IF user_plan.credits > 0 THEN
    UPDATE public.user_credits 
    SET credits = credits - 1, updated_at = NOW()
    WHERE user_id = p_user_id;
    RETURN TRUE;
  END IF;
  
  -- No credits or subscription
  RETURN FALSE;
END;
$$;

-- Function to update subscription status (used by webhook)
CREATE OR REPLACE FUNCTION public.update_subscription_status(
  p_user_id UUID,
  p_stripe_subscription_id TEXT,
  p_status TEXT,
  p_current_period_start TIMESTAMP WITH TIME ZONE,
  p_current_period_end TIMESTAMP WITH TIME ZONE
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_subscriptions (
    user_id, 
    stripe_subscription_id, 
    status, 
    current_period_start, 
    current_period_end
  )
  VALUES (
    p_user_id, 
    p_stripe_subscription_id, 
    p_status, 
    p_current_period_start, 
    p_current_period_end
  )
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    stripe_subscription_id = p_stripe_subscription_id,
    status = p_status,
    current_period_start = p_current_period_start,
    current_period_end = p_current_period_end,
    updated_at = NOW();
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.user_credits TO authenticated;
GRANT ALL ON public.user_subscriptions TO authenticated;
GRANT ALL ON public.user_analyses TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_plan_status(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.add_user_credits(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.use_credit(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_subscription_status(UUID, TEXT, TEXT, TIMESTAMP WITH TIME ZONE, TIMESTAMP WITH TIME ZONE) TO authenticated; 