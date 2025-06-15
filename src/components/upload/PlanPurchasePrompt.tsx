
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
        You've used all your free credits. Purchase more credits or get unlimited access with our monthly plan.
      </p>
      <div className="space-y-3">
        <Button 
          onClick={onPurchase}
          className="bg-gradient-to-r from-lilac to-neonBlue text-white rounded-full w-full"
        >
          Get More Credits - $3 (One-time)
        </Button>
        <Button 
          onClick={onPurchase}
          variant="outline"
          className="w-full rounded-full border-lilac text-lilac hover:bg-lilac hover:text-white"
        >
          Get Unlimited Plan - $10/month
        </Button>
      </div>
    </div>
  );
};

export default PlanPurchasePrompt;
