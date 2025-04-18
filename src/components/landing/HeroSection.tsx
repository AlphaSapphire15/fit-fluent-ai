
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

export const HeroSection = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  return (
    <section className="px-4 pt-8 pb-12 md:pb-20 flex flex-col items-center text-center">
      <h1 className="font-poppins text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
        Is your outfit <span className="glow-text">actually</span> working?
      </h1>
      <div className="text-center mb-8">
        <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Get honest AI feedback on your style in seconds.
        </p>
      </div>

      <Button 
        onClick={() => navigate('/upload')} 
        variant="gradient"
        size={isMobile ? "lg" : "xl"}
        className="rounded-full font-medium mb-12 w-full max-w-xs md:max-w-md"
      >
        <Camera className="mr-2" />
        Upload Your Look
      </Button>

      <div className="w-full max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative">
            <img 
              src="/lovable-uploads/ddeb9d03-d0cc-4684-bc97-3cb531fcc68d.png" 
              alt="Before style transformation"
              className="w-full rounded-lg"
            />
            <div className="absolute top-4 left-4 bg-black/60 px-3 py-1 rounded-full text-sm font-medium">
              Before
            </div>
          </div>
          <div className="relative">
            <img 
              src="/lovable-uploads/ddeb9d03-d0cc-4684-bc97-3cb531fcc68d.png" 
              alt="After style transformation"
              className="w-full rounded-lg"
            />
            <div className="absolute top-4 left-4 bg-lilac/80 px-3 py-1 rounded-full text-sm font-medium">
              After
            </div>
          </div>
        </div>
        <p className="text-center text-muted-foreground mt-4">
          See how DresAI can transform your fit
        </p>
      </div>
    </section>
  );
};
