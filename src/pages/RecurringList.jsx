// Fatura Pro - Recurring invoices manager (Business plan)
import { loadRecurring, toggleRecurring, deleteRecurring } from "../lib/recurring";
import { getLocale } from "../lib/locale";

export default function RecurringList({ recurring, setRecurring, userId, f }) {
  const ar = getLocale() === "ar";
  const ui = (english, arabic) => ar ? arabic : english;
  const refresh = async () => setRecurring(await loadRecurring(userId));

  const handleToggle = async (r) => { await toggleRecurring(r.id, !r.active, userId); refresh(); };
  const handleDelete = async (r) => {
    if (!window.confirm(ui("Delete recurring invoice for \"" + (r.template?.client || "client") + "\"?", "حذف الفاتورة الدورية للعميل «" + (r.template?.client || "العميل") + "»؟"))) return;
    await deleteRecurring(r.id, userId);
    refresh();
  };

  return (
    <div className="card" style={{ marginTop: 20 }}>
      <div className="card-title" style={{ marginBottom: 12 }}>{ui("Recurring invoices", "الفواتير الدورية")}</div>
      {recurring.length === 0 && (
        <div style={{ color:"#999", fontSize:13 }}>
          {ui("No recurring invoices. Open an invoice and click 🔄 to schedule new pending invoices for review and sending.", "لا توجد فواتير دورية. افتح فاتورة واضغط 🔄 لجدولة فواتير جديدة تراجعها قبل الإرسال.")}
        </div>
      )}
      {recurring.map((r) => (
        <div key={r.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderBottom:"1px solid var(--border)", flexWrap:"wrap", gap:8 }}>
          <div>
            <div style={{ fontWeight:700 }}>{r.template?.client || "—"} · {f ? f(r.template?.total || 0) : r.template?.total}</div>
            <div style={{ fontSize:12, color:"#999" }}>{r.frequency} · {ui("next", "التالي")}: {r.next_run}{r.last_generated_at ? " · " + ui("last", "السابق") + ": " + r.last_generated_at.slice(0, 10) : ""}</div>
          </div>
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            <span style={{ fontSize:11, fontWeight:800, color: r.active ? "#2d8c65" : "#999" }}>{r.active ? ui("ACTIVE", "نشطة") : ui("PAUSED", "متوقفة")}</span>
            <button className="btn btn-ghost btn-sm" onClick={() => handleToggle(r)}>{r.active ? ui("Pause", "إيقاف مؤقت") : ui("Resume", "استئناف")}</button>
            <button className="btn btn-ghost btn-sm" style={{ color:"#e05555" }} onClick={() => handleDelete(r)}>✕</button>
          </div>
        </div>
      ))}
    </div>
  );
}
