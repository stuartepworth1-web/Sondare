import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface GenerateRequest {
  prompt: string;
}

async function generateWithClaude(prompt: string) {
  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');

  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY not configured');
  }

  const systemPrompt = `You are an expert mobile app designer and React developer. Generate a complete mobile app structure based on the user's prompt.

CRITICAL: You MUST return ONLY valid JSON. No markdown, no code blocks, no backticks, no explanation text. Just pure JSON.

Return a JSON object with this exact structure:
{
  "name": "App Name (max 4 words)",
  "appType": "social|ecommerce|productivity|fitness|finance|other",
  "screens": ["ScreenName1", "ScreenName2"],
  "components": ["ComponentName1", "ComponentName2"],
  "features": ["Feature description 1", "Feature description 2"],
  "colorScheme": {
    "primary": "#hexcolor",
    "secondary": "#hexcolor",
    "background": "#hexcolor",
    "text": "#hexcolor"
  }
}

Guidelines:
- Generate 4-6 screens appropriate for the app type
- Generate 4-8 reusable components
- List 4-6 key features
- Use modern, professional color schemes (avoid purple/indigo unless requested)
- IMPORTANT: Do not include code in the response, only the structure
- Return ONLY the JSON object, no other text`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: `Generate a mobile app structure for: ${prompt}`,
        },
      ],
      system: systemPrompt,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Claude API error: ${error}`);
  }

  const data = await response.json();
  const content = data.content[0].text;

  let jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Failed to parse Claude response - no JSON found');
  }

  let jsonStr = jsonMatch[0];
  
  try {
    return JSON.parse(jsonStr);
  } catch (parseError) {
    console.error('JSON parse error:', parseError);
    console.error('Attempted to parse:', jsonStr.substring(0, 500));
    throw new Error('Failed to parse Claude response as valid JSON');
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { prompt }: GenerateRequest = await req.json();

    if (!prompt || prompt.trim().length === 0) {
      throw new Error('Prompt is required');
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('credits_remaining, credits_purchased')
      .eq('id', user.id)
      .single();

    if (profileError) throw profileError;

    const totalCredits = (profile.credits_remaining || 0) + (profile.credits_purchased || 0);

    if (totalCredits <= 0) {
      return new Response(
        JSON.stringify({ error: 'No credits remaining' }),
        {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const startTime = Date.now();
    const appStructure = await generateWithClaude(prompt);
    const processingTime = Math.round((Date.now() - startTime) / 1000);

    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert({
        user_id: user.id,
        name: appStructure.name,
        description: prompt,
        app_type: appStructure.appType,
        status: 'generating',
        color_scheme: appStructure.colorScheme,
      })
      .select()
      .single();

    if (projectError) throw projectError;

    const { error: generationError } = await supabase
      .from('generations')
      .insert({
        project_id: project.id,
        prompt,
        generated_code: {},
        generated_schema: {
          screens: appStructure.screens,
          components: appStructure.components,
          features: appStructure.features,
        },
        ai_model: 'claude-3-5-sonnet-20241022',
        processing_time: processingTime,
        status: 'completed',
      });

    if (generationError) throw generationError;

    await supabase
      .from('projects')
      .update({ status: 'completed' })
      .eq('id', project.id);

    if (profile.credits_purchased > 0) {
      await supabase
        .from('profiles')
        .update({ credits_purchased: profile.credits_purchased - 1 })
        .eq('id', user.id);
    } else {
      await supabase
        .from('profiles')
        .update({ credits_remaining: profile.credits_remaining - 1 })
        .eq('id', user.id);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `I've created your ${appStructure.appType} app! It includes ${appStructure.screens.length} screens and ${appStructure.components.length} components. Check the Projects tab to view it.`,
        project: {
          id: project.id,
          name: appStructure.name,
          appType: appStructure.appType,
        },
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
