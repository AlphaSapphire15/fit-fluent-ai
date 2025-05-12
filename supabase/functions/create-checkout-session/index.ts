
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper logging function for enhanced debugging
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
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
    const { priceId } = await req.json();
    
    if (!priceId) {
      throw new Error("Price ID is required");
    }

    logStep("Request received for price ID", { priceId });

    // Initialize Stripe with proper error handling
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      logStep("ERROR: Missing STRIPE_SECRET_KEY");
      throw new Error("Stripe configuration error: Missing secret key");
    }
    
    // Get price IDs from environment
    const oneTimePrice = Deno.env.get("STRIPE_PRICE_ONE_TIME");
    const subMonthlyPrice = Deno.env.get("STRIPE_PRICE_SUB_MONTHLY");
    
    logStep("Available price IDs", { 
      oneTimePrice, 
      subMonthlyPrice, 
      requestedPrice: priceId 
    });

    // Validate price ID
    if (priceId !== oneTimePrice && priceId !== subMonthlyPrice) {
      logStep("WARNING: Requested price ID doesn't match known prices", { 
        requestedPrice: priceId, 
        knownPrices: { oneTimePrice, subMonthlyPrice } 
      });
      // We'll continue anyway since the ID might be valid in Stripe
    }
    
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2022-11-15",
    });

    // Determine if this is a one-time payment or subscription
    const mode = priceId === oneTimePrice ? "payment" : "subscription";
    logStep("Checkout mode determined", { mode });
    
    // Extract auth header to identify the user
    const authHeader = req.headers.get("Authorization");
    let userId = null;
    
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      try {
        // Call Supabase API to validate the token and get user ID
        const authResponse = await fetch(`${Deno.env.get("SUPABASE_URL")}/auth/v1/user`, {
          headers: {
            Authorization: `Bearer ${token}`,
            apikey: Deno.env.get("SUPABASE_ANON_KEY") || "",
          },
        });
        
        if (authResponse.ok) {
          const userData = await authResponse.json();
          userId = userData.id;
          logStep("User identified", { userId });
        }
      } catch (error) {
        logStep("Failed to identify user", { error: error.message });
        // Continue without user ID
      }
    }
    
    // Create a checkout session
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: mode,
      success_url: `${req.headers.get("origin")}/upload?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/#pricing`,
      client_reference_id: userId, // Include user ID if available for identification
      metadata: {
        userId: userId || "anonymous",
        planType: priceId === oneTimePrice ? "one-time" : "subscription"
      }
    });

    logStep("Checkout session created", { 
      sessionId: session.id, 
      url: session.url 
    });

    // For one-time purchases, add credits immediately if possible
    if (mode === "payment" && userId) {
      try {
        // Call the PostgreSQL function to add credits
        const creditsResponse = await fetch(
          `${Deno.env.get("SUPABASE_URL")}/rest/v1/rpc/add_user_credits`, 
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
              'apikey': Deno.env.get("SUPABASE_ANON_KEY") || "",
            },
            body: JSON.stringify({
              user_uuid: userId,
              amount: 1 // One credit for one-time purchase
            })
          }
        );
        
        if (!creditsResponse.ok) {
          const errorData = await creditsResponse.json();
          logStep("Failed to add credits", errorData);
        } else {
          logStep("Added credits for one-time purchase", { userId, credits: 1 });
        }
      } catch (error) {
        logStep("Error adding credits", { error: error.message });
        // Continue anyway, as the checkout was successful
      }
    }

    return new Response(
      JSON.stringify({ url: session.url }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    logStep("Error creating checkout session", { message: error.message });
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
