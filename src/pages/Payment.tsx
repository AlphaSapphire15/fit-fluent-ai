
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CreditCard, Sparkles, Lock, Check } from "lucide-react";
import PageContainer from "@/components/PageContainer";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { supabase } from "@/integrations/supabase/client";

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "");

const Payment = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handlePayment = async (type: "one-time" | "subscription") => {
    try {
      setIsLoading(true);
      
      // Determine the price ID based on the type
      const priceId = type === "one-time"
        ? import.meta.env.VITE_STRIPE_PRICE_ONE_TIME || Deno.env.get("STRIPE_PRICE_ONE_TIME")
        : import.meta.env.VITE_STRIPE_PRICE_SUB_MONTHLY || Deno.env.get("STRIPE_PRICE_SUB_MONTHLY");
      
      // Call the Supabase Edge Function to create a checkout session
      const { data, error } = await supabase.functions.invoke("create-checkout-session", {
        body: { priceId },
      });
      
      if (error) {
        throw new Error(error.message || "Error creating checkout session");
      }
      
      if (!data?.url) {
        throw new Error("No checkout URL returned");
      }
      
      // Redirect to the Stripe Checkout page
      window.location.href = data.url;
      
    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: "Payment Error",
        description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <PageContainer showBackButton backTo="/upload">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-satoshi font-bold mb-2">Choose Your Plan</h1>
        <p className="text-muted-foreground">Get personalized style feedback</p>
      </div>

      <div className="space-y-4 mb-8">
        {/* One-time payment */}
        <div className="glass-card rounded-xl p-6 hover:glow-border transition-all duration-300">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-10 h-10 rounded-full bg-lilac/10 flex items-center justify-center shrink-0">
              <CreditCard size={20} className="text-lilac" />
            </div>
            <div className="flex-1">
              <h3 className="font-satoshi font-bold text-lg">One-Time Scan</h3>
              <p className="text-muted-foreground text-sm mb-2">Just trying it out</p>
              <div className="flex items-baseline">
                <span className="text-2xl font-bold">$3</span>
                <span className="text-muted-foreground text-sm ml-1">single payment</span>
              </div>
            </div>
          </div>
          <ul className="mb-4 space-y-2">
            <li className="flex items-start gap-2 text-sm">
              <Check size={16} className="text-lilac mt-1 shrink-0" />
              <span>Full outfit analysis with detailed scoring</span>
            </li>
            <li className="flex items-start gap-2 text-sm">
              <Check size={16} className="text-lilac mt-1 shrink-0" />
              <span>Personal style core identification</span>
            </li>
            <li className="flex items-start gap-2 text-sm">
              <Check size={16} className="text-lilac mt-1 shrink-0" />
              <span>1-2 customized outfit improvement tips</span>
            </li>
          </ul>
          <Button
            onClick={() => handlePayment("one-time")}
            className="w-full bg-white text-primary hover:bg-white/90 text-sm font-medium"
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : "Choose One-Time Scan"}
          </Button>
        </div>

        {/* Subscription */}
        <div className="glass-card rounded-xl p-6 hover:glow-border transition-all duration-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-lilac text-xs px-2 py-1 font-medium text-white">
            POPULAR
          </div>
          <div className="flex items-start gap-4 mb-4">
            <div className="w-10 h-10 rounded-full bg-lilac/10 flex items-center justify-center shrink-0">
              <Sparkles size={20} className="text-lilac" />
            </div>
            <div className="flex-1">
              <h3 className="font-satoshi font-bold text-lg">Unlimited Plan</h3>
              <p className="text-muted-foreground text-sm mb-2">For serious style upgrades</p>
              <div className="flex items-baseline">
                <span className="text-2xl font-bold">$10</span>
                <span className="text-muted-foreground text-sm ml-1">per month</span>
              </div>
            </div>
          </div>
          <ul className="mb-4 space-y-2">
            <li className="flex items-start gap-2 text-sm">
              <Check size={16} className="text-lilac mt-1 shrink-0" />
              <span>Unlimited outfit analyses, anytime</span>
            </li>
            <li className="flex items-start gap-2 text-sm">
              <Check size={16} className="text-lilac mt-1 shrink-0" />
              <span>Save and compare your outfits over time</span>
            </li>
            <li className="flex items-start gap-2 text-sm">
              <Check size={16} className="text-lilac mt-1 shrink-0" />
              <span>Enhanced feedback with more detailed tips</span>
            </li>
            <li className="flex items-start gap-2 text-sm">
              <Check size={16} className="text-lilac mt-1 shrink-0" />
              <span>Access to style evolution tracking</span>
            </li>
          </ul>
          <Button
            onClick={() => handlePayment("subscription")}
            className="w-full bg-lilac hover:bg-lilac/90 text-white text-sm font-medium"
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : "Start Unlimited Plan"}
          </Button>
        </div>
      </div>

      <div className="text-center">
        <div className="flex justify-center items-center mb-2">
          <Lock size={14} className="text-muted-foreground mr-1" />
          <p className="text-sm text-muted-foreground">Secure checkout. Cancel anytime.</p>
        </div>
      </div>
    </PageContainer>
  );
};

export default Payment;
