
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
    imageSrc: "/lovable-uploads/34999fc2-3843-4516-85cf-9ae2914cdeee.png",
    score: 86,
    styleCore: "Laidback Parkside Minimalist",
    whatsWorking: "This look nails effortless skater energy. The layered long-sleeve under the black tee is a classic early-2000s callback that still holds up when styled clean like this. The brown corduroy pants add texture, and the sneakers + backwards cap keep it casual without slipping into \"messy.\"",
    elevationTip: "Consider swapping the white long sleeve for a soft gray or off-white to add visual contrast — or a subtle graphic that adds identity. Even a colored sock peek could add just enough detail to pop.",
    alt: "Skater in black tee over white long sleeve with brown corduroy pants"
  }
];

export const ExampleAnalyses = () => {
  return (
    <section className="px-4 py-16 bg-muted/5">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-satoshi font-bold text-center mb-12">
          See DresAI in Action
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
