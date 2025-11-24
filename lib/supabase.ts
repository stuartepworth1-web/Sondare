import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

let supabaseInstance: SupabaseClient | null = null;

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

const ExpoSecureStoreAdapter = {
  getItem: async (key: string) => {
    try {
      if (Platform.OS === 'web') {
        if (typeof localStorage === 'undefined') {
          return null;
        }
        return localStorage.getItem(key);
      }
      const SecureStore = require('expo-secure-store');
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error('Storage getItem error:', error);
      return null;
    }
  },
  setItem: async (key: string, value: string) => {
    try {
      if (Platform.OS === 'web') {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(key, value);
        }
        return;
      }
      const SecureStore = require('expo-secure-store');
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error('Storage setItem error:', error);
    }
  },
  removeItem: async (key: string) => {
    try {
      if (Platform.OS === 'web') {
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem(key);
        }
        return;
      }
      const SecureStore = require('expo-secure-store');
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error('Storage removeItem error:', error);
    }
  },
};

function createSupabaseClient(): SupabaseClient {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  try {
    require('react-native-url-polyfill/auto');
  } catch (error) {
    console.error('URL polyfill error:', error);
  }

  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('Supabase environment variables not configured');
    }

    supabaseInstance = createClient(
      supabaseUrl || 'https://placeholder.supabase.co',
      supabaseAnonKey || 'placeholder',
      {
        auth: {
          storage: ExpoSecureStoreAdapter as any,
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false,
        },
      }
    );

    return supabaseInstance;
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error);
    supabaseInstance = createClient('https://placeholder.supabase.co', 'placeholder');
    return supabaseInstance;
  }
}

export const supabase = new Proxy({} as SupabaseClient, {
  get: (target, prop) => {
    const client = createSupabaseClient();
    return (client as any)[prop];
  },
});
