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

const appTemplates = {
  social: {
    screens: ['Login', 'Feed', 'Profile', 'Messages', 'Settings'],
    components: ['PostCard', 'UserAvatar', 'CommentList', 'LikeButton'],
    features: ['User authentication', 'Post creation', 'Follow system', 'Real-time messaging'],
  },
  ecommerce: {
    screens: ['Home', 'ProductList', 'ProductDetail', 'Cart', 'Checkout'],
    components: ['ProductCard', 'CartItem', 'PaymentForm', 'ReviewList'],
    features: ['Product catalog', 'Shopping cart', 'Checkout flow', 'Order history'],
  },
  productivity: {
    screens: ['Dashboard', 'TaskList', 'Calendar', 'Analytics', 'Settings'],
    components: ['TaskCard', 'DatePicker', 'ProgressBar', 'ChartWidget'],
    features: ['Task management', 'Calendar integration', 'Analytics dashboard', 'Team collaboration'],
  },
  fitness: {
    screens: ['Home', 'WorkoutTracker', 'Progress', 'Plans', 'Settings'],
    components: ['ExerciseCard', 'ProgressChart', 'WorkoutTimer', 'GoalWidget'],
    features: ['Workout tracking', 'Progress charts', 'Workout plans', 'Goal setting'],
  },
  finance: {
    screens: ['Dashboard', 'Accounts', 'Transactions', 'Budget', 'Reports'],
    components: ['AccountCard', 'TransactionList', 'BudgetWidget', 'PieChart'],
    features: ['Account management', 'Transaction tracking', 'Budget planning', 'Financial reports'],
  },
};

function detectAppType(prompt: string): keyof typeof appTemplates {
  const lowerPrompt = prompt.toLowerCase();
  
  if (lowerPrompt.includes('social') || lowerPrompt.includes('feed') || lowerPrompt.includes('post')) {
    return 'social';
  } else if (lowerPrompt.includes('ecommerce') || lowerPrompt.includes('shop') || lowerPrompt.includes('store')) {
    return 'ecommerce';
  } else if (lowerPrompt.includes('fitness') || lowerPrompt.includes('workout') || lowerPrompt.includes('exercise')) {
    return 'fitness';
  } else if (lowerPrompt.includes('finance') || lowerPrompt.includes('budget') || lowerPrompt.includes('money')) {
    return 'finance';
  } else if (lowerPrompt.includes('task') || lowerPrompt.includes('todo') || lowerPrompt.includes('productivity')) {
    return 'productivity';
  }
  
  return 'productivity';
}

function generateAppStructure(appType: keyof typeof appTemplates, prompt: string) {
  const template = appTemplates[appType];
  
  return {
    name: prompt.split(' ').slice(0, 4).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
    appType,
    screens: template.screens,
    components: template.components,
    features: template.features,
    colorScheme: {
      primary: '#FF9500',
      background: '#000000',
    },
    code: {
      'App.tsx': `import { useState } from 'react';\n\nfunction App() {\n  return (\n    <div className="min-h-screen bg-black text-white">\n      <h1>Your ${appType} App</h1>\n    </div>\n  );\n}\n\nexport default App;`,
    },
  };
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

    const appType = detectAppType(prompt);
    const appStructure = generateAppStructure(appType, prompt);

    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert({
        user_id: user.id,
        name: appStructure.name,
        description: prompt,
        app_type: appType,
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
        generated_code: appStructure.code,
        generated_schema: {
          screens: appStructure.screens,
          components: appStructure.components,
          features: appStructure.features,
        },
        ai_model: 'template-based',
        processing_time: 2,
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
        message: `I've created your ${appType} app! It includes ${appStructure.screens.length} screens and ${appStructure.components.length} components. Check the Projects tab to view it.`,
        project: {
          id: project.id,
          name: appStructure.name,
          appType,
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