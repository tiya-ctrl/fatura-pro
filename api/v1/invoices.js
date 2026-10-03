// Fatura Pro - Public API v1: invoices (Business plan)
// GET  /api/v1/invoices        -> قائمة فواتير صاحب المفتاح
// POST /api/v1/invoices        -> إنشاء فاتورة
// المصادقة: Authorization: Bearer fp_live_xxx
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";
import { hasAdvancedAccess } from "../../server/plan-access.js";
import { nextInvoiceId } from "../../src/lib/invoiceNumber.js";

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

// No due date given: use the payment term from the settings (30 days by default).
function dueFrom(date, terms) {
  const days = terms != null && terms !== "" && Number(terms) >= 0 ? Number(terms) : 30;
  const d = new Date(date + "T00:00:00Z");
  if (Number.isNaN(d.getTime())) return null;
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().split("T")[0];
}

export default async function handler(req, res) {
  const userId = await authenticate(req);
  if (!userId) return res.status(401).json({ error: "Invalid or missing API key" });
  // Keys are kept when a plan ends, but only work again after upgrading to Advanced.
  if (!(await hasAdvancedAccess(supabaseAdmin, userId))) {
    return res.status(403).json({ error: "API access requires the Advanced plan." });
  }

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

    // Same numbering series and seller details as invoices made in the app.
    const [{ data: ownIds }, { data: profile }] = await Promise.all([
      supabaseAdmin.from("invoices").select("id").eq("user_id", userId),
      supabaseAdmin.from("business_profile").select("*").eq("user_id", userId).maybeSingle(),
    ]);
    const invoiceDate = b.date || new Date().toISOString().split("T")[0];
    const newId = () => nextInvoiceId((ownIds || []).map((inv) => inv.id), profile?.invoice_prefix);
    const row = {
      id: newId(), user_id: userId,
      seller_name: profile?.name || null, seller_email: profile?.email || null, seller_phone: profile?.phone || null,
      seller_address: profile?.address || null, seller_vat: profile?.vat_number || null, seller_country: profile?.country || null,
      bank_info: profile?.bank_info || null,
      client: String(b.client), email: b.email || null,
      date: invoiceDate,
      due: b.due || dueFrom(invoiceDate, profile?.payment_terms), status: "pending",
      amount: total, subtotal, discount_amt: discountAmt, tax_amt: taxAmt, total,
      tax, discount, notes: b.notes || null, currency: b.currency || "EUR",
      items,
    };
    let { error } = await supabaseAdmin.from("invoices").insert(row);
    for (let attempt = 0; error && error.code === "23505" && attempt < 5; attempt++) {
      await new Promise((r) => setTimeout(r, 7));
      row.id = newId();
      ({ error } = await supabaseAdmin.from("invoices").insert(row));
    }
    if (error) { console.error("api create invoice:", error.message); return res.status(500).json({ error: "Could not create invoice" }); }
    return res.status(201).json({ invoice: { id: row.id, total, currency: row.currency, status: "pending" } });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
