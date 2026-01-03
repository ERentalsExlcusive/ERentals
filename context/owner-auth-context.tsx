/**
 * Owner Auth Context
 * Supabase-ready structure with mock authentication for V1
 */

import { createContext, useContext, useState, ReactNode } from 'react';

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
  logout: () => void;
}

const OwnerAuthContext = createContext<OwnerAuthContextType | null>(null);

// Demo credentials for V1
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
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Mock authentication - check demo credentials
    if (email === DEMO_CREDENTIALS.email && password === DEMO_CREDENTIALS.password) {
      setUser(DEMO_CREDENTIALS.user);
      setIsLoading(false);
      return true;
    }

    // TODO: Replace with Supabase auth
    // const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    // if (error) { setIsLoading(false); return false; }
    // setUser(transformSupabaseUser(data.user));

    setIsLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
    // TODO: Add Supabase signOut
    // await supabase.auth.signOut();
  };

  return (
    <OwnerAuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
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
