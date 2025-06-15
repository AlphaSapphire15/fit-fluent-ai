
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Webhook received");
    
    const signature = req.headers.get("stripe-signature");
    const body = await req.text();
    
    if (!signature) {
      logStep("ERROR: Missing Stripe signature");
      return new Response("Missing signature", { status: 400 });
    }

    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    if (!stripeSecretKey || !webhookSecret) {
      logStep("ERROR: Missing Stripe configuration");
      return new Response("Configuration error", { status: 500 });
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2022-11-15",
    });

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      logStep("Webhook verified", { type: event.type });
    } catch (err) {
      logStep("ERROR: Webhook signature verification failed", { error: err.message });
      return new Response("Invalid signature", { status: 400 });
    }

    // Initialize Supabase client with service role key
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        logStep("Processing checkout completion", { 
          sessionId: session.id,
          clientReferenceId: session.client_reference_id,
          mode: session.mode
        });

        const userId = session.client_reference_id;
        if (!userId) {
          logStep("WARNING: No user ID in session");
          break;
        }

        // For subscription mode, create subscription record
        if (session.mode === "subscription" && session.subscription) {
          logStep("Creating subscription record for unlimited plan", { userId });
          
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
          
          const { error: subscriptionError } = await supabase.rpc('update_subscription_status', {
            p_user_id: userId,
            p_stripe_subscription_id: subscription.id,
            p_stripe_customer_id: subscription.customer as string,
            p_status: subscription.status,
            p_plan_type: 'unlimited',
            p_current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            p_current_period_end: new Date(subscription.current_period_end * 1000).toISOString()
          });

          if (subscriptionError) {
            logStep("ERROR: Failed to create subscription record", { error: subscriptionError.message });
          } else {
            logStep("Successfully created subscription record", { userId, subscriptionId: subscription.id });
          }
        }

        // For payment mode (one-time), add credits
        if (session.mode === "payment") {
          logStep("Adding credits for one-time payment", { userId });
          
          const { error: creditsError } = await supabase.rpc('add_user_credits', {
            user_uuid: userId,
            amount: 1 // One-time purchase gets 1 credit
          });

          if (creditsError) {
            logStep("ERROR: Failed to add credits", { error: creditsError.message });
          } else {
            logStep("Successfully added credits for one-time payment", { userId });
          }
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        logStep("Processing subscription renewal", { invoiceId: invoice.id });

        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
          logStep("Retrieved subscription for renewal", { subscriptionId: subscription.id });

          // Get customer to find user_id
          const customer = await stripe.customers.retrieve(subscription.customer as string);
          
          let userId = null;
          if (typeof customer === 'object' && !customer.deleted) {
            userId = customer.metadata?.user_id;
          }

          if (!userId) {
            // Try to find user by email
            const customerEmail = typeof customer === 'object' && !customer.deleted ? customer.email : null;
            if (customerEmail) {
              const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
              if (!userError) {
                const user = userData.users.find(u => u.email === customerEmail);
                if (user) {
                  userId = user.id;
                  logStep("Found user by email", { email: customerEmail, userId });
                }
              }
            }
          }

          if (userId) {
            // Update subscription status for renewal
            const { error: subscriptionError } = await supabase.rpc('update_subscription_status', {
              p_user_id: userId,
              p_stripe_subscription_id: subscription.id,
              p_stripe_customer_id: subscription.customer as string,
              p_status: subscription.status,
              p_plan_type: 'unlimited',
              p_current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              p_current_period_end: new Date(subscription.current_period_end * 1000).toISOString()
            });

            if (subscriptionError) {
              logStep("ERROR: Failed to update subscription for renewal", { error: subscriptionError.message });
            } else {
              logStep("Successfully updated subscription for renewal", { userId });
            }
          } else {
            logStep("ERROR: Could not find user_id for subscription renewal", { 
              customerId: subscription.customer,
              subscriptionId: subscription.id 
            });
          }
        }
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        logStep("Processing subscription change", { 
          subscriptionId: subscription.id,
          status: subscription.status 
        });

        // Get customer to find user_id
        const customer = await stripe.customers.retrieve(subscription.customer as string);
        
        let userId = null;
        if (typeof customer === 'object' && !customer.deleted) {
          userId = customer.metadata?.user_id;
        }

        if (!userId) {
          // Try to find user by email
          const customerEmail = typeof customer === 'object' && !customer.deleted ? customer.email : null;
          if (customerEmail) {
            const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
            if (!userError) {
              const user = userData.users.find(u => u.email === customerEmail);
              if (user) {
                userId = user.id;
                logStep("Found user by email", { email: customerEmail, userId });
              }
            }
          }
        }

        if (userId) {
          // Update subscription status
          const { error: subscriptionError } = await supabase.rpc('update_subscription_status', {
            p_user_id: userId,
            p_stripe_subscription_id: subscription.id,
            p_stripe_customer_id: subscription.customer as string,
            p_status: subscription.status,
            p_plan_type: 'unlimited',
            p_current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            p_current_period_end: new Date(subscription.current_period_end * 1000).toISOString()
          });

          if (subscriptionError) {
            logStep("ERROR: Failed to update subscription status", { error: subscriptionError.message });
          } else {
            logStep("Successfully updated subscription status", { userId, status: subscription.status });
          }
        } else {
          logStep("ERROR: Could not find user_id for subscription update", { 
            customerId: subscription.customer,
            subscriptionId: subscription.id 
          });
        }
        break;
      }

      default:
        logStep("Unhandled event type", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    logStep("ERROR: Webhook processing failed", { error: error.message });
    return new Response(
      JSON.stringify({ error: "Webhook processing failed" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
