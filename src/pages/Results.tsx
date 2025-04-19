
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, Upload, CheckCircle, Clipboard } from "lucide-react";
import PageContainer from "@/components/PageContainer";
import { useStyle } from "@/contexts/StyleContext";
import { useToast } from "@/components/ui/use-toast";

const Results = () => {
  const navigate = useNavigate();
  const { results, image } = useStyle();
  const { toast } = useToast();
  const scoreCircleRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    // If no results, redirect to home
    if (!results) {
      navigate("/");
      return;
    }

    // Animate the score circle
    if (scoreCircleRef.current) {
      scoreCircleRef.current.style.setProperty("--score-value", `${results.score}`);
    }
  }, [results, navigate]);

  const copyResults = () => {
    if (!results) return;
    
    const text = `
DresAI Style Analysis:
Score: ${results.score}/100
Style Core: ${results.styleCore}
Highlights:
${results.highlights.map(h => `- ${h}`).join("\n")}
Suggestion: ${results.suggestion}
    `.trim();
    
    navigator.clipboard.writeText(text);
    
    toast({
      title: "Copied to clipboard!",
      description: "Your style results have been copied.",
    });
  };

  if (!results || !image) {
    return null; // Handled by the useEffect redirect
  }

  return (
    <PageContainer>
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-satoshi font-bold mb-2">Your Style Results</h1>
        <p className="text-muted-foreground">Here's our analysis of your fit</p>
      </div>

      <div className="flex justify-center mb-8">
        <img
          src={URL.createObjectURL(image)}
          alt="Your outfit"
          className="w-40 h-40 object-cover rounded-lg border border-white/10"
        />
      </div>

      {/* Style Analysis */}
      <div className="glass-card rounded-xl p-6 mb-6">
        <h3 className="font-satoshi font-bold text-lg mb-4">What's Working</h3>
        <ul className="space-y-3">
          {results.strengths ? (
            results.strengths.map((strength, index) => (
              <li key={index} className="flex items-start gap-2">
                <CheckCircle size={18} className="text-lilac shrink-0 mt-0.5" />
                <span>{strength}</span>
              </li>
            ))
          ) : (
            results.highlights.slice(0, Math.ceil(results.highlights.length / 2)).map((highlight, index) => (
              <li key={index} className="flex items-start gap-2">
                <CheckCircle size={18} className="text-lilac shrink-0 mt-0.5" />
                <span>{highlight}</span>
              </li>
            ))
          )}
        </ul>
      </div>

      <div className="glass-card rounded-xl p-6 mb-6">
        <h3 className="font-satoshi font-bold text-lg mb-4">Tips to Elevate</h3>
        <ul className="space-y-3">
          {results.improvements ? (
            results.improvements.map((improvement, index) => (
              <li key={index} className="flex items-start gap-2">
                <Sparkles size={18} className="text-lilac shrink-0 mt-0.5" />
                <span>{improvement}</span>
              </li>
            ))
          ) : (
            results.highlights.slice(Math.ceil(results.highlights.length / 2)).map((highlight, index) => (
              <li key={index} className="flex items-start gap-2">
                <Sparkles size={18} className="text-lilac shrink-0 mt-0.5" />
                <span>{highlight}</span>
              </li>
            ))
          )}
        </ul>
      </div>

      {/* Score Circle */}
      <div className="flex flex-col items-center mb-8">
        <div className="relative w-48 h-48 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="rgba(167, 139, 250, 0.1)"
              strokeWidth="8"
            />
            {/* Score circle */}
            <circle
              ref={scoreCircleRef}
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="rgba(167, 139, 250, 0.8)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray="283, 283"
              className="animate-score-circle"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-bold">{results.score}</span>
            <span className="text-sm text-muted-foreground">out of 100</span>
          </div>
        </div>
      </div>

      {/* Style core */}
      <div className="glass-card rounded-xl p-6 mb-6 text-center">
        <div className="inline-block bg-lilac/10 px-3 py-1 rounded-full text-xs font-medium text-lilac mb-2">
          STYLE CORE
        </div>
        <h2 className="text-2xl font-satoshi font-bold">
          {results.styleCore}
        </h2>
      </div>

      {/* Style highlights */}
      <div className="glass-card rounded-xl p-6 mb-6">
        <h3 className="font-satoshi font-bold text-lg mb-4 flex items-center">
          <Sparkles size={18} className="text-lilac mr-2" />
          Style Highlights
        </h3>
        <ul className="space-y-3">
          {results.highlights.map((highlight, index) => (
            <li key={index} className="flex items-start gap-2">
              <CheckCircle size={18} className="text-lilac shrink-0 mt-0.5" />
              <span>{highlight}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Suggestion */}
      <div className="glass-card rounded-xl p-6 mb-8">
        <h3 className="font-satoshi font-bold text-lg mb-4">AI Suggestion</h3>
        <p>{results.suggestion}</p>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <Button
          onClick={() => navigate("/upload")}
          className="w-full bg-lilac hover:bg-lilac/90 text-white py-6 h-auto text-lg rounded-full"
        >
          <Upload size={18} className="mr-2" /> Upload Another Fit
        </Button>
        <Button
          variant="outline"
          onClick={copyResults}
          className="w-full py-5 h-auto rounded-full"
        >
          <Clipboard size={16} className="mr-2" /> Copy My Results
        </Button>
      </div>
    </PageContainer>
  );
};

export default Results;
