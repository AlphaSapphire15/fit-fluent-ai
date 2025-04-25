
import React from "react";
import { CheckCircle, Sparkles } from "lucide-react";

interface AnalysisResultProps {
  score: number;
  styleCore: string;
  strengths: string[];
  suggestion: string;
}

const AnalysisResult = ({ score, styleCore, strengths, suggestion }: AnalysisResultProps) => {
  return (
    <div className="space-y-6">
      <div className="glass-card rounded-xl p-6 space-y-6">
        {/* Style Core */}
        <div className="text-center">
          <div className="inline-block bg-lilac/10 px-3 py-1 rounded-full text-xs font-medium text-lilac mb-2">
            STYLE CORE
          </div>
          <h2 className="text-2xl font-satoshi font-bold">{styleCore}</h2>
        </div>

        {/* What's Working */}
        <div>
          <h3 className="font-satoshi font-bold text-lg mb-4">What's Working</h3>
          <ul className="space-y-3">
            {strengths && strengths.length > 0 ? (
              strengths.map((strength, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle size={18} className="text-lilac shrink-0 mt-0.5" />
                  <span>{strength}</span>
                </li>
              ))
            ) : (
              <li className="flex items-start gap-2">
                <CheckCircle size={18} className="text-lilac shrink-0 mt-0.5" />
                <span>Great overall style balance</span>
              </li>
            )}
          </ul>
        </div>

        {/* Tips to Elevate */}
        <div>
          <h3 className="font-satoshi font-bold text-lg mb-4">Tip to Elevate</h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-2">
              <Sparkles size={18} className="text-lilac shrink-0 mt-0.5" />
              <span>
                {(suggestion || "Try adding a statement accessory to elevate your look.")
                  .replace(/^\*\*(\s|$)/, '') // Remove leading ** and optional space
                  .replace(/^Tip to Elevate:?\s*/i, '') // Remove "Tip to Elevate:" prefix if present
                }
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AnalysisResult;
