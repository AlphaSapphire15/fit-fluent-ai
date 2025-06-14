
import React from "react";
import { Button } from "@/components/ui/button";
import AnalysisResult from "@/components/AnalysisResult";
import { AnalysisResult as AnalysisResultType } from "@/utils/analysisParser";

interface ResultsDisplayProps {
  analysisResult: AnalysisResultType;
  onReset: () => void;
  onPurchase: () => void;
  hasAccess: boolean;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  analysisResult,
  onReset,
  onPurchase,
  hasAccess
}) => {
  return (
    <div className="space-y-6">
      <AnalysisResult {...analysisResult} />
      <div className="flex gap-4 justify-center">
        <Button
          onClick={onReset}
          className="bg-lilac hover:bg-lilac/90 text-white py-6 h-auto text-lg rounded-full"
        >
          Upload Another Fit
        </Button>
        {!hasAccess && (
          <Button
            onClick={onPurchase}
            variant="outline"
            className="py-6 h-auto text-lg rounded-full border-neonBlue text-neonBlue hover:bg-neonBlue hover:text-white"
          >
            Get Unlimited Plan
          </Button>
        )}
      </div>
    </div>
  );
};

export default ResultsDisplay;
