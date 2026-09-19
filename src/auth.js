import { supabase } from "./supabase";
import { ensureUserPlan, getVisitorCountry } from "./lib/userPlan";

export const signUp = async (email, password) => {
  const country = await getVisitorCountry();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { country } },
  });
  if (error) throw error;
  if (data?.user && data?.session) await ensureUserPlan(data.user, country);
  return data;
};

export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const onAuthChange = (callback) => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user || null);
  });
  return () => subscription.unsubscribe();
};
export const loginWithGoogle = async (returnPath = "/app") => {
  const safeReturnPath = String(returnPath || "/app").startsWith("/")
    ? String(returnPath || "/app")
    : "/app";
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: window.location.origin + safeReturnPath, queryParams: { prompt: "select_account" } }
  });
  if (error) throw error;
  return data;
};
