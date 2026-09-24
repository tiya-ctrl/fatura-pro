import { supabase } from "./supabase";
import { ensureUserPlan, getVisitorCountry } from "./lib/userPlan";

// The app address the confirmation email links to. It carries the chosen trial
// so an Advanced choice survives opening the email on another device.
const appReturnUrl = (intentPlan) =>
  window.location.origin + "/app" + (intentPlan === "business" ? "?plan=business" : "");

export const signUp = async (email, password, intentPlan) => {
  const country = await getVisitorCountry();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    // Used only when "Confirm email" is on in Supabase: the link in the email
    // brings the person straight into the app (same return path as Google sign-in).
    options: { data: { country }, emailRedirectTo: appReturnUrl(intentPlan) },
  });
  if (error) throw error;
  if (data?.user && data?.session) await ensureUserPlan(data.user, country);
  return data;
};

// No session after sign-up means Supabase is waiting for the email to be confirmed.
export const needsEmailConfirmation = (signUpData) => Boolean(signUpData?.user && !signUpData?.session);

export const isEmailNotConfirmedError = (error) =>
  error?.code === "email_not_confirmed" || /email not confirmed/i.test(String(error?.message || ""));

export const resendConfirmationEmail = async (email, intentPlan) => {
  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: { emailRedirectTo: appReturnUrl(intentPlan) },
  });
  if (error) throw error;
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
