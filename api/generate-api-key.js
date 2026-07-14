// Fatura Pro - Generate API key (Business plan)
// يولد مفتاحاً عشوائياً، يخزن بصمته فقط، ويرجع المفتاح مرة واحدة للعرض
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    const token = (req.headers.authorization || "").replace("Bearer ", "");
    if (!token) return res.status(401).json({ error: "Not authenticated" });
    const { data: { user }, error: userErr } = await supabaseAdmin.auth.getUser(token);
    if (userErr || !user) return res.status(401).json({ error: "Invalid session" });

    // حد أقصى 3 مفاتيح لكل مستخدم
    const { count } = await supabaseAdmin
      .from("api_keys").select("id", { count: "exact", head: true })
      .eq("user_id", user.id);
    if ((count || 0) >= 3) return res.status(400).json({ error: "Key limit reached (3). Delete an old key first." });

    // توليد المفتاح: fp_live_ + 48 حرف عشوائي آمن
    const raw = "fp_live_" + crypto.randomBytes(24).toString("hex");
    const hash = crypto.createHash("sha256").update(raw).digest("hex");

    const { error } = await supabaseAdmin.from("api_keys").insert({
      user_id: user.id,
      key_hash: hash,
      key_prefix: raw.slice(0, 12) + "…",
    });
    if (error) return res.status(500).json({ error: "Could not create key" });

    // المفتاح يظهر هالمرة الوحيدة - لا يخزن ولا يسترجع أبداً
    return res.status(200).json({ key: raw });
  } catch (err) {
    console.error("generate-api-key:", err.message);
    return res.status(500).json({ error: "Something went wrong" });
  }
}
