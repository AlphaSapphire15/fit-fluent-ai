
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    console.log('Analyzing outfit from image:', imageUrl);

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
              { type: 'image_url', image_url: imageUrl }
            ]
          }
        ]
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API error:', error);
      throw new Error('Failed to analyze image');
    }

    const data = await response.json();
    const analysis = data.choices[0].message.content;

    console.log('Analysis completed:', analysis);

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in analyze-outfit function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
