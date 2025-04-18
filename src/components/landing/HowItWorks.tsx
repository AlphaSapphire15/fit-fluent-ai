
import { Camera, Wand2, Award, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";

const steps = [
  {
    icon: Camera,
    title: "Upload",
    description: "Snap a photo of your outfit or upload an existing one"
  },
  {
    icon: Wand2,
    title: "Analyze",
    description: "Our AI analyzes your style elements, colors, and proportions"
  },
  {
    icon: Award,
    title: "Score",
    description: "Get your style score and discover your unique Style Core identity"
  },
  {
    icon: Sparkles,
    title: "Improve",
    description: "Receive personalized tips to elevate your look"
  }
];

export const HowItWorks = () => {
  return (
    <section className="px-4 py-16 bg-muted/20">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-satoshi font-bold text-center mb-12">
          How It Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <Card 
              key={index} 
              className="relative overflow-hidden p-6 glass-card border-lilac/20 
                hover:border-lilac/40 transition-all duration-300
                before:absolute before:inset-0 before:bg-gradient-to-br 
                before:from-lilac/0 before:to-lilac/10 before:opacity-0
                hover:before:opacity-100 before:transition-opacity before:duration-300"
            >
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-full bg-lilac/10 flex items-center justify-center mb-6">
                  <step.icon className="w-8 h-8 text-lilac" />
                </div>
                <h3 className="text-lg font-satoshi font-medium mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
