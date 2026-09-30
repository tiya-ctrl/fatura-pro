// One free trial per email address and plan. Mirrors public.normalize_email_key
// in supabase/migrations/202609300001_one_trial_per_email.sql.

export function normalizeEmailKey(email) {
  const value = String(email || "").trim().toLowerCase();
  const at = value.indexOf("@");
  if (at < 1) return null;
  const domain = value.slice(at + 1);
  const local = value.slice(0, at).split("+")[0];
  if (domain === "gmail.com" || domain === "googlemail.com") return local.replace(/\./g, "") + "@gmail.com";
  return local + "@" + domain;
}

// Called when a Stripe checkout starts a subscription. If it started in a trial
// and this email already had that plan's trial, the trial ends now, so Stripe
// charges straight away. Returns what happened, for the log.
export async function enforceOneTrial(stripe, supabaseAdmin, { email, subscriptionId, plan }) {
  const key = normalizeEmailKey(email);
  if (!key || !subscriptionId || plan !== "business") return "skipped";
  const sub = await stripe.subscriptions.retrieve(subscriptionId);
  if (sub.status !== "trialing") return "not_trialing";

  const { error } = await supabaseAdmin
    .from("trial_claims")
    .insert({ email_key: key, plan: "advanced" });
  if (!error) return "first_trial";
  if (error.code !== "23505") throw error;

  await stripe.subscriptions.update(subscriptionId, { trial_end: "now" });
  return "repeat_trial_ended";
}
