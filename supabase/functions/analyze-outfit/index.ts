
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

    // Adjust the system prompt based on the tone selected
    let systemPrompt = `You are a fashion expert AI that analyzes outfit photos. Provide concise, constructive feedback including:
      1. A style score out of 100
      2. A core style description using one of these exact style labels: "Casual – Slouchy Clean", "Earthy – Nomad Luxe", "Modern – Luxe Minimalist", "Streetwear – Urban Layered", or "Grunge – Soft Editorial"
      3. 2-3 key strengths
      4. One specific styling suggestion to elevate the outfit
      Keep your feedback constructive and encouraging.`;

    // Adjust the tone if specified
    if (tone === 'chill') {
      systemPrompt = `You are a laid-back, friendly fashion expert that analyzes outfit photos. With a casual, conversational tone, provide feedback including:
        1. A style score out of 100
        2. A core style description using one of these exact style labels: "Casual – Slouchy Clean", "Earthy – Nomad Luxe", "Modern – Luxe Minimalist", "Streetwear – Urban Layered", or "Grunge – Soft Editorial"
        3. 2-3 key strengths, phrased in a friendly way
        4. One chill suggestion to elevate the look
        Keep it casual but helpful, like advice from a stylish friend.`;
    } else if (tone === 'creative') {
      systemPrompt = `You are an artistic, imaginative fashion expert analyzing outfit photos. With colorful language and metaphors, provide vibrant feedback including:
        1. A style score out of 100
        2. A core style description using one of these exact style labels: "Casual – Slouchy Clean", "Earthy – Nomad Luxe", "Modern – Luxe Minimalist", "Streetwear – Urban Layered", or "Grunge – Soft Editorial"
        3. 2-3 key strengths, described with creative flair
        4. One inspired, unique suggestion to elevate the outfit
        Make your descriptions evocative and memorable, like a fashion editorial.`;
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
              { type: 'text', text: 'Please analyze this outfit:' },
              { type: 'image_url', image_url: imageData }
            ]
          }
        ]
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
