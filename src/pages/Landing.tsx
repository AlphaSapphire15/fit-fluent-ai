
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { HeroSection } from "@/components/landing/HeroSection";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { ExampleAnalyses } from "@/components/landing/ExampleAnalyses";
import { PerfectFor } from "@/components/landing/PerfectFor";
import { PricingSection } from "@/components/landing/PricingSection";
import { Testimonials } from "@/components/landing/Testimonials";
import { FAQ } from "@/components/landing/FAQ";
import { useIsMobile } from "@/hooks/use-mobile";

const Landing = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const scrollToPricing = () => {
    document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-background/80 border-b border-white/10">
        <div className="flex justify-between items-center px-4 py-3 max-w-6xl mx-auto">
          <img 
            src="/lovable-uploads/3b00c8fa-f005-4603-977e-b78b8c890067.png" 
            alt="DresAI Logo" 
            className="h-8 md:h-10 object-contain"
          />
          <Button 
            variant="ghost" 
            onClick={scrollToPricing}
            className="text-sm hover:text-lilac"
          >
            Pricing
          </Button>
        </div>
      </header>

      <main className="flex-1">
        <HeroSection />
        <HowItWorks />
        <PerfectFor />
        <ExampleAnalyses />
        <Testimonials />
        <div id="pricing">
          <PricingSection />
        </div>
        <FAQ />
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-white/10">
        <div className="max-w-md mx-auto px-4 flex flex-col md:flex-row items-center justify-center gap-4">
          <div className="flex items-center">
            <MessageCircle size={20} className="mr-2 text-lilac" />
            <span className="text-sm text-muted-foreground">Seen us on your FYP?</span>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-lilac border-lilac/30 hover:bg-lilac/10 hover:text-white"
            onClick={() => window.open('https://tiktok.com/@dresai', '_blank')}
          >
            Follow Us
          </Button>
        </div>
        <div className="text-center mt-4 text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} DresAI. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Landing;
