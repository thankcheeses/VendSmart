// The auth context and its hook live apart from AuthProvider so that
// AuthContext.tsx exports only a component (React Fast Refresh needs that).
import { createContext, useContext } from 'react';
import type { User } from '@supabase/supabase-js';
import type { Profile, Subscription } from '@/types';

export interface AuthContextValue {
  user: User | null;
  profile: Profile | null;
  subscription: Subscription | null;
  loading: boolean;
  isDemoMode: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, businessName: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
