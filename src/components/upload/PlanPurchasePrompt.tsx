
import React from "react";
import { Button } from "@/components/ui/button";

interface PlanPurchasePromptProps {
  onPurchase: () => void;
}

const PlanPurchasePrompt: React.FC<PlanPurchasePromptProps> = ({ onPurchase }) => {
  return (
    <div className="text-center space-y-6 p-8 glass-card rounded-xl">
      <h2 className="text-xl font-semibold">Get Unlimited Access</h2>
      <p className="text-muted-foreground">
        You've used your free trial. Get unlimited outfit analyses with our monthly plan.
      </p>
      <Button 
        onClick={onPurchase}
        className="bg-gradient-to-r from-lilac to-neonBlue text-white rounded-full"
      >
        Get Unlimited Plan - $10/month
      </Button>
    </div>
  );
};

export default PlanPurchasePrompt;
