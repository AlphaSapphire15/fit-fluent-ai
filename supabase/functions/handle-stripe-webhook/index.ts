
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

        // For subscription mode, add credits immediately
        if (session.mode === "subscription") {
          logStep("Adding credits for new subscription", { userId });
          
          // Add 100 credits for unlimited plan (adjust as needed)
          const { error: creditsError } = await supabase.rpc('add_user_credits', {
            user_uuid: userId,
            amount: 100
          });

          if (creditsError) {
            logStep("ERROR: Failed to add credits", { error: creditsError.message });
          } else {
            logStep("Successfully added credits for new subscription", { userId });
          }
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
            // Add credits for recurring payment
            const { error: creditsError } = await supabase.rpc('add_user_credits', {
              user_uuid: userId,
              amount: 100 // Add 100 credits per month
            });

            if (creditsError) {
              logStep("ERROR: Failed to add credits for payment", { error: creditsError.message });
            } else {
              logStep("Successfully added credits for payment", { userId });
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
          // If subscription is cancelled or ended, set credits to 0
          if (subscription.status === 'canceled' || subscription.status === 'incomplete_expired') {
            const { error: updateError } = await supabase
              .from('user_credits')
              .update({ credits: 0, last_updated: new Date().toISOString() })
              .eq('user_id', userId);

            if (updateError) {
              logStep("ERROR: Failed to remove credits", { error: updateError.message });
            } else {
              logStep("Successfully removed credits for cancelled subscription", { userId });
            }
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
