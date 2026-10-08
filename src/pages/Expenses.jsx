// Fatura Pro - Expenses + VAT/BTW report (Business plan)
import { useEffect, useMemo, useRef, useState } from "react";
import { loadExpenses, saveExpense, deleteExpense, vatReport } from "../lib/expenses";
import { CURRENCIES, fmtCurrency, codesUsed } from "../lib/currencies";
import { exportExpensesCSV } from "../lib/accountantExport";
import { trackEvent } from "../lib/tracking";
import { recordActivationEvent } from "../lib/activationEvents";
import { getLocale, tr } from "../lib/locale";
import { uploadReceipt, openReceipt, deleteReceipt, scanReceipt, receiptToForm } from "../lib/receipts";
import { Download as DownloadIcon, Paperclip as PaperclipIcon, Camera as CameraIcon } from "lucide-react";

const CATEGORIES = ["software", "hardware", "office", "travel", "marketing", "services", "other"];

export default function Expenses({ expenses, setExpenses, invoices, userId }) {
  const locale = getLocale();
  const t = (key, fallback) => tr(key, fallback, locale);
  const now = new Date();
  const [editing, setEditing] = useState(null);
  // In the first month of a quarter you file the VAT return of the quarter before it
  // (deadline: the end of that month), so the report opens on that quarter.
  const currentQ = Math.floor(now.getMonth() / 3) + 1;
  const filingMonth = now.getMonth() % 3 === 0;
  const [year, setYear] = useState(filingMonth && currentQ === 1 ? now.getFullYear() - 1 : now.getFullYear());
  const [quarter, setQuarter] = useState(filingMonth ? (currentQ === 1 ? 4 : currentQ - 1) : currentQ);
  // Years to choose from: this year back to the oldest invoice or expense (records are kept 7 years).
  const oldestYear = (invoices || []).concat(expenses || []).reduce((min, x) => { const y = Number(String(x.date || "").slice(0, 4)); return y > 1990 && y < min ? y : min; }, now.getFullYear());
  const yearOptions = Array.from({ length: Math.min(7, Math.max(3, now.getFullYear() - oldestYear + 1)) }, (_, i) => now.getFullYear() - i);

  const refresh = async () => setExpenses(await loadExpenses(userId));
  const currencyCodes = codesUsed((invoices || []).concat(expenses || []), "EUR");
  const [reportCur, setReportCur] = useState("");
  const activeCur = currencyCodes.indexOf(reportCur) > -1 ? reportCur : currencyCodes[0];
  const report = vatReport(invoices, expenses, year, quarter, activeCur);
  const fmt = (n) => fmtCurrency(n, activeCur);
  const periodExpenses = (expenses || []).filter((expense) => {
    const date = new Date(expense.date);
    return expense.date
      && !Number.isNaN(date.getTime())
      && date.getFullYear() === year
      && Math.floor(date.getMonth() / 3) + 1 === quarter
      && (expense.currency || "EUR") === activeCur;
  });

  const exportPeriod = () => {
    const filename = `fatura-pro-expenses-${year}-Q${quarter}-${activeCur}.csv`;
    const count = exportExpensesCSV(periodExpenses, filename);
    trackEvent("expenses_csv_exported", { year, quarter, currency:activeCur, expense_count:count });
  };

  const handleDelete = async (e) => {
    if (!window.confirm(locale === "ar" ? "حذف المصروف «" + e.description + "»؟" : "Delete expense \"" + e.description + "\"?")) return;
    const deleted = await deleteExpense(e.id, userId);
    if (deleted && e.receipt_path) deleteReceipt(e.receipt_path);
    refresh();
  };

  const showReceipt = async (e) => {
    if (!(await openReceipt(e.receipt_path))) window.alert(t("receipt_open_failed", "Could not open this receipt. Please try again."));
  };

  // The modal uploads a new receipt as soon as it is picked (so it can be read). Save the expense,
  // then remove a replaced receipt, so a failed save never leaves an expense pointing at a missing file.
  // Returns true when saved; the modal deletes its unsaved upload otherwise.
  const handleSave = async ({ expense, newPath, removeReceipt }) => {
    const creating = editing === "new";
    const oldPath = creating ? null : editing.receipt_path || null;
    const finalPath = newPath || (removeReceipt ? null : oldPath);
    const row = { ...expense };
    delete row.receipt_path;
    // Only send the column when a receipt is involved, so saving works before the migration runs.
    if (finalPath || oldPath) row.receipt_path = finalPath;

    const saved = await saveExpense(row, userId);
    if (!saved) {
      window.alert(locale === "ar" ? "تعذر حفظ المصروف. حاول مرة أخرى." : "Could not save this expense. Please try again.");
      return false;
    }
    if (oldPath && oldPath !== finalPath) deleteReceipt(oldPath);
    trackEvent(creating ? "expense_created" : "expense_updated", { currency:expense.currency || "EUR", category:expense.category || "other", vat_rate:Number(expense.vat_rate) || 0, has_receipt:!!finalPath });
    if (creating) recordActivationEvent("expense_created", {
      metadata:{ currency:expense.currency || "EUR", is_first_expense:expenses.length === 0 },
    }).catch(() => {});
    setEditing(null);
    refresh();
    return true;
  };

  return (
    <div>
      {/* VAT Report */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:10, marginBottom:14 }}>
          <div className="card-title">{t("vat_report", "VAT / BTW Report")}{currencyCodes.length > 1 ? " (" + activeCur + ")" : ""}</div>
          <div style={{ display:"flex", gap:8 }}>
            {currencyCodes.length > 1 && (
              <select value={activeCur} onChange={(e) => setReportCur(e.target.value)}>
                {currencyCodes.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            )}
            <select value={quarter} onChange={(e) => setQuarter(Number(e.target.value))}>
              <option value={1}>Q1 (Jan–Mar)</option><option value={2}>Q2 (Apr–Jun)</option>
              <option value={3}>Q3 (Jul–Sep)</option><option value={4}>Q4 (Oct–Dec)</option>
            </select>
            <select value={year} onChange={(e) => setYear(Number(e.target.value))}>
              {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(150px, 1fr))", gap:12 }}>
          <div className="stat-card"><div className="stat-label">{t("revenue_excl", "Revenue (excl. VAT)")}</div><div className="stat-value" style={{ fontSize:20 }}>{fmt(report.revenueExcl)}</div><div className="stat-change">{report.invoiceCount} {t("invoices", "invoices").toLowerCase()}</div></div>
          <div className="stat-card"><div className="stat-label">{t("vat_collected", "VAT collected")}</div><div className="stat-value" style={{ fontSize:20 }}>{fmt(report.vatCollected)}</div><div className="stat-change">{t("on_sales", "on sales")}</div></div>
          <div className="stat-card"><div className="stat-label">{t("vat_paid", "VAT paid")}</div><div className="stat-value" style={{ fontSize:20 }}>{fmt(report.vatPaid)}</div><div className="stat-change">{report.expenseCount} {t("expense_count", "expenses")}</div></div>
          <div className="stat-card" style={{ border:"1px solid " + (report.vatDue >= 0 ? "rgba(224,85,85,0.4)" : "rgba(45,140,101,0.4)") }}>
            <div className="stat-label">{report.vatDue >= 0 ? t("vat_pay", "VAT to pay") : t("vat_reclaim", "VAT to reclaim")}</div>
            <div className="stat-value" style={{ fontSize:20, color: report.vatDue >= 0 ? "var(--red)" : "#2d8c65" }}>{fmt(Math.abs(report.vatDue))}</div>
            <div className="stat-change">Q{quarter} {year}</div>
          </div>
        </div>
        <div style={{ fontSize:12, color:"#999", marginTop:12 }}>{t("vat_period_note", "Only invoices and expenses dated in the selected quarter are counted. Choose another quarter above to see that period.")}</div>
      </div>

      {/* Expenses list */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14, gap:10, flexWrap:"wrap" }}>
        <div className="card-title">{t("expenses", "Expenses")}</div>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          <button className="btn btn-ghost" disabled={periodExpenses.length === 0} onClick={exportPeriod}><DownloadIcon size={15} strokeWidth={2} aria-hidden="true" style={{ verticalAlign:"-3px", marginInlineEnd:6 }} />{t("export_quarter", "Export")} Q{quarter} CSV</button>
          <button className="btn btn-primary" onClick={() => setEditing("new")}>+ {t("add_expense", "Add expense")}</button>
        </div>
      </div>

      {expenses.length === 0 && (
        <div className="card" style={{ textAlign:"center", padding:40, color:"#999" }}>
          <div>{t("no_expenses", "No expenses yet. Track your business costs here — VAT you paid is deducted automatically in the report above.")}</div>
          <button className="btn btn-primary" style={{ marginTop:16 }} onClick={() => setEditing("new")}>{t("add_expense", "Add an expense")}</button>
        </div>
      )}

      {expenses.map((e) => (
        <div key={e.id} className="card" title={periodExpenses.includes(e) ? undefined : t("expense_other_period", "Not in the selected quarter")} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8, padding:"12px 16px", flexWrap:"wrap", gap:8, opacity: periodExpenses.includes(e) ? 1 : 0.55 }}>
          <div>
            <div style={{ fontWeight:700 }}>{e.description}</div>
            <div style={{ fontSize:12, color:"#999" }}>{e.date} · {e.category}{e.supplier ? " · " + e.supplier : ""} · VAT {e.vat_rate}%</div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ fontWeight:700 }}>{fmtCurrency(e.amount_incl, e.currency || "EUR")}</span>
            {e.receipt_path && <button className="btn btn-ghost btn-sm" title={t("view_receipt", "View receipt")} aria-label={t("view_receipt", "View receipt")} onClick={() => showReceipt(e)}><PaperclipIcon size={15} strokeWidth={2} aria-hidden="true" /></button>}
            <button className="btn btn-ghost btn-sm" onClick={() => setEditing(e)}>{t("edit", "Edit")}</button>
            <button className="btn btn-ghost btn-sm" style={{ color:"#e05555" }} onClick={() => handleDelete(e)}>✕</button>
          </div>
        </div>
      ))}

      {editing && (
        <ExpenseModal
          expense={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          defaultCurrency={activeCur}
          locale={locale}
          onSave={handleSave}
          onViewReceipt={showReceipt}
          ownerId={userId}
        />
      )}
    </div>
  );
}

function ExpenseModal({ expense, onClose, onSave, onViewReceipt, ownerId, defaultCurrency, locale }) {
  const t = (key, fallback) => tr(key, fallback, locale);
  const isEdit = !!expense;
  const [receiptFile, setReceiptFile] = useState(null);
  // A receipt picked in this dialog is uploaded straight away so it can be read;
  // it stays "unsaved" until the expense is saved, and is deleted if the dialog is closed.
  const [newPath, setNewPath] = useState(null);
  const [removeReceipt, setRemoveReceipt] = useState(false);
  const [scanState, setScanState] = useState(""); // "", "reading", "filled", "failed"
  const [saving, setSaving] = useState(false);
  const receiptInput = useRef(null);
  const pickCount = useRef(0);
  const previewUrl = useMemo(() => (receiptFile && receiptFile.type.startsWith("image/") ? URL.createObjectURL(receiptFile) : null), [receiptFile]);
  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);
  const hasStoredReceipt = !!expense?.receipt_path && !removeReceipt && !receiptFile;
  const busy = scanState === "reading";

  const [form, setForm] = useState(expense || {
    date: new Date().toISOString().split("T")[0],
    description:"", category:"other", supplier:"",
    amount_excl:"", vat_rate:21, currency: defaultCurrency || "EUR",
  });
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const pickReceipt = async (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = "";
    if (!file) return;
    const pick = ++pickCount.current;
    if (newPath) deleteReceipt(newPath);
    setNewPath(null);
    setReceiptFile(file);
    setRemoveReceipt(false);
    setScanState("reading");
    const up = await uploadReceipt(file, ownerId);
    if (pick !== pickCount.current) { if (up.path) deleteReceipt(up.path); return; }
    if (up.error) {
      setReceiptFile(null);
      setScanState("");
      window.alert(up.error === "too_big" ? t("receipt_too_big", "This file is larger than 5 MB.") : t("receipt_upload_failed", "Could not upload the receipt. Please try again."));
      return;
    }
    setNewPath(up.path);
    const fields = await scanReceipt(up.path, file);
    if (pick !== pickCount.current) return;
    const { vat_unknown, ...values } = receiptToForm(fields);
    if (Object.keys(values).length) {
      setForm((p) => ({ ...p, ...values }));
      // Say exactly what is missing instead of "filled in" when the amount or VAT was not found.
      setScanState(!values.amount_excl ? "no_amount" : vat_unknown ? "no_vat" : "filled");
    } else {
      setScanState("failed");
    }
  };
  const clearReceipt = () => {
    pickCount.current++;
    if (newPath) deleteReceipt(newPath);
    setNewPath(null);
    setReceiptFile(null);
    setRemoveReceipt(true);
    setScanState("");
  };
  const close = () => {
    pickCount.current++;
    if (newPath) deleteReceipt(newPath);
    onClose();
  };

  const excl = Number(form.amount_excl) || 0;
  const vatAmount = excl * (Number(form.vat_rate) / 100);
  const incl = excl + vatAmount;

  const save = async () => {
    if (saving || busy) return;
    if (!form.description.trim()) { alert(locale === "ar" ? "الوصف مطلوب" : "Description is required"); return; }
    if (!excl) { alert(locale === "ar" ? "المبلغ مطلوب" : "Amount is required"); return; }
    setSaving(true);
    try {
      await onSave({ expense: { ...form, amount_excl: excl, vat_amount: vatAmount, amount_incl: incl }, newPath, removeReceipt });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={close}>
      <div className="modal" style={{ maxWidth:520 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:16 }}>
          <div className="card-title">{isEdit ? t("edit_expense", "Edit expense") : t("new_expense", "New expense")}</div>
          <button className="btn btn-ghost btn-sm" onClick={close}>✕</button>
        </div>

        <div style={{ display:"grid", gap:10 }}>
          <div style={{ border:"1px dashed rgba(128,128,128,0.45)", borderRadius:10, padding:12, display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" }}>
            <input ref={receiptInput} type="file" accept="image/*,application/pdf" onChange={pickReceipt} style={{ display:"none" }} />
            {previewUrl && <img src={previewUrl} alt="" style={{ width:56, height:56, objectFit:"cover", borderRadius:8 }} />}
            <div style={{ flex:1, minWidth:160, fontSize:13 }}>
              <div style={{ fontWeight:700 }}>{t("receipt", "Receipt")}</div>
              <div aria-live="polite" style={{ color: scanState === "filled" ? "#2d8c65" : scanState === "no_amount" || scanState === "no_vat" ? "#d68a1c" : "#999", fontSize:12 }}>
                {scanState === "reading" ? t("receipt_reading", "Reading the receipt…")
                  : scanState === "filled" ? t("receipt_filled", "Filled in from the receipt. Please check the details.")
                  : scanState === "no_amount" ? t("receipt_no_amount", "Filled in from the receipt, but the amount could not be read. Please enter it.")
                  : scanState === "no_vat" ? t("receipt_no_vat", "Total found, but no VAT on the receipt. Please check the VAT rate.")
                  : scanState === "failed" ? t("receipt_scan_failed", "Could not read the receipt. Please fill in the details.")
                  : receiptFile ? receiptFile.name
                  : hasStoredReceipt ? t("receipt_attached", "Receipt attached")
                  : t("receipt_hint", "Add a photo or PDF and we fill in the details. Keep receipts for 7 years.")}
              </div>
            </div>
            {hasStoredReceipt && <button type="button" className="btn btn-ghost btn-sm" onClick={() => onViewReceipt(expense)}><PaperclipIcon size={14} strokeWidth={2} aria-hidden="true" style={{ verticalAlign:"-3px", marginInlineEnd:6 }} />{t("view_receipt", "View receipt")}</button>}
            <button type="button" className="btn btn-ghost btn-sm" disabled={busy} onClick={() => receiptInput.current && receiptInput.current.click()}>
              <CameraIcon size={15} strokeWidth={2} aria-hidden="true" style={{ verticalAlign:"-3px", marginInlineEnd:6 }} />{receiptFile || hasStoredReceipt ? t("change_receipt", "Change") : t("add_receipt", "Add receipt")}
            </button>
            {(receiptFile || hasStoredReceipt) && <button type="button" className="btn btn-ghost btn-sm" style={{ color:"#e05555" }} aria-label={t("remove_receipt", "Remove receipt")} title={t("remove_receipt", "Remove receipt")} onClick={clearReceipt}>✕</button>}
          </div>
          <input placeholder={t("description", "Description") + " * (e.g. Adobe subscription)"} value={form.description} onChange={(e) => set("description", e.target.value)} />
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            <label style={{ fontSize:12 }}>{t("date", "Date")}<input type="date" value={form.date} onChange={(e) => set("date", e.target.value)} /></label>
            <label style={{ fontSize:12 }}>{t("currency", "Currency")}<select value={form.currency} onChange={(e) => set("currency", e.target.value)}>{CURRENCIES.map(g => (<optgroup key={g.group} label={g.group}>{g.items.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}</optgroup>))}</select></label>
            <label style={{ fontSize:12 }}>{t("category", "Category")}
              <select value={form.category} onChange={(e) => set("category", e.target.value)}>
                {CATEGORIES.map(c => <option key={c} value={c}>{locale === "ar" ? ({ software:"برمجيات", hardware:"أجهزة", office:"مكتب", travel:"سفر", marketing:"تسويق", services:"خدمات", other:"أخرى" }[c] || c) : c}</option>)}
              </select>
            </label>
          </div>
          <input placeholder={t("supplier", "Supplier (optional)")} value={form.supplier || ""} onChange={(e) => set("supplier", e.target.value)} />
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            <label style={{ fontSize:12 }}>{t("amount_excl", "Amount excl. VAT")} *<input type="number" step="0.01" value={form.amount_excl} onChange={(e) => set("amount_excl", e.target.value)} /></label>
            <label style={{ fontSize:12 }}>{t("vat_rate", "VAT rate")} %
               <select value={[21, 9, 0].includes(Number(form.vat_rate)) ? String(form.vat_rate) : "custom"} onChange={(e) => { if (e.target.value === "custom") set("vat_rate", ""); else set("vat_rate", Number(e.target.value)); }}>
                <option value="21">{locale === "ar" ? "21% (المعدل القياسي في هولندا)" : "21% (NL standard)"}</option>
                <option value="9">{locale === "ar" ? "9% (المعدل المخفّض في هولندا)" : "9% (NL reduced)"}</option>
                <option value="0">{locale === "ar" ? "0% (معفى)" : "0% (exempt)"}</option>
                <option value="custom">{locale === "ar" ? "نسبة مخصّصة…" : "Custom rate…"}</option>
              </select>
              {(form.vat_rate === "" || ![21, 9, 0].includes(Number(form.vat_rate))) && (
                <input type="number" step="0.1" min="0" max="100" placeholder={locale === "ar" ? "أدخل نسبة الضريبة" : "Enter VAT %"} autoFocus value={form.vat_rate} onChange={(e) => set("vat_rate", e.target.value === "" ? "" : Number(e.target.value))} style={{ marginTop: 6 }} />
              )}
            </label>
          </div>
        </div>

        <div style={{ textAlign:"right", margin:"14px 0", fontSize:14 }}>
          {locale === "ar" ? "الضريبة" : "VAT"}: <b>{vatAmount.toFixed(2)}</b> · {t("total_incl", "Total incl.")}: <b>{incl.toFixed(2)} {form.currency}</b>
        </div>

        <div style={{ display:"flex", justifyContent:"flex-end", gap:10 }}>
          <button className="btn btn-ghost" onClick={close}>{t("cancel", "Cancel")}</button>
          <button className="btn btn-primary" disabled={saving || busy} onClick={save}>{saving ? "…" : isEdit ? t("save", "Save changes") : t("add", "Add expense")}</button>
        </div>
      </div>
    </div>
  );
}
