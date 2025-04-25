
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper logging function for enhanced debugging
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[ANALYZE-OUTFIT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const { imageUrl, tone = 'straightforward' } = await req.json();
    if (!imageUrl) {
      throw new Error('No image URL provided');
    }

    logStep('Processing image', { urlLength: imageUrl.length });

    // The critical fix: OpenAI expects an object with a "url" property, not just the URL string
    const imageData = {
      url: imageUrl
    };

    logStep('Sending request to OpenAI');

    // Create a more structured prompt that will produce consistent scores and more honest feedback
    let systemPrompt = `You are a fashion expert AI that analyzes outfit photos. Provide structured, consistent, and HONEST feedback including:
      1. A style score out of 100. Be critical and realistic - casual outfits should get lower scores (30-60), average outfits around 50-70, and only exceptionally well-styled outfits should get scores above 80. Be consistent in your scoring - similar outfit styles should receive similar scores. Focus on objective aspects like fit, color coordination, and overall styling.
      2. A core style description using ONE of these exact labels (do not modify or create new labels): "Casual – Slouchy Clean", "Earthy – Nomad Luxe", "Modern – Luxe Minimalist", "Streetwear – Urban Layered", or "Grunge – Soft Editorial"
      3. 2-3 key strengths in bullet point format, labeled as "What's Working"
      4. One specific styling suggestion to elevate the outfit, clearly labeled as "Tip to Elevate"

      Format your response in a clean, structured way that's easy to parse. Always include all four sections (score, style core, strengths, and tip). Your analysis should be objective and based on fashion principles.
      
      Always format scores consistently as a number without any additional characters (e.g., "85" not "85/100").`;

    // Adjust the tone if specified
    if (tone === 'chill') {
      systemPrompt = `You are a laid-back, friendly fashion expert analyzing outfit photos. With a casual, conversational tone, provide consistent, HONEST feedback including:
        1. A style score out of 100. Be critical and realistic - casual outfits should get lower scores (30-60), average outfits around 50-70, and only exceptionally well-styled outfits should get scores above 80. Base your score on objective aspects like fit, color coordination, and styling.
        2. A core style description using ONE of these exact labels (do not modify them): "Casual – Slouchy Clean", "Earthy – Nomad Luxe", "Modern – Luxe Minimalist", "Streetwear – Urban Layered", or "Grunge – Soft Editorial"
        3. 2-3 key strengths, labeled as "What's Working"
        4. One chill suggestion to elevate the look, labeled as "Tip to Elevate"
        
        Format your response in a clean, structured way that's easy to parse. Always include all four sections. Always format scores consistently as a number without any additional characters (e.g., "85" not "85/100").`;
    } else if (tone === 'creative') {
      systemPrompt = `You are an artistic, imaginative fashion expert analyzing outfit photos. With colorful language and metaphors, provide vibrant, HONEST but consistent feedback including:
        1. A style score out of 100. Be critical and realistic - casual outfits should get lower scores (30-60), average outfits around 50-70, and only exceptionally well-styled outfits should get scores above 80. Base your score on objective aspects like fit, color coordination, and overall styling.
        2. A core style description using ONE of these exact labels (do not modify or create new labels): "Casual – Slouchy Clean", "Earthy – Nomad Luxe", "Modern – Luxe Minimalist", "Streetwear – Urban Layered", or "Grunge – Soft Editorial"
        3. 2-3 key strengths with creative flair, labeled as "What's Working"
        4. One inspired, unique suggestion to elevate the outfit, clearly labeled as "Tip to Elevate"
        
        Format your response in a clean, structured way that's easy to parse. Always include all four sections. Always format scores consistently as a number without any additional characters (e.g., "85" not "85/100").`;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Please analyze this outfit and provide structured feedback with all four sections (score, style core, strengths, and tip):' },
              { type: 'image_url', image_url: imageData }
            ]
          }
        ],
        temperature: 0.4, // Lower temperature for more consistent responses
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      logStep('OpenAI API error', error);
      throw new Error(`OpenAI API error: ${JSON.stringify(error)}`);
    }

    const data = await response.json();
    const analysis = data.choices[0].message.content;

    logStep('Analysis completed successfully');

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    logStep('Error in analyze-outfit function', { message: error.message });
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
