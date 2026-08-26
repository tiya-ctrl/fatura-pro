const MONTH_LIMIT = 36;

function id(value) {
  if (!value) return null;
  return typeof value === "string" ? value : value.id || null;
}

function addMonths(value, months) {
  const date = new Date(value);
  const day = date.getUTCDate();
  date.setUTCDate(1);
  date.setUTCMonth(date.getUTCMonth() + Math.max(1, Math.min(MONTH_LIMIT, Number(months) || 12)));
  const finalDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)).getUTCDate();
  date.setUTCDate(Math.min(day, finalDay));
  return date;
}

function invoicePaidAt(invoice) {
  const seconds = invoice?.status_transitions?.paid_at || invoice?.created;
  return seconds ? new Date(seconds * 1000) : new Date();
}

function commissionRevenue(invoice) {
  const candidates = [
    invoice?.total_excluding_tax,
    invoice?.subtotal_excluding_tax,
    invoice?.subtotal,
    invoice?.amount_paid,
  ];
  const amount = candidates.find(value => value != null && Number.isFinite(Number(value)) && Number(value) >= 0);
  return Math.max(0, Math.min(Number(amount || 0), Number(invoice?.amount_paid || amount || 0)));
}

async function userForStripeCustomer(stripe, supabaseAdmin, customerId) {
  if (!customerId) return null;
  const { data: plans } = await supabaseAdmin
    .from("user_plans")
    .select("user_id")
    .eq("stripe_customer", customerId)
    .limit(1);
  if (plans?.[0]?.user_id) return plans[0].user_id;

  try {
    const customer = await stripe.customers.retrieve(customerId);
    if (!customer?.email || customer.deleted) return null;
    for (let page = 1; page <= 10; page += 1) {
      const { data } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 1000 });
      const match = data?.users?.find(user => user.email?.toLowerCase() === customer.email.toLowerCase());
      if (match) return match.id;
      if (!data?.users || data.users.length < 1000) break;
    }
  } catch {}
  return null;
}

export async function recordAmbassadorCommission(stripe, supabaseAdmin, invoice) {
  if (!invoice?.id || invoice.status !== "paid" || Number(invoice.amount_paid || 0) <= 0) {
    return { created: false, reason: "not_paid" };
  }

  const referredUserId = await userForStripeCustomer(stripe, supabaseAdmin, id(invoice.customer));
  if (!referredUserId) return { created: false, reason: "customer_not_linked" };

  const { data: referral, error: referralError } = await supabaseAdmin
    .from("referrals")
    .select("id, referrer_id, program")
    .eq("referred_user_id", referredUserId)
    .eq("program", "ambassador")
    .maybeSingle();
  if (referralError) throw referralError;
  if (!referral) return { created: false, reason: "not_ambassador_referral" };

  const { data: account, error: accountError } = await supabaseAdmin
    .from("ambassador_accounts")
    .select("*")
    .eq("user_id", referral.referrer_id)
    .maybeSingle();
  if (accountError) throw accountError;
  if (!account || account.status !== "active") return { created: false, reason: "ambassador_inactive" };

  const earnedAt = invoicePaidAt(invoice);
  const agreementStart = new Date(account.agreement_started_at);
  const agreementEnd = account.agreement_ends_at ? new Date(account.agreement_ends_at) : null;
  if (earnedAt < agreementStart || (agreementEnd && earnedAt >= agreementEnd)) {
    return { created: false, reason: "outside_agreement" };
  }

  let { data: customer, error: customerError } = await supabaseAdmin
    .from("ambassador_customers")
    .select("*")
    .eq("referred_user_id", referredUserId)
    .maybeSingle();
  if (customerError) throw customerError;

  if (!customer) {
    const customerEnd = addMonths(earnedAt, account.commission_months);
    const commissionEnd = agreementEnd && agreementEnd < customerEnd ? agreementEnd : customerEnd;
    const created = await supabaseAdmin
      .from("ambassador_customers")
      .insert({
        ambassador_id: account.id,
        referral_id: referral.id,
        referred_user_id: referredUserId,
        first_paid_at: earnedAt.toISOString(),
        commission_ends_at: commissionEnd.toISOString(),
      })
      .select("*")
      .single();
    if (created.error) {
      if (created.error.code !== "23505") throw created.error;
      const retry = await supabaseAdmin.from("ambassador_customers").select("*").eq("referred_user_id", referredUserId).single();
      if (retry.error) throw retry.error;
      customer = retry.data;
    } else {
      customer = created.data;
    }
  }

  const commissionEnd = new Date(customer.commission_ends_at);
  if (earnedAt >= commissionEnd) {
    if (customer.status !== "ended") {
      await supabaseAdmin.from("ambassador_customers").update({ status: "ended" }).eq("id", customer.id);
    }
    return { created: false, reason: "commission_term_ended" };
  }

  const revenueCents = commissionRevenue(invoice);
  const amountCents = Math.floor((revenueCents * Number(account.commission_bps)) / 10000);
  if (amountCents <= 0) return { created: false, reason: "zero_commission" };
  const availableAt = new Date(earnedAt.getTime() + Number(account.hold_days || 30) * 86400000);

  const { data: commission, error } = await supabaseAdmin
    .from("ambassador_commissions")
    .insert({
      ambassador_id: account.id,
      ambassador_customer_id: customer.id,
      referred_user_id: referredUserId,
      stripe_invoice_id: invoice.id,
      stripe_subscription_id: id(invoice.subscription) || id(invoice.parent?.subscription_details?.subscription),
      stripe_charge_id: id(invoice.charge),
      currency: String(invoice.currency || "eur").toLowerCase(),
      revenue_cents: revenueCents,
      commission_bps: account.commission_bps,
      amount_cents: amountCents,
      earned_at: earnedAt.toISOString(),
      available_at: availableAt.toISOString(),
    })
    .select("id, amount_cents")
    .single();
  if (error?.code === "23505") return { created: false, reason: "already_recorded" };
  if (error) throw error;
  return { created: true, commission };
}

export async function reverseAmbassadorCommission(supabaseAdmin, stripeInvoiceId, reason = "refunded") {
  if (!stripeInvoiceId) return { reversed: false };
  const { data, error } = await supabaseAdmin.rpc("reverse_ambassador_commission", {
    p_stripe_invoice_id: stripeInvoiceId,
    p_reason: reason,
  });
  if (error) throw error;
  return { reversed: data === true };
}

async function payProcessingBatch(stripe, supabaseAdmin, batch) {
  const { data: account, error } = await supabaseAdmin
    .from("ambassador_accounts")
    .select("stripe_connected_account_id, payouts_enabled")
    .eq("id", batch.ambassador_id)
    .single();
  if (error) throw error;
  if (!account?.stripe_connected_account_id || !account.payouts_enabled) return { paid: false, reason: "payout_account_not_ready" };

  try {
    const transfer = await stripe.transfers.create({
      amount: batch.amount_cents,
      currency: batch.currency,
      destination: account.stripe_connected_account_id,
      transfer_group: `ambassador_${batch.id}`,
      metadata: { ambassador_payout_batch_id: batch.id },
    }, { idempotencyKey: `ambassador-payout-${batch.id}` });
    const completed = await supabaseAdmin.rpc("complete_ambassador_payout_batch", {
      p_batch_id: batch.id,
      p_stripe_transfer_id: transfer.id,
    });
    if (completed.error) throw completed.error;
    return { paid: true, amount: batch.amount_cents, transferId: transfer.id };
  } catch (error) {
    await supabaseAdmin.from("ambassador_payout_batches").update({
      attempts: Number(batch.attempts || 0) + 1,
      last_attempt_at: new Date().toISOString(),
      failure_reason: String(error?.message || "Payout attempt failed").slice(0, 500),
    }).eq("id", batch.id).eq("status", "processing");
    return { paid: false, reason: "stripe_transfer_failed" };
  }
}

export async function runAutomaticAmbassadorPayouts(stripe, supabaseAdmin) {
  const results = [];
  const { data: accounts, error } = await supabaseAdmin
    .from("ambassador_accounts")
    .select("id")
    .eq("automatic_payouts", true)
    .eq("payouts_enabled", true);
  if (error) throw error;

  for (const account of accounts || []) {
    const existing = await supabaseAdmin
      .from("ambassador_payout_batches")
      .select("*")
      .eq("ambassador_id", account.id)
      .eq("status", "processing")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (existing.error) throw existing.error;
    if (existing.data) {
      results.push(await payProcessingBatch(stripe, supabaseAdmin, existing.data));
      continue;
    }

    const eligible = await supabaseAdmin
      .from("ambassador_commissions")
      .select("currency")
      .eq("ambassador_id", account.id)
      .in("status", ["pending", "available"])
      .lte("available_at", new Date().toISOString());
    if (eligible.error) throw eligible.error;
    const currencies = [...new Set((eligible.data || []).map(row => row.currency))];

    for (const currency of currencies) {
      const claimed = await supabaseAdmin.rpc("claim_ambassador_payout_batch", {
        p_ambassador_id: account.id,
        p_currency: currency,
      });
      if (claimed.error) throw claimed.error;
      const row = claimed.data?.[0];
      if (!row) continue;
      const batch = {
        id: row.batch_id,
        ambassador_id: account.id,
        amount_cents: row.batch_amount_cents,
        currency,
        attempts: 0,
      };
      results.push(await payProcessingBatch(stripe, supabaseAdmin, batch));
    }
  }
  return results;
}


