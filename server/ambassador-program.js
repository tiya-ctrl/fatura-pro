function normalizedEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function numberBetween(value, min, max, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(min, Math.min(max, Math.round(number))) : fallback;
}

function addMonths(value, months) {
  const date = new Date(value);
  const day = date.getUTCDate();
  date.setUTCDate(1);
  date.setUTCMonth(date.getUTCMonth() + months);
  const finalDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)).getUTCDate();
  date.setUTCDate(Math.min(day, finalDay));
  return date;
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
      commissionPercent: account.commission_bps / 100,
      commissionMonths: account.commission_months,
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
  return { status: 200, body: { applications: applications.data || [], accounts: accountRows } };
}

export async function approveAmbassador(supabaseAdmin, user, body) {
  if (!isAmbassadorAdmin(user)) return { status: 403, body: { error: "Administrator access required" } };
  const applicationId = String(body?.applicationId || "");
  const commissionBps = numberBetween(Number(body?.commissionPercent) * 100, 500, 5000, 2500);
  const commissionMonths = numberBetween(body?.commissionMonths, 1, 36, 12);
  const agreementMonths = numberBetween(body?.agreementMonths, 1, 36, 12);
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
  const endsAt = addMonths(startedAt, agreementMonths);
  const accountResult = await supabaseAdmin
    .from("ambassador_accounts")
    .upsert({
      application_id: application.id,
      user_id: ambassadorUser.id,
      code,
      status: "active",
      commission_bps: commissionBps,
      commission_months: commissionMonths,
      agreement_started_at: startedAt.toISOString(),
      agreement_ends_at: endsAt.toISOString(),
      automatic_payouts: true,
      updated_at: startedAt.toISOString(),
    }, { onConflict: "user_id" })
    .select("*")
    .single();
  if (accountResult.error) throw accountResult.error;
  const updatedApplication = await supabaseAdmin.from("ambassador_applications").update({ status: "approved", reviewed_at: startedAt.toISOString() }).eq("id", application.id);
  if (updatedApplication.error) throw updatedApplication.error;

  return { status: 200, body: { approved: true, account: accountResult.data } };
}

export async function updateAmbassador(supabaseAdmin, user, body) {
  if (!isAmbassadorAdmin(user)) return { status: 403, body: { error: "Administrator access required" } };
  const accountId = String(body?.accountId || "");
  const allowedStatus = new Set(["active", "paused", "ended"]);
  const updates = { updated_at: new Date().toISOString() };
  if (allowedStatus.has(body?.status)) updates.status = body.status;
  if (body?.commissionPercent != null) updates.commission_bps = numberBetween(Number(body.commissionPercent) * 100, 500, 5000, 2500);
  if (body?.commissionMonths != null) updates.commission_months = numberBetween(body.commissionMonths, 1, 36, 12);
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
