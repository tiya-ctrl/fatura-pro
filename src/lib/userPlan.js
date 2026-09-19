import { supabase } from "../supabase";

const TRIAL_DAYS = 7;

export async function getVisitorCountry() {
  try {
    const response = await fetch("/api/location", {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data.country || data.countryCode || null;
  } catch {
    return null;
  }
}

export async function ensureUserPlan(user, knownCountry = null) {
  if (!user?.id) return null;

  const { data: current, error: readError } = await supabase
    .from("user_plans")
    .select("plan, trial_end, email, country")
    .eq("user_id", user.id)
    .maybeSingle();
  if (readError) throw readError;

  const email = user.email || null;
  const needsEmail = Boolean(email && current?.email !== email);
  const country = current?.country || knownCountry || await getVisitorCountry();

  if (!current) {
    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + TRIAL_DAYS);
    const row = {
      user_id: user.id,
      plan: "free",
      trial_end: trialEnd.toISOString(),
      email,
      country,
    };
    const { error } = await supabase.from("user_plans").insert(row);
    if (error) throw error;
    return row;
  }

  const updates = {};
  if (needsEmail) updates.email = email;
  if (!current.country && country) updates.country = country;
  if (Object.keys(updates).length) {
    updates.updated_at = new Date().toISOString();
    const { error } = await supabase.from("user_plans").update(updates).eq("user_id", user.id);
    if (error) throw error;
  }

  return { ...current, ...updates };
}
