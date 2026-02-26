import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { initializePurchases } from '../lib/purchases';

interface Profile {
  id: string;
  email: string;
  subscription_tier: 'free' | 'pro' | 'entrepreneur';
  credits_remaining: number;
  credits_purchased: number;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  console.log('AuthProvider initializing');
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('AuthProvider timeout effect mounted');
    const timeout = setTimeout(() => {
      console.warn('Auth loading timeout (5s) - forcing completion');
      setLoading(false);
    }, 5000);

    return () => clearTimeout(timeout);
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (!error && data) {
      setProfile(data);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  useEffect(() => {
    console.log('AuthProvider auth check effect mounted');

    supabase.auth.getSession()
      .then(({ data: { session }, error }) => {
        console.log('getSession result:', { hasSession: !!session, error });
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          console.log('User found, fetching profile');
          fetchProfile(session.user.id).finally(() => {
            console.log('Profile fetch complete, setting loading to false');
            setLoading(false);
          });
          initializePurchases(session.user.id);
        } else {
          console.log('No session, setting loading to false');
          setLoading(false);
        }
      })
      .catch((error) => {
        console.error('Error getting session:', error);
        setLoading(false);
      });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        (async () => {
          setSession(session);
          setUser(session?.user ?? null);

          if (session?.user) {
            await fetchProfile(session.user.id);
            initializePurchases(session.user.id);
          } else {
            setProfile(null);
          }

          setLoading(false);
        })();
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}`,
    });

    return { error };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        signUp,
        signIn,
        signOut,
        resetPassword,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
