
import React from "react";
import { Button } from "@/components/ui/button";

interface PlanPurchasePromptProps {
  onPurchase: () => void;
}

const PlanPurchasePrompt: React.FC<PlanPurchasePromptProps> = ({ onPurchase }) => {
  return (
    <div className="text-center space-y-6 p-8 glass-card rounded-xl">
      <h2 className="text-xl font-semibold">No Credits Remaining</h2>
      <p className="text-muted-foreground">
        You've used all your free trial credits. Get unlimited access with our monthly plan to continue analyzing your outfits.
      </p>
      <div className="space-y-3">
        <Button 
          onClick={onPurchase}
          className="bg-gradient-to-r from-lilac to-neonBlue text-white rounded-full w-full"
        >
          Get Unlimited Plan - $10/month
        </Button>
      </div>
    </div>
  );
};

export default PlanPurchasePrompt;
