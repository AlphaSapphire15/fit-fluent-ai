
import { Card, CardContent } from "@/components/ui/card";

const exampleAnalyses = [
  {
    imageSrc: "/lovable-uploads/4473c895-58aa-4006-842d-d42706bc4eec.png",
    score: 91,
    styleCore: "Earthy Nomad Luxe",
    whatsWorking: "This look is effortlessly grounded — the olive green wrap dress pairs beautifully with the rustic background, making it feel intentional and rooted. The layered jewelry, rolled sleeves, and brown boots give it structure without trying too hard. It's giving wanderer with a plan.",
    elevationTip: "Add a soft contrast texture — maybe a light woven scarf or a statement bag — to break the tonal flow just enough to pop without losing the earthy cohesion.",
    alt: "Woman in olive green wrap dress with brown boots against stone wall"
  },
  {
    imageSrc: "/lovable-uploads/4473c895-58aa-4006-842d-d42706bc4eec.png",
    score: 88,
    styleCore: "Modern Minimalist",
    whatsWorking: "Clean lines and neutral palette create a sophisticated silhouette. The monochromatic approach shows confidence in simplicity.",
    elevationTip: "Consider adding a delicate gold chain necklace to bring warmth to the neckline while maintaining the minimal aesthetic.",
    alt: "Modern minimalist outfit example"
  },
  {
    imageSrc: "/lovable-uploads/4473c895-58aa-4006-842d-d42706bc4eec.png",
    score: 94,
    styleCore: "Urban Bohemian",
    whatsWorking: "Perfect balance of structure and flow. The dress choice shows understanding of personal style while staying true to current trends.",
    elevationTip: "Layer with a vintage-inspired leather belt to add more definition and personality to the silhouette.",
    alt: "Urban bohemian style outfit"
  }
];

export const ExampleAnalyses = () => {
  return (
    <section className="px-4 py-16 bg-muted/5">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-satoshi font-bold text-center mb-12">
          See DresAI in Action
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {exampleAnalyses.map((analysis, index) => (
            <Card 
              key={index} 
              className="glass-card overflow-hidden group hover:-translate-y-1 transition-all duration-300"
            >
              <CardContent className="p-0">
                <div className="aspect-[3/4] relative">
                  <img 
                    src={analysis.imageSrc} 
                    alt={analysis.alt}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 right-4 w-16 h-16 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center border border-lilac">
                    <div className="text-center">
                      <span className="text-xl font-bold">{analysis.score}</span>
                      <span className="text-sm">/100</span>
                    </div>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <h3 className="text-xl font-satoshi font-bold text-lilac">
                    {analysis.styleCore}
                  </h3>
                  <div>
                    <h4 className="text-sm font-medium mb-2 text-lilac/80">What's Working:</h4>
                    <p className="text-sm text-muted-foreground">
                      {analysis.whatsWorking}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-2 text-lilac/80">Tip to Elevate:</h4>
                    <p className="text-sm text-muted-foreground">
                      {analysis.elevationTip}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
