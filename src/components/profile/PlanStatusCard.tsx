
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";

interface PlanStatusCardProps {
  loading: boolean;
  planType: 'free_trial' | 'unlimited' | 'expired';
  subscriptionEndDate: string | null;
  getDisplayText: () => string;
}

export const PlanStatusCard = ({ 
  loading, 
  planType, 
  subscriptionEndDate, 
  getDisplayText 
}: PlanStatusCardProps) => {
  const getPlanStatusColor = () => {
    if (planType === 'unlimited') return 'text-green-600';
    if (planType === 'free_trial') return 'text-blue-600';
    return 'text-gray-600';
  };

  const getPlanDisplayName = () => {
    switch (planType) {
      case 'unlimited':
        return 'Unlimited Plan';
      case 'free_trial':
        return 'Free Trial';
      case 'expired':
        return 'No Active Plan';
      default:
        return 'Unknown Plan';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5" />
          Plan Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <p className="text-muted-foreground">Loading plan status...</p>
        ) : (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-medium">Current Plan:</span>
              <span className={`font-semibold ${getPlanStatusColor()}`}>
                {getPlanDisplayName()}
              </span>
            </div>
            
            {planType === 'unlimited' && subscriptionEndDate && (
              <div className="flex justify-between items-center">
                <span className="font-medium">Subscription ends:</span>
                <span className="text-sm text-muted-foreground">
                  {new Date(subscriptionEndDate).toLocaleDateString()}
                </span>
              </div>
            )}
            
            <div className="pt-2">
              <p className="text-sm text-muted-foreground">{getDisplayText()}</p>
            </div>

            {planType === 'expired' && (
              <div className="pt-2">
                <Button 
                  onClick={() => window.location.href = '/pricing'}
                  className="w-full bg-gradient-to-r from-lilac to-neonBlue text-white"
                >
                  Get Unlimited Plan
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
