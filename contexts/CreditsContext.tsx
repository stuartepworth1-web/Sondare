import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Platform } from 'react-native';
import { getUserProfile, type UserProfile } from '@/lib/credits';
import { supabase } from '@/lib/supabase';

interface CreditsContextType {
  credits: number;
  profile: UserProfile | null;
  isLoading: boolean;
  refreshProfile: () => Promise<void>;
}

const CreditsContext = createContext<CreditsContextType | undefined>(undefined);

export function CreditsProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadProfile = async () => {
    try {
      const userProfile = await getUserProfile();
      setProfile(userProfile);
    } catch (error) {
      console.error('Error loading profile:', error);
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProfile = async () => {
    try {
      await loadProfile();
    } catch (error) {
      console.error('Error refreshing profile:', error);
    }
  };

  useEffect(() => {
    let mounted = true;
    let authSubscription: any = null;

    const init = async () => {
      try {
        if (mounted) {
          await loadProfile();
        }

        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
          if (!mounted) return;

          if (event === 'SIGNED_IN') {
            loadProfile().catch(err => console.error('Auth state change error:', err));
          } else if (event === 'SIGNED_OUT') {
            setProfile(null);
          }
        });

        authSubscription = authListener.subscription;
      } catch (error) {
        console.error('CreditsProvider initialization error:', error);
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    init();

    return () => {
      mounted = false;
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
  }, []);

  return (
    <CreditsContext.Provider
      value={{
        credits: profile?.credits ?? 0,
        profile,
        isLoading,
        refreshProfile,
      }}
    >
      {children}
    </CreditsContext.Provider>
  );
}

export function useCredits() {
  const context = useContext(CreditsContext);
  if (context === undefined) {
    throw new Error('useCredits must be used within a CreditsProvider');
  }
  return context;
}
