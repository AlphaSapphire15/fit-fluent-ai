
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "How accurate is the AI scoring?",
    answer: "Our AI scoring system is trained on millions of fashion images and expert stylist inputs, achieving a 95% correlation with professional stylists' assessments. The score considers multiple factors including fit, color coordination, occasion appropriateness, and current trends."
  },
  {
    question: "What kind of photos work best?",
    answer: "Full-length photos in good lighting work best. Natural daylight is ideal, and a simple background helps the AI focus on your outfit. Make sure your whole outfit is visible, and try to capture front-facing poses for the most accurate analysis."
  },
  {
    question: "How private is my data?",
    answer: "Your privacy is our top priority. All photos are encrypted, never shared with third parties, and you can delete them anytime. We use industry-standard security measures and don't store any personally identifiable information without your explicit consent."
  },
  {
    question: "Can I get feedback on multiple outfits?",
    answer: "Yes! You can upload multiple outfits and get detailed feedback on each one. This is especially useful for planning your week's outfits or preparing for special occasions. Our premium plans offer unlimited analyses."
  },
  {
    question: "How are Style Cores determined?",
    answer: "Style Cores are determined through our advanced AI analysis that considers color palettes, silhouettes, texture combinations, and overall aesthetic coherence. The AI identifies patterns in your style choices and matches them with established style categories while accounting for personal variations."
  },
  {
    question: "Can I track my style progress over time?",
    answer: "Absolutely! Our platform maintains a style history that shows your score progression and style evolution. You can track improvements, identify successful combinations, and see how your Style Core develops over time."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards, PayPal, Apple Pay, and Google Pay. All transactions are secure and encrypted. For business accounts, we also offer invoice payment options."
  }
];

export const FAQ = () => {
  return (
    <section className="px-4 py-16">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-satoshi font-bold text-center mb-12">
          Frequently Asked Questions
        </h2>
        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="border border-border/50 rounded-lg px-6 py-2"
            >
              <AccordionTrigger className="hover:no-underline">
                <span className="text-left">{faq.question}</span>
                <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" />
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};
