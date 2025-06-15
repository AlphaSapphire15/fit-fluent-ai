
import React from "react";
import { Button } from "@/components/ui/button";
import AnalysisResult from "@/components/AnalysisResult";
import { AnalysisResult as AnalysisResultType } from "@/utils/analysisParser";

interface ResultsDisplayProps {
  analysisResult: AnalysisResultType;
  onReset: () => void;
  onPurchase: () => void;
  hasAccess: boolean;
  uploadedImage?: string; // Add image prop
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  analysisResult,
  onReset,
  onPurchase,
  hasAccess,
  uploadedImage
}) => {
  return (
    <div className="space-y-6">
      {/* Show uploaded image */}
      {uploadedImage && (
        <div className="flex justify-center mb-6">
          <div className="relative">
            <img
              src={uploadedImage}
              alt="Your analyzed outfit"
              className="w-48 h-auto object-cover rounded-lg border border-white/10"
            />
            {/* Show score overlay on image */}
            <div className="absolute top-4 right-4 w-16 h-16 rounded-full flex items-center justify-center bg-black/80 backdrop-blur-sm text-white border border-lilac">
              <div className="text-center">
                <span className="text-xl font-bold">{analysisResult.score}</span>
                <span className="text-sm">/100</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <AnalysisResult {...analysisResult} />
      
      <div className="flex gap-4 justify-center">
        <Button
          onClick={onReset}
          className="bg-lilac hover:bg-lilac/90 text-white py-6 h-auto text-lg rounded-full font-semibold"
        >
          Upload Another Fit
        </Button>
        {!hasAccess && (
          <Button
            onClick={onPurchase}
            variant="outline"
            className="py-6 h-auto text-lg rounded-full border-2 border-neonBlue text-neonBlue hover:bg-neonBlue hover:text-white font-semibold"
          >
            Get Unlimited Plan
          </Button>
        )}
      </div>
    </div>
  );
};

export default ResultsDisplay;
