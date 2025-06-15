
export interface AnalysisResult {
  score: number;
  styleCore: string;
  strengths: string[];
  suggestion: string;
}

// Helper function to clean markdown formatting
function cleanMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold markdown
    .replace(/\*(.*?)\*/g, '$1') // Remove italic markdown
    .replace(/#+\s*/g, '') // Remove headers
    .replace(/^[-•*\s\d\.]+/, '') // Remove bullet points
    .trim();
}

export function parseAnalysisResponse(analysis: string): AnalysisResult {
  // Extract score
  const scoreMatch = 
    analysis.match(/(\d+)(?=\/100)/i) || 
    analysis.match(/score:?\s*(\d+)/i) ||
    analysis.match(/style score:?\s*(\d+)/i);
  const score = scoreMatch ? parseInt(scoreMatch[1]) : 70;

  // Extract style core
  const styleTextMatch = 
    analysis.match(/core style.*?:\s*(.*?)(?=\n|$)/i) ||
    analysis.match(/style description:?\s*(.*?)(?=\n|$)/i) ||
    analysis.match(/.*?style:?\s*(.*?)(?=\n|$)/i);
  const styleText = styleTextMatch ? cleanMarkdown(styleTextMatch[1]) : "Modern – Luxe Minimalist";

  // Extract strengths with better parsing
  const strengthsBlockMatch = analysis.match(/what['']s working:?(.*?)(?=tip to elevate|suggestion|$)/is);
  let strengths: string[] = [];
  
  if (strengthsBlockMatch && strengthsBlockMatch[1]) {
    // Split by common separators and clean each line
    strengths = strengthsBlockMatch[1]
      .split(/\n/)
      .map(line => cleanMarkdown(line))
      .filter(line => line.length > 0 && !line.toLowerCase().includes('tip') && !line.toLowerCase().includes('elevate'))
      .slice(0, 3); // Limit to 3 items
  }
  
  // Fallback if no strengths found
  if (strengths.length === 0) {
    strengths = analysis
      .split(/\n/)
      .filter(line => /^[-•*\s\d\.]+/.test(line))
      .map(line => cleanMarkdown(line))
      .filter(line => line.length > 0 && !line.toLowerCase().includes('tip') && !line.toLowerCase().includes('elevate'))
      .slice(0, 3);
  }

  // Extract suggestion/tip
  const suggestionMatch = 
    analysis.match(/tip to elevate:?\s*(.*?)(?=\n\n|$)/is) || 
    analysis.match(/suggestion:?\s*(.*?)(?=\n\n|$)/is);
  
  let suggestion = "Try adding a statement accessory to elevate your look.";
  if (suggestionMatch && suggestionMatch[1]) {
    suggestion = cleanMarkdown(suggestionMatch[1]);
  } else {
    const tipSentenceMatch = analysis.match(/tip|elevate.*?([\w\s,\.'":\-]+)(?=\n|$)/i);
    if (tipSentenceMatch && tipSentenceMatch[1]) {
      suggestion = cleanMarkdown(tipSentenceMatch[1]);
    }
  }

  return {
    score,
    styleCore: styleText,
    strengths: strengths.slice(0, 3), // Ensure exactly 3 or fewer
    suggestion
  };
}
