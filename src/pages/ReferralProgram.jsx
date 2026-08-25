import { useEffect, useMemo, useState } from "react";
import { fetchReferralSummary, redeemReferralRewards } from "../lib/referrals";
import { trackEvent } from "../lib/tracking";

const CSS = `
  .fref-card { position:relative; overflow:hidden; margin-bottom:20px; padding:28px; border-radius:16px; border:1px solid rgba(201,168,76,.28); background:linear-gradient(135deg,rgba(201,168,76,.14),rgba(17,17,24,.98) 48%,rgba(31,31,40,.92)); }
  .fref-card:after { content:"03"; position:absolute; right:22px; top:-34px; font-family:'Playfair Display',serif; font-size:132px; font-weight:700; color:rgba(201,168,76,.055); pointer-events:none; }
  .fref-grid { position:relative; z-index:1; display:grid; grid-template-columns:minmax(0,1.1fr) minmax(280px,.9fr); gap:28px; align-items:start; }
  .fref-kicker { display:flex; align-items:center; gap:8px; color:var(--gold); font-size:10px; font-weight:800; letter-spacing:1.8px; text-transform:uppercase; margin-bottom:10px; }
  .fref-kicker:before { content:""; width:22px; height:1px; background:var(--gold); }
  .fref-title { font-family:'Playfair Display',serif; font-size:clamp(27px,4vw,40px); line-height:1.08; margin-bottom:10px; max-width:620px; }
  .fref-copy { max-width:620px; color:var(--text2); font-size:13px; line-height:1.7; }
  .fref-linkbox { display:flex; gap:8px; margin-top:20px; padding:7px; border-radius:11px; border:1px solid var(--border); background:rgba(10,10,15,.62); }
  .fref-link { min-width:0; flex:1; padding:8px 9px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; color:var(--text2); font-size:11px; }
  .fref-actions { display:flex; flex-wrap:wrap; gap:8px; margin-top:9px; }
  .fref-progress-card { padding:20px; border-radius:13px; border:1px solid var(--border); background:rgba(10,10,15,.68); }
  .fref-progress-top { display:flex; justify-content:space-between; gap:14px; align-items:flex-start; margin-bottom:16px; }
  .fref-progress-title { font-weight:700; font-size:14px; }
  .fref-progress-sub { color:var(--text2); font-size:11px; line-height:1.45; margin-top:4px; }
  .fref-progress-number { color:var(--gold); font-weight:800; font-size:17px; white-space:nowrap; }
  .fref-track { height:7px; overflow:hidden; border-radius:99px; background:var(--bg4); }
  .fref-fill { height:100%; border-radius:99px; background:linear-gradient(90deg,var(--gold),var(--gold-light)); transition:width .25s ease; }
  .fref-stats { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; margin-top:15px; }
  .fref-stat { padding:11px 9px; border-radius:9px; background:var(--bg3); border:1px solid rgba(255,255,255,.045); }
  .fref-stat strong { display:block; color:var(--text); font-size:18px; margin-bottom:2px; }
  .fref-stat span { display:block; color:var(--text2); font-size:9px; text-transform:uppercase; letter-spacing:.55px; }
  .fref-rule { display:grid; grid-template-columns:28px minmax(0,1fr); gap:10px; align-items:start; margin-top:13px; color:var(--text2); font-size:11px; line-height:1.5; }
  .fref-rule-num { width:28px; height:28px; display:flex; align-items:center; justify-content:center; border-radius:8px; color:var(--gold); background:var(--gold-dim); border:1px solid var(--border); font-weight:800; }
  .fref-note { margin-top:13px; padding:10px 12px; border-radius:9px; background:rgba(76,175,137,.09); border:1px solid rgba(76,175,137,.22); color:#7bcaa9; font-size:11px; line-height:1.5; }
  .fref-ambassador { display:inline-flex; align-items:center; gap:7px; margin-top:16px; color:var(--text2); font-size:11px; font-weight:700; text-decoration:none; transition:color .2s; }
  .fref-ambassador:hover { color:var(--gold-light); }
  .fref-error { color:var(--red); font-size:12px; margin-top:12px; }
  @media(max-width:800px){ .fref-card{padding:21px 18px}.fref-grid{grid-template-columns:1fr;gap:20px}.fref-linkbox{flex-wrap:wrap}.fref-linkbox .btn{width:100%;justify-content:center} }
`;

function previewSummary(userId, plan) {
  return {
    code: "FP" + String(userId || "00000000").replace(/-/g, "").slice(0, 8).toUpperCase(),
    pending: 0,
    activated: 0,
    progress: 0,
    nextRewardIn: 3,
    appliedRewards: 0,
    bankedDays: 0,
    currentPlan: plan || "free",
    preview: true,
  };
}

export default function ReferralProgram({ userId, plan }) {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [redeeming, setRedeeming] = useState(false);

  const load = async () => {
    if (!userId) return;
    setError("");
    try {
      setSummary(await fetchReferralSummary());
    } catch (err) {
      const isLocal = window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost";
      if (isLocal) setSummary(previewSummary(userId, plan));
      else setError(err.message || "Could not load your referral program");
    }
  };

  useEffect(() => { load(); }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

  const referralLink = useMemo(() => summary?.code
    ? `https://faturapro.app/?ref=${encodeURIComponent(summary.code)}&utm_source=referral&utm_medium=share&utm_campaign=member_referral`
    : "", [summary?.code]);

  const copyLink = async () => {
    if (!referralLink) return;
    await navigator.clipboard.writeText(referralLink);
    setCopied(true);
    trackEvent("referral_link_copied", { placement:"settings", progress:summary?.progress || 0 });
    setTimeout(() => setCopied(false), 1800);
  };

  const shareWhatsApp = () => {
    const message = `Create your first professional invoice with Fatūra Pro: ${referralLink}`;
    trackEvent("referral_share_clicked", { channel:"whatsapp", placement:"settings" });
    window.open("https://wa.me/?text=" + encodeURIComponent(message), "_blank", "noopener,noreferrer");
  };

  const redeem = async () => {
    setRedeeming(true);
    setError("");
    try {
      const result = await redeemReferralRewards();
      if (result.redeemed) trackEvent("referral_reward_redeemed", { days:result.days });
      await load();
    } catch (err) {
      setError(err.message || "Could not redeem your reward");
    } finally {
      setRedeeming(false);
    }
  };

  if (!summary && !error) return <div className="card" style={{ padding:24, marginBottom:20, color:"var(--text2)" }}>Loading your referral link…</div>;
  if (!summary) return <div className="card" style={{ padding:24, marginBottom:20 }}><div className="card-title">Earn free Pro</div><div className="fref-error">{error}</div><button className="btn btn-ghost btn-sm" style={{ marginTop:12 }} onClick={load}>Try again</button></div>;

  const progress = Number(summary.progress || 0);
  const earnedDays = Number(summary.appliedRewards || 0) * 30 + Number(summary.bankedDays || 0);

  return (
    <>
      <style>{CSS}</style>
      <section className="fref-card">
        <div className="fref-grid">
          <div>
            <div className="fref-kicker">Rewards that follow real use</div>
            <h2 className="fref-title">Invite three active friends. Earn 30 days of Pro.</h2>
            <p className="fref-copy">A referral becomes active only after your friend creates a real first invoice. They receive 7 extra Pro days, and every three active referrals earn you 30 Pro days.</p>
            <div className="fref-linkbox">
              <div className="fref-link" title={referralLink}>{referralLink}</div>
              <button className="btn btn-primary btn-sm" onClick={copyLink}>{copied ? "✓ Copied" : "Copy invite link"}</button>
            </div>
            <div className="fref-actions">
              <button className="btn btn-ghost btn-sm" onClick={shareWhatsApp}>Share on WhatsApp</button>
              {summary.bankedDays > 0 && summary.currentPlan === "free" && <button className="btn btn-ghost btn-sm" onClick={redeem} disabled={redeeming}>{redeeming ? "Applying…" : `Use ${summary.bankedDays} saved days`}</button>}
            </div>
            {summary.bankedDays > 0 && summary.currentPlan !== "free" && <div className="fref-note">You have {summary.bankedDays} Pro days safely saved. You can use them after your paid subscription ends.</div>}
            {summary.preview && <div className="fref-note">Preview mode: live referral counts begin after this version is published.</div>}
            {error && <div className="fref-error">{error}</div>}
            <a className="fref-ambassador" href="/ambassadors" onClick={() => trackEvent("ambassador_program_clicked", { placement:"referral_settings" })}>Build an audience or community? Apply to the Founding Ambassador Circle →</a>
          </div>

          <div className="fref-progress-card">
            <div className="fref-progress-top">
              <div><div className="fref-progress-title">Next 30-day reward</div><div className="fref-progress-sub">Only activated referrals count.</div></div>
              <div className="fref-progress-number">{progress}/3</div>
            </div>
            <div className="fref-track"><div className="fref-fill" style={{ width:(progress / 3 * 100) + "%" }} /></div>
            <div className="fref-stats">
              <div className="fref-stat"><strong>{summary.activated || 0}</strong><span>Activated</span></div>
              <div className="fref-stat"><strong>{summary.pending || 0}</strong><span>Pending</span></div>
              <div className="fref-stat"><strong>{earnedDays}</strong><span>Days earned</span></div>
            </div>
            <div className="fref-rule"><span className="fref-rule-num">1</span><span>Your friend opens the invite link and creates an account.</span></div>
            <div className="fref-rule"><span className="fref-rule-num">2</span><span>They create their first valid invoice and receive 7 extra Pro days.</span></div>
            <div className="fref-rule"><span className="fref-rule-num">3</span><span>You earn 30 Pro days. Paid subscribers keep the days safely banked.</span></div>
          </div>
        </div>
      </section>
    </>
  );
}
