import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export type AdminStatus = 'pending' | 'approved' | 'rejected' | 'revoked' | 'none';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  adminRole: 'super_admin' | 'admin' | null;
  adminStatus: AdminStatus;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, displayName: string) => Promise<{ error: Error | null }>;
  requestAdminAccess: (email: string, password: string, displayName: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  adminRole: null,
  adminStatus: 'none',
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  requestAdminAccess: async () => ({ error: null }),
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [adminRole, setAdminRole] = useState<'super_admin' | 'admin' | null>(null);
  const [adminStatus, setAdminStatus] = useState<AdminStatus>('none');

  async function loadAdminInfo(userId: string) {
    const { data } = await supabase
      .from('admin_users')
      .select('role, status')
      .eq('user_id', userId)
      .maybeSingle();
    const row = data as { role: 'super_admin' | 'admin'; status: AdminStatus } | null;
    setAdminRole(row?.role ?? null);
    setAdminStatus(row?.status ?? 'none');
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        loadAdminInfo(u.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        loadAdminInfo(u.id);
      } else {
        setAdminRole(null);
        setAdminStatus('none');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error) {
      const { data: { user: u } } = await supabase.auth.getUser();
      if (u) await loadAdminInfo(u.id);
    }
    return { error };
  }

  async function signUp(email: string, password: string, displayName: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } },
    });
    if (!error && data.user) {
      const { data: meta } = await supabase
        .from('forum_conduct_meta')
        .select('current_version')
        .eq('id', 1)
        .maybeSingle();
      const version = (meta as { current_version: number } | null)?.current_version ?? 1;
      await supabase
        .from('forum_conduct_acceptances')
        .upsert({ user_id: data.user.id, version }, { onConflict: 'user_id' });
    }
    return { error };
  }

  async function requestAdminAccess(email: string, password: string, displayName: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } },
    });
    if (error) {
      return { error: error.message };
    }
    if (!data.user) {
      return { error: 'No se pudo crear el usuario. Intenta de nuevo.' };
    }
    const { error: insertError } = await supabase
      .from('admin_users')
      .insert({
        user_id: data.user.id,
        email,
        display_name: displayName,
        role: 'admin',
        status: 'pending',
      });
    if (insertError) {
      return { error: insertError.message };
    }
    return { error: null };
  }

  async function signOut() {
    await supabase.auth.signOut();
    setAdminRole(null);
    setAdminStatus('none');
  }

  return (
    <AuthContext.Provider value={{ session, user, loading, adminRole, adminStatus, signIn, signUp, requestAdminAccess, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
