// Fatura Pro - Expenses + VAT/BTW report (Business plan)
import { useState } from "react";
import { loadExpenses, saveExpense, deleteExpense, vatReport } from "../lib/expenses";

const CATEGORIES = ["software", "hardware", "office", "travel", "marketing", "services", "other"];

export default function Expenses({ expenses, setExpenses, invoices, userId, f }) {
  const now = new Date();
  const [editing, setEditing] = useState(null);
  const [year, setYear] = useState(now.getFullYear());
  const [quarter, setQuarter] = useState(Math.floor(now.getMonth() / 3) + 1);

  const refresh = async () => setExpenses(await loadExpenses(userId));
  const report = vatReport(invoices, expenses, year, quarter);
  const fmt = (n) => (f ? f(n) : Number(n).toFixed(2));

  const handleDelete = async (e) => {
    if (!window.confirm("Delete expense \"" + e.description + "\"?")) return;
    await deleteExpense(e.id, userId);
    refresh();
  };

  return (
    <div>
      {/* VAT Report */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:10, marginBottom:14 }}>
          <div className="card-title">VAT / BTW Report</div>
          <div style={{ display:"flex", gap:8 }}>
            <select value={quarter} onChange={(e) => setQuarter(Number(e.target.value))}>
              <option value={1}>Q1 (Jan–Mar)</option><option value={2}>Q2 (Apr–Jun)</option>
              <option value={3}>Q3 (Jul–Sep)</option><option value={4}>Q4 (Oct–Dec)</option>
            </select>
            <select value={year} onChange={(e) => setYear(Number(e.target.value))}>
              {[0,1,2].map(i => { const y = now.getFullYear() - i; return <option key={y} value={y}>{y}</option>; })}
            </select>
          </div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(150px, 1fr))", gap:12 }}>
          <div className="stat-card"><div className="stat-label">Revenue (excl. VAT)</div><div className="stat-value" style={{ fontSize:20 }}>{fmt(report.revenueExcl)}</div><div className="stat-change">{report.invoiceCount} invoices</div></div>
          <div className="stat-card"><div className="stat-label">VAT collected</div><div className="stat-value" style={{ fontSize:20 }}>{fmt(report.vatCollected)}</div><div className="stat-change">on sales</div></div>
          <div className="stat-card"><div className="stat-label">VAT paid</div><div className="stat-value" style={{ fontSize:20 }}>{fmt(report.vatPaid)}</div><div className="stat-change">{report.expenseCount} expenses</div></div>
          <div className="stat-card" style={{ border:"1px solid " + (report.vatDue >= 0 ? "rgba(224,85,85,0.4)" : "rgba(45,140,101,0.4)") }}>
            <div className="stat-label">VAT to {report.vatDue >= 0 ? "pay" : "reclaim"}</div>
            <div className="stat-value" style={{ fontSize:20, color: report.vatDue >= 0 ? "var(--red)" : "#2d8c65" }}>{fmt(Math.abs(report.vatDue))}</div>
            <div className="stat-change">Q{quarter} {year}</div>
          </div>
        </div>
      </div>

      {/* Expenses list */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
        <div className="card-title">Expenses</div>
        <button className="btn btn-primary" onClick={() => setEditing("new")}>+ Add expense</button>
      </div>

      {expenses.length === 0 && (
        <div className="card" style={{ textAlign:"center", padding:40, color:"#999" }}>
          No expenses yet. Track your business costs here — VAT you paid is deducted automatically in the report above.
        </div>
      )}

      {expenses.map((e) => (
        <div key={e.id} className="card" style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8, padding:"12px 16px", flexWrap:"wrap", gap:8 }}>
          <div>
            <div style={{ fontWeight:700 }}>{e.description}</div>
            <div style={{ fontSize:12, color:"#999" }}>{e.date} · {e.category}{e.supplier ? " · " + e.supplier : ""} · VAT {e.vat_rate}%</div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ fontWeight:700 }}>{fmt(e.amount_incl)}</span>
            <button className="btn btn-ghost btn-sm" onClick={() => setEditing(e)}>Edit</button>
            <button className="btn btn-ghost btn-sm" style={{ color:"#e05555" }} onClick={() => handleDelete(e)}>✕</button>
          </div>
        </div>
      ))}

      {editing && (
        <ExpenseModal
          expense={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSave={async (e) => { await saveExpense(e, userId); setEditing(null); refresh(); }}
        />
      )}
    </div>
  );
}

function ExpenseModal({ expense, onClose, onSave }) {
  const isEdit = !!expense;
  const [form, setForm] = useState(expense || {
    date: new Date().toISOString().split("T")[0],
    description:"", category:"other", supplier:"",
    amount_excl:"", vat_rate:21, currency:"EUR",
  });
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const excl = Number(form.amount_excl) || 0;
  const vatAmount = excl * (Number(form.vat_rate) / 100);
  const incl = excl + vatAmount;

  const save = () => {
    if (!form.description.trim()) { alert("Description is required"); return; }
    if (!excl) { alert("Amount is required"); return; }
    onSave({ ...form, amount_excl: excl, vat_amount: vatAmount, amount_incl: incl });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth:520 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:16 }}>
          <div className="card-title">{isEdit ? "Edit expense" : "New expense"}</div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>

        <div style={{ display:"grid", gap:10 }}>
          <input placeholder="Description * (e.g. Adobe subscription)" value={form.description} onChange={(e) => set("description", e.target.value)} />
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            <label style={{ fontSize:12 }}>Date<input type="date" value={form.date} onChange={(e) => set("date", e.target.value)} /></label>
            <label style={{ fontSize:12 }}>Category
              <select value={form.category} onChange={(e) => set("category", e.target.value)}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
          </div>
          <input placeholder="Supplier (optional)" value={form.supplier || ""} onChange={(e) => set("supplier", e.target.value)} />
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            <label style={{ fontSize:12 }}>Amount excl. VAT *<input type="number" step="0.01" value={form.amount_excl} onChange={(e) => set("amount_excl", e.target.value)} /></label>
            <label style={{ fontSize:12 }}>VAT rate %
              <select value={form.vat_rate} onChange={(e) => set("vat_rate", Number(e.target.value))}>
                <option value={21}>21% (standard NL)</option>
                <option value={9}>9% (reduced NL)</option>
                <option value={0}>0% (exempt / reverse)</option>
              </select>
            </label>
          </div>
        </div>

        <div style={{ textAlign:"right", margin:"14px 0", fontSize:14 }}>
          VAT: <b>{vatAmount.toFixed(2)}</b> · Total incl.: <b>{incl.toFixed(2)} {form.currency}</b>
        </div>

        <div style={{ display:"flex", justifyContent:"flex-end", gap:10 }}>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={save}>{isEdit ? "Save changes" : "Add expense"}</button>
        </div>
      </div>
    </div>
  );
}
