import { useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import {
  getSupabaseBrowserClient,
  isSupabaseConfigured,
  telemetryDashboardRepository,
} from '@repositories';

export interface TelemetryAuthState {
  configured: boolean;
  loading: boolean;
  session: Session | null;
  user: User | null;
  isAdmin: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export function useTelemetryAuth(): TelemetryAuthState {
  const configured = isSupabaseConfigured();
  const [loading, setLoading] = useState(configured);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!configured) {
      return;
    }

    const client = getSupabaseBrowserClient();
    if (!client) {
      queueMicrotask(() => {
        setLoading(false);
      });
      return;
    }

    let active = true;

    const sync = async (next: Session | null) => {
      if (!active) {
        return;
      }

      setSession(next);
      setUser(next?.user ?? null);

      if (!next?.user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      const admin = await telemetryDashboardRepository.isAdminUser(next.user.id);
      if (!active) {
        return;
      }

      setIsAdmin(admin);
      setLoading(false);
    };

    void client.auth.getSession().then(({ data }) => {
      void sync(data.session);
    });

    const { data: subscription } = client.auth.onAuthStateChange(
      (_event, next) => {
        void sync(next);
      },
    );

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, [configured]);

  const signIn = async (email: string, password: string) => {
    setError(null);
    const client = getSupabaseBrowserClient();
    if (!client) {
      setError('Supabase is not configured.');
      return;
    }

    const { error: signInError } = await client.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
    }
  };

  const signOut = async () => {
    const client = getSupabaseBrowserClient();
    await client?.auth.signOut();
    setIsAdmin(false);
  };

  return {
    configured,
    loading,
    session,
    user,
    isAdmin,
    error,
    signIn,
    signOut,
  };
}
