// Fatura Pro - Public payment page (/pay/:invoiceId)
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { documentDirection, normalizeDocumentLanguage } from "../lib/documentLanguage";

const COPY = {
  en: { invoice:"Invoice", payment:"Invoice payment", to:"To", due:"Due", paid:"This invoice has been paid. Thank you!", disabled:"Online payment is not enabled for this invoice. Please pay via the details on the invoice.", redirecting:"Redirecting…", pay:"Pay securely 💳", powered:"Payments powered by Stripe · Fatūra Pro", contact:"Please contact the sender of this invoice.", loading:"Loading…", loadError:"Could not load invoice", startError:"Payment could not be started" },
  nl: { invoice:"Factuur", payment:"Factuur betalen", to:"Aan", due:"Vervaldatum", paid:"Deze factuur is betaald. Bedankt!", disabled:"Online betalen is niet ingeschakeld voor deze factuur. Betaal via de gegevens op de factuur.", redirecting:"Doorsturen…", pay:"Veilig betalen 💳", powered:"Betalingen via Stripe · Fatūra Pro", contact:"Neem contact op met de afzender van deze factuur.", loading:"Laden…", loadError:"Factuur kon niet worden geladen", startError:"Betaling kon niet worden gestart" },
  fr: { invoice:"Facture", payment:"Paiement de la facture", to:"À", due:"Échéance", paid:"Cette facture a été payée. Merci !", disabled:"Le paiement en ligne n’est pas activé pour cette facture. Utilisez les coordonnées indiquées sur la facture.", redirecting:"Redirection…", pay:"Payer en toute sécurité 💳", powered:"Paiements sécurisés par Stripe · Fatūra Pro", contact:"Veuillez contacter l’émetteur de cette facture.", loading:"Chargement…", loadError:"Impossible de charger la facture", startError:"Impossible de démarrer le paiement" },
  ar: { invoice:"فاتورة", payment:"دفع الفاتورة", to:"إلى", due:"تاريخ الاستحقاق", paid:"تم دفع هذه الفاتورة. شكرًا لك!", disabled:"الدفع عبر الإنترنت غير مفعّل لهذه الفاتورة. يرجى الدفع باستخدام البيانات الموضحة في الفاتورة.", redirecting:"جارٍ التحويل…", pay:"ادفع بأمان 💳", powered:"المدفوعات عبر Stripe · Fatūra Pro", contact:"يرجى التواصل مع مُرسل هذه الفاتورة.", loading:"جارٍ التحميل…", loadError:"تعذّر تحميل الفاتورة", startError:"تعذّر بدء عملية الدفع" },
};

export default function PayInvoice() {
  const { invoiceId } = useParams();
  const [inv, setInv] = useState(null);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);
  const paid = new URLSearchParams(window.location.search).get("paid") === "1";
  const language = normalizeDocumentLanguage(inv?.document_language);
  const copy = COPY[language];
  const dir = documentDirection(language);

  useEffect(() => {
    fetch("/api/pay?id=" + encodeURIComponent(invoiceId))
      .then((r) => r.json())
      .then((d) => (d.error ? setErr(d.error) : setInv(d)))
      .catch(() => setErr("load"));
  }, [invoiceId]);

  const pay = async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId }),
      });
      const d = await r.json();
      if (d.url) window.location.href = d.url;
      else { setErr("start"); setLoading(false); }
    } catch { setErr("start"); setLoading(false); }
  };

  const box = { maxWidth: 440, margin: "60px auto", padding: 28, background: "#fff", borderRadius: 14, boxShadow: "0 8px 40px rgba(0,0,0,0.08)", fontFamily: "system-ui, sans-serif" };

  if (err) return <div lang={language} dir={dir} style={box}><h2>⚠️ {err === "start" ? copy.startError : copy.loadError}</h2><p style={{ color:"#777" }}>{copy.contact}</p></div>;
  if (!inv) return <div style={box}>{COPY.en.loading}</div>;

  const isPaid = paid || inv.status === "paid";

  return (
    <div lang={language} dir={dir} style={{ minHeight: "100vh", background: "#f4f2ee" }}>
      <div style={box}>
        <div style={{ fontSize: 13, color: "#999", marginBottom: 4 }}>{copy.invoice} <bdi dir="ltr">{inv.id}</bdi></div>
        <h2 style={{ margin: "0 0 4px" }}>{inv.seller_name || copy.payment}</h2>
        <div style={{ color: "#777", fontSize: 14, marginBottom: 18 }}>{copy.to}: {inv.client}{inv.due ? ` · ${copy.due} ` : ""}<bdi dir="ltr">{inv.due || ""}</bdi></div>
        <div dir="ltr" style={{ fontSize: 34, fontWeight: 800, marginBottom: 20, textAlign:dir === "rtl" ? "right" : "left" }}>{Number(inv.total).toFixed(2)} {inv.currency || "EUR"}</div>

        {isPaid ? (
          <div style={{ padding: "14px 18px", background: "rgba(45,140,101,0.1)", border: "1px solid rgba(45,140,101,0.35)", borderRadius: 10, color: "#2d8c65", fontWeight: 700 }}>
            ✓ {copy.paid}
          </div>
        ) : !inv.payments_enabled ? (
          <div style={{ padding: "14px 18px", background: "#f7f5f1", borderRadius: 10, color: "#777", fontSize: 14 }}>
            {copy.disabled}
          </div>
        ) : (
          <button onClick={pay} disabled={loading} style={{ width: "100%", padding: "14px 0", fontSize: 16, fontWeight: 700, background: "#1a1a2e", color: "#fff", border: "none", borderRadius: 10, cursor: "pointer" }}>
            {loading ? copy.redirecting : copy.pay}
          </button>
        )}
        <div style={{ marginTop: 16, fontSize: 11, color: "#aaa", textAlign: "center" }}>{copy.powered}</div>
      </div>
    </div>
  );
}
