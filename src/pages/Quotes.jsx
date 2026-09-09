// Fatura Pro - Quotes page (Business plan)
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { CURRENCIES, fmtCurrency } from "../lib/currencies";
import { getLocale } from "../lib/locale";
import { trackEvent } from "../lib/tracking";
import { recordActivationEvent } from "../lib/activationEvents";
import { loadQuotes, saveQuote, deleteQuote, nextQuoteId } from "../lib/quotes";

export { loadQuotes };

const QUOTE_CSS = `
.quote-empty { text-align:center; padding:42px 24px; color:var(--text2); }
.quote-empty .btn { margin-top:16px; }
.quote-form-section { padding:14px; margin-bottom:14px; border:1px solid var(--border); border-radius:10px; background:var(--bg3); }
.quote-form-section-title { margin-bottom:10px; color:var(--gold); font-size:11px; font-weight:800; letter-spacing:.7px; text-transform:uppercase; }
.quote-two-col { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
.quote-three-col { display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px; }
.quote-item-row { display:grid; grid-template-columns:minmax(0,3fr) minmax(72px,.7fr) minmax(96px,1fr) auto; gap:8px; margin-bottom:8px; }
.quote-preview-actions { display:flex; justify-content:space-between; gap:10px; padding:12px 0 16px; flex-wrap:wrap; }
.quote-preview-actions > div { display:flex; gap:8px; flex-wrap:wrap; }
.quote-preview-parties { display:grid; grid-template-columns:1fr 1fr; gap:24px; margin-bottom:36px; padding:20px 24px; border-radius:10px; background:#faf8f3; }
.quote-preview-party + .quote-preview-party { border-left:1px solid #e8dfc8; padding-left:24px; }
.quote-email-help { margin:0 0 12px; color:var(--text2); font-size:11px; line-height:1.5; }
@media (max-width:640px) {
  .quote-two-col,.quote-three-col { grid-template-columns:1fr; }
  .quote-item-row { grid-template-columns:minmax(74px,.7fr) minmax(96px,1fr) auto; }
  .quote-item-row > :first-child { grid-column:1 / -1; }
  .quote-preview-wrapper { width:100% !important; max-height:100vh !important; border-radius:0 !important; }
  .quote-preview-actions { position:sticky; top:0; z-index:4; padding:10px; background:var(--bg2); }
  .quote-preview-actions .btn { flex:1; min-height:44px; justify-content:center; }
  .quote-preview-parties { grid-template-columns:1fr; gap:16px; padding:18px; }
  .quote-preview-party + .quote-preview-party { border-left:0; border-top:1px solid #e8dfc8; padding:16px 0 0; }
}
@media print {
  .app { display:none !important; }
  .quote-preview-actions,.quote-email-help { display:none !important; }
  .quote-preview-wrapper { max-height:none !important; overflow:visible !important; width:100% !important; max-width:100% !important; }
  .quote-preview-parties { grid-template-columns:1fr 1fr !important; }
  .quote-preview-party + .quote-preview-party { border-top:0 !important; border-left:1px solid #e8dfc8 !important; padding:0 0 0 24px !important; }
}
`;

const COPY = {
  en: { document:"Quote", from:"From", to:"Client", issue:"Issue date", valid:"Valid until", description:"Description", qty:"Qty", unit:"Unit price", amount:"Amount", subtotal:"Subtotal", discount:"Discount", tax:"Tax", total:"Quote total", notes:"Notes / terms", payment:"Payment information", emailSubject:"Quote" },
  fr: { document:"Devis", from:"Émetteur", to:"Client", issue:"Date d’émission", valid:"Valable jusqu’au", description:"Description", qty:"Qté", unit:"Prix unitaire", amount:"Montant", subtotal:"Sous-total", discount:"Remise", tax:"TVA", total:"Total du devis", notes:"Notes / conditions", payment:"Informations de paiement", emailSubject:"Devis" },
  es: { document:"Presupuesto", from:"Emisor", to:"Cliente", issue:"Fecha de emisión", valid:"Válido hasta", description:"Descripción", qty:"Cant.", unit:"Precio unitario", amount:"Importe", subtotal:"Subtotal", discount:"Descuento", tax:"Impuesto", total:"Total del presupuesto", notes:"Notas / condiciones", payment:"Información de pago", emailSubject:"Presupuesto" },
  nl: { document:"Offerte", from:"Van", to:"Klant", issue:"Offertedatum", valid:"Geldig tot", description:"Omschrijving", qty:"Aantal", unit:"Prijs", amount:"Bedrag", subtotal:"Subtotaal", discount:"Korting", tax:"Btw", total:"Offertetotaal", notes:"Notities / voorwaarden", payment:"Betaalinformatie", emailSubject:"Offerte" },
};

function quoteCopy(language) {
  return COPY[language] || COPY.en;
}

function compactDate(value, language) {
  if (!value) return "—";
  try {
    return new Intl.DateTimeFormat(language || "en", { year:"numeric", month:"short", day:"numeric" }).format(new Date(value + "T00:00:00"));
  } catch (_) {
    return value;
  }
}

export default function Quotes({ quotes, setQuotes, userId, onConvert, sellerDefaults }) {
  const [editing, setEditing] = useState(null);
  const [previewing, setPreviewing] = useState(null);

  const refresh = async () => setQuotes(await loadQuotes(userId));

  const handleDelete = async (quote) => {
    if (!window.confirm("Delete quote " + quote.id + "?")) return;
    await deleteQuote(quote.id, userId);
    refresh();
  };

  const handleConvert = async (quote) => {
    if (quote.convertedInvoiceId) {
      window.alert("Already converted to invoice " + quote.convertedInvoiceId);
      return;
    }
    const invoice = await onConvert(quote);
    if (!invoice) return;
    const updated = { ...quote, status:"accepted", convertedInvoiceId:invoice.id };
    const saved = await saveQuote(updated, userId);
    if (!saved) {
      window.alert("The invoice was created, but the quote status could not be updated. Please refresh and try again.");
      return;
    }
    setQuotes(current => current.map(item => item.id === quote.id ? updated : item));
    setPreviewing(updated);
    trackEvent("quote_converted", { currency:quote.currency || "EUR" });
    window.alert("Quote converted to invoice " + invoice.id + " ✓");
  };

  const saveAndPreview = async (quote) => {
    const creating = editing === "new";
    const saved = await saveQuote(quote, userId);
    if (!saved) {
      window.alert("Could not save this quote. Please try again.");
      return;
    }
    if (creating) {
      trackEvent("quote_created", { currency:quote.currency || "EUR", is_first_quote:quotes.length === 0 });
      recordActivationEvent("quote_created", {
        metadata:{ currency:quote.currency || "EUR", is_first_quote:quotes.length === 0 },
        dedupeKey:"quote_created:" + quote.id,
      }).catch(() => {});
    }
    setEditing(null);
    setPreviewing(quote);
    refresh();
  };

  const statusColor = { draft:"#999", sent:"#c9a84c", accepted:"#2d8c65", declined:"#e05555", expired:"#777" };

  return (
    <div>
      <style>{QUOTE_CSS}</style>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20, gap:12, flexWrap:"wrap" }}>
        <div className="card-title">Quotes</div>
        <button className="btn btn-primary" onClick={() => setEditing("new")}>+ New Quote</button>
      </div>

      {quotes.length === 0 && !editing && (
        <div className="card quote-empty">
          <div style={{ fontWeight:700, color:"var(--text)", marginBottom:6 }}>No quotes yet</div>
          <div>Create a professional quote you can preview, save as PDF, and convert to an invoice.</div>
          <button className="btn btn-primary" onClick={() => setEditing("new")}>Create your first quote</button>
        </div>
      )}

      {quotes.map((quote) => (
        <div key={quote.id} className="card" style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10, padding:"14px 18px", flexWrap:"wrap", gap:10 }}>
          <div>
            <div style={{ fontWeight:700 }}>{quote.id} · {quote.client || "No client"}</div>
            <div style={{ fontSize:12, color:"#999" }}>{quote.date || ""}{quote.validUntil ? " · valid until " + quote.validUntil : ""}{quote.convertedInvoiceId ? " · → " + quote.convertedInvoiceId : ""}</div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
            <span style={{ fontSize:11, fontWeight:800, textTransform:"uppercase", color:statusColor[quote.status] || "#999" }}>{quote.status}</span>
            <span style={{ fontWeight:700 }}>{fmtCurrency(quote.total, quote.currency)}</span>
            <button className="btn btn-ghost btn-sm" onClick={() => setPreviewing(quote)}>Preview / PDF</button>
            <button className="btn btn-ghost btn-sm" onClick={() => setEditing(quote)}>Edit</button>
            {!quote.convertedInvoiceId && <button className="btn btn-sm" style={{ background:"rgba(45,140,101,0.15)", color:"#2d8c65", border:"1px solid rgba(45,140,101,0.4)" }} onClick={() => handleConvert(quote)}>→ Invoice</button>}
            <button className="btn btn-ghost btn-sm" aria-label={"Delete " + quote.id} style={{ color:"#e05555" }} onClick={() => handleDelete(quote)}>✕</button>
          </div>
        </div>
      ))}

      {editing && <QuoteModal quote={editing === "new" ? null : editing} quoteCount={quotes.length} sellerDefaults={sellerDefaults || {}} onClose={() => setEditing(null)} onSave={saveAndPreview} />}
      {previewing && <QuotePreview quote={previewing} onClose={() => setPreviewing(null)} onConvert={previewing.convertedInvoiceId ? null : () => handleConvert(previewing)} />}
    </div>
  );
}

function QuoteModal({ quote, quoteCount, sellerDefaults, onClose, onSave }) {
  const isEdit = !!quote;
  const currentLanguage = getLocale();
  const [form, setForm] = useState(quote || {
    client:"", email:"", buyerPhone:"", buyerAddress:"", buyerCountry:"",
    date:new Date().toISOString().split("T")[0], validUntil:"",
    tax:sellerDefaults.defaultTax ?? 21, discount:0, notes:"", bankInfo:sellerDefaults.bankInfo || "",
    currency:sellerDefaults.currency || "EUR", status:"draft", documentLanguage:currentLanguage,
    sellerName:sellerDefaults.sellerName || "", sellerEmail:sellerDefaults.sellerEmail || "",
    sellerPhone:sellerDefaults.sellerPhone || "", sellerVat:sellerDefaults.sellerVat || "",
    sellerAddress:sellerDefaults.sellerAddress || "", sellerCountry:sellerDefaults.sellerCountry || "",
    items:[{ desc:"", qty:1, price:0, note:"" }],
  });
  const set = (key, value) => setForm((previous) => ({ ...previous, [key]:value }));
  const setItem = (index, key, value) => setForm((previous) => ({ ...previous, items:previous.items.map((item, itemIndex) => itemIndex === index ? { ...item, [key]:value } : item) }));
  const addItem = () => set("items", [...form.items, { desc:"", qty:1, price:0, note:"" }]);
  const removeItem = (index) => set("items", form.items.filter((_, itemIndex) => itemIndex !== index));
  const subtotal = form.items.reduce((sum, item) => sum + (Number(item.qty) * Number(item.price) || 0), 0);
  const discountAmt = subtotal * (Number(form.discount) / 100);
  const taxAmt = (subtotal - discountAmt) * (Number(form.tax) / 100);
  const total = subtotal - discountAmt + taxAmt;

  const save = () => {
    if (!(form.sellerName || "").trim()) { window.alert("Business / seller name is required"); return; }
    if (!(form.client || "").trim()) { window.alert("Client name is required"); return; }
    const items = form.items.filter(item => (item.desc || "").trim());
    if (!items.length) { window.alert("Add at least one line item with a description"); return; }
    const id = isEdit ? quote.id : nextQuoteId(quoteCount);
    onSave({ ...form, id, items, subtotal, discountAmt, taxAmt, total, amount:total });
  };

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth:760, maxHeight:"94vh", overflowY:"auto" }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:16, gap:12 }}><div className="card-title">{isEdit ? "Edit Quote " + quote.id : "New Quote"}</div><button className="btn btn-ghost btn-sm" onClick={onClose} aria-label="Close quote form">✕</button></div>

        <div className="quote-form-section"><div className="quote-form-section-title">From your business</div><div className="quote-two-col">
          <input placeholder="Business / seller name *" value={form.sellerName || ""} onChange={(event) => set("sellerName", event.target.value)} />
          <input type="email" placeholder="Business email" value={form.sellerEmail || ""} onChange={(event) => set("sellerEmail", event.target.value)} />
          <input placeholder="Phone" value={form.sellerPhone || ""} onChange={(event) => set("sellerPhone", event.target.value)} />
          <input placeholder="VAT / tax number" value={form.sellerVat || ""} onChange={(event) => set("sellerVat", event.target.value)} />
          <input placeholder="Business address" value={form.sellerAddress || ""} onChange={(event) => set("sellerAddress", event.target.value)} />
          <input placeholder="Country" value={form.sellerCountry || ""} onChange={(event) => set("sellerCountry", event.target.value)} />
        </div></div>

        <div className="quote-form-section"><div className="quote-form-section-title">Client and dates</div><div className="quote-two-col">
          <input placeholder="Client name *" value={form.client} onChange={(event) => set("client", event.target.value)} />
          <input type="email" placeholder="Client email" value={form.email || ""} onChange={(event) => set("email", event.target.value)} />
          <input placeholder="Client phone" value={form.buyerPhone || ""} onChange={(event) => set("buyerPhone", event.target.value)} />
          <input placeholder="Client address" value={form.buyerAddress || ""} onChange={(event) => set("buyerAddress", event.target.value)} />
          <label style={{ fontSize:12 }}>Issue date<input type="date" value={form.date} onChange={(event) => set("date", event.target.value)} /></label>
          <label style={{ fontSize:12 }}>Valid until<input type="date" value={form.validUntil || ""} onChange={(event) => set("validUntil", event.target.value)} /></label>
        </div></div>

        <div className="quote-form-section"><div className="quote-form-section-title">Line items</div>
          {form.items.map((item, index) => <div key={index} style={{ marginBottom:10 }}><div className="quote-item-row">
            <input placeholder="Description *" value={item.desc || ""} onChange={(event) => setItem(index, "desc", event.target.value)} />
            <input aria-label="Quantity" type="number" min="0" step="0.01" placeholder="Qty" value={item.qty} onChange={(event) => setItem(index, "qty", event.target.value)} />
            <input aria-label="Unit price" type="number" step="0.01" placeholder="Price" value={item.price} onChange={(event) => setItem(index, "price", event.target.value)} />
            <button className="btn btn-ghost btn-sm" aria-label={"Remove line " + (index + 1)} onClick={() => removeItem(index)} disabled={form.items.length === 1}>✕</button>
          </div><input style={{ width:"100%" }} placeholder="Line note (optional)" value={item.note || ""} onChange={(event) => setItem(index, "note", event.target.value)} /></div>)}
          <button className="btn btn-ghost btn-sm" onClick={addItem}>+ Add item</button>
        </div>

        <div className="quote-three-col" style={{ marginBottom:12 }}>
          <label style={{ fontSize:12 }}>Tax %<input type="number" min="0" value={form.tax} onChange={(event) => set("tax", event.target.value)} /></label>
          <label style={{ fontSize:12 }}>Discount %<input type="number" min="0" max="100" value={form.discount} onChange={(event) => set("discount", event.target.value)} /></label>
          <label style={{ fontSize:12 }}>Currency<select value={form.currency} onChange={(event) => set("currency", event.target.value)}>{CURRENCIES.map(group => <optgroup key={group.group} label={group.group}>{group.items.map(currency => <option key={currency.value} value={currency.value}>{currency.label}</option>)}</optgroup>)}</select></label>
          <label style={{ fontSize:12 }}>Document language<select value={form.documentLanguage || currentLanguage} onChange={(event) => set("documentLanguage", event.target.value)}><option value="en">English — Quote</option><option value="fr">Français — Devis</option><option value="es">Español — Presupuesto</option><option value="nl">Nederlands — Offerte</option></select></label>
          <label style={{ fontSize:12 }}>Status<select value={form.status} onChange={(event) => set("status", event.target.value)}><option value="draft">Draft</option><option value="sent">Sent</option><option value="accepted">Accepted</option><option value="declined">Declined</option></select></label>
        </div>

        <textarea rows={3} placeholder="Notes or terms" value={form.notes || ""} onChange={(event) => set("notes", event.target.value)} style={{ width:"100%", marginBottom:10, resize:"vertical" }} />
        <textarea rows={3} placeholder="Payment / bank information (optional)" value={form.bankInfo || ""} onChange={(event) => set("bankInfo", event.target.value)} style={{ width:"100%", marginBottom:12, resize:"vertical" }} />
        <div style={{ textAlign:"right", marginBottom:14, fontSize:14 }}>Subtotal: <b>{fmtCurrency(subtotal, form.currency)}</b> · Tax: <b>{fmtCurrency(taxAmt, form.currency)}</b> · Total: <b>{fmtCurrency(total, form.currency)}</b></div>
        <div style={{ display:"flex", justifyContent:"flex-end", gap:10, flexWrap:"wrap" }}><button className="btn btn-ghost" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={save}>{isEdit ? "Save & preview" : "Create & preview quote"}</button></div>
      </div>
    </div>
  );
}

export function QuotePreview({ quote, onClose, onConvert }) {
  const language = quote.documentLanguage || getLocale();
  const copy = quoteCopy(language);
  const subtotal = Number(quote.subtotal ?? quote.amount ?? 0);
  const discountAmt = Number(quote.discountAmt || 0);
  const taxAmt = Number(quote.taxAmt || 0);
  const total = Number(quote.total ?? quote.amount ?? 0);
  const money = (value) => fmtCurrency(value, quote.currency || "EUR");

  useEffect(() => { trackEvent("quote_previewed", { currency:quote.currency || "EUR", language }); }, [quote.id, quote.currency, language]);

  const printQuote = () => {
    const previousTitle = document.title;
    document.title = `${copy.document}-${quote.id}`;
    trackEvent("quote_downloaded", { format:"pdf", language, currency:quote.currency || "EUR" });
    window.print();
    window.setTimeout(() => { document.title = previousTitle; }, 500);
  };

  const emailQuote = () => {
    if (!quote.email) { window.alert("Add the client's email address before opening an email."); return; }
    const subject = `${copy.emailSubject} ${quote.id} — ${quote.sellerName || "FaturaPro"}`;
    const validity = quote.validUntil ? `It is valid until ${compactDate(quote.validUntil, language)}.\n` : "";
    const body = `Hello ${quote.client || ""},\n\nPlease find ${copy.document.toLowerCase()} ${quote.id} for ${money(total)}.\n${validity}\nPlease attach the PDF saved from FaturaPro before sending this email.\n\nKind regards,\n${quote.sellerName || ""}`;
    trackEvent("quote_email_opened", { language, currency:quote.currency || "EUR" });
    window.open(`mailto:${encodeURIComponent(quote.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, "_blank", "noopener,noreferrer");
  };

  const preview = <div className="modal-overlay"><style>{QUOTE_CSS}</style><div className="invoice-preview-wrapper quote-preview-wrapper" style={{ width:"100%", maxWidth:760, maxHeight:"95vh", overflow:"auto", borderRadius:16, margin:"0 auto" }}>
    <div className="quote-preview-actions print-hide"><div><button className="btn btn-primary btn-sm" onClick={printQuote}>Print / Save PDF</button><button className="btn btn-ghost btn-sm" onClick={emailQuote}>Open email</button>{onConvert && <button className="btn btn-ghost btn-sm" onClick={onConvert}>Convert to invoice</button>}</div><button className="btn btn-ghost btn-sm" onClick={onClose}>Close</button></div>
    <p className="quote-email-help print-hide">Email opens in your own mail app. Save the PDF here first, then attach it before sending.</p>
    <article className="invoice-preview" aria-label={`${copy.document} ${quote.id}`}>
      <header style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:18, marginBottom:36 }}><div style={{ fontFamily:"'Playfair Display', serif", fontSize:26, color:"#c9a84c", fontWeight:700 }}>{quote.sellerName || "FaturaPro"}</div><div style={{ textAlign:"right" }}><div style={{ fontSize:11, color:"#aaa", fontWeight:700, letterSpacing:1.2, textTransform:"uppercase", marginBottom:4 }}>{copy.document}</div><div style={{ fontSize:22, fontWeight:800, color:"#1a1a2e" }}>{quote.id}</div><div style={{ fontSize:12, color:"#777", marginTop:6 }}><div><b>{copy.issue}:</b> {compactDate(quote.date, language)}</div>{quote.validUntil && <div><b>{copy.valid}:</b> {compactDate(quote.validUntil, language)}</div>}</div></div></header>
      <div className="quote-preview-parties"><div className="quote-preview-party"><div style={{ color:"#c9a84c", fontSize:10, fontWeight:800, letterSpacing:1.2, textTransform:"uppercase", marginBottom:9 }}>{copy.from}</div><div style={{ fontWeight:700, color:"#1a1a2e" }}>{quote.sellerName || "—"}</div>{quote.sellerEmail && <div style={{ fontSize:12, color:"#555" }}>{quote.sellerEmail}</div>}{quote.sellerPhone && <div style={{ fontSize:12, color:"#555" }}>{quote.sellerPhone}</div>}{quote.sellerAddress && <div style={{ fontSize:12, color:"#777", marginTop:4, whiteSpace:"pre-wrap" }}>{quote.sellerAddress}</div>}{quote.sellerCountry && <div style={{ fontSize:12, color:"#777" }}>{quote.sellerCountry}</div>}{quote.sellerVat && <div style={{ fontSize:12, color:"#777", marginTop:3 }}>VAT: {quote.sellerVat}</div>}</div><div className="quote-preview-party"><div style={{ color:"#c9a84c", fontSize:10, fontWeight:800, letterSpacing:1.2, textTransform:"uppercase", marginBottom:9 }}>{copy.to}</div><div style={{ fontWeight:700, color:"#1a1a2e" }}>{quote.client || "—"}</div>{quote.email && <div style={{ fontSize:12, color:"#555" }}>{quote.email}</div>}{quote.buyerPhone && <div style={{ fontSize:12, color:"#555" }}>{quote.buyerPhone}</div>}{quote.buyerAddress && <div style={{ fontSize:12, color:"#777", marginTop:4, whiteSpace:"pre-wrap" }}>{quote.buyerAddress}</div>}{quote.buyerCountry && <div style={{ fontSize:12, color:"#777" }}>{quote.buyerCountry}</div>}</div></div>
      <table className="preview-table"><thead><tr><th style={{ width:"45%" }}>{copy.description}</th><th style={{ width:"10%" }}>{copy.qty}</th><th style={{ width:"20%" }}>{copy.unit}</th><th style={{ width:"25%", textAlign:"right" }}>{copy.amount}</th></tr></thead><tbody>{(quote.items || []).map((item, index) => <tr key={index}><td><div style={{ fontWeight:500, color:"#1a1a2e" }}>{item.desc || "—"}</div>{item.note && <div style={{ marginTop:3, color:"#999", fontSize:11, fontStyle:"italic" }}>{item.note}</div>}</td><td>{item.qty}</td><td>{money(item.price)}</td><td style={{ textAlign:"right" }}>{money(Number(item.qty) * Number(item.price))}</td></tr>)}</tbody></table>
      <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:28 }}><div style={{ minWidth:260 }}><div className="preview-total-section"><div className="preview-total-row"><span>{copy.subtotal}</span><span>{money(subtotal)}</span></div>{discountAmt > 0 && <div className="preview-total-row" style={{ color:"#2d8c65" }}><span>{copy.discount} ({quote.discount}%)</span><span>- {money(discountAmt)}</span></div>}<div className="preview-total-row"><span>{copy.tax} ({quote.tax || 0}%)</span><span>{money(taxAmt)}</span></div><div className="preview-total-row grand"><span>{copy.total}</span><span>{money(total)}</span></div></div></div></div>
      {quote.notes && <div className="invoice-notes" style={{ marginBottom:16, padding:"14px 18px", background:"#f5f3ef", borderRadius:8, borderLeft:"3px solid #c9a84c" }}><div style={{ fontSize:10, fontWeight:800, color:"#c9a84c", letterSpacing:1, textTransform:"uppercase", marginBottom:6 }}>{copy.notes}</div><div style={{ fontSize:13, color:"#555", lineHeight:1.6, whiteSpace:"pre-wrap" }}>{quote.notes}</div></div>}
      {quote.bankInfo && <div className="invoice-bank-info" style={{ padding:"14px 18px", background:"#f5f3ef", borderRadius:8, borderLeft:"3px solid #c9a84c" }}><div style={{ fontSize:10, fontWeight:800, color:"#c9a84c", letterSpacing:1, textTransform:"uppercase", marginBottom:6 }}>{copy.payment}</div><div style={{ fontSize:12, color:"#333", lineHeight:1.7, whiteSpace:"pre-wrap" }}>{quote.bankInfo}</div></div>}
      <footer className="preview-footer" style={{ marginTop:32 }}>{quote.sellerName || "FaturaPro"} · {copy.document} {quote.id}</footer>
    </article>
  </div></div>;
  return createPortal(preview, document.body);
}
