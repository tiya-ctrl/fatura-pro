// Fatura Pro - Advanced Analytics page (Business plan)
import { monthlyRevenue, topClients, avgPaymentDays, collectionStats, revenueByCurrency } from "../lib/analytics";

export default function Analytics({ invoices, f }) {
  const months = monthlyRevenue(invoices);
  const clients = topClients(invoices);
  const avgDays = avgPaymentDays(invoices);
  const stats = collectionStats(invoices);
  const byCurrency = revenueByCurrency(invoices);
  const fmt = (n) => (f ? f(n) : Number(n).toFixed(2));
  const maxMonth = Math.max(...months.map((m) => m.total), 1);
  const totalCollectable = stats.paid.total + stats.pending.total + stats.overdue.total;

  return (
    <div>
      {/* KPI cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(160px, 1fr))", gap:12, marginBottom:20 }}>
        <div className="stat-card"><div className="stat-label">Avg. payment terms</div><div className="stat-value" style={{ fontSize:22 }}>{avgDays === null ? "—" : avgDays + " days"}</div><div className="stat-change">invoice to due date</div></div>
        <div className="stat-card"><div className="stat-label">Collection rate</div><div className="stat-value" style={{ fontSize:22 }}>{totalCollectable ? Math.round((stats.paid.total / totalCollectable) * 100) + "%" : "—"}</div><div className="stat-change">{stats.paid.count} paid invoices</div></div>
        <div className="stat-card"><div className="stat-label">Outstanding</div><div className="stat-value" style={{ fontSize:22 }}>{fmt(stats.pending.total)}</div><div className="stat-change">{stats.pending.count} pending</div></div>
        <div className="stat-card" style={{ border: stats.overdue.count ? "1px solid rgba(224,85,85,0.4)" : undefined }}><div className="stat-label">Overdue</div><div className="stat-value" style={{ fontSize:22, color: stats.overdue.count ? "var(--red)" : undefined }}>{fmt(stats.overdue.total)}</div><div className="stat-change">{stats.overdue.count} invoices</div></div>
      </div>

      {/* Monthly revenue chart */}
      <div className="card" style={{ marginBottom:20 }}>
        <div className="card-title" style={{ marginBottom:16 }}>Revenue — last 12 months (paid)</div>
        <div style={{ display:"flex", alignItems:"flex-end", gap:6, height:160 }}>
          {months.map((m) => (
            <div key={m.key} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:4 }} title={m.label + ": " + fmt(m.total)}>
              <div style={{ width:"100%", maxWidth:34, height: Math.max(3, (m.total / maxMonth) * 130), background: m.total ? "var(--gold)" : "var(--border)", borderRadius:"4px 4px 0 0", transition:"height .3s" }} />
              <div style={{ fontSize:10, color:"#999" }}>{m.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(280px, 1fr))", gap:20 }}>
        {/* Top clients */}
        <div className="card">
          <div className="card-title" style={{ marginBottom:12 }}>Top clients (paid revenue)</div>
          {clients.length === 0 && <div style={{ color:"#999", fontSize:13 }}>No paid invoices yet.</div>}
          {clients.map((c, i) => (
            <div key={c.client} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid var(--border)" }}>
              <span>{i + 1}. {c.client}</span><b>{fmt(c.total)}</b>
            </div>
          ))}
        </div>

        {/* Revenue by currency */}
        <div className="card">
          <div className="card-title" style={{ marginBottom:12 }}>Revenue by currency</div>
          {byCurrency.length === 0 && <div style={{ color:"#999", fontSize:13 }}>No paid invoices yet.</div>}
          {byCurrency.map((c) => (
            <div key={c.currency} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid var(--border)" }}>
              <span>{c.currency}</span><b>{c.total.toFixed(2)}</b>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
