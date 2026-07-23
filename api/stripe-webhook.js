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
          plan: newPlan,
          updated_at: new Date().toISOString(),
        });
      }
    }
  }

  res.status(200).json({ received: true });
}
