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
    throw new Error('AI service is temporarily unavailable. Our team has been notified and is working on a fix. Please try again later.');
  }

  const systemPrompt = `You are an elite mobile app designer and React Native developer, comparable to the best AI coding assistants like Bolt.new and Claude. You build complete, production-ready mobile apps iteratively through conversation.

YOUR CAPABILITIES:
- Generate fully-positioned, styled UI components with exact layouts
- Create multi-screen apps with complete navigation flows
- Apply professional design principles (typography, spacing, color theory)
- Implement real interactions, state management, and business logic
- Suggest UX improvements based on industry best practices
- Iterate and refine based on user feedback

YOUR INTERACTION STYLE:
1. QUESTIONS (FREE): Ask clarifying questions to deeply understand the user's vision
   - Target audience, brand identity, key features
   - Design preferences, competing apps they admire
   - Specific functionality requirements
   - DO NOT include <app_structure> when just conversing

2. ACTIONS (1 CREDIT): When you have enough information OR user explicitly requests it, BUILD the app
   - Generate complete screen layouts with positioned components
   - Apply professional color schemes and typography
   - Include realistic placeholder content
   - ALWAYS include <app_structure> tag with full details

CRITICAL: When generating screens, create COMPLETE, PRODUCTION-READY layouts with:
- Precisely positioned components (x, y coordinates)
- Proper sizing (width, height in pixels for 375px wide canvas)
- Professional styling (colors, fonts, spacing, borders, shadows)
- Realistic content and proper hierarchy
- Functional props (navigation targets, form validation, etc.)

OUTPUT FORMAT for ACTIONS:
<app_structure>
{
  "name": "App Name",
  "appType": "social|ecommerce|productivity|fitness|finance|education|entertainment|health|travel|custom",
  "screens": [
    {
      "name": "Home",
      "type": "home",
      "background_color": "#F8F9FA",
      "components": [
        {
          "type": "header|text|button|input|image|view|card|list|icon|divider",
          "props": {
            // Component-specific props
            // For header: title, backgroundColor, textColor, showBackButton
            // For text: text, fontSize (12-32), color, fontWeight, textAlign
            // For button: title, backgroundColor, textColor, borderRadius, fontSize
            // For input: placeholder, borderColor, backgroundColor
            // For image: source (use Pexels URLs), borderRadius
            // For view: backgroundColor, borderRadius, borderColor, borderWidth
            // For icon: name (lucide icon name), color, size
          },
          "position_x": 0,
          "position_y": 0,
          "width": 375,
          "height": 60
        }
      ]
    }
  ],
  "colorScheme": {
    "primary": "#FF6B6B",
    "secondary": "#4ECDC4",
    "accent": "#45B7D1",
    "background": "#F8F9FA",
    "text": "#2D3748",
    "textSecondary": "#718096"
  },
  "features": ["Feature 1", "Feature 2"],
  "designNotes": "Professional design with modern spacing and hierarchy"
}
</app_structure>

DESIGN EXCELLENCE RULES:
1. Color: Use sophisticated palettes (blues, teals, oranges, greens, reds - NO purple/indigo unless requested)
2. Typography: Clear hierarchy with 3 sizes max (titles 20-28px, body 14-16px, captions 12-14px)
3. Spacing: Consistent 8px grid (use 16, 24, 32, 40px for margins/padding)
4. Layout: Proper visual hierarchy, breathing room, aligned elements
5. Modern: Rounded corners (12-20px), subtle shadows, clean lines
6. Content: Realistic, professional placeholder content (names, descriptions, prices)
7. Components: Position precisely - headers at top (y:0), proper margins between elements
8. Mobile-first: Design for 375px width (iPhone standard), components within safe boundaries

COMPONENT POSITIONING GUIDE (375px canvas):
- Header: x:0, y:0, width:375, height:60-70
- Full-width cards: x:20, width:335 (leaves 20px margins)
- Two-column: width:160 each, spaced 15px apart
- Buttons: Typically 120-200px wide, 45-55px tall
- Stack vertically with 15-25px spacing between components
- Bottom navigation: y:750 (assuming 812px canvas height)

INTERACTION PATTERNS:
- Ask 2-3 targeted questions before first generation
- After generating, suggest 2-3 specific improvements
- Iteratively refine based on feedback
- Explain your design decisions briefly
- Be concise but insightful

Remember: You're building REAL apps that work, not just mockups. Every component should be complete with proper styling, positioning, and functionality.`;

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
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      messages,
      system: systemPrompt,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Claude API error:', response.status, error);

    if (response.status === 401) {
      throw new Error('AI service authentication failed. The API key may be invalid or expired. Please contact support.');
    } else if (response.status === 429) {
      throw new Error('Rate limit exceeded. Please wait a moment and try again.');
    } else if (response.status >= 500) {
      throw new Error('AI service is temporarily unavailable. Please try again in a few moments.');
    } else {
      throw new Error(`API error (${response.status}): ${error.substring(0, 200)}`);
    }
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

      // Update project metadata
      await supabase
        .from('projects')
        .update({
          name: appStructure.name,
          app_type: appStructure.appType || 'custom',
          color_scheme: appStructure.colorScheme,
          updated_at: new Date().toISOString(),
        })
        .eq('id', currentProjectId);

      // Create screens and components if provided
      if (appStructure.screens && Array.isArray(appStructure.screens)) {
        for (let i = 0; i < appStructure.screens.length; i++) {
          const screenData = appStructure.screens[i];

          // Check if screen already exists
          const { data: existingScreen } = await supabase
            .from('screens')
            .select('id')
            .eq('project_id', currentProjectId)
            .eq('name', screenData.name)
            .maybeSingle();

          let screenId: string;

          if (existingScreen) {
            // Update existing screen
            await supabase
              .from('screens')
              .update({
                screen_type: screenData.type || 'custom',
                background_color: screenData.background_color || '#FFFFFF',
                order_index: i,
                is_home_screen: i === 0,
              })
              .eq('id', existingScreen.id);

            screenId = existingScreen.id;

            // Delete existing components for this screen to replace them
            await supabase
              .from('components')
              .delete()
              .eq('screen_id', screenId);
          } else {
            // Create new screen
            const { data: newScreen, error: screenError } = await supabase
              .from('screens')
              .insert({
                project_id: currentProjectId,
                name: screenData.name,
                screen_type: screenData.type || 'custom',
                background_color: screenData.background_color || '#FFFFFF',
                order_index: i,
                is_home_screen: i === 0,
              })
              .select()
              .single();

            if (screenError) {
              console.error('Error creating screen:', screenError);
              continue;
            }

            screenId = newScreen.id;
          }

          // Create components for this screen
          if (screenData.components && Array.isArray(screenData.components)) {
            for (let j = 0; j < screenData.components.length; j++) {
              const comp = screenData.components[j];

              await supabase
                .from('components')
                .insert({
                  screen_id: screenId,
                  component_type: comp.type,
                  props: comp.props || {},
                  styles: {
                    borderRadius: comp.props?.borderRadius || 0,
                    backgroundColor: comp.props?.backgroundColor,
                    borderColor: comp.props?.borderColor,
                    borderWidth: comp.props?.borderWidth || 0,
                  },
                  position_x: comp.position_x || 0,
                  position_y: comp.position_y || 0,
                  width: comp.width || 100,
                  height: comp.height || 50,
                  layer_order: j,
                });
            }
          }
        }
      }

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
          ai_model: 'claude-sonnet-4-20250514',
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
