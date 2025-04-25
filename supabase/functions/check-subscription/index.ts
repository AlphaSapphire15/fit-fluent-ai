
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper logging function for enhanced debugging
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
    });
  }
  
  try {
    logStep("Function started");

    // Initialize Stripe with proper error handling
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      logStep("ERROR: Missing STRIPE_SECRET_KEY");
      throw new Error("Stripe configuration error: Missing secret key");
    }
    
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2022-11-15",
    });

    // Create Supabase client to authenticate the user
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Get the authorization header and extract the token
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header provided");
    }
    
    const token = authHeader.replace("Bearer ", "");
    logStep("Authenticating user with token");
    
    // Get user data from the token
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) {
      throw new Error(`Authentication error: ${userError.message}`);
    }
    
    const user = userData.user;
    if (!user?.email) {
      throw new Error("User not authenticated or email not available");
    }
    
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Try to find a customer in Stripe with the user's email
    const customers = await stripe.customers.list({ 
      email: user.email, 
      limit: 1 
    });
    
    // If no customer found, user has no subscription
    if (customers.data.length === 0) {
      logStep("No Stripe customer found for user");
      return new Response(
        JSON.stringify({ 
          subscribed: false,
          subscription_end: null
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Get the customer
    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    // Check for active subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'active',
      limit: 1
    });

    // Check for one-time payments if no subscription is found
    const charges = await stripe.charges.list({
      customer: customerId,
      limit: 10
    });
    
    // Use the service role key to potentially update subscriber info in database
    // This could be extended to maintain a subscribers table if needed
    
    // Check if there's an active subscription
    const hasActiveSubscription = subscriptions.data.length > 0;
    let subscriptionEndDate = null;
    let subscriptionType = null;
    
    if (hasActiveSubscription) {
      const subscription = subscriptions.data[0];
      subscriptionEndDate = new Date(subscription.current_period_end * 1000).toISOString();
      subscriptionType = 'subscription';
      logStep("Active subscription found", { 
        subscriptionId: subscription.id, 
        endDate: subscriptionEndDate 
      });
    }
    
    // Check for successful one-time payments (could be cached in a database table)
    const hasOneTimePayment = charges.data.some(charge => 
      charge.paid && 
      !charge.refunded && 
      // You might want to add more specific checks based on your product
      charge.amount >= 100 // Minimum amount for a valid purchase in cents
    );
    
    if (hasOneTimePayment && !hasActiveSubscription) {
      subscriptionType = 'one-time';
      logStep("One-time payment found");
    }

    const isSubscribed = hasActiveSubscription || hasOneTimePayment;
    
    logStep("Subscription check complete", { 
      subscribed: isSubscribed,
      type: subscriptionType,
      endDate: subscriptionEndDate
    });

    return new Response(
      JSON.stringify({ 
        subscribed: isSubscribed,
        subscription_type: subscriptionType,
        subscription_end: subscriptionEndDate
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in check-subscription", { message: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
