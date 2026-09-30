// Fatura Pro - Read a receipt photo/PDF and suggest the expense fields (Advanced plan)
// POST /api/scan-receipt  { path: "<owner id>/<file>" }  with the user's Supabase access token.
// The file must already be in the private "receipts" bucket, in the caller's own or team owner's folder.
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";
import { hasAdvancedAccess } from "../server/plan-access.js";

const supabaseAdmin = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const CATEGORIES = ["software", "hardware", "office", "travel", "marketing", "services", "other"];
const MEDIA_TYPES = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp", pdf: "application/pdf" };

const RATE_LIMIT = 30;                  // scans per user
const RATE_WINDOW_MS = 60 * 60 * 1000;  // per hour
const hits = new Map();
function rateLimited(userId) {
  const now = Date.now();
  const list = (hits.get(userId) || []).filter((t) => now - t < RATE_WINDOW_MS);
  list.push(now);
  hits.set(userId, list);
  return list.length > RATE_LIMIT;
}

const nullable = (type) => ({ type: [type, "null"] });
const RECEIPT_SCHEMA = {
  type: "object",
  properties: {
    is_receipt: { type: "boolean" },
    date: nullable("string"),
    supplier: nullable("string"),
    description: nullable("string"),
    category: { type: "string", enum: CATEGORIES },
    currency: nullable("string"),
    amount_excl: nullable("number"),
    vat_amount: nullable("number"),
    amount_incl: nullable("number"),
    vat_rate: nullable("number"),
  },
  required: ["is_receipt", "date", "supplier", "description", "category", "currency", "amount_excl", "vat_amount", "amount_incl", "vat_rate"],
  additionalProperties: false,
};

const INSTRUCTIONS = `You read a purchase receipt or supplier invoice for a small business's expense records (often Dutch: "btw", "totaal", "excl./incl.").
Return the fields exactly as printed on the document; do not guess numbers that are not there.
- is_receipt: false if the image is not a receipt or invoice (then leave the other fields null, category "other").
- date: purchase/invoice date as YYYY-MM-DD.
- supplier: the shop or company that issued it.
- description: a short label for what was bought, max 6 words, in the document's language (e.g. "Kantoorartikelen", "Adobe abonnement").
- category: the best fit from the list.
- currency: ISO 4217 code (EUR for "€").
- amount_excl, vat_amount, amount_incl: totals for the whole document. If only two are printed, leave the third null.
- vat_rate: the VAT percentage when a single rate applies (e.g. 21, 9, 0). If several rates are mixed, or none is shown, null.`;

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const token = (req.headers.authorization || "").replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Not authenticated" });
  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
  if (authError || !user) return res.status(401).json({ error: "Invalid session" });

  const path = String((req.body || {}).path || "");
  const [folder, file] = path.split("/");
  const ext = (file || "").split(".").pop().toLowerCase();
  if (!folder || !file || path.split("/").length !== 2 || !MEDIA_TYPES[ext]) {
    return res.status(400).json({ error: "Invalid receipt" });
  }

  // Same rule as the storage policies: your own folder, or your team owner's.
  let ownerId = user.id;
  if (folder !== user.id) {
    const { data: membership } = await supabaseAdmin
      .from("team_members").select("owner_id")
      .eq("member_user_id", user.id).eq("status", "active").maybeSingle();
    if (!membership || membership.owner_id !== folder) return res.status(403).json({ error: "Forbidden" });
    ownerId = membership.owner_id;
  }
  if (!(await hasAdvancedAccess(supabaseAdmin, ownerId))) return res.status(403).json({ error: "Plan required" });
  if (rateLimited(user.id)) return res.status(429).json({ error: "Too many scans. Please try again later." });

  const { data: blob, error: downloadError } = await supabaseAdmin.storage.from("receipts").download(path);
  if (downloadError || !blob) return res.status(404).json({ error: "Receipt not found" });
  const data = Buffer.from(await blob.arrayBuffer()).toString("base64");
  const mediaType = MEDIA_TYPES[ext];
  const source = mediaType === "application/pdf"
    ? { type: "document", source: { type: "base64", media_type: mediaType, data } }
    : { type: "image", source: { type: "base64", media_type: mediaType, data } };

  try {
    const response = await anthropic.beta.messages.create({
      model: "claude-opus-5-5",
      max_tokens: 2000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "low", format: { type: "json_schema", schema: RECEIPT_SCHEMA } },
      system: INSTRUCTIONS,
      messages: [{ role: "user", content: [source, { type: "text", text: "Read this receipt." }] }],
    });

    if (response.stop_reason !== "end_turn") {
      console.error("scan-receipt stop_reason", response.stop_reason);
      return res.status(422).json({ error: "Could not read this receipt" });
    }
    const text = response.content.find((b) => b.type === "text");
    const fields = text ? JSON.parse(text.text) : null;
    if (!fields || !fields.is_receipt) return res.status(422).json({ error: "Not a receipt" });
    return res.status(200).json({ fields });
  } catch (e) {
    if (e instanceof Anthropic.RateLimitError) return res.status(429).json({ error: "Busy, please try again in a minute" });
    console.error("scan-receipt upstream error", e instanceof Anthropic.APIError ? e.status : e.message);
    return res.status(502).json({ error: "Receipt reading is unavailable right now" });
  }
}
