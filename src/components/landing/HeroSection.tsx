
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

export const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="px-4 pt-8 pb-12 md:pb-20 flex flex-col items-center text-center">
      <h1 className="text-4xl md:text-5xl font-satoshi font-bold mb-4 leading-tight">
        Is your outfit <span className="glow-text">actually</span> working?
      </h1>
      <div className="text-center mb-8">
        <p className="text-lg md:text-xl text-muted-foreground mb-8">
          Get honest AI feedback on your style in seconds.
        </p>
      </div>

      {/* Drop Zone */}
      <div className="w-full max-w-md mb-8 glass-card rounded-xl p-8 border border-lilac/20 hover:border-lilac/40 transition-all duration-300">
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
        size="lg" 
        className="bg-lilac hover:bg-lilac/90 text-white font-medium rounded-full px-8 py-6 text-lg h-auto transition-all duration-300 
          shadow-[0_0_15px_rgba(167,139,250,0.4)] hover:shadow-[0_0_25px_rgba(167,139,250,0.6)]"
      >
        Analyze My Fit
      </Button>
    </section>
  );
};
