
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { HeroSection } from "@/components/landing/HeroSection";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { ExampleAnalyses } from "@/components/landing/ExampleAnalyses";
import { PricingSection } from "@/components/landing/PricingSection";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <main className="flex-1">
        {/* Logo */}
        <div className="flex justify-center mb-8 mt-4">
          <img 
            src="/lovable-uploads/3f98984f-55db-43ca-8154-6e5bb669d40d.png" 
            alt="DresAI Logo" 
            className="h-24 md:h-32"
          />
        </div>

        <HeroSection />
        <HowItWorks />
        <ExampleAnalyses />

        {/* Mock Score Card */}
        <section className="px-4 mb-16">
          <div className="glass-card max-w-sm mx-auto rounded-xl p-6 flex flex-col items-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-lilac/20 to-lilac flex items-center justify-center mb-4 border border-lilac/40">
              <span className="text-2xl font-bold">84</span>
              <span className="text-sm">/100</span>
            </div>
            <h3 className="text-lg font-satoshi font-bold mb-1">
              Street Sleek Nomad
            </h3>
            <p className="text-sm text-muted-foreground">Your Style Core</p>
          </div>
        </section>

        <PricingSection />

        {/* CTA Section */}
        <section className="px-4 py-12 flex flex-col items-center">
          <Button 
            onClick={() => navigate('/upload')} 
            size="lg" 
            className="bg-lilac hover:bg-lilac/90 text-white font-medium rounded-full px-8 py-6 text-lg h-auto"
          >
            Analyze My Fit
          </Button>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-white/10">
        <div className="max-w-md mx-auto px-4 flex items-center justify-center">
          <MessageCircle size={20} className="mr-2 text-lilac" />
          <span className="text-sm text-muted-foreground">Seen us on your FYP?</span>
        </div>
        <div className="text-center mt-4 text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} DresAI. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Landing;
