// Fatura Pro - Public API v1: invoices (Business plan)
// GET  /api/v1/invoices        -> قائمة فواتير صاحب المفتاح
// POST /api/v1/invoices        -> إنشاء فاتورة
// المصادقة: Authorization: Bearer fp_live_xxx
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function authenticate(req) {
  const raw = (req.headers.authorization || "").replace("Bearer ", "").trim();
  if (!raw || !raw.startsWith("fp_live_")) return null;
  const hash = crypto.createHash("sha256").update(raw).digest("hex");
  const { data } = await supabaseAdmin
    .from("api_keys").select("id, user_id").eq("key_hash", hash).maybeSingle();
  if (!data) return null;
  // تحديث آخر استخدام (بدون انتظار)
  supabaseAdmin.from("api_keys").update({ last_used_at: new Date().toISOString() }).eq("id", data.id).then(() => {});
  return data.user_id;
}

export default async function handler(req, res) {
  const userId = await authenticate(req);
  if (!userId) return res.status(401).json({ error: "Invalid or missing API key" });

  if (req.method === "GET") {
    const { data, error } = await supabaseAdmin
      .from("invoices")
      .select("id, client, email, date, due, status, subtotal, tax_amt, total, currency, items")
      .eq("user_id", userId)
      .order("date", { ascending: false })
      .limit(100);
    if (error) return res.status(500).json({ error: "Could not fetch invoices" });
    return res.status(200).json({ invoices: data || [] });
  }

  if (req.method === "POST") {
    const b = req.body || {};
    if (!b.client || !Array.isArray(b.items) || b.items.length === 0) {
      return res.status(400).json({ error: "Required: client (string), items (array of {desc, qty, price})" });
    }

    // الحسابات على السيرفر - لا نثق بمجاميع من الخارج
    const items = b.items.map((i) => ({ desc: String(i.desc || ""), qty: Number(i.qty) || 1, price: Number(i.price) || 0 }));
    const subtotal = items.reduce((a, i) => a + i.qty * i.price, 0);
    const discount = Number(b.discount) || 0;
    const tax = b.tax === undefined ? 21 : Number(b.tax) || 0;
    const discountAmt = subtotal * (discount / 100);
    const taxAmt = (subtotal - discountAmt) * (tax / 100);
    const total = subtotal - discountAmt + taxAmt;

    const id = "INV-API-" + Date.now().toString().slice(-6) + "-" + crypto.randomBytes(2).toString("hex").toUpperCase();
    const row = {
      id, user_id: userId,
      client: String(b.client), email: b.email || null,
      date: b.date || new Date().toISOString().split("T")[0],
      due: b.due || null, status: "pending",
      amount: total, subtotal, discount_amt: discountAmt, tax_amt: taxAmt, total,
      tax, discount, notes: b.notes || null, currency: b.currency || "EUR",
      items,
    };
    const { error } = await supabaseAdmin.from("invoices").insert(row);
    if (error) { console.error("api create invoice:", error.message); return res.status(500).json({ error: "Could not create invoice" }); }
    return res.status(201).json({ invoice: { id, total, currency: row.currency, status: "pending" } });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
