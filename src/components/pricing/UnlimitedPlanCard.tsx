
import React from "react";
import { CheckIcon, Star } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface UnlimitedPlanCardProps {
  onSelectPlan: () => void;
  isLoading: boolean;
}

const UnlimitedPlanCard: React.FC<UnlimitedPlanCardProps> = ({ onSelectPlan, isLoading }) => {
  return (
    <Card className="glass-card hover:glow-border transition-all duration-300 relative overflow-hidden">
      <div className="absolute top-0 right-0 bg-gradient-to-r from-lilac to-neonBlue text-xs px-3 py-1 font-medium text-white rounded-bl-lg">
        BEST VALUE
      </div>
      <CardHeader className="pt-8">
        <CardTitle className="flex justify-between items-center">
          <span className="text-xl font-poppins">Unlimited Plan</span>
          <div>
            <span className="text-2xl font-bold text-lilac">$10</span>
            <span className="text-xs text-muted-foreground block text-right">/month</span>
          </div>
        </CardTitle>
        <CardDescription>For serious style upgrades</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          <li className="flex items-center gap-2">
            <CheckIcon size={18} className="text-lilac min-w-[18px]" />
            <span>Unlimited outfit analyses</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckIcon size={18} className="text-lilac min-w-[18px]" />
            <span>Priority feedback</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckIcon size={18} className="text-lilac min-w-[18px]" />
            <span>Advanced style recommendations</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckIcon size={18} className="text-lilac min-w-[18px]" />
            <span>Seasonal trend insights</span>
          </li>
          <li className="flex items-center gap-2">
            <Star size={18} className="text-lilac min-w-[18px] fill-lilac" />
            <span className="font-medium">Cancel anytime</span>
          </li>
        </ul>
      </CardContent>
      <CardFooter className="pt-4">
        <Button
          onClick={onSelectPlan}
          variant="gradient"
          className="w-full py-3 h-auto rounded-full text-sm font-medium"
          disabled={isLoading}
          size="lg"
        >
          {isLoading ? "Processing..." : "Choose Unlimited Plan"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default UnlimitedPlanCard;
