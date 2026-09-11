// Fatura Pro - Quotes page (Business plan)
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { CURRENCIES, fmtCurrency } from "../lib/currencies";
import { getLocale } from "../lib/locale";
import { DOCUMENT_LANGUAGES, documentDirection, normalizeDocumentLanguage } from "../lib/documentLanguage";
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
.quote-preview-party + .quote-preview-party { border-inline-start:1px solid #e8dfc8; padding-inline-start:24px; }
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
  en: { document:"Quote", from:"From", to:"Client", issue:"Issue date", valid:"Valid until", description:"Description", qty:"Qty", unit:"Unit price", amount:"Amount", subtotal:"Subtotal", discount:"Discount", tax:"Tax", total:"Quote total", notes:"Notes / terms", payment:"Payment information", emailSubject:"Quote", emailMissing:"Add the client's email address before opening an email.", hello:"Hello", emailFind:"Please find", emailFor:"for", emailValid:"It is valid until", emailAttach:"Please attach the PDF saved from FaturaPro before sending this email.", regards:"Kind regards" },
  fr: { document:"Devis", from:"Émetteur", to:"Client", issue:"Date d’émission", valid:"Valable jusqu’au", description:"Description", qty:"Qté", unit:"Prix unitaire", amount:"Montant", subtotal:"Sous-total", discount:"Remise", tax:"TVA", total:"Total du devis", notes:"Notes / conditions", payment:"Informations de paiement", emailSubject:"Devis", emailMissing:"Ajoutez l’adresse e-mail du client avant d’ouvrir un e-mail.", hello:"Bonjour", emailFind:"Veuillez trouver", emailFor:"d’un montant de", emailValid:"Ce devis est valable jusqu’au", emailAttach:"Veuillez joindre le PDF enregistré depuis FaturaPro avant d’envoyer cet e-mail.", regards:"Cordialement" },
  es: { document:"Presupuesto", from:"Emisor", to:"Cliente", issue:"Fecha de emisión", valid:"Válido hasta", description:"Descripción", qty:"Cant.", unit:"Precio unitario", amount:"Importe", subtotal:"Subtotal", discount:"Descuento", tax:"Impuesto", total:"Total del presupuesto", notes:"Notas / condiciones", payment:"Información de pago", emailSubject:"Presupuesto" },
  nl: { document:"Offerte", from:"Van", to:"Klant", issue:"Offertedatum", valid:"Geldig tot", description:"Omschrijving", qty:"Aantal", unit:"Prijs", amount:"Bedrag", subtotal:"Subtotaal", discount:"Korting", tax:"Btw", total:"Offertetotaal", notes:"Notities / voorwaarden", payment:"Betaalinformatie", emailSubject:"Offerte", emailMissing:"Voeg het e-mailadres van de klant toe voordat je een e-mail opent.", hello:"Beste", emailFind:"In de bijlage vind je", emailFor:"ter waarde van", emailValid:"Deze offerte is geldig tot", emailAttach:"Voeg de vanuit FaturaPro opgeslagen PDF toe voordat je deze e-mail verstuurt.", regards:"Met vriendelijke groet" },
  ar: { document:"عرض سعر", from:"من", to:"العميل", issue:"تاريخ الإصدار", valid:"صالح حتى", description:"الوصف", qty:"الكمية", unit:"سعر الوحدة", amount:"المبلغ", subtotal:"المجموع الفرعي", discount:"الخصم", tax:"الضريبة", total:"إجمالي عرض السعر", notes:"الملاحظات / الشروط", payment:"معلومات الدفع", emailSubject:"عرض سعر", emailMissing:"أضف البريد الإلكتروني للعميل قبل فتح رسالة البريد.", hello:"مرحبًا", emailFind:"يرجى الاطلاع على", emailFor:"بقيمة", emailValid:"عرض السعر صالح حتى", emailAttach:"يرجى إرفاق ملف PDF المحفوظ من FaturaPro قبل إرسال هذه الرسالة.", regards:"مع التحية" },
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
  const ar = getLocale() === "ar";
  const ui = (english, arabic) => ar ? arabic : english;
  const [editing, setEditing] = useState(null);
  const [previewing, setPreviewing] = useState(null);

  const refresh = async () => setQuotes(await loadQuotes(userId));

  const handleDelete = async (quote) => {
    if (!window.confirm(ui("Delete quote " + quote.id + "?", "حذف عرض السعر " + quote.id + "؟"))) return;
    await deleteQuote(quote.id, userId);
    refresh();
  };

  const handleConvert = async (quote) => {
    if (quote.convertedInvoiceId) {
      window.alert(ui("Already converted to invoice ", "تم تحويله بالفعل إلى الفاتورة ") + quote.convertedInvoiceId);
      return;
    }
    const invoice = await onConvert(quote);
    if (!invoice) return;
    const updated = { ...quote, status:"accepted", convertedInvoiceId:invoice.id };
    const saved = await saveQuote(updated, userId);
    if (!saved) {
      window.alert(ui("The invoice was created, but the quote status could not be updated. Please refresh and try again.", "تم إنشاء الفاتورة، لكن تعذر تحديث حالة عرض السعر. حدّث الصفحة وحاول مرة أخرى."));
      return;
    }
    setQuotes(current => current.map(item => item.id === quote.id ? updated : item));
    setPreviewing(updated);
    trackEvent("quote_converted", { currency:quote.currency || "EUR" });
    window.alert(ui("Quote converted to invoice ", "تم تحويل عرض السعر إلى الفاتورة ") + invoice.id + " ✓");
  };

  const saveAndPreview = async (quote) => {
    const creating = editing === "new";
    const saved = await saveQuote(quote, userId);
    if (!saved) {
      window.alert(ui("Could not save this quote. Please try again.", "تعذر حفظ عرض السعر. حاول مرة أخرى."));
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

  const statusColor = { draft:"#999", sent:"#6366F1", accepted:"#2d8c65", declined:"#e05555", expired:"#777" };

  return (
    <div>
      <style>{QUOTE_CSS}</style>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20, gap:12, flexWrap:"wrap" }}>
        <div className="card-title">{ui("Quotes", "عروض الأسعار")}</div>
        <button className="btn btn-primary" onClick={() => setEditing("new")}>+ {ui("New Quote", "عرض سعر جديد")}</button>
      </div>

      {quotes.length === 0 && !editing && (
        <div className="card quote-empty">
          <div style={{ fontWeight:700, color:"var(--text)", marginBottom:6 }}>{ui("No quotes yet", "لا توجد عروض أسعار بعد")}</div>
          <div>{ui("Create a professional quote you can preview, save as PDF, and convert to an invoice.", "أنشئ عرض سعر احترافيًا، عاينه واحفظه PDF ثم حوّله إلى فاتورة.")}</div>
          <button className="btn btn-primary" onClick={() => setEditing("new")}>{ui("Create your first quote", "إنشاء أول عرض سعر")}</button>
        </div>
      )}

      {quotes.map((quote) => (
        <div key={quote.id} className="card" style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10, padding:"14px 18px", flexWrap:"wrap", gap:10 }}>
          <div>
            <div style={{ fontWeight:700 }}>{quote.id} · {quote.client || ui("No client", "دون عميل")}</div>
            <div style={{ fontSize:12, color:"#999" }}>{quote.date || ""}{quote.validUntil ? " · " + ui("valid until", "صالح حتى") + " " + quote.validUntil : ""}{quote.convertedInvoiceId ? " · → " + quote.convertedInvoiceId : ""}</div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
            <span style={{ fontSize:11, fontWeight:800, textTransform:ar ? "none" : "uppercase", color:statusColor[quote.status] || "#999" }}>{ar ? ({ draft:"مسودة", sent:"مُرسل", accepted:"مقبول", declined:"مرفوض", expired:"منتهي" }[quote.status] || quote.status) : quote.status}</span>
            <span style={{ fontWeight:700 }}>{fmtCurrency(quote.total, quote.currency)}</span>
            <button className="btn btn-ghost btn-sm" onClick={() => setPreviewing(quote)}>{ui("Preview / PDF", "معاينة / PDF")}</button>
            <button className="btn btn-ghost btn-sm" onClick={() => setEditing(quote)}>{ui("Edit", "تعديل")}</button>
            {!quote.convertedInvoiceId && <button className="btn btn-sm" style={{ background:"rgba(45,140,101,0.15)", color:"#2d8c65", border:"1px solid rgba(45,140,101,0.4)" }} onClick={() => handleConvert(quote)}>→ {ui("Invoice", "فاتورة")}</button>}
            <button className="btn btn-ghost btn-sm" aria-label={"Delete " + quote.id} style={{ color:"#e05555" }} onClick={() => handleDelete(quote)}>✕</button>
          </div>
        </div>
      ))}

      {editing && <QuoteModal quote={editing === "new" ? null : editing} quoteCount={quotes.length} sellerDefaults={sellerDefaults || {}} onClose={() => setEditing(null)} onSave={saveAndPreview} ar={ar} />}
      {previewing && <QuotePreview quote={previewing} onClose={() => setPreviewing(null)} onConvert={previewing.convertedInvoiceId ? null : () => handleConvert(previewing)} />}
    </div>
  );
}

function QuoteModal({ quote, quoteCount, sellerDefaults, onClose, onSave, ar }) {
  const ui = (english, arabic) => ar ? arabic : english;
  const isEdit = !!quote;
  const currentLanguage = getLocale();
  const [form, setForm] = useState(quote || {
    client:"", email:"", buyerPhone:"", buyerAddress:"", buyerCountry:"",
    date:new Date().toISOString().split("T")[0], validUntil:"",
    tax:sellerDefaults.defaultTax ?? 21, discount:0, notes:"", bankInfo:sellerDefaults.bankInfo || "",
    currency:sellerDefaults.currency || "EUR", status:"draft", documentLanguage:normalizeDocumentLanguage(sellerDefaults.defaultInvoiceLanguage || currentLanguage),
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
    if (!(form.sellerName || "").trim()) { window.alert(ui("Business / seller name is required", "اسم النشاط / البائع مطلوب")); return; }
    if (!(form.client || "").trim()) { window.alert(ui("Client name is required", "اسم العميل مطلوب")); return; }
    const items = form.items.filter(item => (item.desc || "").trim());
    if (!items.length) { window.alert(ui("Add at least one line item with a description", "أضف بندًا واحدًا بوصف على الأقل")); return; }
    const id = isEdit ? quote.id : nextQuoteId(quoteCount);
    onSave({ ...form, id, items, subtotal, discountAmt, taxAmt, total, amount:total });
  };

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth:760, maxHeight:"94vh", overflowY:"auto" }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:16, gap:12 }}><div className="card-title">{isEdit ? ui("Edit Quote ", "تعديل عرض السعر ") + quote.id : ui("New Quote", "عرض سعر جديد")}</div><button className="btn btn-ghost btn-sm" onClick={onClose} aria-label={ui("Close quote form", "إغلاق نموذج عرض السعر")}>✕</button></div>

        <div className="quote-form-section"><div className="quote-form-section-title">{ui("From your business", "من نشاطك التجاري")}</div><div className="quote-two-col">
          <input placeholder={ui("Business / seller name *", "اسم النشاط / البائع *")} value={form.sellerName || ""} onChange={(event) => set("sellerName", event.target.value)} />
          <input type="email" placeholder={ui("Business email", "بريد النشاط")} value={form.sellerEmail || ""} onChange={(event) => set("sellerEmail", event.target.value)} />
          <input type="tel" placeholder={ui("Phone", "الهاتف")} value={form.sellerPhone || ""} onChange={(event) => set("sellerPhone", event.target.value)} />
          <input data-direction="ltr" placeholder={ui("VAT / tax number", "رقم الضريبة / VAT")} value={form.sellerVat || ""} onChange={(event) => set("sellerVat", event.target.value)} />
          <input placeholder={ui("Business address", "عنوان النشاط")} value={form.sellerAddress || ""} onChange={(event) => set("sellerAddress", event.target.value)} />
          <input placeholder={ui("Country", "البلد")} value={form.sellerCountry || ""} onChange={(event) => set("sellerCountry", event.target.value)} />
        </div></div>

        <div className="quote-form-section"><div className="quote-form-section-title">{ui("Client and dates", "العميل والتواريخ")}</div><div className="quote-two-col">
          <input placeholder={ui("Client name *", "اسم العميل *")} value={form.client} onChange={(event) => set("client", event.target.value)} />
          <input type="email" placeholder={ui("Client email", "بريد العميل")} value={form.email || ""} onChange={(event) => set("email", event.target.value)} />
          <input type="tel" placeholder={ui("Client phone", "هاتف العميل")} value={form.buyerPhone || ""} onChange={(event) => set("buyerPhone", event.target.value)} />
          <input placeholder={ui("Client address", "عنوان العميل")} value={form.buyerAddress || ""} onChange={(event) => set("buyerAddress", event.target.value)} />
          <label style={{ fontSize:12 }}>{ui("Issue date", "تاريخ الإصدار")}<input type="date" value={form.date} onChange={(event) => set("date", event.target.value)} /></label>
          <label style={{ fontSize:12 }}>{ui("Valid until", "صالح حتى")}<input type="date" value={form.validUntil || ""} onChange={(event) => set("validUntil", event.target.value)} /></label>
        </div></div>

        <div className="quote-form-section"><div className="quote-form-section-title">{ui("Line items", "البنود")}</div>
          {form.items.map((item, index) => <div key={index} style={{ marginBottom:10 }}><div className="quote-item-row">
            <input placeholder={ui("Description *", "الوصف *")} value={item.desc || ""} onChange={(event) => setItem(index, "desc", event.target.value)} />
            <input aria-label={ui("Quantity", "الكمية")} type="number" min="0" step="0.01" placeholder={ui("Qty", "الكمية")} value={item.qty} onChange={(event) => setItem(index, "qty", event.target.value)} />
            <input aria-label={ui("Unit price", "سعر الوحدة")} type="number" step="0.01" placeholder={ui("Price", "السعر")} value={item.price} onChange={(event) => setItem(index, "price", event.target.value)} />
            <button className="btn btn-ghost btn-sm" aria-label={ui("Remove line ", "حذف البند ") + (index + 1)} onClick={() => removeItem(index)} disabled={form.items.length === 1}>✕</button>
          </div><input style={{ width:"100%" }} placeholder={ui("Line note (optional)", "ملاحظة البند (اختياري)")} value={item.note || ""} onChange={(event) => setItem(index, "note", event.target.value)} /></div>)}
          <button className="btn btn-ghost btn-sm" onClick={addItem}>+ {ui("Add item", "إضافة بند")}</button>
        </div>

        <div className="quote-three-col" style={{ marginBottom:12 }}>
          <label style={{ fontSize:12 }}>{ui("Tax", "الضريبة")} %<input type="number" min="0" value={form.tax} onChange={(event) => set("tax", event.target.value)} /></label>
          <label style={{ fontSize:12 }}>{ui("Discount", "الخصم")} %<input type="number" min="0" max="100" value={form.discount} onChange={(event) => set("discount", event.target.value)} /></label>
          <label style={{ fontSize:12 }}>{ui("Currency", "العملة")}<select value={form.currency} onChange={(event) => set("currency", event.target.value)}>{CURRENCIES.map(group => <optgroup key={group.group} label={group.group}>{group.items.map(currency => <option key={currency.value} value={currency.value}>{currency.label}</option>)}</optgroup>)}</select></label>
          <label style={{ fontSize:12 }}>{currentLanguage === "ar" ? "لغة عرض السعر" : "Document language"}<select value={normalizeDocumentLanguage(form.documentLanguage || sellerDefaults.defaultInvoiceLanguage)} onChange={(event) => set("documentLanguage", event.target.value)}>{DOCUMENT_LANGUAGES.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
          <label style={{ fontSize:12 }}>{ui("Status", "الحالة")}<select value={form.status} onChange={(event) => set("status", event.target.value)}><option value="draft">{ui("Draft", "مسودة")}</option><option value="sent">{ui("Sent", "مُرسل")}</option><option value="accepted">{ui("Accepted", "مقبول")}</option><option value="declined">{ui("Declined", "مرفوض")}</option></select></label>
        </div>

        <textarea rows={3} placeholder={ui("Notes or terms", "الملاحظات أو الشروط")} value={form.notes || ""} onChange={(event) => set("notes", event.target.value)} style={{ width:"100%", marginBottom:10, resize:"vertical" }} />
        <textarea rows={3} placeholder={ui("Payment / bank information (optional)", "معلومات الدفع / البنك (اختياري)")} value={form.bankInfo || ""} onChange={(event) => set("bankInfo", event.target.value)} style={{ width:"100%", marginBottom:12, resize:"vertical" }} />
        <div style={{ textAlign:ar ? "left" : "right", marginBottom:14, fontSize:14 }}>{ui("Subtotal", "المجموع الفرعي")}: <b>{fmtCurrency(subtotal, form.currency)}</b> · {ui("Tax", "الضريبة")}: <b>{fmtCurrency(taxAmt, form.currency)}</b> · {ui("Total", "الإجمالي")}: <b>{fmtCurrency(total, form.currency)}</b></div>
        <div style={{ display:"flex", justifyContent:"flex-end", gap:10, flexWrap:"wrap" }}><button className="btn btn-ghost" onClick={onClose}>{ui("Cancel", "إلغاء")}</button><button className="btn btn-primary" onClick={save}>{isEdit ? ui("Save & preview", "حفظ ومعاينة") : ui("Create & preview quote", "إنشاء عرض السعر ومعاينته")}</button></div>
      </div>
    </div>
  );
}

export function QuotePreview({ quote, onClose, onConvert }) {
  const interfaceArabic = getLocale() === "ar";
  const ui = (english, arabic) => interfaceArabic ? arabic : english;
  const language = normalizeDocumentLanguage(quote.documentLanguage);
  const copy = quoteCopy(language);
  const direction = documentDirection(language);
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
    if (!quote.email) { window.alert(copy.emailMissing); return; }
    const subject = `${copy.emailSubject} ${quote.id} — ${quote.sellerName || "FaturaPro"}`;
    const validity = quote.validUntil ? `${copy.emailValid} ${compactDate(quote.validUntil, language)}.\n` : "";
    const body = `${copy.hello} ${quote.client || ""},\n\n${copy.emailFind} ${copy.document.toLowerCase()} ${quote.id} ${copy.emailFor} ${money(total)}.\n${validity}\n${copy.emailAttach}\n\n${copy.regards},\n${quote.sellerName || ""}`;
    trackEvent("quote_email_opened", { language, currency:quote.currency || "EUR" });
    window.open(`mailto:${encodeURIComponent(quote.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, "_blank", "noopener,noreferrer");
  };

  const preview = <div className="modal-overlay"><style>{QUOTE_CSS}</style><div className="invoice-preview-wrapper quote-preview-wrapper" style={{ width:"100%", maxWidth:760, maxHeight:"95vh", overflow:"auto", borderRadius:16, margin:"0 auto" }}>
    <div className="quote-preview-actions print-hide"><div><button className="btn btn-primary btn-sm" onClick={printQuote}>{ui("Print / Save PDF", "طباعة / حفظ PDF")}</button><button className="btn btn-ghost btn-sm" onClick={emailQuote}>{ui("Open email", "فتح البريد")}</button>{onConvert && <button className="btn btn-ghost btn-sm" onClick={onConvert}>{ui("Convert to invoice", "تحويل إلى فاتورة")}</button>}</div><button className="btn btn-ghost btn-sm" onClick={onClose}>{ui("Close", "إغلاق")}</button></div>
    <p className="quote-email-help print-hide">{ui("Email opens in your own mail app. Save the PDF here first, then attach it before sending.", "يفتح البريد في تطبيقك. احفظ ملف PDF هنا أولًا ثم أرفقه قبل الإرسال.")}</p>
    <article className="invoice-preview" aria-label={`${copy.document} ${quote.id}`} lang={language} dir={direction} style={{ fontFamily:language === "ar" ? "'Noto Sans Arabic','Segoe UI',Tahoma,Arial,sans-serif" : undefined, textAlign:direction === "rtl" ? "right" : "left" }}>
      <header style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:18, marginBottom:36 }}><div style={{ fontFamily:language === "ar" ? "'Noto Sans Arabic','Segoe UI',sans-serif" : "'Playfair Display', serif", fontSize:26, color:"#6366F1", fontWeight:700 }}>{quote.sellerName || "FaturaPro"}</div><div style={{ textAlign:direction === "rtl" ? "left" : "right" }}><div style={{ fontSize:11, color:"#aaa", fontWeight:700, letterSpacing:1.2, textTransform:language === "ar" ? "none" : "uppercase", marginBottom:4 }}>{copy.document}</div><div className="document-number" style={{ fontSize:22, fontWeight:800, color:"#1a1a2e" }}>{quote.id}</div><div style={{ fontSize:12, color:"#777", marginTop:6 }}><div><b>{copy.issue}:</b> <span data-direction="ltr">{compactDate(quote.date, language)}</span></div>{quote.validUntil && <div><b>{copy.valid}:</b> <span data-direction="ltr">{compactDate(quote.validUntil, language)}</span></div>}</div></div></header>
      <div className="quote-preview-parties"><div className="quote-preview-party"><div style={{ color:"#6366F1", fontSize:10, fontWeight:800, letterSpacing:1.2, textTransform:"uppercase", marginBottom:9 }}>{copy.from}</div><div style={{ fontWeight:700, color:"#1a1a2e" }}>{quote.sellerName || "—"}</div>{quote.sellerEmail && <div style={{ fontSize:12, color:"#555" }}>{quote.sellerEmail}</div>}{quote.sellerPhone && <div style={{ fontSize:12, color:"#555" }}>{quote.sellerPhone}</div>}{quote.sellerAddress && <div style={{ fontSize:12, color:"#777", marginTop:4, whiteSpace:"pre-wrap" }}>{quote.sellerAddress}</div>}{quote.sellerCountry && <div style={{ fontSize:12, color:"#777" }}>{quote.sellerCountry}</div>}{quote.sellerVat && <div style={{ fontSize:12, color:"#777", marginTop:3 }}>VAT: {quote.sellerVat}</div>}</div><div className="quote-preview-party"><div style={{ color:"#6366F1", fontSize:10, fontWeight:800, letterSpacing:1.2, textTransform:"uppercase", marginBottom:9 }}>{copy.to}</div><div style={{ fontWeight:700, color:"#1a1a2e" }}>{quote.client || "—"}</div>{quote.email && <div style={{ fontSize:12, color:"#555" }}>{quote.email}</div>}{quote.buyerPhone && <div style={{ fontSize:12, color:"#555" }}>{quote.buyerPhone}</div>}{quote.buyerAddress && <div style={{ fontSize:12, color:"#777", marginTop:4, whiteSpace:"pre-wrap" }}>{quote.buyerAddress}</div>}{quote.buyerCountry && <div style={{ fontSize:12, color:"#777" }}>{quote.buyerCountry}</div>}</div></div>
      <table className="preview-table"><thead><tr><th style={{ width:"45%" }}>{copy.description}</th><th style={{ width:"10%" }}>{copy.qty}</th><th style={{ width:"20%" }}>{copy.unit}</th><th style={{ width:"25%", textAlign:direction === "rtl" ? "left" : "right" }}>{copy.amount}</th></tr></thead><tbody>{(quote.items || []).map((item, index) => <tr key={index}><td><div style={{ fontWeight:500, color:"#1a1a2e" }}>{item.desc || "—"}</div>{item.note && <div style={{ marginTop:3, color:"#999", fontSize:11, fontStyle:"italic" }}>{item.note}</div>}</td><td>{item.qty}</td><td className="money">{money(item.price)}</td><td className="money" style={{ textAlign:direction === "rtl" ? "left" : "right" }}>{money(Number(item.qty) * Number(item.price))}</td></tr>)}</tbody></table>
      <div style={{ display:"flex", justifyContent:direction === "rtl" ? "flex-start" : "flex-end", marginBottom:28 }}><div style={{ minWidth:260 }}><div className="preview-total-section"><div className="preview-total-row"><span>{copy.subtotal}</span><span className="money">{money(subtotal)}</span></div>{discountAmt > 0 && <div className="preview-total-row" style={{ color:"#2d8c65" }}><span>{copy.discount} ({quote.discount}%)</span><span className="money">- {money(discountAmt)}</span></div>}<div className="preview-total-row"><span>{copy.tax} ({quote.tax || 0}%)</span><span className="money">{money(taxAmt)}</span></div><div className="preview-total-row grand"><span>{copy.total}</span><span className="money">{money(total)}</span></div></div></div></div>
      {quote.notes && <div className="invoice-notes" style={{ marginBottom:16, padding:"14px 18px", background:"#f5f3ef", borderRadius:8, borderInlineStart:"3px solid #6366F1" }}><div style={{ fontSize:10, fontWeight:800, color:"#6366F1", letterSpacing:1, textTransform:language === "ar" ? "none" : "uppercase", marginBottom:6 }}>{copy.notes}</div><div style={{ fontSize:13, color:"#555", lineHeight:1.6, whiteSpace:"pre-wrap" }}>{quote.notes}</div></div>}
      {quote.bankInfo && <div className="invoice-bank-info" style={{ padding:"14px 18px", background:"#f5f3ef", borderRadius:8, borderInlineStart:"3px solid #6366F1" }}><div style={{ fontSize:10, fontWeight:800, color:"#6366F1", letterSpacing:1, textTransform:language === "ar" ? "none" : "uppercase", marginBottom:6 }}>{copy.payment}</div><div style={{ fontSize:12, color:"#333", lineHeight:1.7, whiteSpace:"pre-wrap" }}>{quote.bankInfo}</div></div>}
      <footer className="preview-footer" style={{ marginTop:32 }}>{quote.sellerName || "FaturaPro"} · {copy.document} {quote.id}</footer>
    </article>
  </div></div>;
  return createPortal(preview, document.body);
}
