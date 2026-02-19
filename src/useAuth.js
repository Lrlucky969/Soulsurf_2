// SoulSurf – Auth Hook (v4.7)
// Provides auth state + actions. Gracefully does nothing if Supabase is not configured.
import { useState, useEffect, useCallback } from "react";
import { supabase, isSupabaseConfigured } from "./supabase.js";

export default function useAuth() {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user || null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user || null);
    });

    return () => subscription?.unsubscribe();
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const login = useCallback(async (email, password) => {
    if (!supabase) return { error: { message: "Supabase nicht konfiguriert" } };
    setError(null);
    setLoading(true);
    const { data, error: err } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (err) { setError(err.message); return { error: err }; }
    return { data };
  }, []);

  const register = useCallback(async (email, password) => {
    if (!supabase) return { error: { message: "Supabase nicht konfiguriert" } };
    setError(null);
    setLoading(true);
    const { data, error: err } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (err) { setError(err.message); return { error: err }; }
    return { data };
  }, []);

  const logout = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  }, []);

  const resetPassword = useCallback(async (email) => {
    if (!supabase) return { error: { message: "Supabase nicht konfiguriert" } };
    setError(null);
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
    if (err) { setError(err.message); return { error: err }; }
    return { success: true };
  }, []);

  return {
    user,
    session,
    loading,
    error,
    clearError,
    login,
    register,
    logout,
    resetPassword,
    isConfigured: isSupabaseConfigured,
    isLoggedIn: Boolean(user),
    displayName: user?.email?.split("@")[0] || null,
  };
}
