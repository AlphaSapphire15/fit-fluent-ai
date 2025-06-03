import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { useUserPlan } from "@/hooks/useUserPlan";

export const HeroSection = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const { hasAccess, loading } = useUserPlan();

  const handleUpload = () => {
    if (!user) {
      // Not logged in - go to signup
      navigate('/signup');
    } else if (hasAccess()) {
      // Logged in and has access - go directly to upload
      navigate('/upload');
    } else {
      // Logged in but no access - go to pricing
      navigate('/pricing');
    }
  };

  const getButtonText = () => {
    if (!user) return "Sign Up to Analyze";
    if (loading) return "Checking...";
    if (hasAccess()) return "Analyze Your Outfit";
    return "Get Started";
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

      <Button 
        onClick={handleUpload}
        variant="gradient"
        size={isMobile ? "lg" : "xl"}
        className="rounded-full font-medium shadow-[0_0_15px_rgba(167,139,250,0.4)] hover:shadow-[0_0_25px_rgba(167,139,250,0.6)] w-full max-w-xs md:max-w-md mb-12"
        disabled={loading}
      >
        <Camera className="mr-2 w-5 h-5" />
        {getButtonText()}
      </Button>

      {/* Before/After Comparison */}
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
          <div className="flex-1 w-full">
            <div className="relative rounded-xl overflow-hidden">
              <img 
                src="/lovable-uploads/6f6384ff-9e6a-477e-8923-15605aceb5fa.png" 
                alt="Before and After style transformation"
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
        <p className="text-lg text-center mt-4 text-muted-foreground">
          See how DresAI can transform your fit
        </p>
      </div>
    </section>
  );
};
