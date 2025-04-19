
import React from "react";
import { CheckCircle } from "lucide-react";

interface AnalysisResultProps {
  score: number;
  styleCore: string;
  strengths: string[];
  suggestion: string;
}

const AnalysisResult = ({ score, styleCore, strengths, suggestion }: AnalysisResultProps) => {
  return (
    <div className="glass-card rounded-xl p-6 space-y-6">
      {/* Score Ring */}
      <div className="flex justify-center">
        <div className="relative w-32 h-32">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="rgba(167, 139, 250, 0.1)"
              strokeWidth="8"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="rgba(167, 139, 250, 0.8)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${(score / 100) * 283}, 283`}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold">{score}</span>
            <span className="text-sm text-muted-foreground">out of 100</span>
          </div>
        </div>
      </div>

      {/* Style Core */}
      <div className="text-center">
        <h2 className="text-2xl font-satoshi font-bold">{styleCore}</h2>
      </div>

      {/* Strengths */}
      <ul className="space-y-2">
        {strengths.map((strength, index) => (
          <li key={index} className="flex items-start gap-2">
            <CheckCircle size={18} className="text-lilac shrink-0 mt-0.5" />
            <span>{strength}</span>
          </li>
        ))}
      </ul>

      {/* Suggestion */}
      <p className="text-muted-foreground">{suggestion}</p>
    </div>
  );
};

export default AnalysisResult;
