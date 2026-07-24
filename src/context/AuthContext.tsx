import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import type { AuthError, AuthResponse, Session, User } from "@supabase/supabase-js";
import { fetchProfile, upsertProfile, type ProfileRecord } from "../lib/backend";
import { supabase } from "../lib/supabase";

interface SignUpInput {
  fullName: string;
  email: string;
  password: string;
  emailRedirectTo: string;
}

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  profile: ProfileRecord | null;
  isAdmin: boolean;
  isProductAdmin: boolean;
  isStaff: boolean;
  loading: boolean;
  profileLoading: boolean;
  signIn: (email: string, password: string) => Promise<AuthResponse>;
  signUp: (input: SignUpInput) => Promise<AuthResponse>;
  signOut: () => Promise<{ error: AuthError | null }>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function requireSupabase() {
  if (!supabase) {
    throw new Error("Supabase is not configured yet. Add the public Vite variables and restart the app.");
  }

  return supabase;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setProfileLoading(false);
      return;
    }

    let mounted = true;
    setProfileLoading(true);

    upsertProfile(user)
      .then(() => fetchProfile(user.id))
      .then((nextProfile) => {
        if (mounted) setProfile(nextProfile);
      })
      .catch((error) => {
        console.error("Could not sync Soolou profile", error);
        if (mounted) setProfile(null);
      })
      .finally(() => {
        if (mounted) setProfileLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [user]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      session,
      profile,
      isAdmin: profile?.admin_role === "admin" || Boolean(profile?.is_admin),
      isProductAdmin:
        profile?.admin_role === "admin" ||
        profile?.admin_role === "sub_admin" ||
        Boolean(profile?.is_admin),
      isStaff: Boolean(profile && profile.admin_role !== "customer"),
      loading,
      profileLoading,
      signIn: (email, password) =>
        requireSupabase().auth.signInWithPassword({
          email,
          password,
        }),
      signUp: ({ fullName, email, password, emailRedirectTo }) =>
        requireSupabase().auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo,
            data: {
              full_name: fullName,
            },
          },
        }),
      signOut: () => requireSupabase().auth.signOut(),
      refreshUser: async () => {
        const { data } = await requireSupabase().auth.getUser();
        setUser(data.user);
      },
    }),
    [loading, profile, profileLoading, session, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}
