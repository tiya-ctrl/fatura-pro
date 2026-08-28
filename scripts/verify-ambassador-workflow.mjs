import assert from "node:assert/strict";
import { ambassadorCommissionTerms } from "../server/ambassador-commissions.js";
import { ambassadorAcceptanceEmail, approveAmbassador, resendAmbassadorAcceptance } from "../server/ambassador-program.js";
import { ambassadorAdminEmails } from "../server/email.js";

process.env.AMBASSADOR_ADMIN_EMAILS = "owner@example.com, owner@example.com";
process.env.RESEND_API_KEY = "test-only";
process.env.STRIPE_PRICE_BUSINESS = "price_business";
process.env.STRIPE_PRICE_PRO = "price_pro";

assert.deepEqual(ambassadorAdminEmails(), ["owner@example.com"]);
assert.equal(ambassadorCommissionTerms({ lines:{ data:[{ price:{ id:"price_pro", unit_amount:900 } }] } }, "business").policy.commissionBps, 2500);
assert.equal(ambassadorCommissionTerms({ lines:{ data:[{ price:{ id:"price_business", unit_amount:1900 } }] } }, "pro").policy.commissionBps, 3500);
assert.equal(ambassadorCommissionTerms({ lines:{ data:[] } }, "business").policy.commissionBps, 3500);

let savedAccount = null;
let emailPayload = null;
global.fetch = async (_url, options) => {
  emailPayload = JSON.parse(options.body);
  return { ok:true, json:async () => ({ id:"email_test" }) };
};

const application = {
  id:"application-1",
  name:"Test Creator",
  email:"creator@example.com",
  status:"pending",
};

function chain(result) {
  const builder = {
    select() { return builder; },
    eq() { return builder; },
    maybeSingle:async () => result,
    single:async () => result,
  };
  return builder;
}

const supabase = {
  auth:{ admin:{ listUsers:async () => ({ data:{ users:[{ id:"11111111-2222-3333-4444-555555555555", email:application.email }] } }) } },
  from(table) {
    if (table === "ambassador_applications") return {
      select:() => chain({ data:application, error:null }),
      update:() => ({ eq:async () => ({ error:null }) }),
    };
    if (table === "referral_codes") return { upsert:async () => ({ error:null }) };
    if (table === "ambassador_accounts") return {
      upsert(values) {
        savedAccount = values;
        return chain({ data:{ id:"account-1", ...values }, error:null });
      },
    };
    throw new Error(`Unexpected table: ${table}`);
  },
};

const result = await approveAmbassador(supabase, { email:"owner@example.com" }, { applicationId:application.id, commissionPercent:5, commissionMonths:36 });
assert.equal(result.status, 200);
assert.equal(savedAccount.commission_bps, 2500);
assert.equal(savedAccount.commission_months, 12);
assert.equal(savedAccount.agreement_ends_at, null);
assert.equal(savedAccount.automatic_payouts, true);
assert.equal(emailPayload.to, application.email);
assert.match(emailPayload.html, /Pro: 25% · Business: 35% · First 12 paid months/);
assert.match(emailPayload.html, /\?ref=FP11111111&amp;utm_source=ambassador/);
assert.match(emailPayload.html, /https:\/\/faturapro\.app\/ambassador/);

const acceptance = ambassadorAcceptanceEmail(application, { code:"FP11111111" });
assert.match(acceptance.html, /Open personal link/);
assert.match(acceptance.html, /Open tracking dashboard/);

const approvedApplication = { ...application, status:"approved" };
const resendSupabase = {
  from(table) {
    if (table === "ambassador_applications") return { select:() => chain({ data:approvedApplication, error:null }) };
    if (table === "ambassador_accounts") return { select:() => chain({ data:{ id:"account-1", application_id:application.id, code:"FP11111111", status:"active" }, error:null }) };
    throw new Error(`Unexpected resend table: ${table}`);
  },
};
const resent = await resendAmbassadorAcceptance(resendSupabase, { email:"owner@example.com" }, { applicationId:application.id });
assert.equal(resent.status, 200);
assert.equal(resent.body.sent, true);

console.log("Ambassador workflow verified: fixed plan rates, 12-month term, admin recipients, personal link, dashboard and approval email.");
