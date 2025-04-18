
import { Camera, Wand2, Award, Sparkles } from "lucide-react";

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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
          {/* Connecting Lines */}
          <div className="hidden md:block absolute top-24 left-1/4 right-1/4 h-[2px] bg-gradient-to-r from-lilac/20 via-lilac/40 to-lilac/20" />
          
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center text-center relative">
              <div className="w-16 h-16 rounded-full bg-lilac/10 flex items-center justify-center mb-6 relative z-10 border border-lilac/20">
                <step.icon className="w-8 h-8 text-lilac" />
              </div>
              <h3 className="text-lg font-satoshi font-medium mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground max-w-[200px]">
                {step.description}
              </p>
              {/* Mobile Connector */}
              {index < steps.length - 1 && (
                <div className="md:hidden h-16 w-[2px] my-4 bg-gradient-to-b from-lilac/40 to-lilac/10" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
