import { useState, useEffect } from "react";
import { trackEvent } from "../lib/tracking";

const INVOICE_ATTRIBUTION_URL = "https://faturapro.app/?utm_source=invoice&utm_medium=footer&utm_campaign=free_invoice_generator";

const CURRENCIES = [
  { code: "EUR", symbol: "€" }, { code: "USD", symbol: "$" }, { code: "GBP", symbol: "£" },
  { code: "AED", symbol: "AED" }, { code: "MAD", symbol: "MAD" }, { code: "SAR", symbol: "SAR" },
];

export default function InvoiceGenerator() {
  useEffect(() => {
    document.title = "Free Invoice Generator — Create a Professional Invoice Online | Fatūra Pro";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Free online invoice generator. Create a professional invoice in seconds and download it as a PDF — no signup, no account needed. Supports EUR, USD, GBP, AED and more.");
  }, []);

  const [form, setForm] = useState({
    yourName: "", clientName: "", invoiceNumber: "INV-001",
    date: new Date().toISOString().split("T")[0],
    due: "", currency: "EUR", tax: 0,
  });
  const [items, setItems] = useState([{ desc: "", qty: 1, price: 0 }]);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setItem = (i, k, v) => setItems(prev => prev.map((it, idx) => idx === i ? { ...it, [k]: v } : it));
  const cur = CURRENCIES.find(c => c.code === form.currency) || CURRENCIES[0];
  const subtotal = items.reduce((a, b) => a + (b.qty * b.price), 0);
  const taxAmt = subtotal * (form.tax / 100);
  const total = subtotal + taxAmt;
  const f = (n) => cur.symbol + " " + n.toFixed(2);

  const inputStyle = { width:"100%", background:"#18181f", border:"1px solid rgba(201,168,76,0.18)", borderRadius:8, color:"#e8e4dc", fontSize:14, padding:"10px 12px", outline:"none", boxSizing:"border-box", fontFamily:"DM Sans, sans-serif" };
  const labelStyle = { fontSize:11, fontWeight:700, color:"#9a9690", letterSpacing:0.5, textTransform:"uppercase", marginBottom:6, display:"block" };

  return (
    <div style={{ minHeight:"100vh", background:"#08080e", color:"#e8e4dc", fontFamily:"DM Sans, sans-serif" }}>
      <div style={{ maxWidth:1100, margin:"0 auto", padding:"40px 20px" }}>
        <a href="/" style={{ color:"#c9a84c", fontSize:13, textDecoration:"none", display:"inline-block", marginBottom:24 }}>← Fatūra Pro</a>
        <h1 style={{ fontFamily:"Playfair Display, Georgia, serif", fontSize:34, marginBottom:8 }}>Free Invoice Generator</h1>
        <p style={{ color:"#9a9690", marginBottom:36, fontSize:15, lineHeight:1.7 }}>Create a professional invoice in seconds and download it as a PDF — free, no signup, no account needed. Fill in the details and watch your invoice come to life.</p>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:28, alignItems:"start" }} className="gen-grid">
          <style>{`
            @media (max-width: 800px) { .gen-grid { grid-template-columns: 1fr !important; } }
            @media print {
              html, body { background: #fff !important; margin: 0 !important; padding: 0 !important; }
              body * { visibility: hidden !important; }
              .gen-invoice, .gen-invoice * { visibility: visible !important; }
              .gen-invoice {
                position: absolute !important; left: 0 !important; top: 0 !important;
                width: 100% !important; max-width: 100% !important;
                box-shadow: none !important; border-radius: 0 !important;
                padding: 0 !important; background: #fff !important;
              }
              .gen-noprint { display: none !important; }
              * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
            }
            @page { size: A4 portrait; margin: 14mm; }
          `}</style>

          {/* FORM */}
          <div style={{ background:"#111118", border:"1px solid rgba(201,168,76,0.15)", borderRadius:16, padding:28 }}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:14 }}>
              <div><label style={labelStyle}>Your Name / Business</label><input style={inputStyle} value={form.yourName} onChange={e => set("yourName", e.target.value)} placeholder="e.g. Sarah Design Studio" /></div>
              <div><label style={labelStyle}>Client Name</label><input style={inputStyle} value={form.clientName} onChange={e => set("clientName", e.target.value)} placeholder="e.g. Acme BV" /></div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14, marginBottom:14 }}>
              <div><label style={labelStyle}>Invoice #</label><input style={inputStyle} value={form.invoiceNumber} onChange={e => set("invoiceNumber", e.target.value)} /></div>
              <div><label style={labelStyle}>Date</label><input type="date" style={inputStyle} value={form.date} onChange={e => set("date", e.target.value)} /></div>
              <div><label style={labelStyle}>Due Date</label><input type="date" style={inputStyle} value={form.due} onChange={e => set("due", e.target.value)} /></div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:20 }}>
              <div><label style={labelStyle}>Currency</label>
                <select style={inputStyle} value={form.currency} onChange={e => set("currency", e.target.value)}>
                  {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code} ({c.symbol})</option>)}
                </select>
              </div>
              <div><label style={labelStyle}>Tax / VAT %</label><input type="number" style={inputStyle} value={form.tax === 0 ? "" : form.tax} min={0} onChange={e => set("tax", e.target.value === "" ? 0 : +e.target.value)} placeholder="0" /></div>
            </div>

            <label style={labelStyle}>Items</label>
            {items.map((it, i) => (
              <div key={i} style={{ display:"grid", gridTemplateColumns:"2fr 60px 90px 28px", gap:8, marginBottom:8 }}>
                <input style={inputStyle} value={it.desc} onChange={e => setItem(i, "desc", e.target.value)} placeholder="Service description" />
                <input type="number" style={{...inputStyle, textAlign:"center"}} value={it.qty === 0 ? "" : it.qty} min={0} onChange={e => setItem(i, "qty", e.target.value === "" ? 0 : +e.target.value)} placeholder="1" />
                <input type="number" style={{...inputStyle, textAlign:"right"}} value={it.price === 0 ? "" : it.price} min={0} onChange={e => setItem(i, "price", e.target.value === "" ? 0 : +e.target.value)} placeholder="0.00" />
                <button onClick={() => setItems(prev => prev.filter((_, idx) => idx !== i))} style={{ background:"none", border:"none", color:"#e05555", cursor:"pointer", fontSize:18 }}>×</button>
              </div>
            ))}
            <button onClick={() => setItems(prev => [...prev, { desc:"", qty:1, price:0 }])} style={{ background:"none", border:"1px solid rgba(201,168,76,0.25)", color:"#c9a84c", borderRadius:8, padding:"8px 16px", fontSize:13, cursor:"pointer", marginTop:6, fontFamily:"DM Sans, sans-serif" }}>+ Add Item</button>
          </div>

          {/* PREVIEW */}
          <div>
            <div className="gen-invoice" style={{ background:"#fdfcf9", borderRadius:16, padding:"36px 34px", color:"#1a1a2e", boxShadow:"0 20px 60px rgba(0,0,0,0.5)" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:28 }}>
                <div style={{ fontFamily:"Playfair Display, Georgia, serif", fontSize:22, fontWeight:700, color:"#c9a84c" }}>{form.yourName || "Your Business"}</div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontSize:10, letterSpacing:2, color:"#999", textTransform:"uppercase" }}>Invoice</div>
                  <div style={{ fontWeight:700, fontSize:16 }}>{form.invoiceNumber}</div>
                  <div style={{ fontSize:11, color:"#777", marginTop:4 }}>Date: {form.date}</div>
                  {form.due && <div style={{ fontSize:11, color:"#777" }}>Due: {form.due}</div>}
                </div>
              </div>
              <div style={{ background:"#faf7f0", borderRadius:8, padding:"12px 16px", marginBottom:24 }}>
                <div style={{ fontSize:10, letterSpacing:1.5, color:"#c9a84c", textTransform:"uppercase", fontWeight:800, marginBottom:4 }}>Bill To</div>
                <div style={{ fontWeight:700, fontSize:14 }}>{form.clientName || "Client Name"}</div>
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
                  <div style={{ display:"flex", justifyContent:"space-between", fontWeight:800, fontSize:17, padding:"10px 0", borderTop:"2px solid #eee", marginTop:6 }}><span>Total</span><span style={{ color:"#c9a84c" }}>{f(total)}</span></div>
                </div>
              </div>
              <div style={{ borderTop:"1px solid #eee", marginTop:26, paddingTop:12, textAlign:"center", fontSize:10, letterSpacing:0.6, color:"#b3aea4" }}>
                <a href={INVOICE_ATTRIBUTION_URL} target="_blank" rel="noreferrer" onClick={() => trackEvent("invoice_brand_link_clicked", { placement:"free_generator_footer", plan:"generator" })} style={{ color:"#9d8647", fontWeight:700, textDecoration:"none" }}>
                  Made with Fatūra Pro ↗
                </a>
              </div>
            </div>

            <button className="gen-noprint" onClick={() => { trackEvent("free_generator_pdf_downloaded", { has_items:items.some(item => item.desc || Number(item.price) > 0) }); window.print(); }} style={{ width:"100%", marginTop:16, padding:"14px 20px", borderRadius:11, background:"linear-gradient(135deg,#f0d878,#c9a84c)", color:"#0a0a0f", fontWeight:700, fontSize:15, border:"none", cursor:"pointer", fontFamily:"DM Sans, sans-serif" }}>
              Download PDF
            </button>
            <div className="gen-noprint" style={{ fontSize:11.5, color:"#5a5750", textAlign:"center", marginTop:8, lineHeight:1.7 }}>
              Opens your browser's print window — choose "Save as PDF" as the destination.
            </div>

            {/* CTA */}
            <div className="gen-noprint" style={{ background:"rgba(201,168,76,0.07)", border:"1px solid rgba(201,168,76,0.25)", borderRadius:14, padding:"22px 24px", marginTop:20, textAlign:"center" }}>
              <div style={{ fontSize:15, fontWeight:700, color:"#e8e4dc", marginBottom:6 }}>Invoicing more than once?</div>
              <div style={{ fontSize:13, color:"#9a9690", marginBottom:14 }}>Create a free account to add your logo, save clients for repeat billing, track who has paid, and send payment reminders automatically.</div>
              <a href="/login" style={{ display:"inline-block", padding:"12px 30px", borderRadius:10, background:"linear-gradient(135deg,#f0d878,#c9a84c)", color:"#0a0a0f", fontWeight:700, fontSize:15, textDecoration:"none" }}>Continue Free →</a>
              <div style={{ fontSize:11, color:"#5a5750", marginTop:10 }}>No credit card · 7-day Pro trial included</div>
            </div>
          </div>
        </div>

        {/* SEO text */}
        <div style={{ maxWidth:760, margin:"60px auto 0" }}>
          <h2 style={{ fontFamily:"Playfair Display, Georgia, serif", fontSize:24, color:"#c9a84c", marginBottom:12 }}>How to use this free invoice generator</h2>
          <p style={{ fontSize:14.5, lineHeight:1.9, color:"rgba(232,228,220,0.75)", marginBottom:20 }}>Enter your business name, your client's details, and your services with quantities and prices. The invoice preview updates instantly. Choose from EUR, USD, GBP, AED, MAD, SAR and more. Add tax or VAT if needed — the totals calculate automatically. When it looks right, press Download PDF and save it straight to your device: no signup, no account, no email address. To add your logo, save clients for repeat billing, track paid and overdue invoices and send payment reminders automatically, create a free Fatūra Pro account. No credit card required.</p>
          <h2 style={{ fontFamily:"Playfair Display, Georgia, serif", fontSize:24, color:"#c9a84c", marginBottom:12 }}>Why professionals choose Fatūra Pro</h2>
          <p style={{ fontSize:14.5, lineHeight:1.9, color:"rgba(232,228,220,0.75)" }}>Fatūra Pro is an online invoicing app for freelancers, consultants and small businesses worldwide. Create unlimited professional invoices, track payment status (paid, pending, overdue), and send payment reminders via Email and WhatsApp in English, Arabic, French and Dutch. Your business profile and clients are saved once and auto-filled on every invoice.</p>
        </div>
      </div>
    </div>
  );
}
