"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "../lib/supabase/client";

export interface Profile {
  id: string;
  full_name: string;
  phone: string | null;
  role: "user" | "admin";
  created_at: string;
  updated_at: string;
}

interface SupabaseContextValue {
  supabase: SupabaseClient;
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
}

const SupabaseContext = createContext<SupabaseContextValue | undefined>(undefined);

async function fetchProfile(client: SupabaseClient, userId: string): Promise<Profile | null> {
  const { data, error } = await client
    .from("profiles")
    .select("id, full_name, phone, role, created_at, updated_at")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("Không thể tải thông tin hồ sơ:", error);
    return null;
  }

  return data as Profile | null;
}

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const supabase = useRef(createSupabaseBrowserClient()).current;
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadSession = useMemo(
    () =>
      async () => {
        const {
          data: { session: currentSession },
          error,
        } = await supabase.auth.getSession();
        if (error) {
          console.error("Không thể lấy session Supabase:", error);
          setSession(null);
          setUser(null);
          setProfile(null);
          setLoading(false);
          return;
        }

        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user?.id) {
          const profileData = await fetchProfile(supabase, currentSession.user.id);
          setProfile(profileData);
        } else {
          setProfile(null);
        }

        setLoading(false);
      },
    [supabase],
  );

  useEffect(() => {
    loadSession();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      if (newSession?.user?.id) {
        const profileData = await fetchProfile(supabase, newSession.user.id);
        setProfile(profileData);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [loadSession, supabase]);

  const refreshProfile = useMemo(
    () =>
      async () => {
        if (!user?.id) return;
        const profileData = await fetchProfile(supabase, user.id);
        setProfile(profileData);
      },
    [supabase, user?.id],
  );

  const value = useMemo(
    () => ({
      supabase,
      session,
      user,
      profile,
      loading,
      refreshProfile,
    }),
    [supabase, session, user, profile, loading, refreshProfile],
  );

  return <SupabaseContext.Provider value={value}>{children}</SupabaseContext.Provider>;
}

export function useSupabase() {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error("useSupabase phải được sử dụng trong SupabaseProvider");
  }
  return context;
}
