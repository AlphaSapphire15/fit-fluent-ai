
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Instagram, Compass, CheckCircle2 } from "lucide-react";

export const PerfectFor = () => {
  return (
    <section className="px-4 py-16 bg-background">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-satoshi font-bold text-center mb-12">
          Perfect For
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Content Creators Card */}
          <Card className="glass-card hover:scale-105 transition-transform duration-300">
            <CardContent className="pt-6 text-center">
              <div className="rounded-full bg-lilac/10 p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Instagram className="w-8 h-8 text-lilac" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Content Creators</h3>
              <p className="text-muted-foreground">
                Elevate your TikTok and Instagram content with style feedback that helps you stand out
              </p>
            </CardContent>
          </Card>

          {/* Style Explorers Card */}
          <Card className="glass-card hover:scale-105 transition-transform duration-300">
            <CardContent className="pt-6 text-center">
              <div className="rounded-full bg-lilac/10 p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Compass className="w-8 h-8 text-lilac" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Style Explorers</h3>
              <p className="text-muted-foreground">
                Discover your unique fashion identity and build a cohesive personal style
              </p>
            </CardContent>
          </Card>

          {/* Daily Decisions Card */}
          <Card className="glass-card hover:scale-105 transition-transform duration-300">
            <CardContent className="pt-6 text-center">
              <div className="rounded-full bg-lilac/10 p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-lilac" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Daily Decisions</h3>
              <p className="text-muted-foreground">
                Never second-guess your outfit choices again with objective AI analysis
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};
