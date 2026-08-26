import { useEffect, useMemo, useState } from "react";
import { connectAmbassadorPayout, fetchAmbassadorSummary } from "../lib/ambassadors";

const CSS = `
  .apage{min-height:100vh;background:#08080e;color:#e8e4dc;font-family:'DM Sans',sans-serif}.awrap{width:min(100% - 32px,1100px);margin:auto}.anav{height:74px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(255,255,255,.07)}.abrand{display:flex;align-items:center;gap:10px;color:#e8e4dc;text-decoration:none;font-family:'Playfair Display',serif;font-size:20px;font-weight:700}.abrand img{width:29px;height:29px}.anav a:last-child{color:#9a9690;text-decoration:none;font-size:12px}.amain{padding:48px 0 90px}.akicker{color:#c9a84c;font-size:10px;font-weight:800;letter-spacing:1.8px;text-transform:uppercase}.atitle{font:700 clamp(34px,5vw,54px)/1.08 'Playfair Display',serif;margin:12px 0 9px}.asub{color:#97928b;font-size:14px;line-height:1.7}.atop{display:flex;justify-content:space-between;gap:30px;align-items:flex-end;margin-bottom:32px}.astatus{padding:8px 12px;border:1px solid rgba(90,196,147,.28);border-radius:99px;background:rgba(90,196,147,.08);color:#72c7a4;font-size:11px;font-weight:800;text-transform:capitalize}.agrid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}.acard{border:1px solid rgba(255,255,255,.08);border-radius:15px;background:#111118;padding:20px}.alabel{color:#77726c;font-size:10px;font-weight:800;letter-spacing:.8px;text-transform:uppercase}.avalue{font:700 31px/1.2 'Playfair Display',serif;color:#e8e4dc;margin-top:8px}.acard.gold .avalue{color:#e1bf65}.asection{margin-top:24px;border:1px solid rgba(255,255,255,.08);border-radius:17px;background:#111118;padding:24px}.asection h2{font:700 23px 'Playfair Display',serif;margin:0 0 7px}.asection p{color:#8f8a84;font-size:12px;line-height:1.7}.alinkrow{display:flex;gap:10px;margin-top:18px}.alink{min-width:0;flex:1;padding:12px 14px;border:1px solid rgba(201,168,76,.24);border-radius:9px;background:#0b0b11;color:#bdb7ad;font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.abtn{border:0;border-radius:9px;background:#c9a84c;color:#09090d;padding:12px 17px;font:800 12px 'DM Sans',sans-serif;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center;justify-content:center}.abtn.secondary{border:1px solid rgba(255,255,255,.12);background:transparent;color:#d9d4cc}.abtn:disabled{opacity:.5;cursor:not-allowed}.aterms{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;margin-top:19px;border:1px solid rgba(255,255,255,.08);border-radius:12px;overflow:hidden;background:rgba(255,255,255,.08)}.aterms>div{background:#0d0d14;padding:16px}.aterms strong{display:block;color:#e8e4dc;font-size:15px;margin-bottom:4px}.aterms span{color:#77726c;font-size:10px}.anotice{margin-top:16px;padding:13px 15px;border-left:2px solid #c9a84c;background:rgba(201,168,76,.06);color:#aaa49b;font-size:11px;line-height:1.6}.aempty{max-width:620px;margin:70px auto;padding:40px;border:1px solid rgba(255,255,255,.08);border-radius:18px;background:#111118;text-align:center}.aempty h1{font:700 35px 'Playfair Display',serif}.aempty p{color:#918c85;line-height:1.7}.aerror{margin:20px 0;padding:12px;border:1px solid rgba(225,86,86,.28);border-radius:9px;color:#ef9999;background:rgba(225,86,86,.07);font-size:12px}.apayouts{width:100%;border-collapse:collapse;margin-top:14px}.apayouts th,.apayouts td{padding:11px 8px;border-bottom:1px solid rgba(255,255,255,.07);text-align:left;font-size:11px}.apayouts th{color:#77726c;text-transform:uppercase;letter-spacing:.6px}.apayouts td{color:#bcb6ad}.apayouts td:last-child{text-transform:capitalize}.aload{min-height:65vh;display:flex;align-items:center;justify-content:center;color:#8f8a84}@media(max-width:760px){.agrid{grid-template-columns:1fr 1fr}.atop{align-items:flex-start;flex-direction:column}.aterms{grid-template-columns:1fr}.alinkrow{flex-direction:column}}@media(max-width:440px){.agrid{grid-template-columns:1fr}.amain{padding-top:34px}}
`;

function euros(cents) {
  return new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR" }).format(Number(cents || 0) / 100);
}

function date(value) {
  if (!value) return "No fixed end";
  return new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function AmbassadorDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const load = async () => {
    try { setData(await fetchAmbassadorSummary()); }
    catch (err) { setError(err.message); }
  };

  useEffect(() => {
    const verify = new URLSearchParams(window.location.search).get("stripe") === "connected";
    (async () => {
      if (verify) {
        try { await connectAmbassadorPayout("verify"); window.history.replaceState({}, "", "/ambassador"); }
        catch (err) { setError(err.message); }
      }
      await load();
    })();
  }, []);

  const link = useMemo(() => data?.account?.code
    ? `https://faturapro.app/?ref=${data.account.code}&utm_source=ambassador&utm_medium=partner&utm_campaign=founding_ambassadors`
    : "", [data]);

  const stripeAction = async (action) => {
    setBusy(true); setError("");
    try {
      const result = await connectAmbassadorPayout(action);
      if (result.url) window.location.href = result.url;
      else await load();
    } catch (err) { setError(err.message); setBusy(false); }
  };

  if (!data && !error) return <div className="apage"><style>{CSS}</style><div className="aload">Loading your ambassador dashboard…</div></div>;
  if (data && !data.approved) return (
    <div className="apage"><style>{CSS}</style><header className="awrap anav"><a className="abrand" href="/"><img src="/fatura-mark.svg" alt="" />Fatūra Pro</a><a href="/app">Open app →</a></header><main className="awrap"><div className="aempty"><div className="akicker">Ambassador Circle</div><h1>{data.application ? "Your application is being reviewed." : "Apply to become an ambassador."}</h1><p>{data.application ? `Current status: ${data.application.status}. Your decision and agreed terms will appear securely in this dashboard.` : "This dashboard becomes available after your application is approved."}</p><a className="abtn" href="/ambassadors">View the ambassador program →</a></div></main></div>
  );

  const earnings = data?.earnings || {};
  return (
    <div className="apage"><style>{CSS}</style>
      <header className="awrap anav"><a className="abrand" href="/"><img src="/fatura-mark.svg" alt="" />Fatūra Pro</a><a href="/app">Open app →</a></header>
      <main className="awrap amain">
        <div className="atop"><div><div className="akicker">Ambassador dashboard</div><h1 className="atitle">Your reach. Clearly measured.</h1><p className="asub">Only real paid subscriptions earn commission. Customer identities stay private.</p></div><div className="astatus">● {data.account.status}</div></div>
        {error && <div className="aerror">{error}</div>}
        <div className="agrid">
          <div className="acard"><div className="alabel">Link clicks</div><div className="avalue">{data.counts.clicks}</div></div>
          <div className="acard"><div className="alabel">Sign-ups</div><div className="avalue">{data.counts.signups}</div></div>
          <div className="acard"><div className="alabel">Paying customers</div><div className="avalue">{data.counts.paying}</div></div>
          <div className="acard gold"><div className="alabel">Paid to you</div><div className="avalue">{euros(data.paidOutCents)}</div></div>
        </div>

        <section className="asection"><h2>Your tracked link</h2><p>Share this exact link. Visits, accounts and paid customers will be attributed automatically for 30 days.</p><div className="alinkrow"><div className="alink">{link}</div><button className="abtn" onClick={async () => { await navigator.clipboard.writeText(link); setCopied(true); setTimeout(() => setCopied(false), 1800); }}>{copied ? "Copied ✓" : "Copy link"}</button></div></section>

        <section className="asection"><h2>Commission & automatic stop</h2><p>Your agreed terms are saved in the system and checked again whenever a subscription payment arrives.</p><div className="aterms"><div><strong>{data.account.commissionPercent}%</strong><span>Commission on eligible subscription revenue, excluding tax and refunds</span></div><div><strong>{data.account.commissionMonths} months</strong><span>Maximum earnings period for each paying customer</span></div><div><strong>{date(data.account.agreementEndsAt)}</strong><span>Partnership end date</span></div></div><div className="anotice">A payment received at or after the customer’s commission end—or the partnership end—creates no commission. The stop is automatic and does not depend on a manual review.</div></section>

        <section className="asection"><h2>Payouts</h2><p>Pending: <b>{euros(earnings.pending)}</b> · Ready: <b>{euros(earnings.available)}</b> · Processing: <b>{euros(earnings.processing)}</b>. Automatic transfer starts at {euros(data.account.payoutThresholdCents)} after the holding period.</p>{data.account.recoveryCents > 0 && <div className="anotice">A {euros(data.account.recoveryCents)} refund or dispute adjustment will be offset against future available commission before the next transfer.</div>}<div className="alinkrow">{data.account.payoutConnected ? <><button className="abtn secondary" disabled={busy} onClick={() => stripeAction("dashboard")}>Open Stripe payout details →</button><span className="astatus">● Bank payout connected</span></> : <button className="abtn" disabled={busy} onClick={() => stripeAction("connect")}>{busy ? "Opening Stripe…" : "Connect bank payout →"}</button>}</div>
          {data.payouts?.length > 0 && <table className="apayouts"><thead><tr><th>Date</th><th>Amount</th><th>Status</th></tr></thead><tbody>{data.payouts.map(row => <tr key={row.id}><td>{date(row.paid_at || row.created_at)}</td><td>{euros(row.amount_cents)}</td><td>{row.status}</td></tr>)}</tbody></table>}
        </section>
      </main>
    </div>
  );
}

