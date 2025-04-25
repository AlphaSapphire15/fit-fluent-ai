
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
    { value: "chill", label: "Chill", description: "Casual and friendly vibes" },
    { value: "straightforward", label: "Straightforward", description: "Clear and direct feedback" },
    { value: "creative", label: "Creative", description: "Artistic and expressive" }
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
                    ? 'shadow-[0_0_25px_rgba(167,139,250,0.6)] scale-[1.02]' 
                    : 'hover:shadow-[0_0_15px_rgba(167,139,250,0.4)] hover:scale-105'
                  }`}
                onClick={() => setTone(option.value)}
              >
                <div className="flex flex-col items-center space-y-2 w-full">
                  <span className="font-medium text-lg text-white">
                    {option.label}
                  </span>
                  <span className="text-white/90 text-sm font-light">
                    {option.description}
                  </span>
                </div>
              </Button>
            </div>
          ))}
        </div>
      </RadioGroup>
    </div>
  );
};

export default FeedbackToneSelector;
