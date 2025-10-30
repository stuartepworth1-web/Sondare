import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface ChatRequest {
  message: string;
  projectId?: string;
}

async function chatWithClaude(conversationHistory: Array<{role: string, content: string}>) {
  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');

  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY not configured');
  }

  const systemPrompt = `You are an expert mobile app designer and React developer helping to build apps iteratively, just like Bolt.new.

Your role:
- Be conversational and inquisitive
- Ask clarifying questions to understand the user's vision (these are FREE for the user)
- Suggest improvements and features
- Build the app incrementally based on the conversation
- NEVER say the project is complete unless the user explicitly says so

IMPORTANT: Only include the <app_structure> tag when you are actually performing an ACTION (creating/updating the app structure).
DO NOT include <app_structure> when just asking clarifying questions or having a conversation.

When you are ACTUALLY CREATING OR UPDATING the app (not just asking questions), respond with the JSON format wrapped in <app_structure> tags:
<app_structure>
{
  "name": "App Name",
  "appType": "social|ecommerce|productivity|fitness|finance|custom",
  "screens": ["Screen1", "Screen2"],
  "components": ["Component1", "Component2"],
  "features": ["Feature 1", "Feature 2"],
  "colorScheme": {
    "primary": "#hexcolor",
    "secondary": "#hexcolor",
    "background": "#hexcolor",
    "text": "#hexcolor"
  }
}
</app_structure>

Guidelines:
- Be friendly and engaging
- Ask questions to understand requirements better (FREE - no <app_structure> tag)
- When user provides enough info, create/update the app (COSTS 1 CREDIT - include <app_structure> tag)
- Suggest modern, professional designs (avoid purple/indigo unless requested)
- Provide 4-6 screens and 4-8 components
- Keep iterating based on user feedback
- When user is vague, ask specific questions about features, design, target audience, etc.`;

  const messages = conversationHistory.map(msg => ({
    role: msg.role as 'user' | 'assistant',
    content: msg.content
  }));

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2048,
      messages,
      system: systemPrompt,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Claude API error: ${error}`);
  }

  const data = await response.json();
  return data.content[0].text;
}

function extractAppStructure(text: string) {
  const match = text.match(/<app_structure>([\s\S]*?)<\/app_structure>/);
  if (!match) return null;

  try {
    return JSON.parse(match[1].trim());
  } catch {
    return null;
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

    const { message, projectId }: ChatRequest = await req.json();

    if (!message || message.trim().length === 0) {
      throw new Error('Message is required');
    }

    // Check credits
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('credits_remaining, credits_purchased')
      .eq('id', user.id)
      .single();

    if (profileError) throw profileError;

    const totalCredits = (profile.credits_remaining || 0) + (profile.credits_purchased || 0);

    let currentProjectId = projectId;
    let conversationHistory: Array<{role: string, content: string}> = [];

    // Get or create active project
    if (!currentProjectId) {
      // Check if user has an active session
      const { data: activeProjects } = await supabase
        .from('projects')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_active_session', true)
        .order('created_at', { ascending: false })
        .limit(1);

      if (activeProjects && activeProjects.length > 0) {
        currentProjectId = activeProjects[0].id;
      } else {
        // Create new project
        const { data: newProject, error: projectError } = await supabase
          .from('projects')
          .insert({
            user_id: user.id,
            name: 'New App Project',
            description: 'Building with AI',
            app_type: 'custom',
            status: 'draft',
            is_active_session: true,
          })
          .select()
          .single();

        if (projectError) throw projectError;
        currentProjectId = newProject.id;
      }
    }

    // Load conversation history
    const { data: messages } = await supabase
      .from('conversation_messages')
      .select('role, content')
      .eq('project_id', currentProjectId)
      .order('created_at', { ascending: true });

    if (messages) {
      conversationHistory = messages;
    }

    // Add user message
    conversationHistory.push({ role: 'user', content: message });

    // Save user message
    await supabase
      .from('conversation_messages')
      .insert({
        project_id: currentProjectId,
        role: 'user',
        content: message,
      });

    // Get AI response
    const aiResponse = await chatWithClaude(conversationHistory);

    // Save AI message
    await supabase
      .from('conversation_messages')
      .insert({
        project_id: currentProjectId,
        role: 'assistant',
        content: aiResponse,
      });

    // Extract and update app structure if present
    const appStructure = extractAppStructure(aiResponse);
    const isAction = !!appStructure;
    
    if (appStructure) {
      // Check credits before performing action
      if (totalCredits <= 0) {
        return new Response(
          JSON.stringify({ error: 'No credits remaining to perform this action' }),
          {
            status: 402,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      await supabase
        .from('projects')
        .update({
          name: appStructure.name,
          app_type: appStructure.appType || 'custom',
          color_scheme: appStructure.colorScheme,
          updated_at: new Date().toISOString(),
        })
        .eq('id', currentProjectId);

      // Save generation record
      await supabase
        .from('generations')
        .insert({
          project_id: currentProjectId,
          prompt: message,
          generated_code: {},
          generated_schema: {
            screens: appStructure.screens || [],
            components: appStructure.components || [],
            features: appStructure.features || [],
          },
          ai_model: 'claude-3-5-sonnet-20241022',
          processing_time: 0,
          status: 'completed',
        });

      // Deduct credit only for actions (when app structure is updated)
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
    }

    // Remove app_structure tags from response
    const cleanResponse = aiResponse.replace(/<app_structure>[\s\S]*?<\/app_structure>/g, '').trim();

    return new Response(
      JSON.stringify({
        message: cleanResponse,
        projectId: currentProjectId,
        hasStructureUpdate: !!appStructure,
        wasAction: isAction,
        creditUsed: isAction,
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
