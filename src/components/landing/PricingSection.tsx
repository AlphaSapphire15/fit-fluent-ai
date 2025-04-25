
import { CreditCard } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export const PricingSection = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user, hasActiveSubscription } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  // For scroll & highlight animation
  const sectionRef = useRef<HTMLDivElement>(null);
  const [highlight, setHighlight] = useState(false);

  // Check for plan parameter in URL for users coming from signup
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const plan = urlParams.get('plan');
    if (plan && user) {
      console.log("Auto-selecting plan from URL parameter:", plan);
      setSelectedPlan(plan);
      handlePlanSelection(plan as "one-time" | "subscription");
    }
    // if user only lands with "plan", scroll to pricing even if not logged in
    if (plan) {
      if (sectionRef.current) {
        sectionRef.current.scrollIntoView({ behavior: "smooth" });
        setHighlight(true);
        setTimeout(() => setHighlight(false), 3000);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search, user]);

  const handlePlanSelection = async (type: "one-time" | "subscription") => {
    try {
      setIsLoading(true);

      // If user is not logged in, redirect to signup with return URL
      if (!user) {
        navigate(`/signup?next=payment&plan=${type}`);
        return;
      }

      // Determine which price ID to use
      const priceId = type === "one-time"
        ? import.meta.env.VITE_PRICE_ONE_TIME
        : import.meta.env.VITE_PRICE_UNLIMITED;

      console.log("Selected plan:", type, "with priceId:", priceId);

      if (!priceId) {
        console.error("Missing price ID in environment variables");
        toast({
          title: "Configuration Error",
          description: "Missing price information. Please contact support.",
          variant: "destructive",
        });
        return;
      }

      // Create checkout session
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { priceId }
      });

      if (error) {
        console.error("Error creating checkout session:", error);
        throw new Error("Failed to create checkout session");
      }

      if (data?.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }

    } catch (error) {
      console.error("Error selecting plan:", error);
      toast({
        title: "Error",
        description: "There was a problem selecting the plan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // If user already has a subscription, show a different message
  const renderContent = () => {
    if (user && hasActiveSubscription) {
      return (
        <div className="text-center mt-8 p-6 glass-card rounded-xl">
          <h3 className="text-xl font-poppins font-semibold mb-3">You're all set!</h3>
          <p className="text-muted-foreground mb-4">
            You have an active subscription. Start analyzing your outfits now!
          </p>
          <Button
            onClick={() => navigate('/upload')}
            variant="gradient"
            size="lg"
            className="rounded-full"
          >
            Go to Upload
          </Button>
        </div>
      );
    }

    return (
      <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} gap-6 justify-center`}>
        {/* One-time Card */}
        <div className="glass-card rounded-xl p-6 hover:glow-border transition-all duration-300 flex-1">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="font-poppins font-bold text-xl mb-1">One-Time Scan</h3>
              <p className="text-muted-foreground text-sm">Just trying it out</p>
            </div>
            <div className="text-2xl font-bold text-lilac">$3</div>
          </div>
          <ul className="mb-6 space-y-3">
            <li className="flex items-center text-sm gap-2">
              <CreditCard size={18} className="text-lilac" />
              <span>Single outfit analysis</span>
            </li>
          </ul>
          <Button
            onClick={() => handlePlanSelection("one-time")}
            className="w-full bg-lilac hover:bg-lilac/90 text-white py-6 h-auto rounded-full"
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : "Choose One-Time Plan"}
          </Button>
        </div>

        {/* Subscription Card */}
        <div className="glass-card rounded-xl p-6 hover:glow-border transition-all duration-300 relative overflow-hidden flex-1">
          <div className="absolute top-0 right-0 bg-gradient-to-r from-lilac to-neonBlue text-xs px-3 py-1 font-medium text-white">
            BEST VALUE
          </div>
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="font-poppins font-bold text-xl mb-1">Unlimited Plan</h3>
              <p className="text-muted-foreground text-sm">For serious style upgrades</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-lilac">$10</div>
              <div className="text-xs text-right text-muted-foreground">per month</div>
            </div>
          </div>
          <ul className="mb-6 space-y-3">
            <li className="flex items-center text-sm gap-2">
              <CreditCard size={18} className="text-lilac" />
              <span>Unlimited outfit analyses</span>
            </li>
          </ul>
          <Button
            onClick={() => handlePlanSelection("subscription")}
            className="w-full bg-gradient-to-r from-lilac to-neonBlue text-white py-6 h-auto rounded-full hover:shadow-[0_0_25px_rgba(167,139,250,0.6)]"
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : "Choose Unlimited Plan"}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <section
      className={`px-4 py-16 bg-muted/10 transition-shadow duration-500 ${highlight ? "ring-4 ring-lilac/70 shadow-lg" : ""
        }`}
      id="pricing"
      ref={sectionRef}
    >
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-poppins font-bold text-center mb-12 heading-gradient">
          Choose Your Plan
        </h2>
        {renderContent()}
      </div>
    </section>
  );
};
