
import { Card, CardContent } from "@/components/ui/card";
import { Quote } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Chen",
    photo: "/lovable-uploads/3f98984f-55db-43ca-8154-6e5bb669d40d.png",
    beforeScore: 72,
    afterScore: 94,
    quote: "As a TikTok fashion creator, I needed to keep my style game strong. DresAI helped me fine-tune my looks and my engagement went up 40% after implementing the tips!",
    styleCore: "Modern Luxe Minimalist",
    role: "TikTok Creator"
  },
  {
    name: "Marcus Rodriguez",
    photo: "/lovable-uploads/4473c895-58aa-4006-842d-d42706bc4eec.png",
    beforeScore: 65,
    afterScore: 88,
    quote: "I've always been passionate about fashion but struggled with consistency. The AI feedback helped me develop a signature style that feels authentically me.",
    styleCore: "Urban Street Sophisticate",
    role: "Fashion Enthusiast"
  },
  {
    name: "Emma Thompson",
    photo: "/lovable-uploads/34999fc2-3843-4516-85cf-9ae2914cdeee.png",
    beforeScore: 58,
    afterScore: 86,
    quote: "DresAI is like having a personal stylist in your pocket. It helped me build a wardrobe that makes me feel confident every day.",
    styleCore: "Casual Chic Minimalist",
    role: "Everyday User"
  }
];

export const Testimonials = () => {
  return (
    <section className="px-4 py-16 bg-muted/5">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-satoshi font-bold text-center mb-12">
          What Our Users Say
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={index}
              className="glass-card overflow-hidden group hover:-translate-y-1 transition-all duration-300"
            >
              <CardContent className="p-6 relative">
                <Quote className="absolute top-4 right-4 text-lilac/20 size-8" />
                <div className="flex items-center gap-4 mb-6">
                  <img 
                    src={testimonial.photo} 
                    alt={testimonial.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-semibold">{testimonial.name}</h3>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground italic">
                    {testimonial.quote}
                  </p>
                </div>
                <div className="pt-4 border-t border-border/50">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-muted-foreground">Style Score</span>
                    <div className="text-sm">
                      <span className="text-red-400">{testimonial.beforeScore}</span>
                      <span className="mx-2">→</span>
                      <span className="text-green-400">{testimonial.afterScore}</span>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-lilac">
                    {testimonial.styleCore}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
