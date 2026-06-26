import { supabase } from "./supabase";

export const signUp = async (email, password) => {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  if (data?.user) {
    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + 7);
    await supabase.from("user_plans").upsert({
      user_id: data.user.id,
      plan: "free",
      trial_end: trialEnd.toISOString(),
    });
  }
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
export const loginWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: window.location.origin + "/app", queryParams: { prompt: "select_account" } }
  });
  if (error) throw error;
  return data;
};
