"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "../lib/supabase/client";

const HEALTH_CHECK_INTERVAL_MS = 4 * 60 * 1000; // 4 phút

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
  let supabaseClient: SupabaseClient | null = null;
  let configErrorMessage: string | null = null;

  try {
    supabaseClient = createSupabaseBrowserClient();
  } catch (error) {
    console.error("Không thể khởi tạo Supabase client:", error);
    configErrorMessage =
      "Ứng dụng chưa được cấu hình Supabase. Vui lòng bổ sung NEXT_PUBLIC_SUPABASE_URL và NEXT_PUBLIC_SUPABASE_ANON_KEY.";
  }

  const [configError] = useState(configErrorMessage);
  const supabaseRef = useRef<SupabaseClient | null>(supabaseClient);
  const supabase = supabaseRef.current;
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return;
    }

    let isMounted = true;
    const pingSupabase = async () => {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/health`, {
          cache: "no-store",
        });
      } catch (error) {
        if (isMounted) {
          console.warn("Không thể ping Supabase health endpoint:", error);
        }
      }
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        void pingSupabase();
      }
    };

    void pingSupabase();
    const intervalId = window.setInterval(pingSupabase, HEALTH_CHECK_INTERVAL_MS);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [supabase]);

  const loadSession = useMemo(
    () =>
      async () => {
        if (!supabase) {
          setLoading(false);
          return;
        }

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
    if (!supabase) {
      setLoading(false);
      return;
    }

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
        if (!supabase || !user?.id) return;
        const profileData = await fetchProfile(supabase, user.id);
        setProfile(profileData);
      },
    [supabase, user?.id],
  );

  const value = useMemo<SupabaseContextValue | null>(
    () =>
      supabase
        ? {
            supabase,
            session,
            user,
            profile,
            loading,
            refreshProfile,
          }
        : null,
    [supabase, session, user, profile, loading, refreshProfile],
  );

  if (!supabase || !value) {
    return (
      <div className="min-h-screen bg-white text-gray-900 flex items-center justify-center px-6 text-center">
        <div className="max-w-lg space-y-4">
          <h1 className="text-2xl font-semibold text-red-600">Lỗi cấu hình Supabase</h1>
          <p>
            {configError ??
              "Không thể khởi tạo Supabase client. Vui lòng kiểm tra biến môi trường NEXT_PUBLIC_SUPABASE_URL và NEXT_PUBLIC_SUPABASE_ANON_KEY."}
          </p>
          <p className="text-sm text-gray-600">
            Tham khảo tệp <code>.env.example</code> và thêm thông tin vào tệp <code>.env.local</code>, sau đó khởi động
            lại máy chủ phát triển.
          </p>
        </div>
      </div>
    );
  }

  return <SupabaseContext.Provider value={value}>{children}</SupabaseContext.Provider>;
}

export function useSupabase() {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error("useSupabase phải được sử dụng trong SupabaseProvider");
  }
  return context;
}
