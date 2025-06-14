
import React from "react";
import { Button } from "@/components/ui/button";

interface DebugSectionProps {
  planType: string;
  hasAccess: boolean;
  onRefreshPlan: () => void;
}

const DebugSection: React.FC<DebugSectionProps> = ({ 
  planType, 
  hasAccess, 
  onRefreshPlan 
}) => {
  return (
    <div className="text-center mb-4 space-y-2">
      <Button 
        onClick={onRefreshPlan} 
        variant="outline" 
        size="sm"
        className="text-xs"
      >
        Refresh Plan Status
      </Button>
      <div className="text-xs text-gray-500">
        Debug: Plan Type = {planType}, Has Access = {hasAccess.toString()}
      </div>
    </div>
  );
};

export default DebugSection;
