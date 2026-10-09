import { useState, useEffect } from "react";
import { trackEvent } from "../lib/tracking";
import { applyPageSeo, suspendBaseSiteSchema } from "../lib/pageSeo";
import { printOnlyCss, printWithTitle } from "../lib/printDocument";
import { CURRENCIES as CURRENCY_GROUPS } from "../lib/currencies";

const INVOICE_ATTRIBUTION_URL = "https://faturapro.app/?utm_source=invoice&utm_medium=footer&utm_campaign=free_invoice_generator";
const SIGNUP_URL = "/login?signup=1&source=invoice_generator";

// The same 18 currencies as the app. Latin symbols are shown as-is; others by their code.
const CURRENCIES = CURRENCY_GROUPS.flatMap((group) => group.items).map((c) => ({
  code: c.value,
  symbol: ["$", "€", "£"].includes(c.symbol) ? c.symbol : c.value,
}));

const FAQS = [
  { q: "Is this invoice generator really free?", a: "Yes. You can create and download as many invoices as you like, without an account, an email address or a credit card." },
  { q: "Is my invoice data stored?", a: "No. Everything you type stays in your browser and is not sent to FaturaPro. When you close the page, it is gone, so download the PDF first." },
  { q: "Which currencies can I use?", a: "18 currencies, including EUR, USD, GBP, AED, SAR, TRY and JPY. Amounts are shown in the currency you choose; nothing is converted." },
  { q: "Can I add VAT?", a: "Yes. Enter the VAT or sales tax percentage and the tax and total are calculated for you. For clients in other EU countries you may need to reverse-charge VAT instead; see the guide on invoicing international clients." },
  { q: "Can I edit or resend the invoice later?", a: "Not in the generator, because nothing is saved. With a free FaturaPro account your invoices, clients and numbering are kept, and you can edit, duplicate or correct an invoice with a credit note." },
];

export default function InvoiceGenerator() {
  useEffect(() => {
    const canonical = "https://faturapro.app/invoice-generator";
    const title = "Free Invoice Generator (No Signup) – Download PDF | FaturaPro";
    const description = "Make a professional invoice online and download it as a PDF. No signup or email. Add your business and bank details, VAT and line items, in 18 currencies.";
    const cleanupSeo = applyPageSeo({ title, description, canonical, language:"en", locale:"en_US", imageAlt:"FaturaPro free invoice generator", alternates:{ en:canonical, "x-default":canonical } });
    const restoreSiteSchema = suspendBaseSiteSchema();
    const schema = document.createElement("script");
    schema.id = "invoice-generator-schema";
    schema.type = "application/ld+json";
    schema.textContent = JSON.stringify({
      "@context":"https://schema.org",
      "@graph":[
        { "@type":"SoftwareApplication", name:"FaturaPro Free Invoice Generator", url:canonical, applicationCategory:"BusinessApplication", operatingSystem:"Web browser", description, offers:{ "@type":"Offer", price:"0", priceCurrency:"EUR" }, publisher:{ "@type":"Organization", name:"FaturaPro", url:"https://faturapro.app/" } },
        { "@type":"BreadcrumbList", itemListElement:[{ "@type":"ListItem", position:1, name:"Home", item:"https://faturapro.app/" }, { "@type":"ListItem", position:2, name:"Free invoice generator", item:canonical }] },
      ],
    });
    document.head.appendChild(schema);
    trackEvent("seo_page_viewed", { page:"invoice_generator", language:"en" });
    return () => { schema.remove(); restoreSiteSchema(); cleanupSeo(); };
  }, []);

  const [form, setForm] = useState({
    yourName: "", yourAddress: "", yourTaxId: "",
    clientName: "", clientAddress: "",
    invoiceNumber: "INV-001",
    date: new Date().toLocaleDateString("en-CA"), // local YYYY-MM-DD, not UTC
    due: "", currency: "EUR", tax: 0, payment: "", notes: "",
  });
  const [items, setItems] = useState([{ desc: "", qty: 1, price: 0 }]);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setItem = (i, k, v) => setItems(prev => prev.map((it, idx) => idx === i ? { ...it, [k]: v } : it));
  const cur = CURRENCIES.find(c => c.code === form.currency) || CURRENCIES[0];
  const subtotal = items.reduce((a, b) => a + (b.qty * b.price), 0);
  const taxAmt = subtotal * (form.tax / 100);
  const total = subtotal + taxAmt;
  const f = (n) => cur.symbol + " " + n.toFixed(2);

  const inputStyle = { width:"100%", background:"#18181f", border:"1px solid rgba(99,102,241,0.18)", borderRadius:8, color:"#e8e4dc", fontSize:14, padding:"10px 12px", outline:"none", boxSizing:"border-box", fontFamily:"DM Sans, sans-serif" };
  const labelStyle = { fontSize:11, fontWeight:700, color:"#9a9690", letterSpacing:0.5, textTransform:"uppercase", marginBottom:6, display:"block" };
  const h2Style = { fontFamily:"Playfair Display, Georgia, serif", fontSize:24, color:"#6366F1", margin:"44px 0 12px" };
  const pStyle = { fontSize:14.5, lineHeight:1.9, color:"rgba(232,228,220,0.75)", margin:"0 0 14px" };
  const linkStyle = { color:"#9b8cff" };
  const small = { fontSize:11, color:"#777", whiteSpace:"pre-line", lineHeight:1.5 };

  return (
    <div style={{ minHeight:"100vh", background:"#08080e", color:"#e8e4dc", fontFamily:"DM Sans, sans-serif" }}>
      <div style={{ maxWidth:1100, margin:"0 auto", padding:"40px 20px" }}>
        <a href="/" style={{ color:"#6366F1", fontSize:13, textDecoration:"none", display:"inline-block", marginBottom:24 }}>← FaturaPro</a>
        <h1 style={{ fontFamily:"Playfair Display, Georgia, serif", fontSize:34, marginBottom:8 }}>Free Invoice Generator</h1>
        <p style={{ color:"#9a9690", marginBottom:36, fontSize:15, lineHeight:1.7 }}>Create a professional invoice and download it as a PDF: free, no signup, no account needed. Add your business and bank details, your client, line items and VAT, and check the invoice as you build it. Nothing you type is stored.</p>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:28, alignItems:"start" }} className="gen-grid">
          <style>{`
            @media (max-width: 800px) { .gen-grid { grid-template-columns: 1fr !important; } }
            @media print { .gen-noprint { display: none !important; } }
            .gen-table td, .gen-table th { padding: 10px 12px; border-bottom: 1px solid rgba(255,255,255,0.08); text-align: left; vertical-align: top; }
          ` + printOnlyCss(".gen-invoice")}</style>

          {/* FORM */}
          <div style={{ background:"#111118", border:"1px solid rgba(99,102,241,0.15)", borderRadius:16, padding:28 }}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:14 }}>
              <div><label style={labelStyle} htmlFor="gen-your-name">Your Name / Business</label><input id="gen-your-name" style={inputStyle} value={form.yourName} onChange={e => set("yourName", e.target.value)} placeholder="e.g. Sarah Design Studio" /></div>
              <div><label style={labelStyle} htmlFor="gen-client-name">Client Name</label><input id="gen-client-name" style={inputStyle} value={form.clientName} onChange={e => set("clientName", e.target.value)} placeholder="e.g. Acme BV" /></div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:14 }}>
              <div><label style={labelStyle} htmlFor="gen-your-address">Your Address</label><textarea id="gen-your-address" rows={2} style={inputStyle} value={form.yourAddress} onChange={e => set("yourAddress", e.target.value)} placeholder={"Street 1\n1011 AB Amsterdam"} /></div>
              <div><label style={labelStyle} htmlFor="gen-client-address">Client Address</label><textarea id="gen-client-address" rows={2} style={inputStyle} value={form.clientAddress} onChange={e => set("clientAddress", e.target.value)} placeholder={"Client street 5\n3011 AA Rotterdam"} /></div>
            </div>
            <div style={{ marginBottom:14 }}>
              <label style={labelStyle} htmlFor="gen-tax-id">Your VAT ID / Company No. (optional)</label>
              <input id="gen-tax-id" style={inputStyle} value={form.yourTaxId} onChange={e => set("yourTaxId", e.target.value)} placeholder="e.g. VAT NL001234567B01 · KVK 12345678" />
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14, marginBottom:14 }}>
              <div><label style={labelStyle} htmlFor="gen-number">Invoice #</label><input id="gen-number" style={inputStyle} value={form.invoiceNumber} onChange={e => set("invoiceNumber", e.target.value)} /></div>
              <div><label style={labelStyle} htmlFor="gen-date">Date</label><input id="gen-date" type="date" style={inputStyle} value={form.date} onChange={e => set("date", e.target.value)} /></div>
              <div><label style={labelStyle} htmlFor="gen-due">Due Date</label><input id="gen-due" type="date" style={inputStyle} value={form.due} onChange={e => set("due", e.target.value)} /></div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:20 }}>
              <div><label style={labelStyle} htmlFor="gen-currency">Currency</label>
                <select id="gen-currency" style={inputStyle} value={form.currency} onChange={e => set("currency", e.target.value)}>
                  {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code}{c.symbol !== c.code ? " (" + c.symbol + ")" : ""}</option>)}
                </select>
              </div>
              <div><label style={labelStyle} htmlFor="gen-tax">Tax / VAT %</label><input id="gen-tax" type="number" style={inputStyle} value={form.tax === 0 ? "" : form.tax} min={0} onChange={e => set("tax", e.target.value === "" ? 0 : +e.target.value)} placeholder="0" /></div>
            </div>

            <label style={labelStyle}>Items</label>
            {items.map((it, i) => (
              <div key={i} style={{ display:"grid", gridTemplateColumns:"2fr 60px 90px 28px", gap:8, marginBottom:8 }}>
                <input aria-label={"Item " + (i + 1) + " description"} style={inputStyle} value={it.desc} onChange={e => setItem(i, "desc", e.target.value)} placeholder="Service description" />
                <input aria-label={"Item " + (i + 1) + " quantity"} type="number" style={{...inputStyle, textAlign:"center"}} value={it.qty === 0 ? "" : it.qty} min={0} onChange={e => setItem(i, "qty", e.target.value === "" ? 0 : +e.target.value)} placeholder="1" />
                <input aria-label={"Item " + (i + 1) + " price"} type="number" style={{...inputStyle, textAlign:"right"}} value={it.price === 0 ? "" : it.price} min={0} onChange={e => setItem(i, "price", e.target.value === "" ? 0 : +e.target.value)} placeholder="0.00" />
                <button aria-label={"Remove item " + (i + 1)} onClick={() => setItems(prev => prev.filter((_, idx) => idx !== i))} style={{ background:"none", border:"none", color:"#e05555", cursor:"pointer", fontSize:18 }}>×</button>
              </div>
            ))}
            <button onClick={() => setItems(prev => [...prev, { desc:"", qty:1, price:0 }])} style={{ background:"none", border:"1px solid rgba(99,102,241,0.25)", color:"#6366F1", borderRadius:8, padding:"8px 16px", fontSize:13, cursor:"pointer", marginTop:6, marginBottom:18 }}>+ Add Item</button>

            <div style={{ marginBottom:14 }}>
              <label style={labelStyle} htmlFor="gen-payment">Payment Details (optional)</label>
              <textarea id="gen-payment" rows={2} style={inputStyle} value={form.payment} onChange={e => set("payment", e.target.value)} placeholder={"IBAN NL00 BANK 0123 4567 89\nPlease pay within 30 days"} />
            </div>
            <div>
              <label style={labelStyle} htmlFor="gen-notes">Notes (optional)</label>
              <textarea id="gen-notes" rows={2} style={inputStyle} value={form.notes} onChange={e => set("notes", e.target.value)} placeholder="e.g. Thank you for your business" />
            </div>
          </div>

          {/* PREVIEW */}
          <div>
            <div className="gen-invoice" style={{ background:"#fdfcf9", borderRadius:16, padding:"36px 34px", color:"#1a1a2e", boxShadow:"0 20px 60px rgba(0,0,0,0.5)" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:28, gap:16 }}>
                <div>
                  <div style={{ fontFamily:"Playfair Display, Georgia, serif", fontSize:22, fontWeight:700, color:"#6366F1" }}>{form.yourName || "Your Business"}</div>
                  {form.yourAddress && <div style={small}>{form.yourAddress}</div>}
                  {form.yourTaxId && <div style={small}>{form.yourTaxId}</div>}
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontSize:10, letterSpacing:2, color:"#999", textTransform:"uppercase" }}>Invoice</div>
                  <div style={{ fontWeight:700, fontSize:16 }}>{form.invoiceNumber}</div>
                  <div style={{ fontSize:11, color:"#777", marginTop:4 }}>Date: {form.date}</div>
                  {form.due && <div style={{ fontSize:11, color:"#777" }}>Due: {form.due}</div>}
                </div>
              </div>
              <div style={{ background:"#faf7f0", borderRadius:8, padding:"12px 16px", marginBottom:24 }}>
                <div style={{ fontSize:10, letterSpacing:1.5, color:"#6366F1", textTransform:"uppercase", fontWeight:800, marginBottom:4 }}>Bill To</div>
                <div style={{ fontWeight:700, fontSize:14 }}>{form.clientName || "Client Name"}</div>
                {form.clientAddress && <div style={small}>{form.clientAddress}</div>}
              </div>
              <table style={{ width:"100%", borderCollapse:"collapse", marginBottom:20 }}>
                <thead><tr style={{ borderBottom:"2px solid #eee" }}>
                  <th style={{ textAlign:"left", padding:"8px 0", fontSize:10, letterSpacing:1, color:"#999", textTransform:"uppercase" }}>Description</th>
                  <th style={{ textAlign:"center", padding:"8px 0", fontSize:10, letterSpacing:1, color:"#999", textTransform:"uppercase", width:50 }}>Qty</th>
                  <th style={{ textAlign:"right", padding:"8px 0", fontSize:10, letterSpacing:1, color:"#999", textTransform:"uppercase", width:90 }}>Amount</th>
                </tr></thead>
                <tbody>
                  {items.map((it, i) => (
                    <tr key={i} style={{ borderBottom:"1px solid #f5f5f5" }}>
                      <td style={{ padding:"10px 0", fontSize:13 }}>{it.desc || "Service"}</td>
                      <td style={{ textAlign:"center", fontSize:13 }}>{it.qty}</td>
                      <td style={{ textAlign:"right", fontSize:13 }}>{f(it.qty * it.price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ display:"flex", justifyContent:"flex-end" }}>
                <div style={{ minWidth:200 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, padding:"4px 0" }}><span style={{ color:"#777" }}>Subtotal</span><span>{f(subtotal)}</span></div>
                  {form.tax > 0 && <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, padding:"4px 0" }}><span style={{ color:"#777" }}>Tax ({form.tax}%)</span><span>{f(taxAmt)}</span></div>}
                  <div style={{ display:"flex", justifyContent:"space-between", fontWeight:800, fontSize:17, padding:"10px 0", borderTop:"2px solid #eee", marginTop:6 }}><span>Total</span><span style={{ color:"#6366F1" }}>{f(total)}</span></div>
                </div>
              </div>
              {(form.payment || form.notes) && (
                <div style={{ marginTop:20, paddingTop:14, borderTop:"1px solid #eee" }}>
                  {form.payment && <div style={{ ...small, color:"#444", marginBottom:6 }}><b>Payment details</b>{"\n"}{form.payment}</div>}
                  {form.notes && <div style={{ ...small, color:"#444" }}>{form.notes}</div>}
                </div>
              )}
              <div style={{ borderTop:"1px solid #eee", marginTop:26, paddingTop:12, textAlign:"center", fontSize:10, letterSpacing:0.6, color:"#b3aea4" }}>
                <a href={INVOICE_ATTRIBUTION_URL} target="_blank" rel="noreferrer" onClick={() => trackEvent("invoice_brand_link_clicked", { placement:"free_generator_footer", plan:"generator" })} style={{ color:"#6366F1", fontWeight:700, textDecoration:"none" }}>
                  Made with FaturaPro ↗
                </a>
              </div>
            </div>

            <button className="gen-noprint" onClick={() => { trackEvent("free_generator_pdf_downloaded", { has_items:items.some(item => item.desc || Number(item.price) > 0) }); printWithTitle("Invoice-" + (form.invoiceNumber || "")); }} style={{ width:"100%", marginTop:20, padding:"14px 0", borderRadius:12, border:"none", background:"linear-gradient(135deg,#7C6CF2,#6366F1)", color:"#0a0a0f", fontWeight:800, fontSize:16, cursor:"pointer" }}>
              Download PDF
            </button>
            <div className="gen-noprint" style={{ fontSize:11.5, color:"#5a5750", textAlign:"center", marginTop:8, lineHeight:1.7 }}>
              Opens your browser's print window. Choose "Save as PDF" as the destination.
            </div>

            {/* CTA */}
            <div className="gen-noprint" style={{ background:"rgba(99,102,241,0.07)", border:"1px solid rgba(99,102,241,0.25)", borderRadius:14, padding:"22px 24px", marginTop:20, textAlign:"center" }}>
              <div style={{ fontSize:15, fontWeight:700, color:"#e8e4dc", marginBottom:6 }}>Invoicing more than once?</div>
              <div style={{ fontSize:13, color:"#9a9690", marginBottom:14 }}>A free account keeps your invoices, clients and numbering, adds your logo, and shows who has paid.</div>
              <a href={SIGNUP_URL} onClick={() => trackEvent("free_generator_signup_clicked", { placement:"preview_cta" })} style={{ display:"inline-block", padding:"12px 30px", borderRadius:10, background:"linear-gradient(135deg,#7C6CF2,#6366F1)", color:"#0a0a0f", fontWeight:700, fontSize:15, textDecoration:"none" }}>Create a free account →</a>
              <div style={{ fontSize:11, color:"#5a5750", marginTop:10 }}>No credit card · Free plan: 20 invoices and 5 clients</div>
            </div>
          </div>
        </div>

        {/* Guide */}
        <div className="gen-noprint" style={{ maxWidth:760, margin:"60px auto 0" }}>
          <h2 style={{ ...h2Style, marginTop:0 }}>How to make an invoice in 4 steps</h2>
          <ol style={{ ...pStyle, paddingLeft:20 }}>
            <li><b>Add your details.</b> Your name or business name, address and, if you are VAT-registered, your VAT ID and company number.</li>
            <li><b>Add your client.</b> Their name and address. For a business client in another EU country, add their VAT ID too.</li>
            <li><b>List the work.</b> One line per service or product with quantity and price. Set the VAT or sales tax percentage; the totals are calculated for you.</li>
            <li><b>Set the terms and download.</b> Give the invoice a number and a due date, add your bank details, then press Download PDF and send it to your client.</li>
          </ol>

          <h2 style={h2Style}>What an invoice should include</h2>
          <p style={pStyle}>Requirements differ per country, but in the EU most invoices need the following. Missing details are a common reason clients pay late.</p>
          <ul style={{ ...pStyle, paddingLeft:20 }}>
            <li>A unique, sequential invoice number and the invoice date</li>
            <li>Your name, address and VAT ID (and company number where required, such as the KVK number in the Netherlands)</li>
            <li>Your client's name and address</li>
            <li>A description of the work, the quantity and the date or period it was done</li>
            <li>The amount excluding VAT, the VAT rate and VAT amount, and the total</li>
            <li>A payment term and how to pay, such as your IBAN</li>
          </ul>
          <p style={pStyle}>For more detail, read <a href="/blog/how-to-create-professional-invoice" style={linkStyle}>how to create a professional invoice</a>, or, if you work in the Netherlands, <a href="/blog/how-to-invoice-zzp-netherlands-english" style={linkStyle}>how to invoice as a ZZP</a>.</p>

          <h2 style={h2Style}>Free generator or free account?</h2>
          <div style={{ overflowX:"auto" }}>
            <table className="gen-table" style={{ width:"100%", borderCollapse:"collapse", fontSize:14, color:"rgba(232,228,220,0.85)" }}>
              <thead><tr><th></th><th>This generator</th><th>Free FaturaPro account</th></tr></thead>
              <tbody>
                <tr><td>Price</td><td>Free, no signup</td><td>Free, no credit card</td></tr>
                <tr><td>Invoices</td><td>One at a time, not saved</td><td>20 invoices and 5 clients, saved</td></tr>
                <tr><td>Numbering</td><td>You type it</td><td>Follows on automatically</td></tr>
                <tr><td>Logo and branding</td><td>No</td><td>Yes</td></tr>
                <tr><td>Invoice languages</td><td>English</td><td>English, Dutch, French, Spanish, Arabic</td></tr>
                <tr><td>Corrections</td><td>Make a new PDF</td><td>Credit notes</td></tr>
                <tr><td>Payment status</td><td>No</td><td>Paid, open and overdue at a glance</td></tr>
              </tbody>
            </table>
          </div>
          <p style={{ ...pStyle, marginTop:14 }}>Paid plans add payment reminders by email and WhatsApp, deposits, UBL/XML export, quotes, recurring invoices, expenses with receipt scanning and a quarterly VAT summary. <a href="/blog/invoicing-plans-free-vs-pro-vs-business" style={linkStyle}>Compare the plans</a> or <a href={SIGNUP_URL} style={linkStyle}>start free</a>.</p>

          <h2 style={h2Style}>Invoicing a client in another country?</h2>
          <p style={pStyle}>Pick the client's currency above, and check whether you should charge VAT: for business clients in other EU countries, VAT is often <a href="/blog/reverse-charge-vat-invoice-btw-verlegd" style={linkStyle}>reverse-charged</a>. The guide on <a href="/blog/how-to-invoice-international-clients" style={linkStyle}>invoicing international clients</a> explains currency, language and VAT step by step. Clients that ask for an e-invoice can be sent a UBL/XML file from a FaturaPro account (<a href="/blog/how-to-create-ubl-invoice-en16931" style={linkStyle}>what UBL is</a>).</p>

          <h2 style={h2Style}>Questions</h2>
          {FAQS.map((item) => (
            <div key={item.q} style={{ marginBottom:16 }}>
              <h3 style={{ fontSize:16, margin:"0 0 6px", color:"#e8e4dc" }}>{item.q}</h3>
              <p style={pStyle}>{item.a}</p>
            </div>
          ))}
          <p style={pStyle}>Late payment? Copy a free <a href="/late-payment-scripts" style={linkStyle}>payment reminder template</a>.</p>
        </div>
      </div>
    </div>
  );
}
