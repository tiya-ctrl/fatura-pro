// Fatura Pro - Quotes (Business plan)
// دوال التعامل مع جدول quotes في Supabase + تحويل العرض لفاتورة

import { supabase } from "../supabase";

// تحويل صف قاعدة البيانات -> شكل الكائن المستخدم بالتطبيق
function fromRow(r) {
  return {
    id: r.id, client: r.client, email: r.email,
    sellerName: r.seller_name, sellerEmail: r.seller_email, sellerPhone: r.seller_phone, sellerAddress: r.seller_address,
    buyerPhone: r.buyer_phone, buyerAddress: r.buyer_address,
    date: r.date, validUntil: r.valid_until, status: r.status,
    amount: r.amount, subtotal: r.subtotal, discountAmt: r.discount_amt, taxAmt: r.tax_amt, total: r.total,
    tax: r.tax, discount: r.discount, notes: r.notes, bankInfo: r.bank_info,
    currency: r.currency, items: r.items || [],
    convertedInvoiceId: r.converted_invoice_id,
  };
}

// تحويل كائن التطبيق -> صف قاعدة البيانات
function toRow(q, userId) {
  return {
    id: q.id, user_id: userId, client: q.client, email: q.email,
    seller_name: q.sellerName, seller_email: q.sellerEmail, seller_phone: q.sellerPhone, seller_address: q.sellerAddress,
    buyer_phone: q.buyerPhone, buyer_address: q.buyerAddress,
    date: q.date, valid_until: q.validUntil, status: q.status,
    amount: q.amount, subtotal: q.subtotal, discount_amt: q.discountAmt, tax_amt: q.taxAmt, total: q.total,
    tax: q.tax, discount: q.discount, notes: q.notes, bank_info: q.bankInfo,
    currency: q.currency, items: q.items,
    converted_invoice_id: q.convertedInvoiceId || null,
  };
}

// تحميل كل عروض المستخدم
export async function loadQuotes(userId) {
  const { data, error } = await supabase
    .from("quotes").select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) { console.error("loadQuotes:", error.message); return []; }
  return (data || []).map(fromRow);
}

// حفظ عرض (جديد أو تعديل)
export async function saveQuote(quote, userId) {
  const { error } = await supabase.from("quotes").upsert(toRow(quote, userId));
  if (error) { console.error("saveQuote:", error.message); return false; }
  return true;
}

// حذف عرض
export async function deleteQuote(quoteId, userId) {
  const { error } = await supabase.from("quotes")
    .delete().eq("id", quoteId).eq("user_id", userId);
  if (error) { console.error("deleteQuote:", error.message); return false; }
  return true;
}

// تحويل عرض -> كائن فاتورة جاهز للحفظ بنظام الفواتير الحالي
// لا يحفظ بنفسه؛ يرجع الفاتورة والتطبيق يمررها لدالة الحفظ الموجودة أصلاً
export function quoteToInvoice(quote, invoiceId) {
  return {
    id: invoiceId,
    client: quote.client, email: quote.email,
    sellerName: quote.sellerName, sellerEmail: quote.sellerEmail, sellerPhone: quote.sellerPhone, sellerAddress: quote.sellerAddress,
    buyerPhone: quote.buyerPhone, buyerAddress: quote.buyerAddress,
    date: new Date().toISOString().split("T")[0],
    due: "", status: "pending",
    amount: quote.total, subtotal: quote.subtotal, discountAmt: quote.discountAmt, taxAmt: quote.taxAmt, total: quote.total,
    tax: quote.tax, discount: quote.discount, notes: quote.notes, bankInfo: quote.bankInfo,
    currency: quote.currency, items: quote.items,
  };
}

// توليد رقم عرض جديد: Q-001, Q-002...
export function nextQuoteId(count) {
  return "Q-" + String(count + 1).padStart(3, "0") + "-" + Date.now().toString().slice(-4);
}
