// Fatura Pro - Quotes page (Business plan)
import { useState } from "react";
import { loadQuotes, saveQuote, deleteQuote, quoteToInvoice, nextQuoteId } from "../lib/quotes";

export { loadQuotes };

export default function Quotes({ quotes, setQuotes, userId, f, onConvert, sellerDefaults }) {
  const [editing, setEditing] = useState(null); // null | "new" | quote object

  const refresh = async () => setQuotes(await loadQuotes(userId));

  const handleDelete = async (q) => {
    if (!window.confirm("Delete quote " + q.id + "?")) return;
    await deleteQuote(q.id, userId);
    refresh();
  };

  const handleConvert = async (q) => {
    if (q.convertedInvoiceId) { alert("Already converted to invoice " + q.convertedInvoiceId); return; }
    const invoice = onConvert(q); // يحفظ الفاتورة بنظام الفواتير الحالي ويرجعها
    if (!invoice) return;
    await saveQuote({ ...q, status: "accepted", convertedInvoiceId: invoice.id }, userId);
    refresh();
    alert("Quote converted to invoice " + invoice.id + " ✓");
  };

  const statusColor = { draft:"#999", sent:"#c9a84c", accepted:"#2d8c65", declined:"#e05555", expired:"#777" };

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <div className="card-title">Quotes</div>
        <button className="btn btn-primary" onClick={() => setEditing("new")}>+ New Quote</button>
      </div>

      {quotes.length === 0 && !editing && (
        <div className="card" style={{ textAlign:"center", padding:40, color:"#999" }}>
          No quotes yet. Create your first quote and convert it to an invoice in one click.
        </div>
      )}

      {quotes.map((q) => (
        <div key={q.id} className="card" style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10, padding:"14px 18px", flexWrap:"wrap", gap:10 }}>
          <div>
            <div style={{ fontWeight:700 }}>{q.id} · {q.client || "No client"}</div>
            <div style={{ fontSize:12, color:"#999" }}>
              {q.date || ""}{q.validUntil ? " · valid until " + q.validUntil : ""}
              {q.convertedInvoiceId ? " · → " + q.convertedInvoiceId : ""}
            </div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
            <span style={{ fontSize:11, fontWeight:800, textTransform:"uppercase", color:statusColor[q.status] || "#999" }}>{q.status}</span>
            <span style={{ fontWeight:700 }}>{f ? f(q.total, q.currency) : q.total}</span>
            <button className="btn btn-ghost btn-sm" onClick={() => setEditing(q)}>Edit</button>
            {!q.convertedInvoiceId && <button className="btn btn-sm" style={{ background:"rgba(45,140,101,0.15)", color:"#2d8c65", border:"1px solid rgba(45,140,101,0.4)" }} onClick={() => handleConvert(q)}>→ Invoice</button>}
            <button className="btn btn-ghost btn-sm" style={{ color:"#e05555" }} onClick={() => handleDelete(q)}>✕</button>
          </div>
        </div>
      ))}

      {editing && (
        <QuoteModal
          quote={editing === "new" ? null : editing}
          quoteCount={quotes.length}
          sellerDefaults={sellerDefaults || {}}
          onClose={() => setEditing(null)}
          onSave={async (q) => { await saveQuote(q, userId); setEditing(null); refresh(); }}
        />
      )}
    </div>
  );
}

function QuoteModal({ quote, quoteCount, sellerDefaults, onClose, onSave }) {
  const isEdit = !!quote;
  const [form, setForm] = useState(quote || {
    client:"", email:"", date:new Date().toISOString().split("T")[0], validUntil:"",
    tax:21, discount:0, notes:"", currency:sellerDefaults.currency || "EUR", status:"draft",
    sellerName:sellerDefaults.sellerName || "", sellerEmail:sellerDefaults.sellerEmail || "",
    items:[{ desc:"", qty:1, price:0 }],
  });
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const setItem = (i, k, v) => setForm((p) => {
    const items = p.items.map((it, idx) => idx === i ? { ...it, [k]: v } : it);
    return { ...p, items };
  });
  const addItem = () => set("items", [...form.items, { desc:"", qty:1, price:0 }]);
  const removeItem = (i) => set("items", form.items.filter((_, idx) => idx !== i));

  const subtotal = form.items.reduce((a, it) => a + (Number(it.qty) * Number(it.price) || 0), 0);
  const discountAmt = subtotal * (Number(form.discount) / 100);
  const taxAmt = (subtotal - discountAmt) * (Number(form.tax) / 100);
  const total = subtotal - discountAmt + taxAmt;

  const save = () => {
    if (!form.client.trim()) { alert("Client name is required"); return; }
    const id = isEdit ? quote.id : nextQuoteId(quoteCount);
    onSave({ ...form, id, subtotal, discountAmt, taxAmt, total, amount: total });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth:640 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:16 }}>
          <div className="card-title">{isEdit ? "Edit Quote " + quote.id : "New Quote"}</div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
          <input placeholder="Client name *" value={form.client} onChange={(e) => set("client", e.target.value)} />
          <input placeholder="Client email" value={form.email} onChange={(e) => set("email", e.target.value)} />
          <label style={{ fontSize:12 }}>Date<input type="date" value={form.date} onChange={(e) => set("date", e.target.value)} /></label>
          <label style={{ fontSize:12 }}>Valid until<input type="date" value={form.validUntil || ""} onChange={(e) => set("validUntil", e.target.value)} /></label>
        </div>

        {form.items.map((it, i) => (
          <div key={i} style={{ display:"grid", gridTemplateColumns:"3fr 1fr 1fr auto", gap:8, marginBottom:8 }}>
            <input placeholder="Description" value={it.desc} onChange={(e) => setItem(i, "desc", e.target.value)} />
            <input type="number" placeholder="Qty" value={it.qty} onChange={(e) => setItem(i, "qty", e.target.value)} />
            <input type="number" placeholder="Price" value={it.price} onChange={(e) => setItem(i, "price", e.target.value)} />
            <button className="btn btn-ghost btn-sm" onClick={() => removeItem(i)} disabled={form.items.length === 1}>✕</button>
          </div>
        ))}
        <button className="btn btn-ghost btn-sm" onClick={addItem} style={{ marginBottom:12 }}>+ Add item</button>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:10 }}>
          <label style={{ fontSize:12 }}>Tax %<input type="number" value={form.tax} onChange={(e) => set("tax", e.target.value)} /></label>
          <label style={{ fontSize:12 }}>Discount %<input type="number" value={form.discount} onChange={(e) => set("discount", e.target.value)} /></label>
          <label style={{ fontSize:12 }}>Status
            <select value={form.status} onChange={(e) => set("status", e.target.value)}>
              <option value="draft">Draft</option><option value="sent">Sent</option>
              <option value="accepted">Accepted</option><option value="declined">Declined</option>
            </select>
          </label>
        </div>

        <textarea placeholder="Notes" value={form.notes} onChange={(e) => set("notes", e.target.value)} style={{ width:"100%", marginBottom:12 }} />

        <div style={{ textAlign:"right", marginBottom:14, fontSize:14 }}>
          Subtotal: <b>{subtotal.toFixed(2)}</b> · Tax: <b>{taxAmt.toFixed(2)}</b> · Total: <b>{total.toFixed(2)} {form.currency}</b>
        </div>

        <div style={{ display:"flex", justifyContent:"flex-end", gap:10 }}>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={save}>{isEdit ? "Save changes" : "Create quote"}</button>
        </div>
      </div>
    </div>
  );
}
