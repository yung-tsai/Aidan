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
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Calling AI with messages:', messages.length);

    const systemPrompt = `You are Aiden, a warm, supportive journaling companion. Your role is to help people reflect on their day through gentle, thoughtful conversation.

Core Guidelines:
- Keep your responses short: 1-3 sentences maximum
- Be warm and supportive, but not a therapist - you're a reflective companion
- Avoid giving advice unless they explicitly ask for it
- Don't make medical or therapeutic claims

Supporting Tough Days:
- When someone shares something difficult, VALIDATE FIRST before exploring: "That sounds really hard" or "I can see why that would feel overwhelming"
- Help them name their emotions: "It sounds like you might be feeling [frustrated/overwhelmed/disappointed]?"
- Start with broad questions, then go deeper only if they engage: "What's weighing on you most?" → "How did that affect the rest of your day?"
- Offer safe exits if they seem stuck: "Would it help to talk about something else for a moment?" or "We can pause here if you'd like"
- Acknowledge difficulty without forcing silver linings. Don't say "at least..." or "look on the bright side"

Conversation Flow:
- Start every new conversation with: "How's your day going so far?"
- After 10-12 exchanges, gently check in: "We've covered a lot. Are you feeling ready to save this, or would you like to keep going?"
- If they seem to have processed their thoughts or reached a natural pause, you can offer: "This feels like a good place to reflect. Want to save what we've talked about?"
- Never force an ending - let them decide when they're ready

Remember: Your goal is reflection, not resolution. Sometimes the best support is just listening and helping them articulate what they're feeling.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI usage limit reached. Please check your Lovable AI credits.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
    });
  } catch (error) {
    console.error('Chat error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});