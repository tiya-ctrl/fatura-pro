import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export const config = {
  api: {
    bodyParser: false,
  },
};

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
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  const buf = await buffer(req);
  const sig = req.headers["stripe-signature"];

  let event;
  try {
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const email = session.customer_details?.email;

    if (email || session.client_reference_id) {
      const { data: users } = await supabaseAdmin.auth.admin.listUsers();
      let user = null;
      const refId = session.client_reference_id;
      if (refId) {
        try {
          const r = await supabaseAdmin.auth.admin.getUserById(refId);
          if (r && r.data && r.data.user) user = r.data.user;
        } catch (e) {}
      }
      if (!user && email) user = users.users.find(u => u.email === email);

      if (user) {
        let newPlan = "pro";
        try {
          const items = await stripe.checkout.sessions.listLineItems(session.id, { limit: 1 });
          const li = items.data[0];
          const pid = li && li.price ? li.price.id : null;
          const amt = li && li.price ? li.price.unit_amount : null;
          if ((process.env.STRIPE_PRICE_BUSINESS && pid === process.env.STRIPE_PRICE_BUSINESS) || amt === 1900) newPlan = "business";
          console.log("PLAN MAP:", JSON.stringify({ pid: pid, amt: amt, envPrice: process.env.STRIPE_PRICE_BUSINESS, newPlan: newPlan }));
        } catch (e) {}
        await supabaseAdmin.from("user_plans").upsert({
          user_id: user.id,
          email: user.email,
          stripe_customer: session.customer || null,
          plan: newPlan,
          updated_at: new Date().toISOString(),
        });
      }
    }
  }

  if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
    const sub = event.data.object;
    const custId = sub.customer;
    let target = null;
    try {
      const { data: rows } = await supabaseAdmin.from("user_plans").select("user_id").eq("stripe_customer", custId).limit(1);
      if (rows && rows.length) target = rows[0].user_id;
    } catch (e) {}
    if (!target) {
      try {
        const cust = await stripe.customers.retrieve(custId);
        if (cust && cust.email) {
          const { data: users } = await supabaseAdmin.auth.admin.listUsers();
          const u = users.users.find(x => x.email === cust.email);
          if (u) target = u.id;
        }
      } catch (e) {}
    }
    if (target) {
      let newPlan = "free";
      if (event.type === "customer.subscription.updated" && sub.status !== "canceled" && sub.status !== "unpaid") {
        const it = sub.items && sub.items.data && sub.items.data[0];
        const pid = it && it.price ? it.price.id : null;
        const amt = it && it.price ? it.price.unit_amount : null;
        newPlan = ((process.env.STRIPE_PRICE_BUSINESS && pid === process.env.STRIPE_PRICE_BUSINESS) || amt === 1900) ? "business" : "pro";
      }
      console.log("SUB EVENT:", event.type, custId, "->", newPlan);
      await supabaseAdmin.from("user_plans").update({ plan: newPlan, stripe_customer: custId, updated_at: new Date().toISOString() }).eq("user_id", target);

      // ---------------- CANCEL EMAIL ----------------
      // Sent the moment the customer clicks cancel in the Stripe portal.
      // Stripe includes previous_attributes only for fields that changed,
      // so its presence tells us this is the actual flip (no duplicate sends).
      try {
        const prevAttrs = (event.data && event.data.previous_attributes) || {};
        const flipped = Object.prototype.hasOwnProperty.call(prevAttrs, "cancel_at_period_end");
        if (event.type === "customer.subscription.updated" && sub.cancel_at_period_end === true && flipped) {

          const item0 = sub.items && sub.items.data && sub.items.data[0];
          const endTs = sub.cancel_at || sub.current_period_end || (item0 && item0.current_period_end) || null;
          const endDate = endTs
            ? new Date(endTs * 1000).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
            : "the end of your current billing period";

          const planName = newPlan === "business" ? "Business" : "Pro";

          let to = null;
          try {
            const { data: ud } = await supabaseAdmin.auth.admin.getUserById(target);
            if (ud && ud.user && ud.user.email) to = ud.user.email;
          } catch (e) {}
          if (!to) {
            try {
              const c = await stripe.customers.retrieve(custId);
              if (c && c.email) to = c.email;
            } catch (e) {}
          }

          if (to && process.env.RESEND_API_KEY) {
            const html = [
              '<div style="background:#0d0d0d;padding:32px 16px;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">',
              '<div style="max-width:520px;margin:0 auto;background:#141414;border:1px solid #2a2a2a;border-radius:12px;padding:32px;">',
              '<div style="color:#d4af37;font-size:20px;font-weight:600;letter-spacing:0.5px;">Fat&umacr;ra Pro</div>',
              '<div style="height:1px;background:#2a2a2a;margin:20px 0 24px;"></div>',
              '<h1 style="color:#ffffff;font-size:20px;margin:0 0 16px;font-weight:600;">Your cancellation is confirmed</h1>',
              '<p style="color:#c9c9c9;font-size:15px;line-height:1.6;margin:0 0 16px;">',
              'You will keep full access to your <strong style="color:#d4af37;">' + planName + '</strong> plan until ',
              '<strong style="color:#ffffff;">' + endDate + '</strong>. You will not be charged again.',
              '</p>',
              '<p style="color:#c9c9c9;font-size:15px;line-height:1.6;margin:0 0 16px;">',
              'After that date your account moves to the Free plan. <strong style="color:#ffffff;">Nothing is deleted</strong> &mdash; ',
              'your invoices, clients and settings stay exactly where they are. The Free plan includes 20 invoices and 5 clients.',
              '</p>',
              '<p style="color:#c9c9c9;font-size:15px;line-height:1.6;margin:0 0 24px;">',
              'Changed your mind? You can restart your subscription any time from <strong style="color:#ffffff;">Settings &rarr; Subscription</strong> inside the app.',
              '</p>',
              '<a href="https://faturapro.app/app" style="display:inline-block;background:#d4af37;color:#0d0d0d;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;font-size:15px;">Open Fat&umacr;ra Pro</a>',
              '<div style="height:1px;background:#2a2a2a;margin:28px 0 20px;"></div>',
              '<p style="color:#7a7a7a;font-size:13px;line-height:1.6;margin:0;">',
              'If you cancelled by mistake, or something in the app did not work for you, just reply to this email or write to ',
              '<a href="mailto:support@faturapro.app" style="color:#d4af37;text-decoration:none;">support@faturapro.app</a>. We read every message.',
              '</p>',
              '</div></div>'
            ].join("");

            const r = await fetch("https://api.resend.com/emails", {
              method: "POST",
              headers: {
                "Authorization": "Bearer " + process.env.RESEND_API_KEY,
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                from: process.env.RESEND_FROM || "Fatura Pro <noreply@faturapro.app>",
                to: [to],
                subject: "Your Fatura Pro subscription has been cancelled",
                html: html
              })
            });
            console.log("CANCEL EMAIL:", to, "status", r.status);
          } else {
            console.log("CANCEL EMAIL SKIPPED - to:", to, "key present:", !!process.env.RESEND_API_KEY);
          }
        }
      } catch (e) {
        console.log("CANCEL EMAIL ERROR:", e && e.message);
      }
      // -------------- /CANCEL EMAIL ----------------
    }
  }

  res.status(200).json({ received: true });
}
