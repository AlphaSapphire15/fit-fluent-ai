
import React from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface FeedbackToneSelectorProps {
  tone: string;
  setTone: (value: string) => void;
}

const FeedbackToneSelector: React.FC<FeedbackToneSelectorProps> = ({ tone, setTone }) => {
  const toneOptions = [
    { value: "chill", label: "Chill" },
    { value: "straightforward", label: "Straightforward" },
    { value: "creative", label: "Creative" }
  ];

  return (
    <div className="mb-6">
      <h2 className="text-lg font-medium mb-4">Select your feedback style:</h2>
      <RadioGroup value={tone} onValueChange={setTone}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {toneOptions.map((option) => (
            <div key={option.value} className="w-full">
              <Button
                variant="gradient"
                className={`w-full h-auto p-6 rounded-xl transition-all duration-300
                  ${tone === option.value 
                    ? 'bg-opacity-90 shadow-[0_0_30px_rgba(167,139,250,0.8)] scale-110 border-2 border-white/20' 
                    : 'hover:shadow-[0_0_15px_rgba(167,139,250,0.4)] hover:scale-105'
                  }`}
                onClick={() => setTone(option.value)}
              >
                <span className="font-semibold text-xl text-white tracking-wide">
                  {option.label}
                </span>
              </Button>
            </div>
          ))}
        </div>
      </RadioGroup>
    </div>
  );
};

export default FeedbackToneSelector;
