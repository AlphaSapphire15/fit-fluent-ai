
import { CreditCard, Zap } from "lucide-react";

export const PricingSection = () => {
  return (
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
  );
};
