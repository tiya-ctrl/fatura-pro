// Server-side plan checks. The browser decides what to show, but features that
// keep running on the server (recurring invoices, API, online payments) must
// stop when an account is no longer on Advanced (internal plan "business").
// Stripe sets "business" for paid and trialing Advanced subscriptions and sets
// "free" when a subscription is canceled or unpaid. Data is never deleted.

export async function advancedUserIds(supabaseAdmin, userIds) {
  const ids = [...new Set((userIds || []).filter(Boolean))];
  if (!ids.length) return new Set();
  const { data, error } = await supabaseAdmin
    .from("user_plans").select("user_id, plan").in("user_id", ids);
  if (error) throw error;
  return new Set((data || []).filter((row) => row.plan === "business").map((row) => row.user_id));
}

export async function hasAdvancedAccess(supabaseAdmin, userId) {
  if (!userId) return false;
  return (await advancedUserIds(supabaseAdmin, [userId])).has(userId);
}
