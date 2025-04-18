
import { Camera, Wand2, Award, Sparkles, Smartphone } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();

  return (
    <section className="px-4 py-16 bg-muted/20">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-poppins font-bold text-center mb-8 heading-gradient">
          How It Works
        </h2>
        
        <div className="flex flex-col md:flex-row gap-8 mb-12">
          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    <h3 className="text-lg font-poppins font-semibold mb-2">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
          
          {/* Mobile mockup */}
          <div className="flex-1 flex justify-center items-center">
            <div className="relative max-w-[250px] w-full">
              <div className="relative bg-black rounded-[40px] p-2 shadow-[0_0_25px_rgba(0,0,0,0.3)] border-4 border-slate-700">
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1/3 h-6 bg-black rounded-b-2xl z-10"></div>
                <div className="rounded-[32px] overflow-hidden bg-background aspect-[9/19]">
                  <img 
                    src="/lovable-uploads/3f98984f-55db-43ca-8154-6e5bb669d40d.png" 
                    alt="DresAI mobile app" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-white text-xs">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xs">Style Score</div>
                      <div className="text-lg font-bold text-lilac">94</div>
                    </div>
                    <div className="text-[10px] text-lilac font-medium">Modern Luxe Minimalist</div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-12 h-12 rounded-full border-4 border-slate-700 flex items-center justify-center bg-slate-900">
                <div className="w-6 h-6 rounded-sm bg-slate-800"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <button className="cta-button">
            Try It On Your Photos
          </button>
        </div>
      </div>
    </section>
  );
};
