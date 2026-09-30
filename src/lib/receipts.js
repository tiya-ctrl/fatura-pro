// Fatura Pro - Receipt photos on expenses (Business plan)
// Files are stored privately at receipts/<ownerId>/<id>.<ext> and opened with a short-lived signed URL.
import { supabase } from "../supabase";

const BUCKET = "receipts";
const MAX_BYTES = 5 * 1024 * 1024;
const MAX_SIDE = 1600;

// Shrink photos before upload so they are quick to send and cheap to keep for 7 years.
// PDFs and anything the browser cannot decode are uploaded as they are.
async function compressImage(file) {
  if (!file.type.startsWith("image/")) return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.78));
    return blob && blob.size < file.size ? blob : file;
  } catch {
    return file;
  }
}

export async function uploadReceipt(file, ownerId) {
  const body = await compressImage(file);
  if (body.size > MAX_BYTES) return { error: "too_big" };
  const type = body.type || file.type;
  const ext = type === "application/pdf" ? "pdf" : type === "image/png" ? "png" : type === "image/webp" ? "webp" : "jpg";
  const id = (window.crypto?.randomUUID?.() || Date.now().toString(36) + Math.random().toString(36).slice(2));
  const path = ownerId + "/" + id + "." + ext;
  const { error } = await supabase.storage.from(BUCKET).upload(path, body, { contentType: type, upsert: false });
  if (error) { console.error("uploadReceipt:", error.message); return { error: "upload_failed" }; }
  return { path };
}

// The tab is opened synchronously in the click so popup blockers (Safari) allow it,
// then pointed at the signed URL once it is ready.
export async function openReceipt(path) {
  const tab = window.open("", "_blank");
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, 120);
  if (error || !data?.signedUrl) {
    console.error("openReceipt:", error?.message);
    if (tab) tab.close();
    return false;
  }
  if (tab) { tab.opener = null; tab.location.href = data.signedUrl; }
  else window.location.href = data.signedUrl;
  return true;
}

// Ask the server to read an uploaded receipt. Returns the suggested fields, or null.
export async function scanReceipt(path) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) return null;
    const r = await fetch("/api/chat?action=scan-receipt", {
      method: "POST",
      headers: { Authorization: "Bearer " + session.access_token, "Content-Type": "application/json" },
      body: JSON.stringify({ path }),
    });
    if (!r.ok) return null;
    const { fields } = await r.json();
    return fields || null;
  } catch {
    return null;
  }
}

const round2 = (n) => Math.round(n * 100) / 100;

// Turn the scanned fields into form values. The form stores the amount excl. VAT and one rate;
// a receipt with mixed rates becomes the effective rate so the VAT total still matches.
export function receiptToForm(fields) {
  const out = {};
  if (!fields) return out;
  if (/^\d{4}-\d{2}-\d{2}$/.test(fields.date || "")) out.date = fields.date;
  if (fields.supplier) out.supplier = fields.supplier;
  if (fields.description) out.description = fields.description;
  if (fields.category) out.category = fields.category;
  if (/^[A-Z]{3}$/.test(fields.currency || "")) out.currency = fields.currency;

  const incl = Number(fields.amount_incl);
  const vat = Number(fields.vat_amount);
  let excl = Number(fields.amount_excl);
  let rate = fields.vat_rate === null || fields.vat_rate === undefined ? NaN : Number(fields.vat_rate);
  if (!(excl > 0) && incl > 0 && vat >= 0 && fields.vat_amount !== null) excl = incl - vat;
  if (!(excl > 0) && incl > 0 && rate >= 0) excl = incl / (1 + rate / 100);
  if (!(rate >= 0) && excl > 0 && vat >= 0 && fields.vat_amount !== null) {
    rate = round2((vat / excl) * 100);
    [21, 9, 0].forEach((r) => { if (Math.abs(rate - r) < 0.15) rate = r; });
  }
  if (excl > 0) out.amount_excl = round2(excl);
  if (rate >= 0) out.vat_rate = rate;
  return out;
}

export async function deleteReceipt(path) {
  if (!path) return;
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) console.error("deleteReceipt:", error.message);
}
