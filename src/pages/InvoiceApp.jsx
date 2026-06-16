import React, { useState, useRef, useEffect } from "react";

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');`;

const STYLES = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'DM Sans', sans-serif; background: #0a0a0f; color: #e8e4dc; -webkit-text-size-adjust: 100%; }
  :root {
    --gold: #c9a84c; --gold-light: #e8c97a; --gold-dim: rgba(201,168,76,0.15);
    --bg: #0a0a0f; --bg2: #111118; --bg3: #18181f; --bg4: #1f1f28;
    --border: rgba(201,168,76,0.18); --text: #e8e4dc; --text2: #9e9a94;
    --green: #4caf89; --red: #e05555; --orange: #e09a45;
  }
  .app { display: flex; min-height: 100vh; }
  .sidebar { width: 240px; background: var(--bg2); border-right: 1px solid var(--border);
    display: flex; flex-direction: column; padding: 28px 0; position: fixed;
    height: 100vh; z-index: 20; transition: transform 0.25s ease; }
  .sidebar-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.6);
    z-index: 19; backdrop-filter: blur(2px); }
  .main { margin-left: 240px; flex: 1; min-height: 100vh; }
  .topbar { background: var(--bg2); border-bottom: 1px solid var(--border);
    padding: 14px 28px; display: flex; align-items: center; justify-content: space-between;
    position: sticky; top: 0; z-index: 10; }
  .topbar-left { display: flex; align-items: center; gap: 12px; }
  .hamburger { display: none; background: none; border: none; color: var(--text); cursor: pointer; font-size: 22px; padding: 4px; }
  .page-title { font-family: 'Playfair Display', serif; font-size: 22px; color: var(--text); }
  .topbar-actions { display: flex; align-items: center; gap: 10px; }
  .content { padding: 28px; }
  .logo { padding: 0 24px 32px; display: flex; align-items: center; gap: 10px; }
  .logo-icon { width: 34px; height: 34px; background: var(--gold); border-radius: 8px;
    display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: 700; color: #000; }
  .logo-text { font-family: 'Playfair Display', serif; font-size: 18px; color: var(--gold); letter-spacing: 0.5px; }
  .nav-section { padding: 0 12px; margin-bottom: 4px; }
  .nav-label { font-size: 10px; font-weight: 600; color: var(--text2); letter-spacing: 1.5px; text-transform: uppercase; padding: 8px 12px; }
  .nav-item { display: flex; align-items: center; gap: 12px; padding: 11px 12px;
    border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 500;
    color: var(--text2); transition: all 0.18s; margin-bottom: 2px; }
  .nav-item:hover { background: var(--bg3); color: var(--text); }
  .nav-item.active { background: var(--gold-dim); color: var(--gold); }
  .nav-item .icon { font-size: 17px; width: 22px; text-align: center; }
  .nav-badge { margin-left: auto; background: var(--gold); color: #000; font-size: 10px; font-weight: 700; border-radius: 10px; padding: 2px 7px; }
  .sidebar-footer { margin-top: auto; padding: 16px 24px; border-top: 1px solid var(--border); }
  .plan-badge { background: var(--gold-dim); border: 1px solid var(--border); border-radius: 8px; padding: 10px 14px; }
  .plan-name { font-size: 11px; color: var(--gold); font-weight: 600; letter-spacing: 0.5px; }
  .plan-info { font-size: 11px; color: var(--text2); margin-top: 2px; }
  .mobile-nav { display: none; position: fixed; bottom: 0; left: 0; right: 0; z-index: 20;
    background: var(--bg2); border-top: 1px solid var(--border);
    padding: 8px 0; }
  .mobile-nav-inner { display: flex; justify-content: space-around; align-items: center; }
  .mobile-nav-item { display: flex; flex-direction: column; align-items: center; gap: 3px;
    cursor: pointer; padding: 6px 16px; border-radius: 10px; transition: all 0.15s;
    color: var(--text2); position: relative; }
  .mobile-nav-item.active { color: var(--gold); }
  .mobile-nav-item .m-icon { font-size: 22px; }
  .mobile-nav-item .m-label { font-size: 10px; font-weight: 600; letter-spacing: 0.3px; }
  .mobile-nav-dot { position: absolute; top: 4px; right: 10px; width: 7px; height: 7px;
    background: var(--gold); border-radius: 50%; border: 1.5px solid var(--bg2); }
  .mobile-fab { display: none; position: fixed; bottom: 80px; right: 20px; z-index: 25;
    width: 52px; height: 52px; border-radius: 50%; background: var(--gold); color: #000;
    font-size: 26px; font-weight: 700; border: none; cursor: pointer;
    box-shadow: 0 4px 20px rgba(201,168,76,0.45); align-items: center; justify-content: center; }
  .btn { padding: 9px 18px; border-radius: 8px; font-size: 13px; font-weight: 600;
    cursor: pointer; border: none; transition: all 0.18s; font-family: 'DM Sans', sans-serif; white-space: nowrap; }
  .btn-primary { background: var(--gold); color: #000; }
  .btn-primary:hover { background: var(--gold-light); transform: translateY(-1px); box-shadow: 0 4px 16px rgba(201,168,76,0.3); }
  .btn-ghost { background: var(--bg3); color: var(--text); border: 1px solid var(--border); }
  .btn-ghost:hover { background: var(--bg4); border-color: var(--gold); color: var(--gold); }
  .btn-sm { padding: 6px 11px; font-size: 11px; }
  .btn-danger { background: rgba(224,85,85,0.15); color: var(--red); border: 1px solid rgba(224,85,85,0.3); }
  .btn-danger:hover { background: rgba(224,85,85,0.25); }
  .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 28px; }
  .stat-card { background: var(--bg2); border: 1px solid var(--border); border-radius: 12px; padding: 18px 20px; }
  .stat-label { font-size: 11px; color: var(--text2); font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase; }
  .stat-value { font-family: 'Playfair Display', serif; font-size: 26px; color: var(--text); margin: 5px 0 4px; }
  .stat-change { font-size: 12px; color: var(--green); }
  .stat-change.down { color: var(--red); }
  .card { background: var(--bg2); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; }
  .card-header { padding: 18px 20px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; }
  .card-title { font-weight: 600; font-size: 15px; }
  .table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }
  table { width: 100%; border-collapse: collapse; min-width: 520px; }
  th { font-size: 11px; font-weight: 600; color: var(--text2); letter-spacing: 0.5px;
    text-transform: uppercase; padding: 11px 18px; text-align: left; border-bottom: 1px solid var(--border); white-space: nowrap; }
  td { padding: 13px 18px; font-size: 13px; border-bottom: 1px solid rgba(255,255,255,0.04); }
  tr:last-child td { border-bottom: none; }
  tr:hover td { background: var(--bg3); }
  .inv-cards { display: none; flex-direction: column; gap: 10px; }
  .inv-card { background: var(--bg3); border: 1px solid var(--border); border-radius: 12px; padding: 16px; }
  .inv-card-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; }
  .inv-card-id { font-weight: 700; color: var(--gold); font-size: 14px; }
  .inv-card-client { font-weight: 600; font-size: 15px; }
  .inv-card-email { font-size: 12px; color: var(--text2); margin-top: 2px; }
  .inv-card-row { display: flex; justify-content: space-between; align-items: center; margin-top: 10px; }
  .inv-card-amount { font-size: 18px; font-weight: 700; color: var(--text); }
  .inv-card-due { font-size: 12px; color: var(--text2); }
  .inv-card-actions { display: flex; gap: 8px; margin-top: 12px; flex-wrap: wrap; }
  .badge { padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
  .badge-paid { background: rgba(76,175,137,0.15); color: var(--green); }
  .badge-pending { background: rgba(224,154,69,0.15); color: var(--orange); }
  .badge-overdue { background: rgba(224,85,85,0.15); color: var(--red); }
  .badge-draft { background: rgba(158,154,148,0.15); color: var(--text2); }
  .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
  .form-group { display: flex; flex-direction: column; gap: 6px; }
  .form-group.full { grid-column: 1 / -1; }
  label { font-size: 12px; font-weight: 600; color: var(--text2); letter-spacing: 0.3px; }
  input, select, textarea {
    background: var(--bg3); border: 1px solid var(--border); border-radius: 8px;
    color: var(--text); font-size: 14px; padding: 11px 14px; font-family: 'DM Sans', sans-serif;
    outline: none; transition: border-color 0.18s; width: 100%; }
  input:focus, select:focus, textarea:focus { border-color: var(--gold); }
  select option { background: var(--bg3); }
  .totals-box { background: var(--bg3); border-radius: 10px; padding: 18px 20px; margin-top: 14px; }
  .totals-row { display: flex; justify-content: space-between; align-items: center; font-size: 13px; padding: 5px 0; }
  .totals-row.grand { font-size: 18px; font-weight: 700; color: var(--gold);
    border-top: 1px solid var(--border); padding-top: 12px; margin-top: 8px; font-family: 'Playfair Display', serif; }
  .invoice-preview { background: #fff; color: #1a1a2e; border-radius: 12px; padding: 40px 48px;
    max-width: 700px; margin: 0 auto; box-shadow: 0 20px 60px rgba(0,0,0,0.5); }
  .preview-label { font-size: 10px; font-weight: 700; color: #999; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 6px; }
  .preview-value { font-size: 14px; color: #1a1a2e; line-height: 1.6; }
  .preview-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
  .preview-table th { font-size: 10px; font-weight: 700; color: #999; letter-spacing: 1px; text-transform: uppercase;
    border-bottom: 2px solid #f0e6c8; padding: 8px 0; text-align: left; }
  .preview-table td { padding: 12px 0; font-size: 13px; border-bottom: 1px solid #f5f5f5; color: #333; }
  .preview-table tr:last-child td { border-bottom: none; }
  .preview-total-section { background: #faf8f3; border-radius: 8px; padding: 16px 20px; }
  .preview-total-row { display: flex; justify-content: space-between; font-size: 13px; padding: 4px 0; color: #555; }
  .preview-total-row.grand { font-size: 17px; font-weight: 700; color: #1a1a2e; border-top: 1px solid #e8d9a0; padding-top: 12px; margin-top: 8px; }
  .preview-footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #f0f0f0; font-size: 12px; color: #999; text-align: center; }
  .clients-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
  .client-card { background: var(--bg2); border: 1px solid var(--border); border-radius: 12px; padding: 18px; }
  .client-avatar { width: 44px; height: 44px; border-radius: 50%; background: var(--gold-dim);
    display: flex; align-items: center; justify-content: center; font-size: 18px;
    font-weight: 700; color: var(--gold); margin-bottom: 10px; border: 1px solid var(--border); }
  .client-name { font-weight: 600; font-size: 15px; margin-bottom: 4px; }
  .client-email { font-size: 12px; color: var(--text2); margin-bottom: 10px; }
  .client-stats { display: flex; gap: 16px; }
  .client-stat { font-size: 12px; color: var(--text2); }
  .client-stat span { color: var(--text); font-weight: 600; display: block; font-size: 14px; }
  .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.75); z-index: 100;
    display: flex; align-items: center; justify-content: center; padding: 16px; backdrop-filter: blur(4px); }
  .modal { background: var(--bg2); border: 1px solid var(--border); border-radius: 16px;
    padding: 24px; width: 100%; max-width: 480px; max-height: 92vh; overflow-y: auto; }
  .modal-title { font-family: 'Playfair Display', serif; font-size: 20px; margin-bottom: 18px; }
  .search-bar { background: var(--bg3); border: 1px solid var(--border); border-radius: 8px;
    padding: 9px 14px; font-size: 13px; color: var(--text); font-family: 'DM Sans', sans-serif;
    outline: none; width: 200px; }
  .search-bar:focus { border-color: var(--gold); }
  .tabs { display: flex; gap: 3px; background: var(--bg2); border: 1px solid var(--border);
    border-radius: 10px; padding: 4px; overflow-x: auto; }
  .tab { padding: 7px 14px; border-radius: 7px; font-size: 12px; font-weight: 500;
    cursor: pointer; color: var(--text2); transition: all 0.18s; white-space: nowrap; }
  .tab.active { background: var(--gold); color: #000; font-weight: 600; }
  .tab:not(.active):hover { color: var(--text); background: var(--bg3); }
  .empty { text-align: center; padding: 50px 20px; }
  .empty-text { color: var(--text2); font-size: 14px; }
  .action-btns { display: flex; gap: 5px; flex-wrap: wrap; }
  ::-webkit-scrollbar { width: 5px; height: 5px; }
  ::-webkit-scrollbar-track { background: var(--bg); }
  ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
  @keyframes spin { to { transform: rotate(360deg); } }
  
  @media print {
    html, body { background: #fff !important; color: #000 !important; margin: 0; padding: 0; }
    .sidebar, .topbar, .content > *:not(.invoice-preview), .mobile-nav, .mobile-fab { display: none !important; }
    .main { margin-left: 0; padding-bottom: 0; }
    .modal-overlay { position: absolute !important; top: 0 !important; left: 0 !important; right: 0 !important; background: none !important; padding: 0 !important; align-items: flex-start !important; justify-content: center !important; backdrop-filter: none !important; display: block !important; }
    .invoice-preview-wrapper { max-height: none !important; overflow: visible !important; width: 100% !important; max-width: 100% !important; border-radius: 0 !important; margin: 0 !important; padding: 0 !important; }
    .invoice-preview { box-shadow: none !important; padding: 15mm 20mm !important; margin: 0 auto !important; max-width: 210mm !important; border: none !important; border-radius: 0 !important; background: #fff !important; color: #1a1a2e !important; }
    .print-hide { display: none !important; }
    * { box-shadow: none !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
}
  
  @page { size: A4 portrait; margin: 15mm; scale: 0.85; }
  
  .desktop-only {
     display: inline-flex;
   }

  @media (max-width: 900px) {
    .stats-grid { grid-template-columns: repeat(2, 1fr); }
    .clients-grid { grid-template-columns: repeat(2, 1fr); }
    .content { padding: 20px; }
  }
 /* ── MOBILE (≤640px) ── */
@media (max-width: 640px) {
  .sidebar { transform: translateX(-100%); width: 260px; }
  .sidebar.open { transform: translateX(0); }
  .sidebar-overlay.open { display: block; }
  .main { margin-left: 0; padding-bottom: 70px; }
  .hamburger { display: flex; }
  .mobile-nav { display: block; }
  .mobile-fab { display: flex !important; }
  .topbar {
  padding: 12px;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}
  .topbar-actions {
  display: flex;
  gap: 8px;
}
  .page-title { font-size: 18px; }
  .content { padding: 14px; }
  .stats-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 18px; }
  .stat-card { padding: 14px 16px; }
  .stat-value { font-size: 20px; }
  .stat-icon { font-size: 18px; margin-bottom: 6px; }
  .clients-grid { grid-template-columns: 1fr; }
  .table-wrap { display: none; }
  .inv-cards { display: flex; }
  .card-header { padding: 14px 16px; }
  .modal-overlay { padding: 0; align-items: flex-end; overflow: hidden; }
  .modal { border-radius: 20px 20px 0 0; max-height: 95vh; padding: 20px 18px 28px; width: 100%; overflow-y: auto; }
  .form-grid { grid-template-columns: 1fr; }
  .form-group.full { grid-column: 1; }
  .search-bar { width: 120px; font-size: 12px; }
  .invoice-preview { padding: 16px 12px; border-radius: 0; overflow-x: hidden; font-size: 12px; }
  .items-header { display: none !important; }
  .item-row-grid {
  grid-template-columns: 1.8fr 50px 70px 70px 50px !important;
  gap: 6px !important;
}
  .item-row-grid button {
  font-size: 20px !important;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}
  .desktop-only {
       display: none !important;
     }
  }
   html, body {
  width: 100%;
  overflow-x: hidden;
}

#root {
  width: 100%;
  overflow-x: hidden;
}

* {
  box-sizing: border-box;
}

img, video, canvas, svg {
  max-width: 100%;
}

.main {
  max-width: 100vw;
  overflow-x: hidden;
}
}  
`;

const INIT_INVOICES = [];


const INIT_CLIENTS = [];


const CURRENCIES = [
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

const ALL_CURRENCIES = CURRENCIES.flatMap(g => g.items);
const getCurrency = (code) => ALL_CURRENCIES.find(c => c.value === code) || ALL_CURRENCIES[0];

const fmtCurrency = (n, currencyCode) => {
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

const formatDate = (dateString) => {
  if (!dateString) return "—";
  const parts = dateString.split("-");
  if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
  return dateString;
};

const statusBadge = (s) => {
  const map = {
    paid: ["badge-paid", "Paid"],
    pending: ["badge-pending", "Pending"],
    overdue: ["badge-overdue", "Overdue"],
    draft: ["badge-draft", "Draft"]
  };
  const entry = map[s] || ["badge-draft", s];
  return React.createElement("span", { className: "badge " + entry[0] }, entry[1]);
};

export default function InvoiceApp({ onGoHome }) {
  const [page, setPage] = useState("dashboard");
  const [invoices, setInvoices] = useState(INIT_INVOICES);
  const [clients, setClients] = useState(INIT_CLIENTS);
  const [showNewInvoice, setShowNewInvoice] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [showNewClient, setShowNewClient] = useState(false);
  const [previewInvoice, setPreviewInvoice] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [currency, setCurrency] = useState("EUR");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [plan, setPlan] = useState("free");
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState("");
  const [invoiceDraft, setInvoiceDraft] = useState(null);
  const [editDraft, setEditDraft] = useState(null); // unsaved edits for existing invoice
  const [reminderInvoice, setReminderInvoice] = useState(null);
  const [remindersLog, setRemindersLog] = useState({});

  const isPro = plan === "pro";
  const f = (n) => fmtCurrency(n, currency);

  const requirePro = (feature, cb) => {
    if (isPro) { cb(); } else { setUpgradeFeature(feature); setShowUpgrade(true); }
  };

  const openNewInvoice = () => {
    if (!isPro && invoices.length >= 5) { setUpgradeFeature("unlimited_invoices"); setShowUpgrade(true); }
    else setShowNewInvoice(true);
  };

  const handleNewInvoiceClose = (draftData) => {
    if (draftData) setInvoiceDraft(draftData);
    setShowNewInvoice(false);
  };

  const discardDraft = () => setInvoiceDraft(null);

  const logReminder = (invoiceId, entry) => {
    setRemindersLog(prev => ({ ...prev, [invoiceId]: [...(prev[invoiceId] || []), entry] }));
  };

  const today = new Date().toISOString().split("T")[0];
  const invoicesWithStatus = invoices.map(inv => {
    if (inv.status === "pending" && inv.due && inv.due < today) return { ...inv, status: "overdue" };
    return inv;
  });

  const totalRevenue = invoicesWithStatus.filter(i => i.status === "paid").reduce((a, b) => a + b.amount, 0);
  const totalPending = invoicesWithStatus.filter(i => i.status === "pending").reduce((a, b) => a + b.amount, 0);
  const totalOverdue = invoicesWithStatus.filter(i => i.status === "overdue").reduce((a, b) => a + b.amount, 0);

  const filteredInvoices = invoicesWithStatus.filter(inv => {
    const matchStatus = filterStatus === "all" || inv.status === filterStatus;
    const matchSearch = inv.client.toLowerCase().includes(search.toLowerCase()) || inv.id.includes(search);
    return matchStatus && matchSearch;
  });

  const addInvoice = (inv) => { setInvoices(prev => [inv, ...prev]); setInvoiceDraft(null); setShowNewInvoice(false); };
  const updateInvoice = (inv) => { setInvoices(prev => prev.map(i => i.id === inv.id ? inv : i)); setEditDraft(null); setEditingInvoice(null); };
  const addClient = (c) => { setClients(prev => [c, ...prev]); setShowNewClient(false); };
  const deleteInvoice = (id) => setInvoices(prev => prev.filter(i => i.id !== id));

  const navItems = [
    { id: "dashboard", icon: "\u229e", label: "Dashboard" },
    { id: "invoices", icon: "\u229f", label: "Invoices", badge: invoices.filter(i => i.status === "pending").length },
    { id: "clients", icon: "\u2299", label: "Clients" },
    { id: "settings", icon: "\u2699", label: "Settings" },
  ];
  
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 640);

    check();
    window.addEventListener("resize", check);

    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <>
      <style>{FONTS + STYLES}</style>
      {previewInvoice && (
        <style>{`@media print { .main { display: none !important; } }`}</style>
      )}
      <div className="app">
        <div className={"sidebar-overlay" + (sidebarOpen ? " open" : "")} onClick={() => setSidebarOpen(false)} />
        <aside className={"sidebar" + (sidebarOpen ? " open" : "")}>
          <div className="logo" onClick={onGoHome} style={{ cursor: onGoHome ? "pointer" : "default" }}>
            <div className="logo-icon">F</div>
            <div className="logo-text">Fatūra</div>
          </div>
          <div className="nav-section">
            <div className="nav-label">Main</div>
            {navItems.map(n => (
              <div key={n.id} className={"nav-item" + (page === n.id ? " active" : "")} onClick={() => { setPage(n.id); setSidebarOpen(false); }}>
                <span className="icon">{n.icon}</span>
                {n.label}
                {n.badge > 0 && <span className="nav-badge">{n.badge}</span>}
              </div>
            ))}
          </div>
          <div className="sidebar-footer">
            {isPro ? (
              <div className="plan-badge">
                <div className="plan-name">PRO PLAN</div>
                <div className="plan-info">Unlimited everything</div>
              </div>
            ) : (
              <div>
                <div style={{ background:"var(--bg3)", border:"1px solid var(--border)", borderRadius:8, padding:"10px 14px", marginBottom:10 }}>
                  <div style={{ fontSize:11, color:"var(--text2)", fontWeight:600 }}>FREE PLAN</div>
                  <div style={{ fontSize:11, color:"var(--text2)", marginTop:2 }}>{invoices.length}/5 invoices · {clients.length}/3 clients</div>
                  <div style={{ marginTop:8, background:"var(--bg4)", borderRadius:4, height:4, overflow:"hidden" }}>
                    <div style={{ height:"100%", width:(Math.min(100,(invoices.length/5)*100)) + "%", background:invoices.length>=5?"var(--red)":"var(--gold)", borderRadius:4 }} />
                  </div>
                </div>
                <button className="btn btn-primary" style={{ width:"100%", justifyContent:"center" }} onClick={() => setShowUpgrade(true)}>
                  Upgrade to Pro
                </button>
              </div>
            )}
          </div>
        </aside>

        <div className="main">
          <div className="topbar">
            <div className="topbar-left">
              <button className="hamburger" onClick={() => setSidebarOpen(o => !o)}>☰</button>
              <div className="page-title">
                {page === "dashboard" && "Dashboard"}
                {page === "invoices" && "Invoices"}
                {page === "clients" && "Clients"}
                {page === "settings" && "Settings"}
              </div>
            </div>
            <div className="topbar-actions">
              {page === "invoices" && (
  <>
    {/* Desktop button */}
    {!isMobile && (
      <button className="btn btn-primary" onClick={openNewInvoice}>
        <span className="btn-label">
          {!isPro && invoices.length >= 5
            ? "🔒 New Invoice"
            : "New Invoice"}
        </span>
      </button>
    )}

    {/* Mobile FAB */}
    {isMobile && (
      <button
        className="mobile-fab"
        onClick={() => {
          if (!isPro && invoices.length >= 5) {
            alert("Upgrade to Pro to create more invoices");
            return;
          }
          openNewInvoice();
        }}
      >
        +
      </button>
    )}
  </>
)}
              {page === "clients" && (
                <button className="btn btn-primary" onClick={() => {
                  if (!isPro && clients.length >= 3) { setUpgradeFeature("unlimited_clients"); setShowUpgrade(true); }
                  else setShowNewClient(true);
                }}>+ Client</button>
              )}
            </div>
          </div>

          <div className="content">
            {page === "dashboard" && <Dashboard invoices={invoicesWithStatus} totalRevenue={totalRevenue} totalPending={totalPending} totalOverdue={totalOverdue} setPage={setPage} setPreviewInvoice={setPreviewInvoice} onEdit={setEditingInvoice} onRemind={(inv) => requirePro("reminders", () => setReminderInvoice(inv))} f={f} />}
            {page === "invoices" && <Invoices invoices={filteredInvoices} filterStatus={filterStatus} setFilterStatus={setFilterStatus} search={search} setSearch={setSearch} onPreview={setPreviewInvoice} onDelete={deleteInvoice} onNew={openNewInvoice} onEdit={setEditingInvoice} onRemind={(inv) => requirePro("reminders", () => setReminderInvoice(inv))} remindersLog={remindersLog} f={f} isPro={isPro} hasDraft={!!invoiceDraft} onOpenDraft={openNewInvoice} onDiscardDraft={discardDraft} />}
            {page === "clients" && <Clients clients={clients} invoices={invoicesWithStatus} f={f} />}
            {page === "settings" && <Settings currency={currency} setCurrency={setCurrency} />}
          </div>
        </div>

        <nav className="mobile-nav">
          <div className="mobile-nav-inner">
            {navItems.map(n => (
              <div key={n.id} className={"mobile-nav-item" + (page === n.id ? " active" : "")} onClick={() => setPage(n.id)}>
                <span className="m-icon">{n.icon}</span>
                <span className="m-label">{n.label}</span>
                {n.badge > 0 && <span className="mobile-nav-dot" />}
              </div>
            ))}
          </div>
        </nav>

        {page === "invoices" && <button className="mobile-fab" onClick={openNewInvoice}>+</button>}

        {showNewInvoice && <NewInvoiceModal clients={clients} onSave={addInvoice} onClose={handleNewInvoiceClose} invoiceCount={invoices.length} currency={currency} f={f} draftData={invoiceDraft} onDiscardDraft={discardDraft} />}
        {editingInvoice && <NewInvoiceModal clients={clients} onSave={updateInvoice} onClose={(draftData) => { if (draftData) setEditDraft(draftData); setEditingInvoice(null); }} invoiceCount={invoices.length} currency={currency} f={f} editData={editingInvoice} editDraft={editDraft} onDiscardEditDraft={() => setEditDraft(null)} />}
        {showNewClient && <NewClientModal onSave={addClient} onClose={() => setShowNewClient(false)} />}
        {previewInvoice && <InvoicePreview invoice={previewInvoice} onClose={() => setPreviewInvoice(null)} currency={currency} />}
        {reminderInvoice && <ReminderModal invoice={reminderInvoice} onClose={() => setReminderInvoice(null)} onLog={logReminder} f={f} />}
        {showUpgrade && <UpgradeModal feature={upgradeFeature} onClose={() => setShowUpgrade(false)} onActivate={() => { setPlan("pro"); setShowUpgrade(false); }} />}
      </div>
    </>
  );
}

function Dashboard({ invoices, totalRevenue, totalPending, totalOverdue, setPage, setPreviewInvoice, onEdit, onRemind, f }) {
  const recent = invoices.slice(0, 5);
  const overdue = invoices.filter(i => i.status === "overdue");
  return (
    <>
      {overdue.length > 0 && (
        <div style={{ background:"rgba(224,85,85,0.1)", border:"1px solid rgba(224,85,85,0.35)", borderRadius:10, padding:"12px 20px", marginBottom:24, display:"flex", alignItems:"center", justifyContent:"space-between", gap:16 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <span style={{ fontSize:20, fontWeight: 700, color:"var(--red)" }}>!</span>
            <div>
              <div style={{ fontWeight:700, color:"var(--red)", fontSize:14 }}>{overdue.length} Overdue Invoice{overdue.length > 1 ? "s" : ""}</div>
              <div style={{ fontSize:12, color:"var(--text2)", marginTop:2 }}>{overdue.map(i => i.client).join(", ")} — Total: <strong style={{ color:"var(--red)" }}>{f(overdue.reduce((a,b) => a+b.amount,0))}</strong></div>
            </div>
          </div>
          <button className="btn btn-sm" style={{ background:"rgba(224,85,85,0.2)", color:"var(--red)", border:"1px solid rgba(224,85,85,0.4)", whiteSpace:"nowrap" }} onClick={() => setPage("invoices")}>View Overdue →</button>
        </div>
      )}
      <div className="stats-grid">
        <div className="stat-card"><div className="stat-label">Total Revenue</div><div className="stat-value">{f(totalRevenue)}</div><div className="stat-change">↑ +12.4% this month</div></div>
        <div className="stat-card"><div className="stat-label">Pending</div><div className="stat-value">{f(totalPending)}</div><div className="stat-change">{invoices.filter(i => i.status === "pending").length} invoices</div></div>
        <div className="stat-card"><div className="stat-label">Overdue</div><div className="stat-value" style={{ color:"var(--red)" }}>{f(totalOverdue)}</div><div className="stat-change down">Needs attention</div></div>
        <div className="stat-card"><div className="stat-label">Total Invoices</div><div className="stat-value">{invoices.length}</div><div className="stat-change">↑ +3 this month</div></div>
      </div>
      <div className="card">
        <div className="card-header">
          <div className="card-title">Recent Invoices</div>
          <button className="btn btn-ghost btn-sm" onClick={() => setPage("invoices")}>View All →</button>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Invoice</th><th>Client</th><th>Amount</th><th>Due Date</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {recent.map(inv => (
                <tr key={inv.id}>
                  <td style={{ fontWeight:600, color:"var(--gold)" }}>{inv.id}</td>
                  <td>{inv.client}</td>
                  <td style={{ fontWeight:600 }}>{f(inv.amount)}</td>
                  <td style={{ color:"var(--text2)" }}>{formatDate(inv.due)}</td>
                  <td>{statusBadge(inv.status)}</td>
                  <td>
                    <div className="action-btns">
                      <button className="btn btn-ghost btn-sm" onClick={() => setPreviewInvoice(inv)}>Preview</button>
                      <button className="btn btn-ghost btn-sm" style={{ color:"var(--gold)" }} onClick={() => onEdit(inv)}>Edit</button>
                      {(inv.status === "overdue" || inv.status === "pending") && (
                        <button className="btn btn-sm" style={{ background:"rgba(224,85,85,0.15)", color:"var(--red)", border:"1px solid rgba(224,85,85,0.3)" }} onClick={() => onRemind(inv)}>Remind</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function Invoices({ invoices, filterStatus, setFilterStatus, search, setSearch, onPreview, onDelete, onNew, onEdit, onRemind, remindersLog, f, isPro, hasDraft, onOpenDraft, onDiscardDraft }) {
  const statuses = ["all", "paid", "pending", "overdue", "draft"];
  return (
    <>
      {hasDraft && (
        <div style={{ background:"rgba(201,168,76,0.1)", border:"1px solid var(--gold)", borderRadius:10, padding:"12px 18px", marginBottom:18, display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, flexWrap:"wrap" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div>
              <div style={{ fontWeight:700, color:"var(--gold)", fontSize:13 }}>Notice: Unsaved Draft</div>
              <div style={{ fontSize:12, color:"var(--text2)" }}>Your invoice was saved automatically when you closed it.</div>
            </div>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <button className="btn btn-ghost btn-sm" onClick={onDiscardDraft} style={{ color:"var(--red)", borderColor:"rgba(224,85,85,0.3)" }}>Discard</button>
            <button className="btn btn-primary btn-sm" onClick={onOpenDraft}>Continue Draft</button>
          </div>
        </div>
      )}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <div className="tabs">
          {statuses.map(s => (
            <div key={s} className={"tab" + (filterStatus === s ? " active" : "")} onClick={() => setFilterStatus(s)}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </div>
          ))}
        </div>
        <input className="search-bar" placeholder="Search invoices..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead><tr><th>Invoice #</th><th>Client</th><th>Date</th><th>Due Date</th><th>Amount</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {invoices.length === 0 ? (
                <tr><td colSpan={7}><div className="empty"><div className="empty-text">Welcome to Fatūra! Create your first invoice to get started.</div></div></td></tr>
              ) : invoices.map(inv => (
                <React.Fragment key={inv.id}>
                  <tr>
                    <td style={{ fontWeight:700, color:"var(--gold)" }}>{inv.id}</td>
                    <td>
                      <div style={{ fontWeight:500 }}>{inv.client}</div>
                      <div style={{ fontSize:11, color:"var(--text2)" }}>{inv.email}</div>
                      {remindersLog[inv.id] && remindersLog[inv.id].length > 0 && (
                        <div style={{ fontSize:10, color:"var(--orange)", marginTop:2 }}>{remindersLog[inv.id].length} reminder{remindersLog[inv.id].length > 1 ? "s" : ""} sent</div>
                      )}
                    </td>
                    <td style={{ color:"var(--text2)", fontSize:12 }}>{formatDate(inv.date)}</td>
                    <td style={{ color:inv.status==="overdue"?"var(--red)":"var(--text2)", fontSize:12, fontWeight:inv.status==="overdue"?700:400 }}>
                      {formatDate(inv.due)}
                      {inv.status === "overdue" && <div style={{ fontSize:10, color:"var(--red)" }}>Overdue</div>}
                    </td>
                    <td style={{ fontWeight:700 }}>{f(inv.amount)}</td>
                    <td>{statusBadge(inv.status)}</td>
                    <td>
                      <div className="action-btns">
                        <button className="btn btn-ghost btn-sm" onClick={() => onPreview(inv)}>View</button>
                        <button className="btn btn-ghost btn-sm" style={{ color:"var(--gold)" }} onClick={() => onEdit(inv)}>Edit</button>
                        {(inv.status === "overdue" || inv.status === "pending") && (
                          <button className="btn btn-sm" style={{ background:"rgba(224,85,85,0.15)", color:"var(--red)", border:"1px solid rgba(224,85,85,0.3)", whiteSpace:"nowrap" }} onClick={() => onRemind(inv)}>Remind</button>
                        )}
                        <button className="btn btn-danger btn-sm" onClick={() => onDelete(inv.id)}>✕</button>
                      </div>
                    </td>
                  </tr>
                  {remindersLog[inv.id] && remindersLog[inv.id].length > 0 && (
                    <tr>
                      <td colSpan={7} style={{ padding:"4px 18px 10px", background:"rgba(224,154,69,0.04)" }}>
                        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                          {remindersLog[inv.id].map((r, i) => (
                            <span key={i} style={{ fontSize:11, background:"rgba(224,154,69,0.12)", border:"1px solid rgba(224,154,69,0.25)", borderRadius:20, padding:"3px 10px", color:"var(--orange)" }}>
                              {r.channel === "email" ? "Email" : "WhatsApp"} · {r.tone} · {formatDate(r.date)}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
        <div className="inv-cards" style={{ padding:invoices.length?"12px":0 }}>
          {invoices.length === 0 ? (
            <div className="empty"><div className="empty-text">Welcome to Fatūra! Create your first invoice to get started.</div></div>
          ) : invoices.map(inv => (
            <div className="inv-card" key={inv.id}>
              <div className="inv-card-top">
                <div>
                  <div className="inv-card-id">{inv.id}</div>
                  <div className="inv-card-client">{inv.client}</div>
                  <div className="inv-card-email">{inv.email}</div>
                </div>
                {statusBadge(inv.status)}
              </div>
              <div className="inv-card-row">
                <div className="inv-card-amount">{f(inv.amount)}</div>
                <div className="inv-card-due" style={{ color:inv.status==="overdue"?"var(--red)":"var(--text2)", fontWeight:inv.status==="overdue"?700:400 }}>Due: {formatDate(inv.due)}</div>
              </div>
              <div className="inv-card-actions">
                <button className="btn btn-ghost btn-sm" onClick={() => onPreview(inv)}>View</button>
                <button className="btn btn-ghost btn-sm" style={{ color:"var(--gold)" }} onClick={() => onEdit(inv)}>Edit</button>
                {(inv.status === "overdue" || inv.status === "pending") && (
                  <button className="btn btn-sm" style={{ background:"rgba(224,85,85,0.15)", color:"var(--red)", border:"1px solid rgba(224,85,85,0.3)" }} onClick={() => onRemind(inv)}>Remind</button>
                )}
                <button className="btn btn-danger btn-sm" onClick={() => onDelete(inv.id)}>✕</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function Clients({ clients, invoices, f }) {
  return (
    <div className="clients-grid">
  {clients.length === 0 && (
    <div className="empty" style={{ gridColumn: "1 / -1" }}>
      <div className="empty-icon">🤝</div>
      <div className="empty-text">No clients yet — add your first client to get started.</div>
    </div>
  )}
  {clients.map(c => (
        <div className="client-card" key={c.id}>
          <div className="client-avatar">{c.name[0]}</div>
          <div className="client-name">{c.name}</div>
          <div className="client-email">{c.email}</div>
          <div className="client-email">{c.phone} · {c.country}</div>
          <div className="client-stats" style={{ marginTop:14 }}>
            <div className="client-stat"><span>{c.invoices}</span>Invoices</div>
            <div className="client-stat"><span style={{ color:"var(--gold)" }}>{f(c.total)}</span>Total Billed</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function Settings({ currency, setCurrency }) {
  const cur = getCurrency(currency);
  return (
    <div style={{ maxWidth:600 }}>
      <div className="card" style={{ padding:28, marginBottom:20 }}>
        <div className="card-title" style={{ marginBottom:20 }}>Business Profile</div>
        <div className="form-grid">
          <div className="form-group"><label>Business Name</label><input defaultValue="My Company" /></div>
          <div className="form-group"><label>Email</label><input defaultValue="me@company.com" /></div>
          <div className="form-group"><label>Phone</label><input defaultValue="+31 6 XX XX XX XX" /></div>
          <div className="form-group"><label>Country</label>
            <select defaultValue="NL">
              {["Morocco","Algeria","Tunisia","Egypt","France","Belgium","Netherlands","United Kingdom","UAE","Saudi Arabia","Qatar","Kuwait","Yemen"].map((l, i) => {
                const v = ["MA","DZ","TN","EG","FR","BE","NL","GB","AE","SA","QA","KW","YE"][i];
                return <option key={v} value={v}>{l}</option>
              })}
            </select>
          </div>
          <div className="form-group full"><label>Address</label><input defaultValue="Keizersgracht 123, Amsterdam, Netherlands" /></div>
        </div>
        <button className="btn btn-primary">Save Changes</button>
      </div>
      <div className="card" style={{ padding:28 }}>
        <div className="card-title" style={{ marginBottom:20 }}>Invoice Defaults</div>
        <div className="form-grid">
          <div className="form-group full">
            <label>Default Currency</label>
            <select value={currency} onChange={e => setCurrency(e.target.value)}>
              {CURRENCIES.map(group => (
                <optgroup key={group.group} label={"── " + group.group + " ──"}>
                  {group.items.map(c => <option key={c.value} value={c.value}>{c.label} ({c.symbol})</option>)}
                </optgroup>
              ))}
            </select>
            <div style={{ fontSize:12, color:"var(--gold)", marginTop:6, padding:"8px 12px", background:"var(--gold-dim)", borderRadius:6, border:"1px solid var(--border)" }}>
              Preview: {fmtCurrency(1234.5, currency)} · {cur.label}
            </div>
          </div>
          <div className="form-group"><label>Default Tax (%)</label><input type="number" defaultValue="20" /></div>
          <div className="form-group"><label>Payment Terms (days)</label><input type="number" defaultValue="30" /></div>
          <div className="form-group"><label>Invoice Prefix</label><input defaultValue="INV-" /></div>
          <div className="form-group full"><label>Invoice Notes</label>
            <textarea rows={3} defaultValue="Thank you for your business. Payment is due within 30 days." style={{ resize:"vertical" }} />
          </div>
        </div>
        <button className="btn btn-primary">Save Defaults</button>
      </div>
    </div>
  );
}

function NewInvoiceModal({ clients, onSave, onClose, invoiceCount, currency: globalCurrency, f: globalF, editData, draftData, onDiscardDraft, editDraft, onDiscardEditDraft }) {
  const isEdit = !!editData;
  const sourceData = isEdit ? (editDraft || editData) : (draftData || null);
  const [showDraftBanner, setShowDraftBanner] = useState(!!draftData && !editData);
  const [showEditDraftBanner, setShowEditDraftBanner] = useState(!!editDraft && !!editData);
  const [step, setStep] = useState(0);
  const [invoiceCurrency, setInvoiceCurrency] = useState((sourceData && sourceData.currency) || globalCurrency || "EUR");
  const fLocal = (n) => fmtCurrency(n, invoiceCurrency);
  const curInfo = getCurrency(invoiceCurrency);

  const [sellerLogoSize, setSellerLogoSize] = useState((sourceData && sourceData.sellerLogoSize) || 80);
  const [buyerLogoSize, setBuyerLogoSize] = useState((sourceData && sourceData.buyerLogoSize) || 60);
  
  const [isMobile, setIsMobile] = React.useState(false);

React.useEffect(() => {
  const check = () => setIsMobile(window.innerWidth <= 640);

  check();
  window.addEventListener("resize", check);

  return () => window.removeEventListener("resize", check);
}, []);

  const emptyForm = {
    sellerName:"", sellerEmail:"", sellerPhone:"+31", sellerAddress:"", sellerLogo:null,
    client:(clients[0] && clients[0].name) || "", email:(clients[0] && clients[0].email) || "",
    buyerPhone:"", buyerAddress:"", buyerLogo:null,
    date:new Date().toISOString().split("T")[0], due:"",
    tax:20, discount:0, notes:"", bankInfo:"",
  };

  const [form, setForm] = useState(sourceData ? {
    sellerName: sourceData.sellerName || "",
    sellerEmail: sourceData.sellerEmail || "",
    sellerPhone: sourceData.sellerPhone || "",
    sellerAddress: sourceData.sellerAddress || "",
    sellerLogo: sourceData.sellerLogo || null,
    client: sourceData.client || "",
    email: sourceData.email || "",
    buyerPhone: sourceData.buyerPhone || "",
    buyerAddress: sourceData.buyerAddress || "",
    buyerLogo: sourceData.buyerLogo || null,
    date: sourceData.date || new Date().toISOString().split("T")[0],
    due: sourceData.due || "",
    tax: sourceData.tax != null ? sourceData.tax : 20,
    discount: sourceData.discount != null ? sourceData.discount : 0,
    notes: sourceData.notes || "",
    bankInfo: sourceData.bankInfo || "",
  } : emptyForm);

  const [items, setItems] = useState(
    (sourceData && sourceData.items && sourceData.items.length > 0)
      ? sourceData.items
      : [{ desc:"", qty:1, price:0, note:"" }]
  );

  const buildDraft = () => ({ ...form, currency:invoiceCurrency, sellerLogoSize, buyerLogoSize, items });

  const hasMeaningfulData = () =>
    form.sellerName || form.client || form.sellerEmail || items.some(i => i.desc || i.price > 0);

  // Overlay click — blocked to prevent accidental close
  const handleOverlayClick = (e) => {};

  const subtotal = items.reduce((a, i) => a + (i.qty * i.price), 0);
  const discountAmt = subtotal * (form.discount / 100);
  const taxAmt = (subtotal - discountAmt) * (form.tax / 100);
  const total = subtotal - discountAmt + taxAmt;

  const addItem = () => setItems(p => [...p, { desc:"", qty:1, price:0, note:"" }]);
  const updateItem = (idx, key, val) => setItems(p => p.map((it, i) => i === idx ? { ...it, [key]: val } : it));
  const removeItem = (idx) => setItems(p => p.filter((_, i) => i !== idx));
  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleClientChange = (name) => {
    const c = clients.find(x => x.name === name);
    setForm(f => ({ ...f, client:name, email:(c && c.email)||"", buyerPhone:(c && c.phone)||"", buyerAddress:"" }));
  };

  const handleLogo = (key, e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => set(key, ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!form.client || !form.due) return alert("Please fill in Client and Due Date (Step 2)");
    const id = isEdit ? editData.id : ("INV-" + String(invoiceCount + 1).padStart(3, "0"));
    const status = isEdit ? (editData.status || "pending") : "pending";
    onSave({ id, ...form, currency:invoiceCurrency, sellerLogoSize, buyerLogoSize, amount:total, status, items, subtotal, discountAmt, taxAmt, total });
  };

  const steps = [
    { label:"From", icon:"1" },
    { label:"To", icon:"2" },
    { label:"Items", icon:"3" },
    { label:"Notes", icon:"4" },
  ];
  const isLast = step === steps.length - 1;

  const LogoUploader = ({ logoKey, sizeVal, onSizeChange, inputId, label }) => (
    <div style={{ marginBottom:20 }}>
      <div style={{ fontSize:12, fontWeight:600, color:"var(--text2)", marginBottom:10 }}>{label}</div>
      <div style={{ display:"flex", alignItems:"flex-start", gap:16 }}>
        <div style={{ width:90, height:90, borderRadius:10, background:"var(--bg3)", border:"2px dashed var(--border)", display:"flex", alignItems:"center", justifyItems:"center", justifyContent:"center", overflow:"hidden", flexShrink:0 }}>
          {form[logoKey]
            ? <img src={form[logoKey]} style={{ width:(sizeVal)+"%", height:(sizeVal)+"%", objectFit:"contain" }} alt="logo" />
            : <span style={{ fontSize:14, fontWeight:600, color:"var(--text2)" }}>Logo</span>}
        </div>
        <div style={{ flex:1 }}>
          <div style={{ display:"flex", gap:8, marginBottom:10 }}>
            <input type="file" accept="image/*" id={inputId} style={{ display:"none" }} onChange={e => handleLogo(logoKey, e)} />
            <label htmlFor={inputId} className="btn btn-ghost btn-sm" style={{ cursor:"pointer", display:"inline-block" }}>
              {form[logoKey] ? "Change Logo" : "Upload Logo"}
            </label>
            {form[logoKey] && <button className="btn btn-danger btn-sm" onClick={() => set(logoKey, null)}>Remove</button>}
          </div>
          {form[logoKey] ? (
            <div>
              <div style={{ fontSize:11, color:"var(--text2)", marginBottom:6 }}>Logo Size: <strong style={{ color:"var(--gold)" }}>{sizeVal}%</strong></div>
              <input type="range" min={20} max={100} value={sizeVal} onChange={e => onSizeChange(+e.target.value)}
                style={{ width:"100%", accentColor:"var(--gold)", cursor:"pointer", height:4 }} />
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:10, color:"var(--text2)", marginTop:3 }}>
                <span>Small</span><span>Large</span>
              </div>
            </div>
          ) : (
            <div style={{ fontSize:11, color:"var(--text2)" }}>PNG or JPG — transparent background recommended</div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal" style={{ maxWidth:700 }}>

        {showDraftBanner && (
          <div style={{ background:"rgba(201,168,76,0.12)", border:"1px solid var(--gold)", borderRadius:10, padding:"12px 16px", marginBottom:18, display:"flex", alignItems:"center", justifyContent:"space-between", gap:12 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div>
                <div style={{ fontSize:13, fontWeight:700, color:"var(--gold)" }}>Draft Restored</div>
                <div style={{ fontSize:11, color:"var(--text2)" }}>Continue where you left off?</div>
              </div>
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <button className="btn btn-ghost btn-sm" onClick={() => { setShowDraftBanner(false); setForm(emptyForm); setItems([{ desc:"", qty:1, price:0, note:"" }]); if (onDiscardDraft) onDiscardDraft(); }}>Discard</button>
              <button className="btn btn-primary btn-sm" onClick={() => setShowDraftBanner(false)}>Continue</button>
            </div>
          </div>
        )}
        {/* Draft restore banner — edit invoice */}
{showEditDraftBanner && (
  <div style={{ background: "rgba(201,168,76,0.12)", border: "1px solid var(--gold)", borderRadius: 10,
    padding: "12px 16px", marginBottom: 18, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <span style={{ fontSize: 18 }}>📝</span>
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--gold)" }}>Unsaved Changes Restored</div>
        <div style={{ fontSize: 11, color: "var(--text2)" }}>You have unsaved edits for this invoice. Continue where you left off?</div>
      </div>
    </div>
    <div style={{ display: "flex", gap: 8 }}>
      <button className="btn btn-ghost btn-sm" onClick={() => {
        setShowEditDraftBanner(false);
        setForm({
          sellerName: editData.sellerName || "", sellerEmail: editData.sellerEmail || "",
          sellerPhone: editData.sellerPhone || "", sellerAddress: editData.sellerAddress || "",
          sellerLogo: editData.sellerLogo || null, client: editData.client || "",
          email: editData.email || "", buyerPhone: editData.buyerPhone || "",
          buyerAddress: editData.buyerAddress || "", buyerLogo: editData.buyerLogo || null,
          date: editData.date || new Date().toISOString().split("T")[0],
          due: editData.due || "", tax: editData.tax ?? 20, discount: editData.discount ?? 0,
          notes: editData.notes || "", bankInfo: editData.bankInfo || "",
        });
        setItems(editData.items?.length > 0 ? editData.items : [{ desc: "", qty: 1, price: 0 }]);
        if (onDiscardEditDraft) onDiscardEditDraft();
      }}>Discard</button>
      <button className="btn btn-primary btn-sm" onClick={() => setShowEditDraftBanner(false)}>Continue ✓</button>
    </div>
  </div>
)}

        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20 }}>
          <div className="modal-title" style={{ marginBottom:0 }}>
            {isEdit ? "Edit Invoice" : "New Invoice"}
            {isEdit && <span style={{ fontSize:13, color:"var(--gold)", marginLeft:10, fontWeight:600 }}>{editData.id}</span>}
          </div>
          <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:4 }}>
            <label style={{ fontSize:10, fontWeight:700, color:"var(--text2)", letterSpacing:1, textTransform:"uppercase" }}>Currency</label>
            <div style={{ position:"relative" }}>
              <select value={invoiceCurrency} onChange={e => setInvoiceCurrency(e.target.value)}
                style={{ background:"var(--gold-dim)", border:"1.5px solid var(--gold)", color:"var(--gold)", fontWeight:700, fontSize:13, borderRadius:8, padding:"7px 32px 7px 12px", cursor:"pointer", appearance:"none", fontFamily:"'DM Sans', sans-serif" }}>
                {CURRENCIES.map(group => (
                  <optgroup key={group.group} label={"── " + group.group + " ──"}>
                    {group.items.map(c => <option key={c.value} value={c.value}>{c.value} {c.symbol}</option>)}
                  </optgroup>
                ))}
              </select>
              <span style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", pointerEvents:"none", color:"var(--gold)", fontSize:10 }}>▼</span>
            </div>
            <div style={{ fontSize:11, color:"var(--text2)" }}>{curInfo.label}</div>
          </div>
        </div>

        <div style={{ display:"flex", alignItems:"center", marginBottom:24 }}>
          {steps.map((s, i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", flex:i < steps.length - 1 ? 1 : "none" }}>
              <div onClick={() => i < step && setStep(i)} style={{ width:34, height:34, borderRadius:"50%", display:"flex", alignItems:"center", justifyItems:"center", justifyContent:"center", fontSize:13, fontWeight:700, flexShrink:0, cursor:i < step ? "pointer" : "default",
                background:i===step?"var(--gold)":i<step?"rgba(201,168,76,0.3)":"var(--bg3)",
                border:i===step?"2px solid var(--gold)":i<step?"2px solid var(--gold)":"2px solid var(--border)",
                color:i===step?"#000":i<step?"var(--gold)":"var(--text2)" }}>
                {i < step ? "✓" : s.icon}
              </div>
              <div style={{ marginLeft:6, marginRight:4 }}>
                <div style={{ fontSize:11, fontWeight:i===step?700:500, color:i===step?"var(--gold)":"var(--text2)" }}>{s.label}</div>
              </div>
              {i < steps.length - 1 && (
                <div style={{ flex:1, height:2, background:i<step?"var(--gold)":"var(--border)", margin:"0 8px", borderRadius:2 }} />
              )}
            </div>
          ))}
        </div>

        {step === 0 && (
          <div>
            <LogoUploader logoKey="sellerLogo" sizeVal={sellerLogoSize} onSizeChange={setSellerLogoSize} inputId="sellerLogoInput" label="Company / Seller Logo" />
            <div className="form-grid">
              <div className="form-group full"><label>Seller / Company Name</label><input value={form.sellerName} onChange={e => set("sellerName", e.target.value)} placeholder="e.g. Vyynd Agency BV" /></div>
              <div className="form-group"><label>Email</label><input value={form.sellerEmail} onChange={e => set("sellerEmail", e.target.value)} placeholder="contact@yourcompany.com" /></div>
              <div className="form-group"><label>Phone</label><input value={form.sellerPhone} onChange={e => set("sellerPhone", e.target.value)} placeholder="+31 6 XX XX XX XX" /></div>
              <div className="form-group full"><label>Address</label><textarea rows={2} value={form.sellerAddress} onChange={e => set("sellerAddress", e.target.value)} placeholder="e.g. Keizersgracht 123, Amsterdam" style={{ resize:"none" }} /></div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div>
            <LogoUploader logoKey="buyerLogo" sizeVal={buyerLogoSize} onSizeChange={setBuyerLogoSize} inputId="buyerLogoInput" label="Client / Buyer Logo (optional)" />
            <div className="form-grid">
              <div className="form-group full">
                <label>Select Existing Client</label>
                <select value={form.client} onChange={e => handleClientChange(e.target.value)}>
                  <option value="">— Enter manually below —</option>
                  {clients.map(c => <option key={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-group full"><label>Client / Company Name *</label><input value={form.client} onChange={e => set("client", e.target.value)} placeholder="e.g. TechFlow Solutions BV" /></div>
              <div className="form-group"><label>Email</label><input value={form.email} onChange={e => set("email", e.target.value)} placeholder="client@company.com" /></div>
              <div className="form-group"><label>Phone</label><input value={form.buyerPhone} onChange={e => set("buyerPhone", e.target.value)} placeholder="+971 50 XXX XXXX" /></div>
              <div className="form-group full"><label>Address</label><textarea rows={2} value={form.buyerAddress} onChange={e => set("buyerAddress", e.target.value)} placeholder="e.g. Sheikh Zayed Rd, Dubai, UAE" style={{ resize:"none" }} /></div>
              <div className="form-group"><label>Invoice Date *</label><input type="date" value={form.date} onChange={e => set("date", e.target.value)} /></div>
              <div className="form-group"><label>Due Date *</label><input type="date" value={form.due} onChange={e => set("due", e.target.value)} /></div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <div style={{ display:"grid", gridTemplateColumns:"minmax(140px, 2.5fr) 70px 100px 90px 28px", gap:8, padding:"6px 12px", background:"var(--bg3)", borderRadius:8, border:"1px solid var(--border)", marginBottom:6 }}>
              {["Description", "Qty", "Price (" + curInfo.symbol + ")", "Total", ""].map((h, i) => (
                <div key={i} style={{ fontSize:10, fontWeight:700, color:"var(--text2)", letterSpacing:0.5, textTransform:"uppercase" }}>{h}</div>
              ))}
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:6, marginBottom:12 }}>
              {items.map((it, idx) => (
                <div key={idx} style={{ display:"flex", flexDirection:"column", background:"var(--bg4)", borderRadius:8, border:"1px solid var(--border)", overflow:"hidden" }}>
                  <div style={{ display:"grid", gridTemplateColumns:"minmax(140px, 1.5fr) 45px 65px 60px 30px", gap:8, padding:"8px 12px", alignItems:"center" }}>
                    <input value={it.desc} onChange={e => updateItem(idx, "desc", e.target.value)} placeholder="e.g. Social Media Package" style={{ width:"100%", padding: isMobile ? "12px" :"8px 10px", fontSize: isMobile ? 16 : 13, minWidth: 0 }} />
                    <input type="number" value={it.qty === 0 ? "" : it.qty} min={0} onChange={e => updateItem(idx, "qty", e.target.value===""?0:+e.target.value)} placeholder="1" style={{ width:"100%", padding:"8px 10px", fontSize:14, fontWeight:600, textAlign:"center" }} />
                    <input type="number" value={it.price === 0 ? "" : it.price} min={0} onChange={e => updateItem(idx, "price", e.target.value===""?0:+e.target.value)} placeholder="0.00" style={{ width:"100%", padding:"8px 10px", fontSize:14, fontWeight:600, textAlign:"right" }} />
                    <div style={{ fontSize:13, fontWeight:700, color:"var(--gold)", textAlign:"right" }}>{fLocal(it.qty * it.price)}</div>
                    <button onClick={() => removeItem(idx)} style={{ background:"none", border:"none", color:"var(--red)", cursor:"pointer", fontSize:18, lineHeight:1, padding:0 }}>×</button>
                  </div>
                  <div style={{ borderTop:"1px dashed var(--border)", padding:"6px 12px 8px" }}>
                    <input
                      value={it.note || ""}
                      onChange={e => updateItem(idx, "note", e.target.value)}
                      placeholder="Add a note for this item (optional)..."
                      style={{ width:"100%", padding:"6px 10px", fontSize:11, color:"var(--text2)", background:"transparent", border:"none", outline:"none", fontStyle:it.note ? "normal" : "italic" }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <button className="btn btn-ghost btn-sm" onClick={addItem} style={{ marginBottom:14 }}>+ Add Line Item</button>
            <div className="form-grid" style={{ gridTemplateColumns:"1fr 1fr", marginBottom:0 }}>
              <div className="form-group"><label>Discount (%)</label><input type="number" value={form.discount===0?"":form.discount} min={0} max={100} onChange={e => set("discount", e.target.value===""?0:+e.target.value)} placeholder="0" /></div>
              <div className="form-group"><label>Tax / VAT (%)</label><input type="number" value={form.tax===0?"":form.tax} min={0} onChange={e => set("tax", e.target.value===""?0:+e.target.value)} placeholder="20" /></div>
            </div>
            <div className="totals-box" style={{ marginTop:12 }}>
              <div className="totals-row"><span>Subtotal</span><span>{fLocal(subtotal)}</span></div>
              {form.discount > 0 && <div className="totals-row" style={{ color:"var(--green)" }}><span>Discount ({form.discount}%)</span><span>-{fLocal(discountAmt)}</span></div>}
              <div className="totals-row"><span>Tax ({form.tax}%)</span><span>{fLocal(taxAmt)}</span></div>
              <div className="totals-row grand"><span>Total</span><span>{fLocal(total)}</span></div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <div className="form-group">
              <label>Invoice Notes</label>
              <textarea rows={4} value={form.notes} onChange={e => set("notes", e.target.value)} placeholder="e.g. Thank you for your business. Payment is due within 30 days." style={{ resize:"vertical" }} />
              <span style={{ fontSize:11, color:"var(--text2)" }}>Shown at the bottom of the invoice</span>
            </div>
            <div className="form-group">
              <label>Bank / Payment Information</label>
              <textarea rows={6} value={form.bankInfo} onChange={e => set("bankInfo", e.target.value)}
                placeholder={"Bank: ING Bank Netherlands\nAccount Name: My Company BV\nIBAN: NL00 INGB 0000 0000 00\nBIC/Swift: INGBNL2A\n\nOr pay via:\nWise: yourname@wise.com"}
                style={{ resize:"vertical", fontFamily:"monospace", fontSize:12, lineHeight:1.8 }} />
              <span style={{ fontSize:11, color:"var(--text2)" }}>Bank details, Wise, PayPal, or any payment instructions</span>
            </div>
            <div style={{ background:"var(--bg3)", border:"1px solid var(--border)", borderRadius:10, padding:"14px 18px" }}>
              <div style={{ fontSize:11, fontWeight:700, color:"var(--text2)", letterSpacing:0.5, marginBottom:10, textTransform:"uppercase" }}>
                {isEdit ? "Editing Invoice" : "Summary"}
              </div>
              {[["Seller", form.sellerName||"—"],["Client", form.client||"—"],["Due Date", formatDate(form.due)||"—"],["Items", (items.filter(i => i.desc).length) + " line item(s)"]].map(([k, v]) => (
                <div key={k} style={{ display:"flex", justifyContent:"space-between", fontSize:13, marginBottom:4 }}>
                  <span style={{ color:"var(--text2)" }}>{k}</span><span style={{ fontWeight:600 }}>{v}</span>
                </div>
              ))}
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, marginBottom:4 }}>
                <span style={{ color:"var(--text2)" }}>Currency</span>
                <span style={{ fontWeight:700, color:"var(--gold)" }}>{invoiceCurrency} ({curInfo.symbol})</span>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:16, fontWeight:700, marginTop:8, paddingTop:8, borderTop:"1px solid var(--border)" }}>
                <span>Total Due</span><span style={{ color:"var(--gold)" }}>{fLocal(total)}</span>
              </div>
            </div>
          </div>
        )}

        <div style={{ display:"flex", gap:10, justifyContent:"space-between", marginTop:24, borderTop:"1px solid var(--border)", paddingTop:16 }}>
          <div style={{ display:"flex", gap:8 }}>
            <button className="btn btn-ghost" onClick={step===0 ? () => onClose(hasMeaningfulData()?buildDraft():null) : () => setStep(s => s-1)}>
              {step===0 ? "Close" : "← Back"}
            </button>
            {hasMeaningfulData() && (
              <button className="btn btn-secondary" onClick={() => onClose(buildDraft())}>
                Save Draft
              </button>
            )}
          </div>
          <div style={{ display:"flex", gap:10, alignItems:"center" }}>
            {!isLast && <span style={{ fontSize:12, color:"var(--text2)" }}>Step {step+1} / {steps.length}</span>}
            {isLast
              ? <button className="btn btn-primary" onClick={handleSave}>{isEdit ? "Update Invoice" : "Save Invoice"}</button>
              : <button className="btn btn-primary" onClick={() => setStep(s => s+1)}>Next →</button>
            }
          </div>
        </div>
      </div>
    </div>
  );
}

function NewClientModal({ onSave, onClose }) {
  const [form, setForm] = useState({ name:"", email:"", phone:"", country:"Morocco" });
  const handleSave = () => {
    if (!form.name || !form.email) return alert("Name and email are required");
    onSave({ ...form, id:Date.now(), invoices:0, total:0 });
  };
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-title">New Client</div>
        <div className="form-grid" style={{ gridTemplateColumns:"1fr" }}>
          {[["name","Client / Business Name *"],["email","Email Address *"],["phone","Phone Number"]].map(([k,l]) => (
            <div className="form-group" key={k}>
              <label>{l}</label>
              <input value={form[k]} onChange={e => setForm(f => ({ ...f, [k]:e.target.value }))} />
            </div>
          ))}
          <div className="form-group">
            <label>Country</label>
            <select value={form.country} onChange={e => setForm(f => ({ ...f, country:e.target.value }))}>
              {["Morocco","Algeria","Tunisia","France","Belgium","Netherlands","UAE","Saudi Arabia","Other"].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div style={{ display:"flex", gap:10, justifyContent:"flex-end", marginTop:8 }}>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave}>Save Client</button>
        </div>
      </div>
    </div>
  );
}

function InvoicePreview({ invoice, onClose, currency }) {
  const f = (n) => fmtCurrency(n, currency || "EUR");
  const subtotal = invoice.subtotal != null ? invoice.subtotal : invoice.amount;
  const taxAmt = invoice.taxAmt != null ? invoice.taxAmt : invoice.amount * 0.2;
  const discountAmt = invoice.discountAmt != null ? invoice.discountAmt : 0;
  const total = invoice.total != null ? invoice.total : invoice.amount * 1.2;
  const tax = invoice.tax != null ? invoice.tax : 20;
  const discount = invoice.discount != null ? invoice.discount : 0;

  return (
    <div className="modal-overlay"> {/* إزالة خاصية الإغلاق بالنقر هنا */}
      <div className="invoice-preview-wrapper" style={{ width:"100%", maxWidth:760, maxHeight:"95vh", overflow:"auto", borderRadius:16, margin:"0 auto" }}>
        <div className="print-hide" style={{ display:"flex", justifyContent:"space-between", padding:"12px 0 16px" }}>
          <button className="btn btn-ghost btn-sm" onClick={() => window.print()}>Print / PDF</button>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>Close</button>
        </div>
        <div className="invoice-preview">
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:36 }}>
            <div style={{ display:"flex", alignItems:"center", gap:14 }}>
              {invoice.sellerLogo
                ? <img src={invoice.sellerLogo} style={{ height: (invoice.sellerLogoSize || 80) * 1.5, maxWidth:220, width: "auto", objectFit:"contain" }} alt="seller logo" />
                : <div style={{ fontFamily:"'Playfair Display', serif", fontSize:26, color:"#c9a84c", fontWeight:700 }}>{invoice.sellerName || "Fatūra"}</div>
              }
            </div>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontSize:11, color:"#aaa", fontWeight:600, letterSpacing:1, textTransform:"uppercase", marginBottom:4 }}>Invoice</div>
              <div style={{ fontSize:22, fontWeight:800, color:"#1a1a2e" }}>{invoice.id}</div>
              <div style={{ fontSize:12, color:"#777", marginTop:6 }}>
                <div><span style={{ fontWeight:600 }}>Date:</span> {formatDate(invoice.date)}</div>
                <div><span style={{ fontWeight:600 }}>Due:</span> {formatDate(invoice.due)}</div>
              </div>
              <div style={{ marginTop:8 }}>
                <span style={{ display:"inline-block", padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:700,
                  background:invoice.status==="paid"?"#e6f7f1":invoice.status==="overdue"?"#fdeaea":"#fef8ec",
                  color:invoice.status==="paid"?"#2d8c65":invoice.status==="overdue"?"#c0392b":"#c17f24" }}>
                  {invoice.status && invoice.status.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:24, marginBottom:36, background:"#faf8f3", borderRadius:10, padding:"20px 24px" }}>
            <div>
              <div style={{ fontSize:10, fontWeight:800, color:"#c9a84c", letterSpacing:1.5, textTransform:"uppercase", marginBottom:10, display:"flex", alignItems:"center", gap:6 }}>
                <span style={{ background:"#c9a84c", color:"#fff", borderRadius:4, padding:"2px 7px", fontSize:9 }}>FROM</span>Seller
              </div>
              {invoice.buyerLogo && <img src={invoice.buyerLogo} style={{ height: (invoice.buyerLogoSize || 60) * 1.5, maxWidth: 180, width: "auto", objectFit:"contain", marginBottom:8, display:"block" }} alt="" />}
              <div style={{ fontWeight:700, fontSize:14, color:"#1a1a2e", marginBottom:4 }}>{invoice.sellerName || "—"}</div>
              {invoice.sellerEmail && <div style={{ fontSize:12, color:"#555" }}>{invoice.sellerEmail}</div>}
              {invoice.sellerPhone && <div style={{ fontSize:12, color:"#555" }}>{invoice.sellerPhone}</div>}
              {invoice.sellerAddress && <div style={{ fontSize:12, color:"#777", marginTop:4, lineHeight:1.5 }}>{invoice.sellerAddress}</div>}
            </div>
            <div style={{ borderLeft:"1px solid #e8dfc8", paddingLeft:24 }}>
              <div style={{ fontSize:10, fontWeight:800, color:"#c9a84c", letterSpacing:1.5, textTransform:"uppercase", marginBottom:10, display:"flex", alignItems:"center", gap:6 }}>
                <span style={{ background:"#c9a84c", color:"#fff", borderRadius:4, padding:"2px 7px", fontSize:9 }}>TO</span>Client
              </div>
              {invoice.buyerLogo && <img src={invoice.buyerLogo} style={{ height: (invoice.buyerLogoSize || 60) * 1.5, maxWidth: 180, width: "auto", objectFit:"contain", marginBottom:8, display:"block" }} alt="" />}
              <div style={{ fontWeight:700, fontSize:14, color:"#1a1a2e", marginBottom:4 }}>{invoice.client || "—"}</div>
              {invoice.email && <div style={{ fontSize:12, color:"#555" }}>{invoice.email}</div>}
              {invoice.buyerPhone && <div style={{ fontSize:12, color:"#555" }}>{invoice.buyerPhone}</div>}
              {invoice.buyerAddress && <div style={{ fontSize:12, color:"#777", marginTop:4, lineHeight:1.5 }}>{invoice.buyerAddress}</div>}
            </div>
          </div>

          <table className="preview-table">
            <thead><tr>
              <th style={{ width:"50%" }}>Description</th>
              <th>Qty</th>
              <th>Unit Price</th>
              <th style={{ textAlign:"right" }}>Amount</th>
            </tr></thead>
            <tbody>
              {(invoice.items && invoice.items.length > 0 ? invoice.items : [{ desc:"Professional Services", qty:1, price:invoice.amount }]).map((it, i) => (
                <tr key={i}>
                  <td>
                    <div style={{ fontWeight:500, color:"#1a1a2e" }}>{it.desc || "Service"}</div>
                    {it.note && <div style={{ fontSize:11, color:"#999", marginTop:3, fontStyle:"italic", lineHeight:1.5 }}>{it.note}</div>}
                  </td>
                  <td>{it.qty}</td>
                  <td>{f(it.price)}</td>
                  <td style={{ textAlign:"right" }}>{f(it.qty * it.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:28 }}>
            <div style={{ minWidth:260 }}>
              <div className="preview-total-section">
                <div className="preview-total-row"><span>Subtotal</span><span>{f(subtotal)}</span></div>
                {discountAmt > 0 && <div className="preview-total-row" style={{ color:"#2d8c65" }}><span>Discount ({discount}%)</span><span>- {f(discountAmt)}</span></div>}
                <div className="preview-total-row"><span>Tax ({tax}%)</span><span>{f(taxAmt)}</span></div>
                <div className="preview-total-row grand"><span>Total Due</span><span>{f(total)}</span></div>
              </div>
            </div>
          </div>

          {invoice.notes && (
            <div className="invoice-notes" style={{ marginBottom:16, padding:"14px 18px", background:"#f5f3ef", borderRadius:8, borderLeft:"3px solid #c9a84c" }}>
              <div style={{ fontSize:10, fontWeight:800, color:"#c9a84c", letterSpacing:1, textTransform:"uppercase", marginBottom:6 }}>Notes</div>
              <div style={{ fontSize:13, color:"#555", lineHeight:1.6 }}>{invoice.notes}</div>
            </div>
          )}

          {invoice.bankInfo && (
            <div style={{ padding:"14px 18px", background:"#f5f3ef", borderRadius:8, borderLeft:"3px solid #c9a84c" }}>
              <div style={{ fontSize:10, fontWeight:800, color:"#c9a84c", letterSpacing:1, textTransform:"uppercase", marginBottom:8 }}>Payment Information</div>
              <pre style={{ fontSize:12, color:"#333", lineHeight:1.8, fontFamily:"monospace", whiteSpace:"pre-wrap", margin:0 }}>{invoice.bankInfo}</pre>
            </div>
          )}

          <div className="preview-footer" style={{ marginTop:32 }}>
            {invoice.sellerName ? (invoice.sellerName + " · ") : ""}Thank you for your business · Fatūra Invoicing
          </div>
        </div>
      </div>
    </div>
  );
}

function ReminderModal({ invoice, onClose, onLog, f }) {
  const today = new Date().toISOString().split("T")[0];
  const daysOverdue = invoice.due ? Math.floor((new Date(today) - new Date(invoice.due)) / 86400000) : 0;
  const [tone, setTone] = useState("polite");
  const [channel, setChannel] = useState("email");
  const [sent, setSent] = useState(false);

  const getBody = (t, c) => {
    const bodies = {
      polite: "Dear " + invoice.client + ",\n\nThis is a friendly reminder that Invoice " + invoice.id + " for " + f(invoice.amount) + " was due on " + formatDate(invoice.due) + ".\n\nPlease arrange payment at your earliest convenience.\n\nWarm regards,\n" + (invoice.sellerName || "Your Company"),
      firm: "Dear " + invoice.client + ",\n\nInvoice " + invoice.id + " for " + f(invoice.amount) + " is now " + daysOverdue + " days overdue.\n\nPlease process payment within 5 business days.\n\nBest regards,\n" + (invoice.sellerName || "Your Company"),
      final: "Dear " + invoice.client + ",\n\nThis is our final notice. Invoice " + invoice.id + " for " + f(invoice.amount) + " is " + daysOverdue + " days overdue.\n\nPlease arrange immediate payment or contact us within 48 hours.\n\nRegards,\n" + (invoice.sellerName || "Your Company"),
    };
    const wa = {
      polite: "Hi " + invoice.client + ", friendly reminder about Invoice " + invoice.id + " for " + f(invoice.amount) + " due " + formatDate(invoice.due) + ". Thank you!",
      firm: "Hi " + invoice.client + ", Invoice " + invoice.id + " for " + f(invoice.amount) + " is " + daysOverdue + " days overdue. Please pay within 5 days.",
      final: "Dear " + invoice.client + ", Invoice " + invoice.id + " is " + daysOverdue + " days overdue. Final notice — please pay immediately.",
    };
    return c === "email" ? bodies[t] : wa[t];
  };

  const [editedText, setEditedText] = useState(getBody("polite","email"));
  const tones = [
    { id:"polite", label:"Polite", desc:"Friendly first reminder", color:"var(--green)" },
    { id:"firm", label:"Firm", desc:"Professional follow-up", color:"var(--orange)" },
    { id:"final", label:"Final", desc:"Last notice before action", color:"var(--red)" },
  ];

  const subjects = { polite:"Friendly Reminder – Invoice " + invoice.id, firm:"Payment Overdue – Invoice " + invoice.id, final:"FINAL NOTICE – Invoice " + invoice.id };

  const handleSend = () => {
    if (channel === "email" && invoice.email) {
      window.open("mailto:" + invoice.email + "?subject=" + encodeURIComponent(subjects[tone]) + "&body=" + encodeURIComponent(editedText), "_blank");
    } else if (channel === "whatsapp") {
      window.open("https://wa.me/" + (invoice.buyerPhone || "").replace(/\D/g,"") + "?text=" + encodeURIComponent(editedText), "_blank");
    }
    onLog(invoice.id, { date:today, tone, channel });
    setSent(true);
    setTimeout(() => onClose(), 1800);
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth:600 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:4 }}>
          <div>
            <div className="modal-title" style={{ marginBottom:4 }}>Payment Reminder</div>
            <div style={{ fontSize:13, color:"var(--text2)" }}>
              <span style={{ color:"var(--gold)", fontWeight:700 }}>{invoice.id}</span> · {invoice.client} · <span style={{ color:"var(--red)", fontWeight:600 }}>{f(invoice.amount)}</span>
              {daysOverdue > 0 && <span style={{ marginLeft:8, background:"rgba(224,85,85,0.15)", color:"var(--red)", borderRadius:20, padding:"2px 8px", fontSize:11, fontWeight:700 }}>{daysOverdue}d overdue</span>}
            </div>
          </div>
          <button onClick={onClose} style={{ background:"none", border:"none", color:"var(--text2)", cursor:"pointer", fontSize:18 }}>✕</button>
        </div>

        <div style={{ margin:"18px 0 14px" }}>
          <div style={{ fontSize:11, fontWeight:700, color:"var(--text2)", letterSpacing:0.5, textTransform:"uppercase", marginBottom:8 }}>Send Via</div>
          <div style={{ display:"flex", gap:8 }}>
            {[["email","Email"],["whatsapp","WhatsApp"]].map(([id,label]) => (
              <button key={id} onClick={() => { setChannel(id); setEditedText(getBody(tone,id)); }} className="btn btn-sm"
                style={{ background:channel===id?"var(--gold)":"var(--bg3)", color:channel===id?"#000":"var(--text2)", border:"1px solid var(--border)", fontWeight:channel===id?700:500 }}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:11, fontWeight:700, color:"var(--text2)", letterSpacing:0.5, textTransform:"uppercase", marginBottom:8 }}>Tone</div>
          <div style={{ display:"flex", gap:8 }}>
            {tones.map(t => (
              <div key={t.id} onClick={() => { setTone(t.id); setEditedText(getBody(t.id,channel)); }}
                style={{ flex:1, padding:"10px 12px", borderRadius:10, cursor:"pointer",
                  background:tone===t.id ? (t.color+"22") : "var(--bg3)",
                  border:"1.5px solid " + (tone===t.id ? t.color : "var(--border)") }}>
                <div style={{ fontSize:13, fontWeight:700, color:tone===t.id?t.color:"var(--text2)" }}>{t.label}</div>
                <div style={{ fontSize:11, color:"var(--text2)", marginTop:2 }}>{t.desc}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="form-group" style={{ marginBottom:16 }}>
          <label>{channel==="email" && <span style={{ color:"var(--text2)", fontSize:11 }}>Subject: <strong style={{ color:"var(--text)" }}>{subjects[tone]}</strong></span>}</label>
          <textarea rows={channel==="email"?9:5} value={editedText} onChange={e => setEditedText(e.target.value)} style={{ resize:"vertical", fontSize:12, lineHeight:1.7, marginTop:channel==="email"?8:0 }} />
          <div style={{ fontSize:11, color:"var(--text2)", marginTop:4 }}>You can edit the message before sending</div>
        </div>

        <div style={{ display:"flex", gap:10, justifyContent:"space-between", alignItems:"center", borderTop:"1px solid var(--border)", paddingTop:16 }}>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          {sent
            ? <div style={{ color:"var(--green)", fontWeight:700, fontSize:14 }}>✓ Done!</div>
            : <div style={{ display:"flex", gap:8 }}>
                <button className="btn btn-ghost btn-sm" onClick={() => { navigator.clipboard.writeText(editedText); onLog(invoice.id,{date:today,tone,channel:"copy"}); setSent(true); setTimeout(()=>setSent(false),2000); }}>Copy</button>
                <button className="btn btn-primary" onClick={handleSend} style={{ background:tone==="final"?"var(--red)":"var(--gold)", color:"#000" }}>
                  {channel==="email" ? "Open in Mail" : "Open WhatsApp"}
                </button>
              </div>
          }
        </div>
      </div>
    </div>
  );
}

function UpgradeModal({ feature, onClose, onActivate }) {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("plans");
  const [selectedPlan, setSelectedPlan] = useState("pro");

  const PLANS_INFO = {
    pro: { name:"Pro", price:"\u20ac9", period:"/month", color:"var(--gold)", stripe_link:"https://buy.stripe.com/test_YOUR_PRO_LINK",
      features:["Unlimited invoices","Unlimited clients","Payment reminders (Email + WhatsApp)","PDF export","Custom logo & branding"] },
    business: { name:"Business", price:"\u20ac19", period:"/month", color:"#a78bfa", badge:"Coming Soon", stripe_link:null,
      features:["Everything in Pro","Team members (up to 5)","Multi-business profiles","Advanced analytics","Stripe payment integration","API access"] },
  };

  const featureLabels = {
    reminders: { icon:"!", label:"Payment Reminders", desc:"Send overdue reminders via Email & WhatsApp" },
    unlimited_invoices: { icon:"!", label:"Unlimited Invoices", desc:"You've hit the 5 invoice limit on the Free plan" },
    unlimited_clients: { icon:"!", label:"Unlimited Clients", desc:"You've hit the 3 client limit on the Free plan" },
  };

  const feat = featureLabels[feature] || { icon:"✦", label:"Pro Feature", desc:"Unlock all Pro features" };

  const handleStripe = () => {
    setLoading(true);
    setTimeout(() => { setStep("success"); setLoading(false); }, 1500);
  };

  if (step === "success") {
    return (
      <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
        <div className="modal" style={{ maxWidth:440, textAlign:"center" }}>
          <div style={{ fontSize:32, marginBottom:16, fontWeight: 700, color:"var(--green)" }}>Success</div>
          <div className="modal-title" style={{ textAlign:"center", color:"var(--gold)" }}>Welcome to Pro!</div>
          <p style={{ color:"var(--text2)", fontSize:14, marginBottom:28, lineHeight:1.7 }}>Your account has been upgraded. All Pro features are now unlocked.</p>
          <div style={{ background:"var(--bg3)", border:"1px solid var(--border)", borderRadius:12, padding:"16px 20px", marginBottom:24, textAlign:"left" }}>
            {PLANS_INFO.pro.features.map((feat2, i) => (
              <div key={i} style={{ display:"flex", gap:10, fontSize:13, color:"var(--text)", marginBottom:i<PLANS_INFO.pro.features.length-1?8:0 }}>
                <span style={{ color:"var(--green)" }}>✓</span> {feat2}
              </div>
            ))}
          </div>
          <button className="btn btn-primary" style={{ width:"100%", justifyContent:"center", fontSize:15, padding:"13px" }} onClick={() => { onActivate(); onClose(); }}>Start Using Pro →</button>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth:520 }}>
        <div style={{ textAlign:"center", marginBottom:24 }}>
          <div style={{ fontSize:36, marginBottom:10, color:"var(--gold)", fontWeight:700 }}>{feat.icon}</div>
          <div className="modal-title" style={{ textAlign:"center", marginBottom:6 }}>Unlock <span style={{ color:"var(--gold)" }}>{feat.label}</span></div>
          <div style={{ fontSize:13, color:"var(--text2)" }}>{feat.desc}</div>
        </div>

        <div style={{ display:"flex", gap:10, marginBottom:20 }}>
          {Object.entries(PLANS_INFO).map(([key, p]) => (
            <div key={key} onClick={() => !p.badge && setSelectedPlan(key)}
              style={{ flex:1, border:"1.5px solid " + (selectedPlan===key?p.color:"var(--border2)"), borderRadius:12, padding:"16px 14px",
                cursor:p.badge?"not-allowed":"pointer", background:selectedPlan===key?(p.color+"15"):"var(--bg3)",
                transition:"all 0.2s", opacity:p.badge?0.55:1, position:"relative" }}>
              {p.badge && <div style={{ position:"absolute", top:8, right:8, fontSize:9, fontWeight:700, background:"var(--bg4)", color:"var(--text2)", borderRadius:20, padding:"2px 7px" }}>{p.badge}</div>}
              <div style={{ fontSize:11, fontWeight:700, color:"var(--text2)", letterSpacing:1, textTransform:"uppercase", marginBottom:6 }}>{p.name}</div>
              <div style={{ display:"flex", alignItems:"baseline", gap:2, marginBottom:10 }}>
                <span style={{ fontSize:26, fontWeight:800, color:p.color, fontFamily:"'Playfair Display', serif" }}>{p.price}</span>
                <span style={{ fontSize:12, color:"var(--text2)" }}>{p.period}</span>
              </div>
              {p.features.slice(0,3).map((feat3, i) => (
                <div key={i} style={{ fontSize:11, color:"var(--text2)", marginBottom:4, display:"flex", gap:6 }}>
                  <span style={{ color:"var(--green)" }}>✓</span>{feat3}
                </div>
              ))}
              {p.features.length > 3 && <div style={{ fontSize:11, color:"var(--text3)", marginTop:4 }}>+{p.features.length-3} more features</div>}
            </div>
          ))}
        </div>

        <div style={{ background:"var(--bg3)", border:"1px solid var(--border)", borderRadius:12, padding:"16px 18px", marginBottom:16 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
            <div>
              <div style={{ fontSize:13, fontWeight:700, color:"var(--text)" }}>Secure payment via Stripe</div>
              <div style={{ fontSize:11, color:"var(--text2)" }}>Visa · Mastercard · Apple Pay · Google Pay</div>
            </div>
          </div>
          <div style={{ fontSize:11, color:"var(--text2)", display:"flex", gap:16, flexWrap:"wrap" }}>
            <span>TLS encrypted</span><span>Cancel anytime</span><span>Invoice sent to email</span>
          </div>
        </div>

        <button className="btn btn-primary" style={{ width:"100%", justifyContent:"center", fontSize:15, padding:"14px", marginBottom:10 }}
          onClick={handleStripe} disabled={loading || !!(PLANS_INFO[selectedPlan] && PLANS_INFO[selectedPlan].badge)}>
          {loading
            ? <span style={{ display:"flex", alignItems:"center", gap:8 }}>
                <span style={{ width:16, height:16, border:"2px solid #000", borderTopColor:"transparent", borderRadius:"50%", display:"inline-block", animation:"spin 0.7s linear infinite" }} />
                Connecting to Stripe...
              </span>
            : ("Upgrade to " + PLANS_INFO[selectedPlan].name + " — " + PLANS_INFO[selectedPlan].price + "/mo")
          }
        </button>

        <div style={{ textAlign:"center", fontSize:11, color:"var(--text3)" }}>No commitment · Cancel anytime · 14-day money back guarantee</div>
        <button onClick={onClose} style={{ display:"block", margin:"14px auto 0", background:"none", border:"none", color:"var(--text2)", cursor:"pointer", fontSize:13 }}>Maybe later</button>
      </div>
    </div>
  );
}