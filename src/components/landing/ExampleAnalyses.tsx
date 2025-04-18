
import { Card, CardContent } from "@/components/ui/card";

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

export const ExampleAnalyses = () => {
  return (
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
  );
};
