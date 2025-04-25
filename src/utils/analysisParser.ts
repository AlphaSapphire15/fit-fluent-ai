
export interface AnalysisResult {
  score: number;
  styleCore: string;
  strengths: string[];
  suggestion: string;
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
  const styleText = styleTextMatch ? styleTextMatch[1].trim() : "Modern – Luxe Minimalist";

  // Extract strengths
  const strengthsBlockMatch = analysis.match(/what['']s working:?(.*?)(?=tip to elevate|suggestion|$)/is);
  let strengths: string[] = [];
  if (strengthsBlockMatch && strengthsBlockMatch[1]) {
    strengths = strengthsBlockMatch[1]
      .split(/\n/)
      .map(line => line.replace(/^[-•*\s\d\.]+/, '').trim())
      .filter(line => line.length > 0);
  } else {
    strengths = analysis
      .split(/\n/)
      .filter(line => /^[-•*\s\d\.]+/.test(line))
      .map(line => line.replace(/^[-•*\s\d\.]+/, '').trim())
      .filter(line => line.length > 0 && !line.toLowerCase().includes('tip') && !line.toLowerCase().includes('elevate'));
  }

  // Extract suggestion/tip
  const suggestionMatch = 
    analysis.match(/tip to elevate:?\s*(.*?)(?=\n\n|$)/is) || 
    analysis.match(/suggestion:?\s*(.*?)(?=\n\n|$)/is);
  
  let suggestion = "Try adding a statement accessory to elevate your look.";
  if (suggestionMatch && suggestionMatch[1]) {
    suggestion = suggestionMatch[1].trim();
  } else {
    const tipSentenceMatch = analysis.match(/tip|elevate.*?([\w\s,\.'":\-]+)(?=\n|$)/i);
    if (tipSentenceMatch && tipSentenceMatch[1]) {
      suggestion = tipSentenceMatch[1].trim();
    }
  }

  return {
    score,
    styleCore: styleText,
    strengths: strengths.slice(0, 3),
    suggestion
  };
}
