// Fatura Pro - Recurring invoices manager (Business plan)
import { loadRecurring, toggleRecurring, deleteRecurring } from "../lib/recurring";

export default function RecurringList({ recurring, setRecurring, userId, f }) {
  const refresh = async () => setRecurring(await loadRecurring(userId));

  const handleToggle = async (r) => { await toggleRecurring(r.id, !r.active, userId); refresh(); };
  const handleDelete = async (r) => {
    if (!window.confirm("Delete recurring invoice for \"" + (r.template?.client || "client") + "\"?")) return;
    await deleteRecurring(r.id, userId);
    refresh();
  };

  return (
    <div className="card" style={{ marginTop: 20 }}>
      <div className="card-title" style={{ marginBottom: 12 }}>Recurring invoices</div>
      {recurring.length === 0 && (
        <div style={{ color:"#999", fontSize:13 }}>
          No recurring invoices. Open any invoice in the Invoices page and click 🔄 to repeat it automatically.
        </div>
      )}
      {recurring.map((r) => (
        <div key={r.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderBottom:"1px solid var(--border)", flexWrap:"wrap", gap:8 }}>
          <div>
            <div style={{ fontWeight:700 }}>{r.template?.client || "—"} · {f ? f(r.template?.total || 0) : r.template?.total}</div>
            <div style={{ fontSize:12, color:"#999" }}>{r.frequency} · next: {r.next_run}{r.last_generated_at ? " · last: " + r.last_generated_at.slice(0, 10) : ""}</div>
          </div>
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            <span style={{ fontSize:11, fontWeight:800, color: r.active ? "#2d8c65" : "#999" }}>{r.active ? "ACTIVE" : "PAUSED"}</span>
            <button className="btn btn-ghost btn-sm" onClick={() => handleToggle(r)}>{r.active ? "Pause" : "Resume"}</button>
            <button className="btn btn-ghost btn-sm" style={{ color:"#e05555" }} onClick={() => handleDelete(r)}>✕</button>
          </div>
        </div>
      ))}
    </div>
  );
}
