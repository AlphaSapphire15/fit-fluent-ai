
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
      <RadioGroup value={tone} onValueChange={setTone} className="space-y-2">
        <div className="grid grid-cols-3 gap-3">
          {toneOptions.map((option) => (
            <div key={option.value} className="w-full">
              <Button
                variant="secondary"
                className={`w-full h-16 rounded-xl transition-all duration-300
                  ${tone === option.value 
                    ? 'bg-gradient-to-r from-lilac to-neonBlue text-white border border-white/30 shadow-[0_0_15px_rgba(167,139,250,0.6)]' 
                    : 'bg-secondary hover:bg-gradient-to-r hover:from-lilac/50 hover:to-neonBlue/50 hover:text-white hover:shadow-[0_0_10px_rgba(167,139,250,0.3)]'
                  }`}
                onClick={() => setTone(option.value)}
              >
                <span className={`font-semibold text-lg ${tone === option.value ? 'text-white' : ''}`}>
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
