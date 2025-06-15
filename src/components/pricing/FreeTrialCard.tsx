
import React from "react";
import { CheckIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface FreeTrialCardProps {
  onStartTrial: () => void;
}

const FreeTrialCard: React.FC<FreeTrialCardProps> = ({ onStartTrial }) => {
  return (
    <Card className="glass-card hover:glow-border transition-all duration-300 relative overflow-hidden">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span className="text-xl font-poppins">Free Trial</span>
          <span className="text-2xl font-bold text-lilac">Free</span>
        </CardTitle>
        <CardDescription>Get 3 outfit analyses to try it out</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          <li className="flex items-center gap-2">
            <CheckIcon size={18} className="text-lilac min-w-[18px]" />
            <span>3 complete outfit analyses</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckIcon size={18} className="text-lilac min-w-[18px]" />
            <span>Detailed style recommendations</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckIcon size={18} className="text-lilac min-w-[18px]" />
            <span>Color coordination advice</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckIcon size={18} className="text-lilac min-w-[18px]" />
            <span>Style core identification</span>
          </li>
        </ul>
      </CardContent>
      <CardFooter className="pt-4">
        <Button
          onClick={onStartTrial}
          variant="outline"
          className="w-full py-6 h-auto rounded-full border-lilac text-lilac hover:bg-lilac hover:text-white"
          size="lg"
        >
          Start Free Trial (3 Analyses)
        </Button>
      </CardFooter>
    </Card>
  );
};

export default FreeTrialCard;
