import { createClient } from 'npm:@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

// Credit costs for different generation types
const CREDIT_COSTS = {
  component: 1,
  page: 5,
  camera_to_code: 10,
  refactor: 3,
  review: 2,
  design_system: 15,
};

interface GenerateRequest {
  prompt: string;
  generationType: keyof typeof CREDIT_COSTS;
  projectId?: string;
}

Deno.serve(async (req: Request) => {
  try {
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: corsHeaders,
      });
    }

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get user from JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Parse request body
    const { prompt, generationType, projectId }: GenerateRequest = await req.json();

    if (!prompt || !generationType) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get credit cost
    const creditCost = CREDIT_COSTS[generationType];
    if (!creditCost) {
      return new Response(
        JSON.stringify({ error: 'Invalid generation type' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Check user credits
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('credits, subscription_tier')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch user profile' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (profile.credits < creditCost) {
      return new Response(
        JSON.stringify({
          error: 'Insufficient credits',
          required: creditCost,
          available: profile.credits,
        }),
        {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Call Claude API
    const claudeApiKey = Deno.env.get('CLAUDE_API_KEY');
    if (!claudeApiKey) {
      throw new Error('Claude API key not configured');
    }

    const systemPrompt = `You are an expert React Native developer. Generate clean, production-ready code based on the user's request. Follow these guidelines:
- Use TypeScript
- Use functional components with hooks
- Include proper imports
- Use StyleSheet for styling
- Follow React Native best practices
- Keep code modular and well-structured
- Add helpful comments for complex logic

Generation type: ${generationType}

Provide ONLY the code, no explanations or markdown formatting.`;

    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': claudeApiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        messages: [
          {
            role: 'user',
            content: `${systemPrompt}\n\nUser request: ${prompt}`,
          },
        ],
      }),
    });

    if (!claudeResponse.ok) {
      const errorText = await claudeResponse.text();
      throw new Error(`Claude API error: ${errorText}`);
    }

    const claudeData = await claudeResponse.json();
    const generatedCode = claudeData.content[0].text;

    // Deduct credits and create transaction
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({
        credits: profile.credits - creditCost,
        total_credits_spent: supabase.rpc('increment', { x: creditCost }),
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Failed to update credits:', updateError);
    }

    // Record transaction
    await supabase.from('credit_transactions').insert({
      user_id: user.id,
      amount: -creditCost,
      transaction_type: 'generation',
      description: `${generationType} generation`,
      metadata: { prompt: prompt.substring(0, 100) },
    });

    // Save generation record
    const { data: generation } = await supabase
      .from('ai_generations')
      .insert({
        user_id: user.id,
        project_id: projectId || null,
        generation_type: generationType,
        prompt,
        generated_code: generatedCode,
        credits_used: creditCost,
        success: true,
        metadata: {
          model: 'claude-3-5-sonnet-20241022',
          tokens: claudeData.usage,
        },
      })
      .select()
      .single();

    return new Response(
      JSON.stringify({
        code: generatedCode,
        creditsUsed: creditCost,
        creditsRemaining: profile.credits - creditCost,
        generationId: generation?.id,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});