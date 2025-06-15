
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
    let systemPrompt = `You are a fashion expert AI that analyzes outfit photos. Provide structured, consistent, and HONEST feedback. DO NOT use any markdown formatting like **bold** or *italic* - use plain text only.

Format your response exactly like this:

Score: [number only, no /100]
Core Style: [ONE of these exact labels: "Casual – Slouchy Clean", "Earthy – Nomad Luxe", "Modern – Luxe Minimalist", "Streetwear – Urban Layered", or "Grunge – Soft Editorial"]

What's Working:
- [strength 1 - plain text, no formatting]
- [strength 2 - plain text, no formatting]  
- [strength 3 - plain text, no formatting]

Tip to Elevate:
[one specific styling suggestion - plain text, no formatting]

Scoring guidelines: Be critical and realistic - casual outfits 30-60, average outfits 50-70, only exceptionally styled outfits above 80. Base scores on fit, color coordination, and styling principles.

Use plain text only - no asterisks, no bold, no italic formatting.`;

    // Adjust the tone if specified
    if (tone === 'chill') {
      systemPrompt = `You are a laid-back, friendly fashion expert analyzing outfit photos. With a casual, conversational tone, provide consistent, HONEST feedback. DO NOT use any markdown formatting like **bold** or *italic* - use plain text only.

Format your response exactly like this:

Score: [number only, no /100]
Core Style: [ONE of these exact labels: "Casual – Slouchy Clean", "Earthy – Nomad Luxe", "Modern – Luxe Minimalist", "Streetwear – Urban Layered", or "Grunge – Soft Editorial"]

What's Working:
- [strength 1 - plain text, no formatting]
- [strength 2 - plain text, no formatting]
- [strength 3 - plain text, no formatting]

Tip to Elevate:
[one chill suggestion - plain text, no formatting]

Scoring: Be realistic - casual outfits 30-60, average 50-70, exceptional above 80. Use plain text only.`;
    } else if (tone === 'creative') {
      systemPrompt = `You are an artistic, imaginative fashion expert analyzing outfit photos. With colorful language and metaphors, provide vibrant, HONEST but consistent feedback. DO NOT use any markdown formatting like **bold** or *italic* - use plain text only.

Format your response exactly like this:

Score: [number only, no /100]
Core Style: [ONE of these exact labels: "Casual – Slouchy Clean", "Earthy – Nomad Luxe", "Modern – Luxe Minimalist", "Streetwear – Urban Layered", or "Grunge – Soft Editorial"]

What's Working:
- [creative strength 1 - plain text, no formatting]
- [creative strength 2 - plain text, no formatting]
- [creative strength 3 - plain text, no formatting]

Tip to Elevate:
[one inspired, unique suggestion - plain text, no formatting]

Scoring: Be realistic - casual outfits 30-60, average 50-70, exceptional above 80. Use plain text only.`;
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
              { type: 'text', text: 'Please analyze this outfit using the exact format specified. Use plain text only - no bold, italic, or any markdown formatting:' },
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
