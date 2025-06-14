
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import PageContainer from "@/components/PageContainer";
import PricingHeader from "@/components/pricing/PricingHeader";
import FreeTrialCard from "@/components/pricing/FreeTrialCard";
import UnlimitedPlanCard from "@/components/pricing/UnlimitedPlanCard";
import PricingFAQ from "@/components/pricing/PricingFAQ";
import { supabase } from "@/integrations/supabase/client";

const Pricing = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleUnlimitedPlan = async () => {
    try {
      setIsLoading(true);
      
      // If not logged in, redirect to signup
      if (!user) {
        navigate('/signup?next=pricing');
        return;
      }
      
      console.log("User selecting unlimited plan");

      // Use the environment variable price ID for monthly subscription
      const priceId = import.meta.env.VITE_PRICE_UNLIMITED || 'price_1RFhvf4EZDpArr1NfeKeTdKf'; // fallback to the working price ID from logs

      // Create checkout session for unlimited plan
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { 
          priceId: priceId
        }
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
        console.log("Redirecting to Stripe Checkout:", data.url);
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

  const handleStartTrial = () => {
    navigate('/signup');
  };

  return (
    <PageContainer showBackButton>
      <div className="max-w-6xl mx-auto">
        <PricingHeader />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <FreeTrialCard onStartTrial={handleStartTrial} />
          <UnlimitedPlanCard 
            onSelectPlan={handleUnlimitedPlan} 
            isLoading={isLoading} 
          />
        </div>

        <PricingFAQ />
      </div>
    </PageContainer>
  );
};

export default Pricing;
