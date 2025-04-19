
import { CreditCard } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export const PricingSection = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handlePlanSelection = async (type: "one-time" | "subscription") => {
    try {
      setIsLoading(true);
      
      if (!user) {
        // Redirect to login with return URL that includes plan type
        navigate(`/login?next=/upload&plan=${type}`);
        return;
      }
      
      // If user is logged in, go directly to upload with plan selection
      navigate(`/upload?plan=${type}`);
      
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

  return (
    <section className="px-4 py-16 bg-muted/10" id="pricing">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-poppins font-bold text-center mb-12 heading-gradient">
          Choose Your Plan
        </h2>
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
      </div>
    </section>
  );
};
