import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          subscription_tier: 'free' | 'pro' | 'teams';
          credits_remaining: number;
          credits_purchased: number;
          created_at: string;
          updated_at: string;
        };
      };
      projects: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string;
          app_type: 'social' | 'ecommerce' | 'productivity' | 'fitness' | 'finance' | 'custom';
          status: 'draft' | 'generating' | 'completed' | 'error';
          color_scheme: {
            primary: string;
            background: string;
          };
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description: string;
          app_type?: 'social' | 'ecommerce' | 'productivity' | 'fitness' | 'finance' | 'custom';
          status?: 'draft' | 'generating' | 'completed' | 'error';
          color_scheme?: {
            primary: string;
            background: string;
          };
        };
      };
      generations: {
        Row: {
          id: string;
          project_id: string;
          prompt: string;
          generated_code: Record<string, unknown>;
          generated_schema: Record<string, unknown>;
          ai_model: string;
          processing_time: number;
          status: 'processing' | 'completed' | 'error';
          error_message: string | null;
          created_at: string;
        };
      };
    };
  };
};
