
import React from "react";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const PricingFAQ: React.FC = () => {
  const faqs = [
    {
      question: "How does the free trial work?",
      answer: "Every new user gets one free outfit analysis to try our service. After that, you'll need the unlimited plan for more analyses."
    },
    {
      question: "Can I cancel my subscription?",
      answer: "Yes, you can cancel your unlimited plan subscription anytime with no questions asked."
    },
    {
      question: "What's included in the unlimited plan?",
      answer: "With the unlimited plan, you can analyze as many outfits as you want during your subscription period, plus get priority feedback and advanced style recommendations."
    }
  ];

  return (
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
  );
};

export default PricingFAQ;
