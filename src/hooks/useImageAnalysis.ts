
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AnalysisResult {
  score: number;
  styleCore: string;
  strengths: string[];
  suggestion: string;
}

/**
 * Converts an image to a properly formatted format for OpenAI
 */
async function prepareImageForAnalysis(inputBase64OrFile: string | File): Promise<string> {
  // If it's already a string (base64)
  if (typeof inputBase64OrFile === "string") {
    // Check if it's already in the right format
    if (/^data:image\/(jpeg|jpg|png|gif|webp);base64,/.test(inputBase64OrFile)) {
      return inputBase64OrFile;
    } 
    
    // It's a base64 string but in an unsupported format, convert to PNG
    console.log("Converting non-standard base64 image to PNG");
    const img = new Image();
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = inputBase64OrFile;
    });
    
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error("Canvas context error");
    
    ctx.drawImage(img, 0, 0);
    return canvas.toDataURL('image/png');
  } 
  
  // If it's a file, convert to base64
  else {
    console.log("Converting File to base64");
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => {
        const base64 = e.target?.result as string;
        
        // For non-PNG/JPEG formats, convert to PNG
        if (!base64.match(/^data:image\/(jpeg|jpg|png|gif|webp);base64,/)) {
          console.log("Converting non-standard file format to PNG");
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            const ctx = canvas.getContext('2d');
            if (!ctx) return reject(new Error("Canvas context error"));
            
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL('image/png'));
          };
          img.onerror = reject;
          img.src = base64;
        } else {
          resolve(base64);
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(inputBase64OrFile);
    });
  }
}

export const useImageAnalysis = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const { toast } = useToast();

  const findMatchingStyleCore = async (styleText: string): Promise<{ base: string; flavor: string; full_label: string; description: string | null } | null> => {
    try {
      // Fetch all style cores from Supabase
      const { data: styleCores, error } = await supabase
        .from('style_cores')
        .select('*');

      if (error) {
        console.error('Error fetching style cores:', error);
        return null;
      }

      if (!styleCores || styleCores.length === 0) {
        console.log('No style cores found in database');
        return null;
      }

      console.log('Retrieved style cores:', styleCores);
      
      // Find the best match by checking if the style core text appears in the AI-generated style core
      const matchedCore = styleCores.find(core => 
        styleText.toLowerCase().includes(core.base.toLowerCase()) ||
        styleText.toLowerCase().includes(core.flavor.toLowerCase()) ||
        (core.full_label && styleText.toLowerCase().includes(core.full_label.toLowerCase()))
      );

      if (matchedCore) {
        console.log('Found matching style core:', matchedCore);
        return matchedCore;
      }
      
      // If no exact match found, return first style core as default (fallback)
      console.log('No matching style core found, using default:', styleCores[0]);
      return styleCores[0];
    } catch (err) {
      console.error('Error in findMatchingStyleCore:', err);
      return null;
    }
  };

  const analyzeImage = async (inputBase64OrFile: string | File, tone: string = 'straightforward') => {
    setIsAnalyzing(true);

    try {
      console.log("Calling analyze-outfit function with image data and tone:", tone);
      
      const imageUrl = await prepareImageForAnalysis(inputBase64OrFile);
      
      const { data, error } = await supabase.functions.invoke('analyze-outfit', {
        body: { imageUrl, tone }
      });

      if (error) {
        console.error('Function invocation error:', error);
        throw error;
      }

      console.log("Received analysis:", data.analysis);
      const analysis = data.analysis;
      
      // Extract the score using improved regex pattern
      // Look for any number that appears before "/100" or just a standalone number after "score:"
      const scoreMatch = 
        analysis.match(/(\d+)(?=\/100)/i) || 
        analysis.match(/score:?\s*(\d+)/i) ||
        analysis.match(/style score:?\s*(\d+)/i);
        
      const score = scoreMatch ? parseInt(scoreMatch[1]) : 70; // Default to 70 if no score found
      
      // Extract the style core
      const styleTextMatch = 
        analysis.match(/core style.*?:\s*(.*?)(?=\n|$)/i) ||
        analysis.match(/style description:?\s*(.*?)(?=\n|$)/i) ||
        analysis.match(/.*?style:?\s*(.*?)(?=\n|$)/i);
        
      const styleText = styleTextMatch ? styleTextMatch[1].trim() : "Modern – Luxe Minimalist";
      
      // Find matching style core from database
      const matchedStyle = await findMatchingStyleCore(styleText);
      
      // Get formatted style core text using the matched database entry if available
      const formattedStyleCore = matchedStyle ? matchedStyle.full_label : styleText;
      
      // Extract strengths - look for text between "What's Working" and the next section
      const strengthsBlockMatch = analysis.match(/what['']s working:?(.*?)(?=tip to elevate|suggestion|$)/is);
      let strengths: string[] = [];
      
      if (strengthsBlockMatch && strengthsBlockMatch[1]) {
        strengths = strengthsBlockMatch[1]
          .split(/\n/)
          .map(line => line.replace(/^[-•*\s\d\.]+/, '').trim())
          .filter(line => line.length > 0);
      } else {
        // Fallback: look for any bullet points or numbered lists
        strengths = analysis
          .split(/\n/)
          .filter(line => /^[-•*\s\d\.]+/.test(line))
          .map(line => line.replace(/^[-•*\s\d\.]+/, '').trim())
          .filter(line => line.length > 0 && !line.toLowerCase().includes('tip') && !line.toLowerCase().includes('elevate'));
      }
      
      // Extract the suggestion/tip
      const suggestionMatch = 
        analysis.match(/tip to elevate:?\s*(.*?)(?=\n\n|$)/is) || 
        analysis.match(/suggestion:?\s*(.*?)(?=\n\n|$)/is);
      
      // Provide a default suggestion if none found, to ensure Tips to Elevate always appears
      let suggestion = "Try adding a statement accessory to elevate your look.";
      
      if (suggestionMatch && suggestionMatch[1]) {
        suggestion = suggestionMatch[1].trim();
      } else {
        // Deeper search - look for any sentence after the phrase "tip" or "elevate"
        const tipSentenceMatch = analysis.match(/tip|elevate.*?([\w\s,\.'":\-]+)(?=\n|$)/i);
        if (tipSentenceMatch && tipSentenceMatch[1]) {
          suggestion = tipSentenceMatch[1].trim();
        }
      }

      const result = {
        score,
        styleCore: formattedStyleCore,
        strengths: strengths.slice(0, 3), // Limit to at most 3 strengths
        suggestion
      };

      console.log("Processed analysis result:", result);
      setAnalysisResult(result);
    } catch (err) {
      console.error('Analysis error:', err);
      toast({
        variant: "destructive",
        title: "Analysis failed",
        description: "Please try again with a different image.",
      });
      throw err;
    } finally {
      setIsAnalyzing(false);
    }
  };

  return {
    isAnalyzing,
    analysisResult,
    analyzeImage,
    setAnalysisResult
  };
};
