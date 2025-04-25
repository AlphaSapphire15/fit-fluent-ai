
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
    <div className="mb-10">
      <h2 className="text-lg font-medium mb-4">How would you like your feedback?</h2>
      <RadioGroup value={tone} onValueChange={setTone} className="space-y-4">
        {toneOptions.map((option) => (
          <Button
            key={option.value}
            variant={tone === option.value ? "gradient" : "outline"}
            className={`w-full justify-start h-auto py-4 px-6 ${
              tone === option.value 
                ? "shadow-[0_0_15px_rgba(167,139,250,0.5)]" 
                : "hover:border-lilac/30 hover:shadow-[0_0_15px_rgba(167,139,250,0.3)]"
            }`}
            onClick={() => setTone(option.value)}
          >
            <RadioGroupItem
              value={option.value}
              id={option.value}
              className="sr-only"
            />
            <div className="flex flex-col items-start">
              <span className="font-medium text-lg">
                {option.label}
              </span>
              <span className={`text-sm mt-1 ${tone === option.value ? 'text-white/80' : 'text-muted-foreground'}`}>
                {option.description}
              </span>
            </div>
          </Button>
        ))}
      </RadioGroup>
    </div>
  );
};

export default FeedbackToneSelector;
