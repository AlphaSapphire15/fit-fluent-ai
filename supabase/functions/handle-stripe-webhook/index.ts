
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

    // Initialize Supabase client
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

        if (session.mode === "payment") {
          // One-time payment - add 1 credit
          logStep("Adding credits for one-time payment", { userId });
          
          // First, check if user_credits record exists
          const { data: existingCredits, error: fetchError } = await supabase
            .from('user_credits')
            .select('credits')
            .eq('user_id', userId)
            .single();

          if (fetchError && fetchError.code !== 'PGRST116') {
            logStep("ERROR: Failed to fetch existing credits", { error: fetchError.message });
            break;
          }

          if (existingCredits) {
            // Update existing record
            const { error: updateError } = await supabase
              .from('user_credits')
              .update({ 
                credits: existingCredits.credits + 1,
                updated_at: new Date().toISOString()
              })
              .eq('user_id', userId);

            if (updateError) {
              logStep("ERROR: Failed to update credits", { error: updateError.message });
            } else {
              logStep("Successfully updated credits", { userId, newTotal: existingCredits.credits + 1 });
            }
          } else {
            // Create new record
            const { error: insertError } = await supabase
              .from('user_credits')
              .insert({
                user_id: userId,
                credits: 1,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              });

            if (insertError) {
              logStep("ERROR: Failed to insert credits", { error: insertError.message });
            } else {
              logStep("Successfully created credits record", { userId, credits: 1 });
            }
          }
        } else if (session.mode === "subscription") {
          // Subscription payment - handle via subscription events
          logStep("Subscription checkout completed - will be handled by subscription events");
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        logStep("Processing subscription payment", { invoiceId: invoice.id });

        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
          logStep("Retrieved subscription", { subscriptionId: subscription.id });

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
            const { error } = await supabase
              .from('user_subscriptions')
              .upsert({
                user_id: userId,
                stripe_subscription_id: subscription.id,
                status: subscription.status,
                current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
                current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
                updated_at: new Date().toISOString()
              }, { onConflict: 'user_id' });

            if (error) {
              logStep("ERROR: Failed to update subscription", { error: error.message });
            } else {
              logStep("Successfully updated subscription", { userId, status: subscription.status });
            }
          } else {
            logStep("ERROR: Could not find user_id for subscription", { 
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
          const { error } = await supabase
            .from('user_subscriptions')
            .upsert({
              user_id: userId,
              stripe_subscription_id: subscription.id,
              status: subscription.status,
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              updated_at: new Date().toISOString()
            }, { onConflict: 'user_id' });

          if (error) {
            logStep("ERROR: Failed to update subscription status", { error: error.message });
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
