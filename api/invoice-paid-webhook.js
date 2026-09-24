// Fatura Pro - Invoice payment webhook (Business plan)
// Stripe ينادي هذا الرابط عند اكتمال دفع فاتورة (أحداث حسابات Connect)
// المصدر الموثوق الوحيد لتعليم الفاتورة paid
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export const config = { api: { bodyParser: false } };

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabaseAdmin = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function buffer(readable) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    readable.on("data", (chunk) => chunks.push(chunk));
    readable.on("end", () => resolve(Buffer.concat(chunks)));
    readable.on("error", reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const buf = await buffer(req);
  const sig = req.headers["stripe-signature"];
  let event;
  try {
    // توقيع منفصل خاص بهذا الـ webhook (غير حق الاشتراكات)
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_INVOICE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send("Webhook Error: " + err.message);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const invoiceId = session.metadata?.invoice_id;

    // ندفع فقط الجلسات المدفوعة فعلاً وفيها فاتورتنا
    if (invoiceId && session.payment_status === "paid") {
      // The payment must have gone to the Stripe account of the invoice's owner.
      // Without this check, another seller could put someone else's invoice id
      // in their own checkout and mark that invoice as paid.
      const { data: inv } = await supabaseAdmin
        .from("invoices").select("user_id").eq("id", invoiceId).maybeSingle();
      const { data: acct } = inv
        ? await supabaseAdmin.from("stripe_accounts").select("stripe_account_id").eq("user_id", inv.user_id).maybeSingle()
        : { data: null };
      if (!event.account || !acct?.stripe_account_id || acct.stripe_account_id !== event.account) {
        console.error("invoice-paid-webhook: account mismatch for", invoiceId, "event account", event.account || "none");
        return res.status(200).json({ received: true, ignored: true });
      }

      const { error } = await supabaseAdmin
        .from("invoices")
        .update({ status: "paid" })
        .eq("id", invoiceId)
        .neq("status", "paid"); // idempotent: لا يعيد تحديث المدفوعة
      if (error) console.error("invoice-paid-webhook update:", error.message);
      else console.log("Invoice marked paid:", invoiceId);
    }
  }

  // نرد 200 دائماً على الأحداث المفهومة حتى لا يعيد Stripe الإرسال بلا نهاية
  return res.status(200).json({ received: true });
}
