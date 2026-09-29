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

export async function deleteReceipt(path) {
  if (!path) return;
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) console.error("deleteReceipt:", error.message);
}
