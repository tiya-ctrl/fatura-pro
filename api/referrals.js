import { createClient } from "@supabase/supabase-js";
import { createHmac } from "node:crypto";
import {
  ambassadorAdminSummary,
  ambassadorSummary,
  approveAmbassador,
  declineAmbassador,
  isAmbassadorAdmin,
  resendAmbassadorAcceptance,
  trackAmbassadorClick,
  updateAmbassador,
} from "../server/ambassador-program.js";

const supabaseAdmin = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

const DAYS_MS = 24 * 60 * 60 * 1000;

function requestActorHash(req) {
  const forwarded = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim();
  const actor = forwarded || String(req.headers["x-real-ip"] || req.socket?.remoteAddress || "unknown");
  return createHmac("sha256", process.env.SUPABASE_SERVICE_ROLE_KEY || "unconfigured").update(actor).digest("hex");
}
function requestOriginIsAllowed(req) {
  if (!req.headers.origin) return true;
  try {
    const { hostname, protocol } = new URL(req.headers.origin);
    const deploymentHost = String(process.env.VERCEL_URL || "").toLowerCase();
    const isLocal = process.env.NODE_ENV !== "production"
      && (hostname === "localhost" || hostname === "127.0.0.1");
    return (protocol === "https:" || protocol === "http:") && (
      hostname === "faturapro.app" || hostname === "www.faturapro.app"
      || (deploymentHost && hostname === deploymentHost) || isLocal
    );
  } catch { return false; }
}

function referralCodeForUser(userId) {
  return "FP" + String(userId || "").replace(/-/g, "").slice(0, 8).toUpperCase();
}

async function authenticatedUser(req) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) return null;
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  return error ? null : data.user;
}

async function ensureReferralCode(userId) {
  const code = referralCodeForUser(userId);
  const { data, error } = await supabaseAdmin
    .from("referral_codes")
    .upsert({ user_id: userId, code }, { onConflict: "user_id" })
    .select("code")
    .single();
  if (error) throw error;
  return data.code;
}

async function extendTrial(userId, rewardDays) {
  const { data: row, error: readError } = await supabaseAdmin
    .from("user_plans")
    .select("plan, trial_end")
    .eq("user_id", userId)
    .maybeSingle();
  if (readError) throw readError;

  const now = new Date();
  const currentEnd = row?.trial_end ? new Date(row.trial_end) : null;
  const base = currentEnd && currentEnd > now ? currentEnd : now;
  const nextEnd = new Date(base.getTime() + rewardDays * DAYS_MS);
  const { error } = await supabaseAdmin.from("user_plans").upsert({
    user_id: userId,
    plan: row?.plan || "free",
    trial_end: nextEnd.toISOString(),
    updated_at: now.toISOString(),
  });
  if (error) throw error;
  return nextEnd.toISOString();
}

async function referralSummary(userId) {
  const code = await ensureReferralCode(userId);
  const [pendingResult, activatedResult, rewardsResult, planResult] = await Promise.all([
    supabaseAdmin.from("referrals").select("id", { count: "exact", head: true }).eq("referrer_id", userId).eq("status", "pending").eq("program", "member"),
    supabaseAdmin.from("referrals").select("id", { count: "exact", head: true }).eq("referrer_id", userId).eq("status", "activated").eq("program", "member"),
    supabaseAdmin.from("referral_rewards").select("status, reward_days").eq("user_id", userId),
    supabaseAdmin.from("user_plans").select("plan, trial_end").eq("user_id", userId).maybeSingle(),
  ]);
  const firstError = pendingResult.error || activatedResult.error || rewardsResult.error || planResult.error;
  if (firstError) throw firstError;

  const rewards = rewardsResult.data || [];
  const activated = activatedResult.count || 0;
  return {
    code,
    pending: pendingResult.count || 0,
    activated,
    progress: activated % 3,
    nextRewardIn: 3 - (activated % 3),
    appliedRewards: rewards.filter(r => r.status === "applied").length,
    bankedDays: rewards.filter(r => r.status === "banked").reduce((sum, r) => sum + Number(r.reward_days || 0), 0),
    currentPlan: planResult.data?.plan || "free",
    trialEnd: planResult.data?.trial_end || null,
  };
}

async function claimReferral(user, code) {
  const normalized = String(code || "").trim().toUpperCase();
  if (!/^FP[A-Z0-9]{8}$/.test(normalized)) {
    return { status: 400, body: { error: "Invalid referral code" } };
  }

  // A referral is acquisition attribution, not a coupon for old accounts.
  const ageMs = Date.now() - new Date(user.created_at).getTime();
  if (!Number.isFinite(ageMs) || ageMs > 3 * DAYS_MS) {
    return { status: 409, body: { error: "Referral window expired" } };
  }

  const { data: owner, error: ownerError } = await supabaseAdmin
    .from("referral_codes")
    .select("user_id")
    .eq("code", normalized)
    .maybeSingle();
  if (ownerError) throw ownerError;
  if (!owner) return { status: 404, body: { error: "Referral code not found" } };
  if (owner.user_id === user.id) return { status: 409, body: { error: "You cannot refer yourself" } };

  const { data: ambassadorAccount, error: ambassadorError } = await supabaseAdmin
    .from("ambassador_accounts")
    .select("status, agreement_started_at, agreement_ends_at")
    .eq("user_id", owner.user_id)
    .maybeSingle();
  if (ambassadorError) throw ambassadorError;
  const now = new Date().toISOString();
  if (ambassadorAccount && (
    ambassadorAccount.status !== "active"
    || ambassadorAccount.agreement_started_at > now
    || (ambassadorAccount.agreement_ends_at && ambassadorAccount.agreement_ends_at <= now)
  )) {
    return { status: 410, body: { error: "This ambassador link is no longer active" } };
  }
  const program = ambassadorAccount ? "ambassador" : "member";

  const { data: existing, error: existingError } = await supabaseAdmin
    .from("referrals")
    .select("status")
    .eq("referred_user_id", user.id)
    .maybeSingle();
  if (existingError) throw existingError;
  if (existing) return { status: 200, body: { claimed: true, status: existing.status } };

  const { error } = await supabaseAdmin.from("referrals").insert({
    referrer_id: owner.user_id,
    referred_user_id: user.id,
    code: normalized,
    status: "pending",
    program,
  });
  if (error) throw error;
  return { status: 201, body: { claimed: true, status: "pending" } };
}

async function activateReferral(user) {
  const { data: firstInvoices, error: invoiceError } = await supabaseAdmin
    .from("invoices")
    .select("id, total, amount")
    .eq("user_id", user.id)
    .or("doc_type.is.null,doc_type.neq.credit_note")
    .order("created_at", { ascending: true })
    .limit(1);
  if (invoiceError) throw invoiceError;
  const firstInvoice = firstInvoices?.[0];
  const invoiceValue = Number(firstInvoice?.total ?? firstInvoice?.amount ?? 0);
  if (!firstInvoice || !(invoiceValue > 0)) {
    return { status: 409, body: { error: "A valid first invoice is required" } };
  }

  const { data: activated, error: activationError } = await supabaseAdmin
    .from("referrals")
    .update({ status: "activated", activated_at: new Date().toISOString() })
    .eq("referred_user_id", user.id)
    .eq("status", "pending")
    .select("referrer_id, program")
    .maybeSingle();
  if (activationError) throw activationError;
  if (!activated) return { status: 200, body: { activated: false, reason: "not_pending" } };

  // The referred person earns seven extra Pro trial days after real activation.
  const referredTrialEnd = await extendTrial(user.id, 7);

  const { count, error: countError } = await supabaseAdmin
    .from("referrals")
    .select("id", { count: "exact", head: true })
    .eq("referrer_id", activated.referrer_id)
    .eq("status", "activated")
    .eq("program", activated.program);
  if (countError) throw countError;

  let reward = null;
  if (activated.program === "member" && (count || 0) > 0 && count % 3 === 0) {
    const milestone = count / 3;
    const { data: createdReward, error: rewardError } = await supabaseAdmin
      .from("referral_rewards")
      .insert({ user_id: activated.referrer_id, milestone, reward_days: 30, status: "banked" })
      .select("id, reward_days")
      .maybeSingle();

    if (rewardError && rewardError.code !== "23505") throw rewardError;
    if (createdReward) {
      const { data: referrerPlan, error: planError } = await supabaseAdmin
        .from("user_plans")
        .select("plan")
        .eq("user_id", activated.referrer_id)
        .maybeSingle();
      if (planError) throw planError;

      if (!referrerPlan || referrerPlan.plan === "free") {
        const rewardTrialEnd = await extendTrial(activated.referrer_id, 30);
        const { error: applyError } = await supabaseAdmin
          .from("referral_rewards")
          .update({ status: "applied", applied_at: new Date().toISOString() })
          .eq("id", createdReward.id);
        if (applyError) throw applyError;
        reward = { days: 30, status: "applied", trialEnd: rewardTrialEnd };
      } else {
        reward = { days: 30, status: "banked" };
      }
    }
  }

  return {
    status: 200,
    body: { activated: true, referredBonusDays: 7, referredTrialEnd, activatedCount: count || 0, reward },
  };
}

async function redeemBankedRewards(userId) {
  const { data: planRow, error: planError } = await supabaseAdmin
    .from("user_plans")
    .select("plan")
    .eq("user_id", userId)
    .maybeSingle();
  if (planError) throw planError;
  if (planRow && planRow.plan !== "free") {
    return { status: 409, body: { error: "Banked days can be redeemed when your paid plan ends" } };
  }

  const { data: claimed, error: claimError } = await supabaseAdmin
    .from("referral_rewards")
    .update({ status: "applying" })
    .eq("user_id", userId)
    .eq("status", "banked")
    .select("id, reward_days");
  if (claimError) throw claimError;
  const days = (claimed || []).reduce((sum, row) => sum + Number(row.reward_days || 0), 0);
  if (!days) return { status: 200, body: { redeemed: false, days: 0 } };

  const ids = claimed.map(row => row.id);
  try {
    const trialEnd = await extendTrial(userId, days);
    const { error: finishError } = await supabaseAdmin
      .from("referral_rewards")
      .update({ status: "applied", applied_at: new Date().toISOString() })
      .in("id", ids);
    if (finishError) throw finishError;
    return { status: 200, body: { redeemed: true, days, trialEnd } };
  } catch (error) {
    await supabaseAdmin.from("referral_rewards").update({ status: "banked" }).in("id", ids);
    throw error;
  }
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  if (req.method !== "GET" && req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const action = String(req.query.action || "");
    if (req.method === "POST" && action === "track-click") {
      if (!requestOriginIsAllowed(req)) return res.status(403).json({ error: "Request origin is not allowed" });
      if (Number(req.headers["content-length"] || 0) > 1000) return res.status(413).json({ error: "Request is too large" });
      const limited = await supabaseAdmin.rpc("consume_public_form_rate_limit", {
        p_form_key: "ambassador_click_ip",
        p_actor_hash: requestActorHash(req),
        p_limit: 20,
      });
      if (limited.error) throw limited.error;
      if (limited.data !== true) return res.status(429).json({ tracked: false });
      const result = await trackAmbassadorClick(supabaseAdmin, req.body?.code, req.body?.clickToken);
      return res.status(result.status).json(result.body);
    }

    const user = await authenticatedUser(req);
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    if (req.method === "GET") {
      if (action === "ambassador-summary") return res.status(200).json(await ambassadorSummary(supabaseAdmin, user));
      if (action === "ambassador-admin-access") return res.status(200).json({ allowed:isAmbassadorAdmin(user) });
      if (action === "ambassador-admin") {
        const result = await ambassadorAdminSummary(supabaseAdmin, user);
        return res.status(result.status).json(result.body);
      }
      return res.status(200).json(await referralSummary(user.id));
    }

    let result;
    if (action === "claim") result = await claimReferral(user, req.body?.code);
    else if (action === "activate") result = await activateReferral(user);
    else if (action === "redeem") result = await redeemBankedRewards(user.id);
    else if (action === "ambassador-admin-approve") result = await approveAmbassador(supabaseAdmin, user, req.body);
    else if (action === "ambassador-admin-decline") result = await declineAmbassador(supabaseAdmin, user, req.body);
    else if (action === "ambassador-admin-resend-acceptance") result = await resendAmbassadorAcceptance(supabaseAdmin, user, req.body);
    else if (action === "ambassador-admin-update") result = await updateAmbassador(supabaseAdmin, user, req.body);
    else result = { status: 400, body: { error: "Unknown action" } };
    return res.status(result.status).json(result.body);
  } catch (error) {
    console.error("Referral API error:", error?.message || error);
    return res.status(500).json({ error: "Could not process the referral request" });
  }
}
