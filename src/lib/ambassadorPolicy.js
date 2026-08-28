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

export function publicAmbassadorPolicy() {
  return {
    commissionMonths: AMBASSADOR_POLICY.commissionMonths,
    plans: Object.fromEntries(Object.entries(AMBASSADOR_POLICY.plans).map(([key, value]) => [key, { ...value }])),
  };
}
