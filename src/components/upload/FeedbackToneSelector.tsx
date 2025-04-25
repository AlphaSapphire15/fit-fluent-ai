
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
    <div className="mb-6">
      <h2 className="text-lg font-medium mb-4">Select your feedback style:</h2>
      <RadioGroup value={tone} onValueChange={setTone}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {toneOptions.map((option) => (
            <div key={option.value} className="w-full">
              <div 
                className={`glass-card rounded-xl p-4 cursor-pointer transition-all duration-300 h-full
                  ${tone === option.value 
                    ? "border-2 border-neonBlue shadow-[0_0_15px_rgba(96,165,250,0.5)] bg-neonBlue/10" 
                    : "border-2 border-transparent hover:border-neonBlue/30 hover:shadow-[0_0_15px_rgba(96,165,250,0.3)]"}`}
              >
                <RadioGroupItem
                  value={option.value}
                  id={option.value}
                  className="sr-only"
                />
                <Label
                  htmlFor={option.value}
                  className="flex flex-col cursor-pointer h-full"
                >
                  <span className={`font-medium text-lg mb-2 ${tone === option.value ? "text-neonBlue" : ""}`}>
                    {option.label}
                  </span>
                  <span className="text-muted-foreground text-sm">
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
