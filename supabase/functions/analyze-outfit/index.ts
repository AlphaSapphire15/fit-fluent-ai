
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

    const { imageUrl } = await req.json();
    if (!imageUrl) {
      throw new Error('No image URL provided');
    }

    logStep('Processing image', { urlLength: imageUrl.length });

    // The critical fix: OpenAI expects an object with a "url" property, not just the URL string
    const imageData = {
      url: imageUrl
    };

    logStep('Sending request to OpenAI');

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
            content: `You are a fashion expert AI that analyzes outfit photos. Provide concise, constructive feedback including:
              1. A style score out of 100
              2. A core style description (2-3 words)
              3. 2-3 key strengths
              4. 2-3 potential improvements
              5. One specific styling suggestion
              Keep the feedback constructive and encouraging.`
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
