// Fatura Pro - Business Plan Feature Flag
// المفتاح الرئيسي: false = كل ميزات Business مخفية تماماً
// يوم الإطلاق فقط نغيره إلى true
export const BUSINESS_ENABLED = true;

// Temporary, while Stripe payments are paused: the 7-day Advanced trial starts without a
// card (database function start_advanced_trial) instead of through the Stripe checkout.
// Set to false to go back to the Stripe trial; nothing else needs to change.
export const ADVANCED_TRIAL_NO_CARD = true;

// Temporary: no payment provider is connected. Paid checkout and "Connect Stripe" are
// replaced by a "payments available soon" notice. Set to false when payments are back.
export const PAYMENTS_PAUSED = true;

// يتحقق إذا المستخدم يشوف ميزات Business
export function hasBusinessAccess(plan) {
  return BUSINESS_ENABLED && plan === "business";
}
