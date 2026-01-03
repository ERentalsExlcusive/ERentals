/**
 * Owner Auth Context
 * Uses Supabase when configured, falls back to mock authentication for development
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export interface OwnerUser {
  id: string;
  email: string;
  name: string;
  role: 'owner' | 'admin';
}

interface OwnerAuthState {
  user: OwnerUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface OwnerAuthContextType extends OwnerAuthState {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (data: { name?: string }) => Promise<boolean>;
}

const OwnerAuthContext = createContext<OwnerAuthContextType | null>(null);

// Demo credentials for development (when Supabase not configured)
const DEMO_CREDENTIALS = {
  email: 'owner@erentals.com',
  password: 'demo123',
  user: {
    id: 'demo-owner-1',
    email: 'owner@erentals.com',
    name: 'Demo Owner',
    role: 'owner' as const,
  },
};

export function OwnerAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<OwnerUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const initAuth = async () => {
      if (isSupabaseConfigured()) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            // Fetch owner profile from database
            const { data: owner } = await supabase
              .from('owners')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (owner) {
              setUser({
                id: owner.id,
                email: owner.email,
                name: owner.name,
                role: owner.role,
              });
            }
          }
        } catch (error) {
          console.error('Auth init error:', error);
        }
      }
      setIsLoading(false);
    };

    initAuth();

    // Listen for auth changes when Supabase is configured
    if (isSupabaseConfigured()) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const { data: owner } = await supabase
            .from('owners')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (owner) {
            setUser({
              id: owner.id,
              email: owner.email,
              name: owner.name,
              role: owner.role,
            });
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      });

      return () => subscription.unsubscribe();
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);

    try {
      if (isSupabaseConfigured()) {
        // Use Supabase authentication
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          console.error('Supabase login error:', error.message);
          setIsLoading(false);
          return false;
        }

        if (data.user) {
          // Fetch owner profile
          const { data: owner, error: profileError } = await supabase
            .from('owners')
            .select('*')
            .eq('id', data.user.id)
            .single();

          if (profileError || !owner) {
            console.error('Owner profile not found');
            await supabase.auth.signOut();
            setIsLoading(false);
            return false;
          }

          setUser({
            id: owner.id,
            email: owner.email,
            name: owner.name,
            role: owner.role,
          });
          setIsLoading(false);
          return true;
        }
      } else {
        // Fall back to mock authentication
        await new Promise(resolve => setTimeout(resolve, 500));

        if (email === DEMO_CREDENTIALS.email && password === DEMO_CREDENTIALS.password) {
          setUser(DEMO_CREDENTIALS.user);
          setIsLoading(false);
          return true;
        }
      }
    } catch (error) {
      console.error('Login error:', error);
    }

    setIsLoading(false);
    return false;
  };

  const logout = async (): Promise<void> => {
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut();
    }
    setUser(null);
  };

  const updateProfile = async (data: { name?: string }): Promise<boolean> => {
    if (!user) return false;

    try {
      if (isSupabaseConfigured()) {
        const { error } = await supabase
          .from('owners')
          .update({ name: data.name, updated_at: new Date().toISOString() })
          .eq('id', user.id);

        if (error) {
          console.error('Profile update error:', error);
          return false;
        }
      }

      // Update local state
      setUser(prev => prev ? { ...prev, ...data } : null);
      return true;
    } catch (error) {
      console.error('Update profile error:', error);
      return false;
    }
  };

  return (
    <OwnerAuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        updateProfile,
      }}
    >
      {children}
    </OwnerAuthContext.Provider>
  );
}

export function useOwnerAuth() {
  const context = useContext(OwnerAuthContext);
  if (!context) {
    throw new Error('useOwnerAuth must be used within an OwnerAuthProvider');
  }
  return context;
}
