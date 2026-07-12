// Fatura Pro - Business Plan Feature Flag
// المفتاح الرئيسي: false = كل ميزات Business مخفية تماماً
// يوم الإطلاق فقط نغيره إلى true
export const BUSINESS_ENABLED = false;

// يتحقق إذا المستخدم يشوف ميزات Business
export function hasBusinessAccess(plan) {
  return BUSINESS_ENABLED && plan === "business";
}
