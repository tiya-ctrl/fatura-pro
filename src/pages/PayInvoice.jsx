// Fatura Pro - Public payment page (/pay/:invoiceId)
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

export default function PayInvoice() {
  const { invoiceId } = useParams();
  const [inv, setInv] = useState(null);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);
  const paid = new URLSearchParams(window.location.search).get("paid") === "1";

  useEffect(() => {
    fetch("/api/invoice-summary?id=" + encodeURIComponent(invoiceId))
      .then((r) => r.json())
      .then((d) => (d.error ? setErr(d.error) : setInv(d)))
      .catch(() => setErr("Could not load invoice"));
  }, [invoiceId]);

  const pay = async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId }),
      });
      const d = await r.json();
      if (d.url) window.location.href = d.url;
      else { setErr(d.error || "Payment could not be started"); setLoading(false); }
    } catch { setErr("Payment could not be started"); setLoading(false); }
  };

  const box = { maxWidth: 440, margin: "60px auto", padding: 28, background: "#fff", borderRadius: 14, boxShadow: "0 8px 40px rgba(0,0,0,0.08)", fontFamily: "system-ui, sans-serif" };

  if (err) return <div style={box}><h2>⚠️ {err}</h2><p style={{ color:"#777" }}>Please contact the sender of this invoice.</p></div>;
  if (!inv) return <div style={box}>Loading…</div>;

  const isPaid = paid || inv.status === "paid";

  return (
    <div style={{ minHeight: "100vh", background: "#f4f2ee" }}>
      <div style={box}>
        <div style={{ fontSize: 13, color: "#999", marginBottom: 4 }}>Invoice {inv.id}</div>
        <h2 style={{ margin: "0 0 4px" }}>{inv.seller_name || "Invoice payment"}</h2>
        <div style={{ color: "#777", fontSize: 14, marginBottom: 18 }}>To: {inv.client}{inv.due ? " · Due " + inv.due : ""}</div>
        <div style={{ fontSize: 34, fontWeight: 800, marginBottom: 20 }}>{Number(inv.total).toFixed(2)} {inv.currency || "EUR"}</div>

        {isPaid ? (
          <div style={{ padding: "14px 18px", background: "rgba(45,140,101,0.1)", border: "1px solid rgba(45,140,101,0.35)", borderRadius: 10, color: "#2d8c65", fontWeight: 700 }}>
            ✓ This invoice has been paid. Thank you!
          </div>
        ) : !inv.payments_enabled ? (
          <div style={{ padding: "14px 18px", background: "#f7f5f1", borderRadius: 10, color: "#777", fontSize: 14 }}>
            Online payment is not enabled for this invoice. Please pay via the details on the invoice.
          </div>
        ) : (
          <button onClick={pay} disabled={loading} style={{ width: "100%", padding: "14px 0", fontSize: 16, fontWeight: 700, background: "#1a1a2e", color: "#fff", border: "none", borderRadius: 10, cursor: "pointer" }}>
            {loading ? "Redirecting…" : "Pay securely 💳"}
          </button>
        )}
        <div style={{ marginTop: 16, fontSize: 11, color: "#aaa", textAlign: "center" }}>Payments powered by Stripe · Fatūra Pro</div>
      </div>
    </div>
  );
}
