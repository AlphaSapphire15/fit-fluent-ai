
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import PageContainer from "@/components/PageContainer";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckIcon, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const Pricing = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, initiateCheckout } = useAuth();
  const [isLoading, setIsLoading] = useState<{[key: string]: boolean}>({
    'one-time': false,
    'subscription': false
  });

  const handlePlanSelection = async (type: "one-time" | "subscription") => {
    try {
      setIsLoading(prev => ({ ...prev, [type]: true }));
      
      // If not logged in, redirect to signup with plan selection info
      if (!user) {
        navigate(`/signup?next=payment&plan=${type}`);
        return;
      }
      
      await initiateCheckout(type);
    } catch (error) {
      console.error("Error selecting plan:", error);
      toast({
        title: "Error",
        description: "There was a problem selecting the plan. Please try again.",
        variant: "destructive",
      });
      setIsLoading(prev => ({ ...prev, [type]: false }));
    }
  };

  const faqs = [
    {
      question: "How does the analysis work?",
      answer: "Our AI analyzes your outfit photo and provides detailed style recommendations, color coordination advice, and personalized fashion tips."
    },
    {
      question: "Can I cancel my subscription?",
      answer: "Yes, you can cancel your unlimited plan subscription anytime with no questions asked."
    },
    {
      question: "How many outfits can I analyze?",
      answer: "With the one-time plan, you get one outfit analysis. With the unlimited plan, you can analyze as many outfits as you want during your subscription period."
    }
  ];

  return (
    <PageContainer showBackButton>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-poppins font-bold mb-4 heading-gradient">
            Choose Your Perfect Plan
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Get personalized style recommendations and outfit analysis to elevate your fashion game
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* One-time Plan Card */}
          <Card className="glass-card hover:glow-border transition-all duration-300 relative overflow-hidden">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span className="text-xl font-poppins">One-Time Scan</span>
                <span className="text-2xl font-bold text-lilac">$3</span>
              </CardTitle>
              <CardDescription>Try it out with a single outfit analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <CheckIcon size={18} className="text-lilac min-w-[18px]" />
                  <span>Single outfit analysis</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckIcon size={18} className="text-lilac min-w-[18px]" />
                  <span>Detailed style recommendations</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckIcon size={18} className="text-lilac min-w-[18px]" />
                  <span>Color coordination advice</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter className="pt-4">
              <Button
                onClick={() => handlePlanSelection("one-time")}
                variant="gradient"
                className="w-full py-6 h-auto rounded-full"
                disabled={isLoading['one-time']}
                size="lg"
              >
                {isLoading['one-time'] ? "Processing..." : "Choose Plan"}
              </Button>
            </CardFooter>
          </Card>

          {/* Subscription Plan Card */}
          <Card className="glass-card hover:glow-border transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-gradient-to-r from-lilac to-neonBlue text-xs px-3 py-1 font-medium text-white">
              BEST VALUE
            </div>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span className="text-xl font-poppins">Unlimited Plan</span>
                <div>
                  <span className="text-2xl font-bold text-lilac">$10</span>
                  <span className="text-xs text-muted-foreground block text-right">/month</span>
                </div>
              </CardTitle>
              <CardDescription>For serious style upgrades</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <CheckIcon size={18} className="text-lilac min-w-[18px]" />
                  <span>Unlimited outfit analyses</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckIcon size={18} className="text-lilac min-w-[18px]" />
                  <span>Priority feedback</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckIcon size={18} className="text-lilac min-w-[18px]" />
                  <span>Advanced style recommendations</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckIcon size={18} className="text-lilac min-w-[18px]" />
                  <span>Seasonal trend insights</span>
                </li>
                <li className="flex items-center gap-2">
                  <Star size={18} className="text-lilac min-w-[18px] fill-lilac" />
                  <span className="font-medium">Cancel anytime</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter className="pt-4">
              <Button
                onClick={() => handlePlanSelection("subscription")}
                variant="gradient"
                className="w-full py-6 h-auto rounded-full"
                disabled={isLoading['subscription']}
                size="lg"
              >
                {isLoading['subscription'] ? "Processing..." : "Choose Plan"}
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="mt-12 text-center max-w-xl mx-auto">
          <Separator className="mb-6" />
          <h3 className="text-lg font-medium mb-4">Frequently Asked Questions</h3>
          <Accordion type="single" collapsible className="text-left">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-base font-medium">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </PageContainer>
  );
};

export default Pricing;
