import { AMBASSADOR_POLICY, publicAmbassadorPolicy } from "../src/lib/ambassadorPolicy.js";
import { htmlEscape, sendEmail } from "./email.js";

function normalizedEmail(value) {
  return String(value || "").trim().toLowerCase();
}

async function findUserByEmail(supabaseAdmin, email) {
  const target = normalizedEmail(email);
  for (let page = 1; page <= 10; page += 1) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw error;
    const user = data?.users?.find(item => normalizedEmail(item.email) === target);
    if (user) return user;
    if (!data?.users || data.users.length < 1000) break;
  }
  return null;
}

export function isAmbassadorAdmin(user) {
  if (!user?.email) return false;
  const configured = String(process.env.AMBASSADOR_ADMIN_EMAILS || "support@faturapro.app")
    .split(",")
    .map(normalizedEmail)
    .filter(Boolean);
  return configured.includes(normalizedEmail(user.email));
}

function ambassadorLinks(code) {
  const safeCode = encodeURIComponent(String(code || "").trim().toUpperCase());
  return {
    referral: `https://faturapro.app/?ref=${safeCode}&utm_source=ambassador&utm_medium=partner&utm_campaign=founding_ambassadors`,
    dashboard: "https://faturapro.app/ambassador",
  };
}

export function ambassadorAcceptanceEmail(application, account) {
  const links = ambassadorLinks(account?.code);
  return {
    to:application.email,
    subject:"You’re approved for the Fatūra Pro Ambassador Program",
    html:`<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:32px;color:#222"><div style="color:#a68123;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase">Fatūra Pro Ambassador Program</div><h1 style="font-size:27px;margin:12px 0">Welcome, ${htmlEscape(application.name)}.</h1><p style="line-height:1.7">Your application has been approved. Your personal tracking link is active and your private dashboard is ready.</p><div style="margin:24px 0;padding:18px;border-radius:10px;background:#f7f3e8"><b>Fixed commission terms</b><p style="margin:8px 0 0;line-height:1.7">Pro: 25% · Business: 35% · First 12 paid months of each qualified customer. Refunds, disputes and tax are excluded automatically.</p></div><div style="margin:20px 0;padding:18px;border:1px solid #e4d7b5;border-radius:10px"><b>Your personal ambassador link</b><p style="margin:9px 0 15px;word-break:break-all;font-size:13px"><a href="${htmlEscape(links.referral)}">${htmlEscape(links.referral)}</a></p><a href="${htmlEscape(links.referral)}" style="display:inline-block;background:#c9a84c;color:#000;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:700">Open personal link →</a></div><p style="margin:28px 0"><a href="${links.dashboard}" style="display:inline-block;background:#17171f;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:700">Open tracking dashboard →</a></p><p style="color:#777;font-size:12px;line-height:1.6">Sign in with ${htmlEscape(application.email)}. Your dashboard shows clicks, sign-ups, paid customers, commission and payouts while customer identities remain private.</p></div>`,
  };
}

async function deliverAmbassadorAcceptance(application, account) {
  try {
    return await sendEmail(ambassadorAcceptanceEmail(application, account));
  } catch (error) {
    console.error("Ambassador acceptance email error:", error?.message || error);
    return { sent:false, reason:"provider_rejected" };
  }
}

export async function trackAmbassadorClick(supabaseAdmin, code, clickToken) {
  const normalizedCode = String(code || "").trim().toUpperCase();
  const normalizedToken = String(clickToken || "").trim().toLowerCase();
  if (!/^FP[A-Z0-9]{8}$/.test(normalizedCode) || !/^[0-9a-f-]{36}$/.test(normalizedToken)) {
    return { status: 400, body: { error: "Invalid tracking request" } };
  }
  const now = new Date().toISOString();
  const { data: account, error } = await supabaseAdmin
    .from("ambassador_accounts")
    .select("id, status, agreement_started_at, agreement_ends_at")
    .eq("code", normalizedCode)
    .maybeSingle();
  if (error) throw error;
  if (!account || account.status !== "active") return { status: 200, body: { tracked: false } };
  if (account.agreement_started_at > now || (account.agreement_ends_at && account.agreement_ends_at <= now)) {
    return { status: 200, body: { tracked: false } };
  }
  const inserted = await supabaseAdmin.from("ambassador_clicks").insert({
    ambassador_id: account.id,
    code: normalizedCode,
    click_token: normalizedToken,
  });
  if (inserted.error && inserted.error.code !== "23505") throw inserted.error;
  return { status: 200, body: { tracked: !inserted.error } };
}

export async function ambassadorSummary(supabaseAdmin, user) {
  const { data: account, error } = await supabaseAdmin
    .from("ambassador_accounts")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();
  if (error) throw error;

  if (!account) {
    const application = await supabaseAdmin
      .from("ambassador_applications")
      .select("status, created_at")
      .eq("email", normalizedEmail(user.email))
      .maybeSingle();
    if (application.error) throw application.error;
    return { approved: false, application: application.data || null };
  }

  const [clicks, referrals, customers, ledgerTotals, commissions, payouts, paidTotal] = await Promise.all([
    supabaseAdmin.from("ambassador_clicks").select("id", { count: "exact", head: true }).eq("ambassador_id", account.id),
    supabaseAdmin.from("referrals").select("status").eq("referrer_id", user.id).eq("program", "ambassador"),
    supabaseAdmin.from("ambassador_customers").select("status, commission_ends_at").eq("ambassador_id", account.id),
    supabaseAdmin.rpc("ambassador_ledger_totals", { p_ambassador_id: account.id }),
    supabaseAdmin.from("ambassador_commissions").select("status, amount_cents, currency, earned_at, available_at, paid_at").eq("ambassador_id", account.id).order("earned_at", { ascending: false }).limit(100),
    supabaseAdmin.from("ambassador_payout_batches").select("id, amount_cents, currency, status, created_at, paid_at, failure_reason").eq("ambassador_id", account.id).order("created_at", { ascending: false }).limit(30),
    supabaseAdmin.rpc("ambassador_paid_payout_total", { p_ambassador_id: account.id }),
  ]);
  const firstError = clicks.error || referrals.error || customers.error || ledgerTotals.error || commissions.error || payouts.error || paidTotal.error;
  if (firstError) throw firstError;

  const earnings = { pending: 0, available: 0, processing: 0, paid: 0, reversed: 0 };
  for (const row of ledgerTotals.data || []) earnings[row.ledger_status] = Number(row.total_cents || 0);
  const referralRows = referrals.data || [];
  const now = new Date();
  const effectiveStatus = account.agreement_ends_at && new Date(account.agreement_ends_at) <= now ? "ended" : account.status;
  return {
    approved: true,
    account: {
      status: effectiveStatus,
      code: account.code,
      commissionMonths: AMBASSADOR_POLICY.commissionMonths,
      commissionByPlan: publicAmbassadorPolicy().plans,
      holdDays: account.hold_days,
      payoutThresholdCents: account.payout_threshold_cents,
      recoveryCents: account.recovery_cents,
      agreementStartedAt: account.agreement_started_at,
      agreementEndsAt: account.agreement_ends_at,
      payoutConnected: account.payouts_enabled,
      automaticPayouts: account.automatic_payouts,
    },
    counts: {
      clicks: clicks.count || 0,
      signups: referralRows.length,
      activated: referralRows.filter(row => row.status === "activated").length,
      paying: (customers.data || []).length,
      earningNow: (customers.data || []).filter(row => row.status === "active" && new Date(row.commission_ends_at) > now).length,
    },
    earnings,
    paidOutCents: Number(paidTotal.data || 0),
    commissions: commissions.data || [],
    payouts: payouts.data || [],
  };
}

export async function ambassadorAdminSummary(supabaseAdmin, user) {
  if (!isAmbassadorAdmin(user)) return { status: 403, body: { error: "Administrator access required" } };
  const [applications, accounts] = await Promise.all([
    supabaseAdmin.from("ambassador_applications").select("*").order("created_at", { ascending: false }),
    supabaseAdmin.from("ambassador_accounts").select("*").order("created_at", { ascending: false }),
  ]);
  if (applications.error) throw applications.error;
  if (accounts.error) throw accounts.error;

  const accountRows = await Promise.all((accounts.data || []).map(async account => {
    const [clicks, referrals, customers, ledgerTotals, paidTotal] = await Promise.all([
      supabaseAdmin.from("ambassador_clicks").select("id", { count: "exact", head: true }).eq("ambassador_id", account.id),
      supabaseAdmin.from("referrals").select("id", { count: "exact", head: true }).eq("referrer_id", account.user_id).eq("program", "ambassador"),
      supabaseAdmin.from("ambassador_customers").select("id", { count: "exact", head: true }).eq("ambassador_id", account.id),
      supabaseAdmin.rpc("ambassador_ledger_totals", { p_ambassador_id: account.id }),
      supabaseAdmin.rpc("ambassador_paid_payout_total", { p_ambassador_id: account.id }),
    ]);
    const rowError = clicks.error || referrals.error || customers.error || ledgerTotals.error || paidTotal.error;
    if (rowError) throw rowError;
    const ledger = { pending: 0, available: 0, processing: 0, paid: 0, reversed: 0 };
    for (const item of ledgerTotals.data || []) ledger[item.ledger_status] = Number(item.total_cents || 0);
    return {
      ...account,
      status: account.agreement_ends_at && new Date(account.agreement_ends_at) <= new Date() ? "ended" : account.status,
      clicks: clicks.count || 0,
      signups: referrals.count || 0,
      customers: customers.count || 0,
      ledger,
      paid_out_cents: Number(paidTotal.data || 0),
    };
  }));
  return { status: 200, body: { applications: applications.data || [], accounts: accountRows, policy: publicAmbassadorPolicy() } };
}

export async function approveAmbassador(supabaseAdmin, user, body) {
  if (!isAmbassadorAdmin(user)) return { status: 403, body: { error: "Administrator access required" } };
  const applicationId = String(body?.applicationId || "");
  const { data: application, error } = await supabaseAdmin.from("ambassador_applications").select("*").eq("id", applicationId).single();
  if (error || !application) return { status: 404, body: { error: "Application not found" } };

  const ambassadorUser = await findUserByEmail(supabaseAdmin, application.email);
  if (!ambassadorUser) {
    return { status: 409, body: { error: "Ask this applicant to create a free Fatūra Pro account with the same email before approval." } };
  }

  const code = "FP" + ambassadorUser.id.replace(/-/g, "").slice(0, 8).toUpperCase();
  const referralCode = await supabaseAdmin.from("referral_codes").upsert({ user_id: ambassadorUser.id, code }, { onConflict: "user_id" });
  if (referralCode.error) throw referralCode.error;
  const startedAt = new Date();
  const accountResult = await supabaseAdmin
    .from("ambassador_accounts")
    .upsert({
      application_id: application.id,
      user_id: ambassadorUser.id,
      code,
      status: "active",
      commission_bps: AMBASSADOR_POLICY.plans.pro.commissionBps,
      commission_months: AMBASSADOR_POLICY.commissionMonths,
      agreement_started_at: startedAt.toISOString(),
      agreement_ends_at: null,
      automatic_payouts: true,
      updated_at: startedAt.toISOString(),
    }, { onConflict: "user_id" })
    .select("*")
    .single();
  if (accountResult.error) throw accountResult.error;
  const updatedApplication = await supabaseAdmin.from("ambassador_applications").update({ status: "approved", reviewed_at: startedAt.toISOString() }).eq("id", application.id);
  if (updatedApplication.error) throw updatedApplication.error;

  const notification = await deliverAmbassadorAcceptance(application, accountResult.data);

  return { status: 200, body: { approved: true, account: accountResult.data, notification, policy: publicAmbassadorPolicy() } };
}

export async function resendAmbassadorAcceptance(supabaseAdmin, user, body) {
  if (!isAmbassadorAdmin(user)) return { status: 403, body: { error:"Administrator access required" } };
  const applicationId = String(body?.applicationId || "");
  const applicationResult = await supabaseAdmin
    .from("ambassador_applications")
    .select("*")
    .eq("id", applicationId)
    .single();
  if (applicationResult.error || !applicationResult.data) return { status:404, body:{ error:"Application not found" } };
  if (applicationResult.data.status !== "approved") return { status:409, body:{ error:"Only approved applications can receive an acceptance email" } };

  const accountResult = await supabaseAdmin
    .from("ambassador_accounts")
    .select("*")
    .eq("application_id", applicationId)
    .maybeSingle();
  if (accountResult.error) throw accountResult.error;
  if (!accountResult.data) return { status:409, body:{ error:"The ambassador account was not created. Approve the application again after checking the account email." } };

  const notification = await deliverAmbassadorAcceptance(applicationResult.data, accountResult.data);
  return { status:notification.sent ? 200 : 502, body:notification.sent
    ? { sent:true, notification }
    : { error:"The acceptance email was not sent. Check the Resend sender/domain settings, then try again.", notification } };
}

export async function declineAmbassador(supabaseAdmin, user, body) {
  if (!isAmbassadorAdmin(user)) return { status: 403, body: { error: "Administrator access required" } };
  const applicationId = String(body?.applicationId || "");
  const { data: application, error } = await supabaseAdmin
    .from("ambassador_applications")
    .select("*")
    .eq("id", applicationId)
    .single();
  if (error || !application) return { status: 404, body: { error: "Application not found" } };
  if (application.status === "approved") return { status: 409, body: { error: "An approved ambassador must be ended from Active partnerships." } };

  const reviewedAt = new Date().toISOString();
  const updated = await supabaseAdmin
    .from("ambassador_applications")
    .update({ status:"declined", reviewed_at:reviewedAt })
    .eq("id", application.id);
  if (updated.error) throw updated.error;

  let notification = { sent:false };
  try {
    notification = await sendEmail({
      to:application.email,
      subject:"Update on your Fatūra Pro ambassador application",
      html:`<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px;color:#222"><div style="color:#a68123;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase">Fatūra Pro Ambassador Program</div><h1 style="font-size:25px;margin:12px 0">Thank you, ${htmlEscape(application.name)}.</h1><p style="line-height:1.7">We reviewed your application carefully. We are keeping the first ambassador group intentionally small, and we are not able to offer a place in this round.</p><p style="line-height:1.7">This is not a judgment on the quality of your work, and you are welcome to apply again in a future intake.</p><p style="color:#777;font-size:12px;margin-top:28px">Fatūra Pro · Business without borders</p></div>`,
    });
  } catch (emailError) {
    console.error("Ambassador decline email error:", emailError?.message || emailError);
  }
  return { status: 200, body: { declined:true, notification } };
}

export async function updateAmbassador(supabaseAdmin, user, body) {
  if (!isAmbassadorAdmin(user)) return { status: 403, body: { error: "Administrator access required" } };
  const accountId = String(body?.accountId || "");
  const allowedStatus = new Set(["active", "paused", "ended"]);
  const updates = { updated_at: new Date().toISOString() };
  if (allowedStatus.has(body?.status)) updates.status = body.status;
  if (body?.automaticPayouts != null) updates.automatic_payouts = body.automaticPayouts === true;
  if (body?.agreementEndsAt) {
    const date = new Date(body.agreementEndsAt);
    if (!Number.isFinite(date.getTime()) || date <= new Date()) return { status: 400, body: { error: "Choose a future agreement end date" } };
    updates.agreement_ends_at = date.toISOString();
  }
  const result = await supabaseAdmin.from("ambassador_accounts").update(updates).eq("id", accountId).select("*").maybeSingle();
  if (result.error) throw result.error;
  if (!result.data) return { status: 404, body: { error: "Ambassador not found" } };
  return { status: 200, body: { updated: true, account: result.data } };
}
