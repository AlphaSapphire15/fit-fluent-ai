
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
                variant={tone === option.value ? "default" : "outline"}
                className="w-full flex flex-col items-start h-auto p-4 space-y-2"
                onClick={() => setTone(option.value)}
              >
                <span className="font-medium text-lg">{option.label}</span>
                <span className="text-muted-foreground text-sm">{option.description}</span>
              </Button>
            </div>
          ))}
        </div>
      </RadioGroup>
    </div>
  );
};

export default FeedbackToneSelector;
