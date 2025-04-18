
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { TrendingUp, Upload, CreditCard, Zap, MessageCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const Landing = () => {
  const navigate = useNavigate();

  const exampleAnalyses = [
    {
      imageSrc: "/placeholder.svg",
      score: 84,
      styleCore: "Street Sleek Nomad",
      tips: "Try adding a textured jacket for more depth.",
      alt: "Street style outfit with minimalist aesthetic"
    },
    {
      imageSrc: "/placeholder.svg",
      score: 92,
      styleCore: "Modern Prep Elite",
      tips: "Layer with a cashmere scarf to elevate the look.",
      alt: "Professional outfit with preppy elements"
    },
    {
      imageSrc: "/placeholder.svg",
      score: 88,
      styleCore: "Urban Zen Athlete",
      tips: "Consider monochrome accessories to unify the palette.",
      alt: "Athletic-inspired casual wear"
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="px-4 pt-16 pb-12 md:pt-24 md:pb-20 flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-5xl font-satoshi font-bold mb-4 leading-tight">
            Is your outfit <span className="glow-text">actually</span> working?
          </h1>
          <div className="text-center mb-4">
            <p className="text-lg md:text-xl text-muted-foreground mb-2">
              Get honest AI feedback on your style in seconds.
            </p>
            <p className="text-md md:text-lg text-muted-foreground mb-8 max-w-md mx-auto px-4">
              Upload a photo of your fit, get a score from 0-100, discover your unique Style Core, 
              and receive smart tips to level up your look.
            </p>
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

        {/* Example Analyses Section */}
        <section className="px-4 py-16 bg-muted/5">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-satoshi font-bold text-center mb-8">
              See DresAI in Action
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {exampleAnalyses.map((analysis, index) => (
                <Card key={index} className="glass-card transition-all duration-300 hover:-translate-y-2">
                  <CardContent className="p-6">
                    <div className="aspect-[3/4] rounded-lg overflow-hidden mb-6 bg-muted/20">
                      <img 
                        src={analysis.imageSrc} 
                        alt={analysis.alt}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-lilac/20 to-lilac flex items-center justify-center border border-lilac/40">
                        <span className="text-xl font-bold">{analysis.score}</span>
                        <span className="text-sm">/100</span>
                      </div>
                      <h3 className="text-lg font-satoshi font-bold">
                        {analysis.styleCore}
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {analysis.tips}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

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

        {/* How it Works */}
        <section className="px-4 py-12 bg-muted/20">
          <div className="max-w-md mx-auto">
            <h2 className="text-2xl font-satoshi font-bold text-center mb-8">
              How It Works
            </h2>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-lilac/10 flex items-center justify-center mb-3">
                  <Upload size={20} className="text-lilac" />
                </div>
                <p className="text-sm">Upload</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-lilac/10 flex items-center justify-center mb-3">
                  <CreditCard size={20} className="text-lilac" />
                </div>
                <p className="text-sm">Pay</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-lilac/10 flex items-center justify-center mb-3">
                  <TrendingUp size={20} className="text-lilac" />
                </div>
                <p className="text-sm">Get Feedback</p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="px-4 py-12">
          <div className="max-w-md mx-auto">
            <h2 className="text-2xl font-satoshi font-bold text-center mb-8">
              Pricing
            </h2>
            <div className="space-y-4">
              {/* One-time Card */}
              <div className="glass-card rounded-xl p-6 hover:glow-border transition-all duration-300">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-satoshi font-bold text-lg">One-Time Scan</h3>
                    <p className="text-muted-foreground text-sm">Just trying it out</p>
                  </div>
                  <div className="text-xl font-bold">$3</div>
                </div>
                <ul className="mb-4 space-y-2">
                  <li className="flex items-center text-sm">
                    <Zap size={16} className="text-lilac mr-2" />
                    Full style analysis
                  </li>
                  <li className="flex items-center text-sm">
                    <Zap size={16} className="text-lilac mr-2" />
                    Style core identification
                  </li>
                  <li className="flex items-center text-sm">
                    <Zap size={16} className="text-lilac mr-2" />
                    Customized improvement tips
                  </li>
                </ul>
              </div>
              
              {/* Subscription Card */}
              <div className="glass-card rounded-xl p-6 hover:glow-border transition-all duration-300 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-lilac text-xs px-2 py-1 font-medium text-white">
                  POPULAR
                </div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-satoshi font-bold text-lg">Unlimited Plan</h3>
                    <p className="text-muted-foreground text-sm">For serious style upgrades</p>
                  </div>
                  <div>
                    <div className="text-xl font-bold">$10</div>
                    <div className="text-xs text-right text-muted-foreground">per month</div>
                  </div>
                </div>
                <ul className="mb-4 space-y-2">
                  <li className="flex items-center text-sm">
                    <Zap size={16} className="text-lilac mr-2" />
                    Unlimited style analyses
                  </li>
                  <li className="flex items-center text-sm">
                    <Zap size={16} className="text-lilac mr-2" />
                    Compare different outfits
                  </li>
                  <li className="flex items-center text-sm">
                    <Zap size={16} className="text-lilac mr-2" />
                    Track your style evolution
                  </li>
                  <li className="flex items-center text-sm">
                    <Zap size={16} className="text-lilac mr-2" />
                    Premium feedback options
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

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
