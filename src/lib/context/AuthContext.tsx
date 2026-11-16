'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { DEMO_USERS } from '@/lib/services/documentService';
import { UserProfile } from '@/types';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isConfigured: boolean;
  signIn: (email: string, password?: string) => Promise<{ error?: string }>;
  signUp: (email: string, password?: string, fullName?: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  switchUser: (userKey: 'alex' | 'sarah' | 'david') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_AUTH_KEY = 'collabspace_current_user_key';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initAuth() {
      if (isSupabaseConfigured && supabase) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            setUser({
              id: session.user.id,
              email: session.user.email || '',
              full_name: profile?.full_name || session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
              avatar_url: profile?.avatar_url,
            });
          }
        } catch (e) {
          console.warn('Supabase auth session check failed, falling back to local session', e);
        }
      } else {
        // Local Session
        const storedKey = typeof window !== 'undefined' ? localStorage.getItem(LOCAL_AUTH_KEY) : null;
        const initialUser = (storedKey && DEMO_USERS[storedKey]) ? DEMO_USERS[storedKey] : DEMO_USERS.alex;
        setUser(initialUser);
      }
      setLoading(false);
    }

    initAuth();

    const client = supabase;
    if (isSupabaseConfigured && client) {
      const { data: authListener } = client.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          const { data: profile } = await client
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          setUser({
            id: session.user.id,
            email: session.user.email || '',
            full_name: profile?.full_name || session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
            avatar_url: profile?.avatar_url,
          });
        } else {
          setUser(null);
        }
      });

      return () => {
        authListener.subscription.unsubscribe();
      };
    }
  }, []);

  const signIn = async (email: string, password?: string): Promise<{ error?: string }> => {
    if (isSupabaseConfigured && supabase) {
      if (!password) return { error: 'Password is required' };
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error: error.message };
      return {};
    }

    // Local Mock Sign In
    const cleanEmail = email.trim().toLowerCase();
    const existingDemo = Object.values(DEMO_USERS).find((u) => u.email.toLowerCase() === cleanEmail);
    if (existingDemo) {
      setUser(existingDemo);
      const key = Object.keys(DEMO_USERS).find((k) => DEMO_USERS[k].id === existingDemo.id);
      if (key && typeof window !== 'undefined') localStorage.setItem(LOCAL_AUTH_KEY, key);
      return {};
    }

    // Dynamic guest mock user
    const newUser: UserProfile = {
      id: `u-${Date.now()}`,
      email: cleanEmail,
      full_name: cleanEmail.split('@')[0],
    };
    setUser(newUser);
    return {};
  };

  const signUp = async (email: string, password?: string, fullName?: string): Promise<{ error?: string }> => {
    if (isSupabaseConfigured && supabase) {
      if (!password) return { error: 'Password is required' };
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      });
      if (error) return { error: error.message };
      return {};
    }

    // Local Mock Sign Up
    const cleanEmail = email.trim().toLowerCase();
    const newUser: UserProfile = {
      id: `u-${Date.now()}`,
      email: cleanEmail,
      full_name: fullName || cleanEmail.split('@')[0],
    };
    setUser(newUser);
    return {};
  };

  const signOut = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem(LOCAL_AUTH_KEY);
    }
    // Set to null or guest
    setUser(null);
  };

  const switchUser = async (userKey: 'alex' | 'sarah' | 'david') => {
    const target = DEMO_USERS[userKey];
    if (target) {
      if (isSupabaseConfigured && supabase) {
        try {
          await supabase.auth.signOut();
        } catch {
          // ignore
        }
      }
      setUser(target);
      if (typeof window !== 'undefined') {
        localStorage.setItem(LOCAL_AUTH_KEY, userKey);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isConfigured: isSupabaseConfigured,
        signIn,
        signUp,
        signOut,
        switchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
