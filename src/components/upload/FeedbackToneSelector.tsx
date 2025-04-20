
import React from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

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
      <RadioGroup value={tone} onValueChange={setTone}>
        <div className="flex flex-col gap-3">
          {toneOptions.map((option) => (
            <div key={option.value} className="w-full">
              <div 
                className={`glass-card rounded-full p-4 cursor-pointer transition-all duration-300
                  ${tone === option.value 
                    ? "border-2 border-lilac shadow-[0_0_15px_rgba(167,139,250,0.5)] bg-lilac/10" 
                    : "border-2 border-transparent hover:border-lilac/30 hover:shadow-[0_0_15px_rgba(167,139,250,0.3)]"}`}
              >
                <RadioGroupItem
                  value={option.value}
                  id={option.value}
                  className="sr-only"
                />
                <Label
                  htmlFor={option.value}
                  className="flex flex-col cursor-pointer"
                >
                  <span className={`font-medium text-lg ${tone === option.value ? "text-lilac" : ""}`}>
                    {option.label}
                  </span>
                  <span className="text-muted-foreground text-sm mt-1">
                    {option.description}
                  </span>
                </Label>
              </div>
            </div>
          ))}
        </div>
      </RadioGroup>
    </div>
  );
};

export default FeedbackToneSelector;
