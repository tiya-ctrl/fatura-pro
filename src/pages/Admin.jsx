import { useEffect, useState } from "react";
import { approveAmbassador, declineAmbassador, fetchAmbassadorAdmin, resendAmbassadorAcceptance, updateAmbassador } from "../lib/ambassadors";
import { publicAmbassadorPolicy } from "../lib/ambassadorPolicy";

const CSS = `
  .adm{min-height:100vh;background:#08080e;color:#e8e4dc;font-family:'DM Sans',sans-serif}.admwrap{width:min(100% - 32px,1160px);margin:auto}.admnav{height:72px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(255,255,255,.07)}.admnav a{color:#aaa49b;text-decoration:none;font-size:12px}.admnav strong{font:700 20px 'Playfair Display',serif}.admmain{padding:44px 0 90px}.admkicker{color:#c9a84c;text-transform:uppercase;font-size:10px;font-weight:800;letter-spacing:1.6px}.admtitle{font:700 43px 'Playfair Display',serif;margin:10px 0}.admsub{max-width:720px;color:#8f8a84;font-size:13px;line-height:1.7}.admsection{margin-top:30px}.admsection h2{font:700 25px 'Playfair Display',serif;margin-bottom:14px}.admlist{display:grid;gap:12px}.admcard{padding:20px;border:1px solid rgba(255,255,255,.08);border-radius:14px;background:#111118}.admcardtop{display:flex;justify-content:space-between;gap:20px}.admcard h3{margin:0 0 4px;font-size:15px}.admmuted{color:#827d76;font-size:11px;line-height:1.6}.admbadge{height:max-content;padding:6px 9px;border:1px solid rgba(201,168,76,.25);border-radius:99px;color:#d9bb68;background:rgba(201,168,76,.06);font-size:9px;font-weight:800;text-transform:uppercase}.admprofile{color:#c9a84c}.admwhy{margin:13px 0;color:#aaa49b;font-size:12px;line-height:1.65}.admpolicy{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;margin-top:15px;overflow:hidden;border:1px solid rgba(201,168,76,.18);border-radius:10px;background:rgba(201,168,76,.18)}.admpolicy div{padding:12px;background:#0b0b11}.admpolicy strong{display:block;color:#e8c97a;font-size:14px}.admpolicy span{color:#77726c;font-size:9px;text-transform:uppercase;letter-spacing:.5px}.admterms{display:grid;grid-template-columns:repeat(3,1fr);gap:9px;margin-top:12px;padding:14px;border:1px solid rgba(201,168,76,.18);border-radius:10px;background:#0b0b11}.admfield label{display:block;margin-bottom:6px;color:#8f8a84;font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:.5px}.admfield select{width:100%;padding:10px;border:1px solid rgba(255,255,255,.12);border-radius:8px;background:#111118;color:#e8e4dc}.admactions{display:flex;gap:9px;align-items:center;margin-top:13px;flex-wrap:wrap}.admbtn{padding:10px 13px;border:0;border-radius:8px;background:#c9a84c;color:#08080e;font-weight:800;font-size:11px;cursor:pointer}.admbtn.secondary{background:transparent;border:1px solid rgba(255,255,255,.13);color:#d6d0c7}.admbtn.danger{background:rgba(220,80,80,.1);border:1px solid rgba(220,80,80,.25);color:#ef9999}.admbtn:disabled{opacity:.5}.admerror,.admnotice{padding:12px;border-radius:9px;font-size:12px;margin:16px 0}.admerror{border:1px solid rgba(220,80,80,.28);background:rgba(220,80,80,.07);color:#ef9999}.admnotice{border:1px solid rgba(76,175,137,.26);background:rgba(76,175,137,.07);color:#8fd3b3}.admstats{display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-top:15px}.admstat{padding:11px;border-radius:9px;background:#0b0b11}.admstat span{display:block;color:#6f6a64;font-size:9px;text-transform:uppercase}.admstat b{display:block;margin-top:5px;font:700 18px 'Playfair Display',serif}.admempty{padding:25px;border:1px dashed rgba(255,255,255,.1);border-radius:12px;color:#77726c;text-align:center;font-size:12px}.admarchive{opacity:.75}@media(max-width:700px){.admpolicy,.admterms,.admstats{grid-template-columns:1fr 1fr}.admcardtop{flex-direction:column}}`;

const DEFAULT_POLICY = publicAmbassadorPolicy();

function money(cents) { return new Intl.NumberFormat("en-IE", { style:"currency", currency:"EUR" }).format(Number(cents || 0) / 100); }

function Policy({ policy = DEFAULT_POLICY }) {
  return <div className="admpolicy"><div><strong>{policy.plans?.pro?.commissionPercent ?? 25}%</strong><span>Pro subscription</span></div><div><strong>{policy.plans?.business?.commissionPercent ?? 35}%</strong><span>Business subscription</span></div><div><strong>{policy.commissionMonths ?? 12} months</strong><span>Per paying customer</span></div></div>;
}

function ApplicationCard({ application, policy, onChanged, onNotice }) {
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [customTerms, setCustomTerms] = useState(false);
  const [terms, setTerms] = useState(() => ({
    proCommissionPercent:policy?.plans?.pro?.commissionPercent ?? 25,
    businessCommissionPercent:policy?.plans?.business?.commissionPercent ?? 35,
    commissionMonths:policy?.commissionMonths ?? 12,
  }));
  const approve = async () => {
    setBusy("approve"); setError("");
    try {
      const result = await approveAmbassador(application.id, terms);
      onNotice(result.notification?.sent ? `${application.name} was approved and the acceptance email was sent.` : `${application.name} was approved, but the acceptance email could not be confirmed.`);
      await onChanged();
    } catch (err) { setError(err.message); }
    setBusy("");
  };
  const decline = async () => {
    if (!window.confirm(`Decline ${application.name}'s ambassador application?`)) return;
    setBusy("decline"); setError("");
    try {
      const result = await declineAmbassador(application.id);
      onNotice(result.notification?.sent ? `${application.name} was declined and the update email was sent.` : `${application.name} was declined, but the email could not be confirmed.`);
      await onChanged();
    } catch (err) { setError(err.message); }
    setBusy("");
  };
  const resend = async () => {
    setBusy("resend"); setError("");
    try {
      await resendAmbassadorAcceptance(application.id);
      onNotice(`The acceptance email with both ambassador links was sent to ${application.email}.`);
    } catch (err) { setError(err.message); }
    setBusy("");
  };
  const pending = application.status === "pending" || application.status === "shortlisted";
  const selectedPolicy = { commissionMonths:terms.commissionMonths, plans:{ pro:{ commissionPercent:terms.proCommissionPercent }, business:{ commissionPercent:terms.businessCommissionPercent } } };
  return <article className={`admcard${pending ? "" : " admarchive"}`}><div className="admcardtop"><div><h3>{application.name}</h3><div className="admmuted">{application.email} · {application.primary_channel} · {application.audience_size} · {application.country}</div></div><span className="admbadge">{application.status}</span></div><p className="admwhy">{application.motivation}</p><a className="admprofile admmuted" href={application.profile_url} target="_blank" rel="noreferrer">Open public profile →</a>{pending && <><Policy policy={customTerms ? selectedPolicy : policy} />{customTerms && <div className="admterms"><div className="admfield"><label>Pro commission</label><select value={terms.proCommissionPercent} onChange={event => setTerms(current => ({ ...current, proCommissionPercent:Number(event.target.value) }))}>{[15,20,25,30,35,40,45,50].map(value => <option key={value} value={value}>{value}%</option>)}</select></div><div className="admfield"><label>Business commission</label><select value={terms.businessCommissionPercent} onChange={event => setTerms(current => ({ ...current, businessCommissionPercent:Number(event.target.value) }))}>{[20,25,30,35,40,45,50].map(value => <option key={value} value={value}>{value}%</option>)}</select></div><div className="admfield"><label>Earns per customer</label><select value={terms.commissionMonths} onChange={event => setTerms(current => ({ ...current, commissionMonths:Number(event.target.value) }))}>{[3,6,12,18,24,36].map(value => <option key={value} value={value}>{value} months</option>)}</select></div></div>}<div className="admactions"><button className="admbtn" disabled={!!busy} onClick={approve}>{busy === "approve" ? "Approving…" : customTerms ? "Approve with custom terms" : "Approve with standard terms"}</button><button className="admbtn secondary" disabled={!!busy} onClick={() => setCustomTerms(value => !value)}>{customTerms ? "Use standard terms" : "Custom terms"}</button><button className="admbtn danger" disabled={!!busy} onClick={decline}>{busy === "decline" ? "Declining…" : "Decline"}</button><span className="admmuted">Standard terms are automatic. Open Custom terms only for a negotiated offer.</span></div></>}{application.status === "approved" && <div className="admactions"><button className="admbtn secondary" disabled={!!busy} onClick={resend}>{busy === "resend" ? "Sending…" : "Resend acceptance email"}</button><span className="admmuted">Includes the personal referral link, private dashboard and the ambassador’s actual terms.</span></div>}{error && <div className="admerror">{error}</div>}</article>;
}

export default function Admin() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busyId, setBusyId] = useState("");
  const load = async () => { try { setData(await fetchAmbassadorAdmin()); setError(""); } catch (err) { setError(err.message); } };
  useEffect(() => { load(); }, []);
  const status = async (account, next) => {
    setBusyId(account.id); setError("");
    try { await updateAmbassador(account.id, { status:next }); await load(); }
    catch (err) { setError(err.message); }
    setBusyId("");
  };
  const policy = data?.policy || DEFAULT_POLICY;
  const pending = (data?.applications || []).filter(item => item.status === "pending" || item.status === "shortlisted");
  const reviewed = (data?.applications || []).filter(item => item.status !== "pending" && item.status !== "shortlisted");

  return <div className="adm"><style>{CSS}</style><header className="admwrap admnav"><strong>Fatūra Pro · Partner control</strong><a href="/app">Open app →</a></header><main className="admwrap admmain"><div className="admkicker">Private administration</div><h1 className="admtitle">Ambassadors</h1><p className="admsub">New applications arrive here. Standard approval uses the defaults below automatically; open Custom terms on an application only when you want a different private offer.</p><Policy policy={policy} />{error && <div className="admerror">{error}</div>}{notice && <div className="admnotice">{notice}</div>}
    <section className="admsection"><h2>Waiting for review ({pending.length})</h2><div className="admlist">{data ? (pending.length ? pending.map(item => <ApplicationCard key={item.id} application={item} policy={policy} onChanged={load} onNotice={setNotice} />) : <div className="admempty">No applications waiting for review.</div>) : <div className="admempty">Loading applications…</div>}</div></section>
    <section className="admsection"><h2>Active partnerships</h2><div className="admlist">{data?.accounts?.length ? data.accounts.map(account => <article className="admcard" key={account.id}><div className="admcardtop"><div><h3>{account.code}</h3><div className="admmuted">Pro {Number(account.commission_bps || 2500) / 100}% · Business {Number(account.business_commission_bps || 3500) / 100}% · {account.commission_months || 12} months/customer</div></div><span className="admbadge">{account.status}</span></div><div className="admstats"><div className="admstat"><span>Clicks</span><b>{account.clicks}</b></div><div className="admstat"><span>Sign-ups</span><b>{account.signups}</b></div><div className="admstat"><span>Paid customers</span><b>{account.customers}</b></div><div className="admstat"><span>Pending</span><b>{money((account.ledger.pending || 0) + (account.ledger.available || 0) + (account.ledger.processing || 0))}</b></div><div className="admstat"><span>Paid</span><b>{money(account.paid_out_cents)}</b></div></div><div className="admactions">{account.status === "active" ? <button className="admbtn secondary" disabled={busyId === account.id} onClick={() => status(account,"paused")}>Pause</button> : account.status === "paused" ? <button className="admbtn" disabled={busyId === account.id} onClick={() => status(account,"active")}>Resume</button> : null}{account.status !== "ended" && <button className="admbtn danger" disabled={busyId === account.id} onClick={() => status(account,"ended")}>End now</button>}<span className="admmuted">Payout: {account.payouts_enabled ? "connected · automatic" : "waiting for Stripe connection"}</span></div></article>) : <div className="admempty">{data ? "No approved ambassadors yet." : "Loading partnerships…"}</div>}</div></section>
    {reviewed.length > 0 && <section className="admsection"><h2>Reviewed applications</h2><div className="admlist">{reviewed.map(item => <ApplicationCard key={item.id} application={item} policy={policy} onChanged={load} onNotice={setNotice} />)}</div></section>}
  </main></div>;
}
