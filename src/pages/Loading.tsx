
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageContainer from "@/components/PageContainer";
import { useStyle } from "@/contexts/StyleContext";

const quotes = [
  "Style is how you show up without speaking.",
  "Every outfit tells a story.",
  "Fashion fades, but style is eternal.",
  "Your clothes speak for you before you do.",
  "Style is a way to say who you are without having to speak.",
];

const styleResults = [
  {
    score: 84,
    styleCore: "Urban Minimalist Explorer",
    highlights: [
      "Strong color coherence with modern silhouette",
      "Effective balance of casual and refined elements"
    ],
    suggestion: "Try adding a textured accessory to add depth to your look."
  },
  {
    score: 78,
    styleCore: "Vintage Contemporary Fusion",
    highlights: [
      "Excellent pattern mixing technique",
      "Well-executed layering approach"
    ],
    suggestion: "Consider adjusting proportions slightly for a more balanced silhouette."
  },
  {
    score: 92,
    styleCore: "Refined Street Aesthetic",
    highlights: [
      "Perfect balance of statement and subtle pieces",
      "Outstanding color coordination with advanced tonal play"
    ],
    suggestion: "Experiment with unexpected footwear choices to elevate this look further."
  }
];

const Loading = () => {
  const navigate = useNavigate();
  const { setResults } = useStyle();
  const [currentQuote, setCurrentQuote] = useState(quotes[0]);
  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    // Rotate through quotes
    const quoteInterval = setInterval(() => {
      setQuoteIndex((prev) => {
        const newIndex = (prev + 1) % quotes.length;
        setCurrentQuote(quotes[newIndex]);
        return newIndex;
      });
    }, 3000);

    // Mock API call to get results
    const timer = setTimeout(() => {
      // Select a random result
      const randomResult = styleResults[Math.floor(Math.random() * styleResults.length)];
      setResults(randomResult);
      navigate("/results");
    }, 5000);

    return () => {
      clearInterval(quoteInterval);
      clearTimeout(timer);
    };
  }, [navigate, setResults]);

  return (
    <PageContainer>
      <div className="flex flex-col items-center justify-center h-[80vh]">
        <div className="loader mb-10" style={{ "--speed": "1.5s", "--easing": "ease-in-out", "--iteration-count": "infinite" } as React.CSSProperties}></div>
        
        <h1 className="text-2xl font-satoshi font-bold mb-3 text-center">
          Reading your fit energy...
        </h1>
        
        <div className="h-20 flex items-center justify-center">
          <p className="text-center text-muted-foreground max-w-xs animate-pulse transition-opacity duration-1000">
            "{currentQuote}"
          </p>
        </div>
      </div>
    </PageContainer>
  );
};

export default Loading;
