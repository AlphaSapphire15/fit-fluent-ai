
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
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  // For scroll & highlight animation
  const sectionRef = useRef<HTMLDivElement>(null);
  const [highlight, setHighlight] = useState(false);

  // Check for plan parameter in URL for users coming from signup
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const plan = urlParams.get('plan');
    if (plan && user && plan === "unlimited") {
      console.log("Auto-selecting unlimited plan from URL parameter:", plan);
      handleUnlimitedPlan();
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

  const handleUnlimitedPlan = async () => {
    try {
      setIsLoading(true);

      // If user is not logged in, redirect to signup with return URL
      if (!user) {
        navigate(`/signup?next=payment&plan=unlimited`);
        return;
      }

      // For existing users, directly initiate checkout
      console.log("Existing user selecting unlimited plan");
      
      // Use the unlimited plan price ID
      const priceId = import.meta.env.VITE_PRICE_UNLIMITED;

      console.log("Selected unlimited plan with priceId:", priceId);

      if (!priceId) {
        console.error("Missing unlimited price ID in environment variables");
        toast({
          title: "Configuration Error",
          description: "Missing price information. Please contact support.",
          variant: "destructive",
        });
        return;
      }

      // Create checkout session for unlimited plan
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { priceId }
      });

      if (error) {
        console.error("Error creating checkout session:", error);
        toast({
          title: "Error",
          description: "There was a problem creating the checkout session. Please try again.",
          variant: "destructive",
        });
        return;
      }

      if (data?.url) {
        console.log("Redirecting existing user to Stripe Checkout:", data.url);
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }

    } catch (error) {
      console.error("Error selecting unlimited plan:", error);
      toast({
        title: "Error",
        description: "There was a problem selecting the plan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFreeTrial = () => {
    if (!user) {
      navigate('/signup');
    } else {
      navigate('/upload');
    }
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
        <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} gap-6 justify-center max-w-4xl mx-auto`}>
          {/* Free Trial Card */}
          <div className="glass-card rounded-xl p-6 hover:glow-border transition-all duration-300 flex-1">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="font-poppins font-bold text-xl mb-1">Free Trial</h3>
                <p className="text-muted-foreground text-sm">Try it out for free</p>
              </div>
              <div className="text-2xl font-bold text-lilac">Free</div>
            </div>
            <ul className="mb-6 space-y-3">
              <li className="flex items-center text-sm gap-2">
                <CreditCard size={18} className="text-lilac" />
                <span>3 free outfit analyses</span>
              </li>
              <li className="flex items-center text-sm gap-2">
                <CreditCard size={18} className="text-lilac" />
                <span>Complete style recommendations</span>
              </li>
            </ul>
            <Button
              onClick={handleFreeTrial}
              variant="outline"
              className="w-full border-lilac text-lilac hover:bg-lilac hover:text-white py-6 h-auto rounded-full"
              disabled={isLoading}
            >
              Start Free Trial
            </Button>
          </div>

          {/* Unlimited Plan Card */}
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
              <li className="flex items-center text-sm gap-2">
                <CreditCard size={18} className="text-lilac" />
                <span>Priority feedback</span>
              </li>
              <li className="flex items-center text-sm gap-2">
                <CreditCard size={18} className="text-lilac" />
                <span>Advanced style recommendations</span>
              </li>
            </ul>
            <Button
              onClick={handleUnlimitedPlan}
              className="w-full bg-gradient-to-r from-lilac to-neonBlue text-white py-6 h-auto rounded-full hover:shadow-[0_0_25px_rgba(167,139,250,0.6)]"
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : "Choose Plan"}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
