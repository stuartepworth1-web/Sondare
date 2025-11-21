import { supabase } from './supabase';

export const CREDIT_COSTS = {
  component: 1,
  page: 5,
  camera_to_code: 10,
  refactor: 3,
  review: 2,
  design_system: 15,
} as const;

export type GenerationType = keyof typeof CREDIT_COSTS;

export interface UserProfile {
  id: string;
  credits: number;
  total_credits_earned: number;
  total_credits_spent: number;
  subscription_tier: 'free' | 'starter' | 'pro' | 'entrepreneur';
  subscription_status: 'active' | 'canceled' | 'expired' | 'trialing';
  subscription_period_end: string | null;
  referral_code: string;
  brand_colors: string[];
  brand_fonts: Record<string, string>;
  onboarding_completed?: boolean;
  onboarding_completed_at?: string | null;
}

export async function getUserProfile(): Promise<UserProfile | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }

  return data;
}

export async function getCreditsRemaining(): Promise<number> {
  const profile = await getUserProfile();
  return profile?.credits ?? 0;
}

export async function generateCode(
  prompt: string,
  generationType: GenerationType,
  projectId?: string
): Promise<{
  code: string;
  creditsUsed: number;
  creditsRemaining: number;
  generationId: string;
} | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    const response = await fetch(
      `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/generate-code`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          prompt,
          generationType,
          projectId,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to generate code');
    }

    return await response.json();
  } catch (error) {
    console.error('Error generating code:', error);
    throw error;
  }
}

export async function getCreditTransactions(limit = 50) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('credit_transactions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }

  return data;
}

export async function getGenerationHistory(limit = 50) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('ai_generations')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching generation history:', error);
    return [];
  }

  return data;
}

export const SUBSCRIPTION_TIERS = {
  free: {
    name: 'Free',
    price: 0,
    credits: 50,
    features: [
      'Basic templates',
      '1 active project',
      'Code export',
      'Watermarked exports',
    ],
  },
  starter: {
    name: 'Starter',
    price: 9.99,
    credits: 500,
    features: [
      'All templates',
      '5 active projects',
      'No watermark',
      'Priority support',
    ],
    creditTopup: { price: 5, credits: 200 },
  },
  pro: {
    name: 'Pro',
    price: 19.99,
    credits: 2000,
    features: [
      'Advanced templates',
      'Unlimited projects',
      'Desktop companion app',
      'Team collaboration (3 seats)',
    ],
    creditTopup: { price: 10, credits: 500 },
  },
  entrepreneur: {
    name: 'Entrepreneur',
    price: 49.99,
    credits: 10000,
    features: [
      'Everything in Pro',
      'White-label exports',
      'API access',
      'Priority generation queue',
      'Custom AI training',
      'Dedicated account manager',
    ],
    creditTopup: { price: 20, credits: 1500 },
  },
};
