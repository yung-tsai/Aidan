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
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const { type } = await req.json();
    
    let prompt = '';
    
    if (type === 'monitor') {
      prompt = `A vintage 1980s beige/cream colored CRT computer monitor bezel frame, viewed straight from the front. 
The plastic should be slightly yellowed with age, with rounded corners typical of 80s design.
The screen area in the center should be COMPLETELY BLACK and rectangular (16:10 aspect ratio).
Include subtle ventilation slots on the sides of the bezel.
A small green power LED indicator light glowing on the bottom right.
A small embossed badge/label that says "AIDEN" on the bottom left.
The monitor should have realistic depth, shadows, and the characteristic bulky CRT look.
Photorealistic product photography style, soft studio lighting, isolated on a transparent or dark background.
Ultra high resolution, 16:9 aspect ratio image.`;
    } else if (type === 'keyboard') {
      prompt = `A vintage 1980s beige/cream computer keyboard, viewed from slightly above at an angle.
Only showing the top portion of the keyboard (function keys row and top number row).
Mechanical keys with that classic chunky 80s aesthetic.
The plastic should match a vintage CRT monitor - slightly yellowed cream color.
Include a small badge that says "AIDEN-KB" in the top right corner.
Photorealistic product photography style, soft studio lighting.
Ultra high resolution, wide panoramic aspect ratio.`;
    } else {
      throw new Error('Invalid type. Use "monitor" or "keyboard"');
    }

    console.log(`Generating ${type} image...`);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image-preview',
        messages: [
          { role: 'user', content: prompt }
        ],
        modalities: ['image', 'text'],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Image generation response received');

    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    
    if (!imageUrl) {
      console.error('No image in response:', JSON.stringify(data));
      throw new Error('No image generated');
    }

    return new Response(JSON.stringify({ imageUrl }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generating image:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
