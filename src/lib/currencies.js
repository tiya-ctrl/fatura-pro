// Fatura Pro - shared currency list and formatter
// Used by invoices, quotes and expenses so every page offers the same currencies.
// Amounts are NEVER converted between currencies anywhere in the app.

export const CURRENCIES = [
  { group: "Global", items: [
    { value: "USD", label: "USD - US Dollar", symbol: "$", locale: "en-US" },
    { value: "EUR", label: "EUR - Euro", symbol: "\u20ac", locale: "de-DE" },
    { value: "GBP", label: "GBP - British Pound", symbol: "\u00a3", locale: "en-GB" },
  ]},
  { group: "Middle East", items: [
    { value: "AED", label: "AED - UAE Dirham", symbol: "\u062f.\u0625", locale: "ar-AE" },
    { value: "SAR", label: "SAR - Saudi Riyal", symbol: "\ufdfc", locale: "ar-SA" },
    { value: "QAR", label: "QAR - Qatari Riyal", symbol: "\u0631.\u0642", locale: "ar-QA" },
    { value: "KWD", label: "KWD - Kuwaiti Dinar", symbol: "\u062f.\u0643", locale: "ar-KW" },
    { value: "YER", label: "YER - Yemeni Rial", symbol: "\ufdfc", locale: "ar-YE" },
  ]},
  { group: "Africa", items: [
    { value: "MAD", label: "MAD - Moroccan Dirham", symbol: "\u062f.\u0645", locale: "ar-MA" },
    { value: "DZD", label: "DZD - Algerian Dinar", symbol: "\u062f\u062c", locale: "ar-DZ" },
    { value: "TND", label: "TND - Tunisian Dinar", symbol: "\u062f.\u062a", locale: "ar-TN" },
    { value: "EGP", label: "EGP - Egyptian Pound", symbol: "\u062c.\u0645", locale: "ar-EG" },
  ]},
  { group: "Asia", items: [
    { value: "TRY", label: "TRY - Turkish Lira", symbol: "\u20ba", locale: "tr-TR" },
    { value: "JPY", label: "JPY - Japanese Yen", symbol: "\u00a5", locale: "ja-JP" },
    { value: "CNY", label: "CNY - Chinese Yuan", symbol: "\u00a5", locale: "zh-CN" },
    { value: "KRW", label: "KRW - Korean Won", symbol: "\u20a9", locale: "ko-KR" },
    { value: "MYR", label: "MYR - Malaysian Ringgit", symbol: "RM", locale: "ms-MY" },
    { value: "IDR", label: "IDR - Indonesian Rupiah", symbol: "Rp", locale: "id-ID" },
  ]},
];

export const ALL_CURRENCIES = CURRENCIES.flatMap(g => g.items);
export const getCurrency = (code) => ALL_CURRENCIES.find(c => c.value === code) || ALL_CURRENCIES[0];

export const fmtCurrency = (n, currencyCode) => {
  if (!currencyCode) currencyCode = "EUR";
  const cur = getCurrency(currencyCode);
  const isRTL = ["AED","SAR","QAR","KWD","YER","MAD","DZD","TND","EGP"].includes(currencyCode);
  const noDecimals = ["JPY","KRW","IDR"].includes(currencyCode);
  const num = Number(n).toLocaleString(cur.locale, {
    minimumFractionDigits: noDecimals ? 0 : 2,
    maximumFractionDigits: noDecimals ? 0 : 2
  });
  return isRTL ? (num + " " + cur.symbol) : (cur.symbol + num);
};

// Currency codes actually used in a list of documents, most-used first.
export const codesUsed = (list, fallback) => {
  const map = {};
  (list || []).forEach((x) => { const c = x.currency || fallback || "EUR"; map[c] = (map[c] || 0) + 1; });
  const codes = Object.keys(map).sort((a, b) => map[b] - map[a]);
  return codes.length ? codes : [fallback || "EUR"];
};
