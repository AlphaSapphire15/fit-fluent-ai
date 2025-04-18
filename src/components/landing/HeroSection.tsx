
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

export const HeroSection = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleUploadClick = () => {
    navigate('/upload');
  };

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

      {/* Drop Zone - Made clickable */}
      <div 
        onClick={handleUploadClick}
        className="w-full max-w-md mb-8 glass-card rounded-xl p-8 border border-lilac/20 hover:border-lilac/40 transition-all duration-300 cursor-pointer"
      >
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-lilac/10 flex items-center justify-center mb-4">
            <Upload className="w-8 h-8 text-lilac" />
          </div>
          <h3 className="text-lg font-medium mb-2">Drop your photo here</h3>
          <p className="text-sm text-muted-foreground">
            or click to browse files
          </p>
        </div>
      </div>

      <Button 
        onClick={() => navigate('/upload')} 
        variant="gradient"
        size={isMobile ? "lg" : "xl"}
        className="rounded-full font-medium shadow-[0_0_15px_rgba(167,139,250,0.4)] w-full max-w-xs md:max-w-md"
      >
        Analyze My Fit
      </Button>
    </section>
  );
};
