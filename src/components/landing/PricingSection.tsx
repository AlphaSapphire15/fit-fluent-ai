
import { CreditCard, Zap, CheckCircle2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

export const PricingSection = () => {
  const isMobile = useIsMobile();

  return (
    <section className="px-4 py-16 bg-muted/10">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-poppins font-bold text-center mb-12 heading-gradient">
          Simple Pricing
        </h2>
        <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} gap-6 justify-center`}>
          {/* One-time Card */}
          <div className="glass-card rounded-xl p-6 hover:glow-border transition-all duration-300 flex-1">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="font-poppins font-bold text-xl mb-1">One-Time Scan</h3>
                <p className="text-muted-foreground text-sm">Just trying it out</p>
              </div>
              <div className="text-2xl font-bold text-lilac">$3</div>
            </div>
            <ul className="mb-6 space-y-3">
              <li className="flex items-center text-sm">
                <CheckCircle2 size={18} className="text-lilac mr-2 flex-shrink-0" />
                <span>Full style analysis</span>
              </li>
              <li className="flex items-center text-sm">
                <CheckCircle2 size={18} className="text-lilac mr-2 flex-shrink-0" />
                <span>Style core identification</span>
              </li>
              <li className="flex items-center text-sm">
                <CheckCircle2 size={18} className="text-lilac mr-2 flex-shrink-0" />
                <span>Customized improvement tips</span>
              </li>
            </ul>
            <button className="w-full py-3 rounded-lg border border-lilac/50 bg-background/50 text-lilac hover:bg-lilac/10 transition-colors">
              Choose Plan
            </button>
          </div>
          
          {/* Subscription Card */}
          <div className="glass-card rounded-xl p-6 hover:glow-border transition-all duration-300 relative overflow-hidden flex-1">
            <div className="absolute top-0 right-0 bg-gradient-to-r from-lilac to-neonBlue text-xs px-3 py-1 font-medium text-white">
              POPULAR
            </div>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="font-poppins font-bold text-xl mb-1">Unlimited Plan</h3>
                <p className="text-muted-foreground text-sm">For serious style upgrades</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-lilac">$10</div>
                <div className="text-xs text-right text-muted-foreground">per month</div>
              </div>
            </div>
            <ul className="mb-6 space-y-3">
              <li className="flex items-center text-sm">
                <CheckCircle2 size={18} className="text-lilac mr-2 flex-shrink-0" />
                <span>Unlimited style analyses</span>
              </li>
              <li className="flex items-center text-sm">
                <CheckCircle2 size={18} className="text-lilac mr-2 flex-shrink-0" />
                <span>Compare different outfits</span>
              </li>
              <li className="flex items-center text-sm">
                <CheckCircle2 size={18} className="text-lilac mr-2 flex-shrink-0" />
                <span>Track your style evolution</span>
              </li>
              <li className="flex items-center text-sm">
                <CheckCircle2 size={18} className="text-lilac mr-2 flex-shrink-0" />
                <span>Premium feedback options</span>
              </li>
            </ul>
            <button className="w-full py-3 rounded-lg bg-gradient-to-r from-lilac to-neonBlue text-white font-medium hover:shadow-[0_0_15px_rgba(167,139,250,0.5)] transition-all">
              Start Free Trial
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
