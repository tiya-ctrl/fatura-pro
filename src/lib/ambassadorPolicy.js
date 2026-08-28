export const AMBASSADOR_POLICY = Object.freeze({
  commissionMonths: 12,
  plans: Object.freeze({
    pro: Object.freeze({ label: "Pro", commissionBps: 2500, commissionPercent: 25 }),
    business: Object.freeze({ label: "Business", commissionBps: 3500, commissionPercent: 35 }),
  }),
});

export function ambassadorPlanPolicy(plan) {
  return AMBASSADOR_POLICY.plans[String(plan || "").toLowerCase()] || null;
}

function boundedInteger(value, min, max, fallback) {
  if (value == null || value === "") return fallback;
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.max(min, Math.min(max, Math.round(number)));
}

export function ambassadorAccountPolicy(account = {}) {
  const proBps = boundedInteger(account.commission_bps, 500, 5000, AMBASSADOR_POLICY.plans.pro.commissionBps);
  const businessBps = boundedInteger(account.business_commission_bps, 500, 5000, AMBASSADOR_POLICY.plans.business.commissionBps);
  return {
    commissionMonths: boundedInteger(account.commission_months, 1, 36, AMBASSADOR_POLICY.commissionMonths),
    plans: {
      pro: { ...AMBASSADOR_POLICY.plans.pro, commissionBps:proBps, commissionPercent:proBps / 100 },
      business: { ...AMBASSADOR_POLICY.plans.business, commissionBps:businessBps, commissionPercent:businessBps / 100 },
    },
  };
}

export function publicAmbassadorPolicy() {
  return {
    commissionMonths: AMBASSADOR_POLICY.commissionMonths,
    plans: Object.fromEntries(Object.entries(AMBASSADOR_POLICY.plans).map(([key, value]) => [key, { ...value }])),
  };
}
