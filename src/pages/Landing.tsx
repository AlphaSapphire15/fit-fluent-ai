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

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <main className="flex-1">
        {/* Logo */}
        <div className="flex justify-center mb-8 mt-4">
          <img 
            src="/lovable-uploads/3b00c8fa-f005-4603-977e-b78b8c890067.png" 
            alt="DresAI Logo" 
            className="h-16 md:h-20 object-contain"
          />
        </div>

        <HeroSection />
        <HowItWorks />
        <PerfectFor />
        <ExampleAnalyses />
        <div className="text-center py-8">
          <Button 
            onClick={() => navigate('/upload')} 
            className="bg-lilac hover:bg-lilac/90 text-white font-medium rounded-full px-8 py-6 text-lg h-auto hover:scale-105 transition-all"
          >
            Find Your Style Core
          </Button>
        </div>
        <Testimonials />
        <div className="text-center py-8">
          <Button 
            onClick={() => navigate('/upload')} 
            className="bg-lilac hover:bg-lilac/90 text-white font-medium rounded-full px-8 py-6 text-lg h-auto hover:scale-105 transition-all"
          >
            Join Them Today
          </Button>
        </div>
        <PricingSection />
        <FAQ />
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
