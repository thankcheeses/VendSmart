import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase, isDemoMode } from '@/lib/supabase';
import type { Profile, Subscription } from '@/types';
import { currentUser } from '@/data/mockData';

interface AuthContextValue {
  user: User | null;
  profile: Profile | null;
  subscription: Subscription | null;
  loading: boolean;
  isDemoMode: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, businessName: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const demoProfile: Profile = {
  id: 'demo-user',
  business_name: currentUser.business_name,
  email: currentUser.email,
  created_at: new Date().toISOString(),
};

const demoSubscription: Subscription = {
  id: 'demo-sub',
  user_id: 'demo-user',
  plan: 'free',
  status: 'active',
  machine_limit: 5,
  created_at: new Date().toISOString(),
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(isDemoMode ? demoProfile : null);
  const [subscription, setSubscription] = useState<Subscription | null>(isDemoMode ? demoSubscription : null);
  const [loading, setLoading] = useState(!isDemoMode);

  useEffect(() => {
    if (isDemoMode || !supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) loadUserData(session.user.id);
      else setLoading(false);
    });

    const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) loadUserData(session.user.id);
      else {
        setProfile(null);
        setSubscription(null);
        setLoading(false);
      }
    });

    return () => authSub.unsubscribe();
  }, []);

  async function loadUserData(userId: string) {
    if (!supabase) return;
    try {
      const [profileRes, subRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).single(),
        supabase.from('subscriptions').select('*').eq('user_id', userId).single(),
      ]);
      if (profileRes.data) setProfile(profileRes.data);
      if (subRes.data) setSubscription(subRes.data);
    } finally {
      setLoading(false);
    }
  }

  async function signIn(email: string, password: string) {
    if (!supabase) return { error: 'Supabase not configured' };
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  }

  async function signUp(email: string, password: string, businessName: string) {
    if (!supabase) return { error: 'Supabase not configured' };

    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return { error: error.message };
    if (!data.user) return { error: 'Sign up failed' };

    const userId = data.user.id;

    await supabase.from('profiles').upsert({
      id: userId,
      business_name: businessName,
      email,
    });

    await supabase.from('subscriptions').upsert({
      user_id: userId,
      plan: 'free',
      status: 'active',
      machine_limit: 5,
    });

    await seedDemoMachines(userId, businessName);

    return { error: null };
  }

  async function seedDemoMachines(userId: string, businessName: string) {
    if (!supabase) return;
    const demos = [
      { name: `${businessName} — Main Office`, location_address: '100 Corporate Drive, Building A', latitude: 40.7484, longitude: -73.9967, machine_type: 'combo', capacity_slots: 48, commission_percent: 12, status: 'online', fill_percentage: 78, weekly_revenue: 412, last_visit_date: new Date().toISOString().split('T')[0] },
      { name: `${businessName} — Warehouse Floor`, location_address: '500 Industrial Pkwy, Dock 3', latitude: 40.7295, longitude: -74.0040, machine_type: 'drink', capacity_slots: 32, commission_percent: 15, status: 'online', fill_percentage: 65, weekly_revenue: 287, last_visit_date: new Date().toISOString().split('T')[0] },
      { name: `${businessName} — Break Room`, location_address: '100 Corporate Drive, Floor 2', latitude: 40.7484, longitude: -73.9950, machine_type: 'snack', capacity_slots: 40, commission_percent: 10, status: 'low_stock', fill_percentage: 28, weekly_revenue: 195, last_visit_date: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0] },
    ];
    await supabase.from('machines').insert(demos.map(d => ({ ...d, user_id: userId })));
  }

  async function signOut() {
    if (supabase) await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setSubscription(null);
  }

  return (
    <AuthContext.Provider value={{ user, profile, subscription, loading, isDemoMode, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
