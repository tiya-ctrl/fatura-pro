import { useEffect, useMemo, useState } from "react";
import { fetchReferralSummary, redeemReferralRewards } from "../lib/referrals";
import { trackEvent } from "../lib/tracking";
import { getLocale } from "../lib/locale";

const CSS = `
  .fref-card { position:relative; overflow:hidden; margin-bottom:20px; padding:28px; border-radius:16px; border:1px solid rgba(99,102,241,.28); background:linear-gradient(135deg,rgba(99,102,241,.14),rgba(17,17,24,.98) 48%,rgba(31,31,40,.92)); }
  .fref-card:after { content:"03"; position:absolute; right:22px; top:-34px; font-family:'Playfair Display',serif; font-size:132px; font-weight:700; color:rgba(99,102,241,.055); pointer-events:none; }
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
  .fref-compact { display:flex; align-items:center; justify-content:space-between; gap:20px; margin-bottom:20px; padding:17px 19px; border-radius:13px; border:1px solid rgba(99,102,241,.22); background:linear-gradient(120deg,rgba(99,102,241,.09),rgba(17,17,24,.97) 58%); }
  .fref-compact-copy { min-width:0; }
  .fref-compact-title { margin:2px 0 4px; font:700 18px 'Playfair Display',serif; color:var(--text); }
  .fref-compact-sub { color:var(--text2); font-size:11px; line-height:1.5; }
  .fref-compact-side { display:flex; align-items:center; gap:13px; flex:0 0 auto; }
  .fref-compact-progress { color:var(--gold); font-size:12px; font-weight:800; white-space:nowrap; }
  .fref-close { position:absolute; right:18px; top:16px; z-index:2; border:0; background:transparent; color:var(--text2); cursor:pointer; font:700 11px 'DM Sans',sans-serif; }
  .fref-close:hover { color:var(--gold-light); }
  @media(max-width:800px){ .fref-card{padding:48px 18px 21px}.fref-grid{grid-template-columns:1fr;gap:20px}.fref-linkbox{flex-wrap:wrap}.fref-linkbox .btn{width:100%;justify-content:center}.fref-compact{align-items:flex-start;flex-direction:column}.fref-compact-side{width:100%;justify-content:space-between} }
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
  const ar = getLocale() === "ar";
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [redeeming, setRedeeming] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const load = async () => {
    if (!userId) return;
    setError("");
    try {
      setSummary(await fetchReferralSummary());
    } catch (err) {
      const isLocal = window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost";
      if (isLocal) setSummary(previewSummary(userId, plan));
      else setError(err.message || (ar ? "تعذّر تحميل برنامج الإحالة الخاص بك" : "Could not load your referral program"));
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
    const message = ar
      ? `أنشئ أول فاتورة احترافية لك باستخدام Fatūra Pro: ${referralLink}`
      : `Create your first professional invoice with Fatūra Pro: ${referralLink}`;
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
      setError(err.message || (ar ? "تعذّر استخدام مكافأتك" : "Could not redeem your reward"));
    } finally {
      setRedeeming(false);
    }
  };

  if (!summary && !error) return <><style>{CSS}</style><div className="fref-compact"><div className="fref-compact-copy"><div className="fref-kicker">{ar ? "مكافآت الإحالة" : "Referral rewards"}</div><div className="fref-compact-title">{ar ? "اكسب 30 يومًا من Pro" : "Earn 30 Pro days"}</div><div className="fref-compact-sub">{ar ? "جارٍ تحميل رابط دعوتك الخاص…" : "Loading your private invite link…"}</div></div></div></>;
  if (!summary) return <><style>{CSS}</style><div className="fref-compact"><div className="fref-compact-copy"><div className="fref-kicker">{ar ? "مكافآت الإحالة" : "Referral rewards"}</div><div className="fref-compact-title">{ar ? "اكسب Pro مجانًا" : "Earn free Pro"}</div><div className="fref-error">{error}</div></div><button className="btn btn-ghost btn-sm" onClick={load}>{ar ? "حاول مرة أخرى" : "Try again"}</button></div></>;

  const progress = Number(summary.progress || 0);
  const earnedDays = Number(summary.appliedRewards || 0) * 30 + Number(summary.bankedDays || 0);

  if (!expanded) return (
    <>
      <style>{CSS}</style>
      <section className="fref-compact">
        <div className="fref-compact-copy">
          <div className="fref-kicker">{ar ? "مكافآت إحالة اختيارية" : "Optional referral rewards"}</div>
          <h2 className="fref-compact-title">{ar ? "ادعُ 3 أصدقاء نشطين واكسب 30 يومًا من Pro." : "Invite 3 active friends. Earn 30 Pro days."}</h2>
          <p className="fref-compact-sub">{ar ? "يحصل صديقك على 7 أيام Pro إضافية. افتح هذا القسم فقط للمشاركة أو متابعة التقدم." : "Your friend gets 7 extra Pro days. Open this only when you want to share or check progress."}</p>
        </div>
        <div className="fref-compact-side">
          <span className="fref-compact-progress">{progress}/3 {ar ? "نشط" : "active"}</span>
          <button className="btn btn-ghost btn-sm" aria-expanded="false" onClick={() => { setExpanded(true); trackEvent("referral_program_opened", { placement:"settings_card" }); }}>{ar ? "عرض ومشاركة" : "View & share"}</button>
        </div>
      </section>
    </>
  );

  return (
    <>
      <style>{CSS}</style>
      <section className="fref-card">
        <button className="fref-close" aria-expanded="true" onClick={() => setExpanded(false)}>{ar ? "طي ↑" : "Collapse ↑"}</button>
        <div className="fref-grid">
          <div>
            <div className="fref-kicker">{ar ? "مكافآت مرتبطة بالاستخدام الحقيقي" : "Rewards that follow real use"}</div>
            <h2 className="fref-title">{ar ? "ادعُ ثلاثة أصدقاء نشطين واكسب 30 يومًا من Pro." : "Invite three active friends. Earn 30 days of Pro."}</h2>
            <p className="fref-copy">{ar ? "تُحتسب الإحالة نشطة فقط بعد أن ينشئ صديقك أول فاتورة حقيقية. يحصل هو على 7 أيام Pro إضافية، وتحصل أنت على 30 يومًا بعد كل ثلاث إحالات نشطة." : "A referral becomes active only after your friend creates a real first invoice. They receive 7 extra Pro days, and every three active referrals earn you 30 Pro days."}</p>
            <div className="fref-linkbox">
              <div className="fref-link" title={referralLink}>{referralLink}</div>
              <button className="btn btn-primary btn-sm" onClick={copyLink}>{copied ? (ar ? "✓ تم النسخ" : "✓ Copied") : (ar ? "نسخ رابط الدعوة" : "Copy invite link")}</button>
            </div>
            <div className="fref-actions">
              <button className="btn btn-ghost btn-sm" onClick={shareWhatsApp}>{ar ? "مشاركة عبر WhatsApp" : "Share on WhatsApp"}</button>
              {summary.bankedDays > 0 && summary.currentPlan === "free" && <button className="btn btn-ghost btn-sm" onClick={redeem} disabled={redeeming}>{redeeming ? (ar ? "جارٍ التطبيق…" : "Applying…") : (ar ? `استخدم ${summary.bankedDays} يومًا محفوظًا` : `Use ${summary.bankedDays} saved days`)}</button>}
            </div>
            {summary.bankedDays > 0 && summary.currentPlan !== "free" && <div className="fref-note">{ar ? `لديك ${summary.bankedDays} يومًا من Pro محفوظة بأمان، ويمكنك استخدامها بعد انتهاء اشتراكك المدفوع.` : `You have ${summary.bankedDays} Pro days safely saved. You can use them after your paid subscription ends.`}</div>}
            {summary.preview && <div className="fref-note">{ar ? "وضع المعاينة: يبدأ عدّ الإحالات الفعلي بعد نشر هذه النسخة." : "Preview mode: live referral counts begin after this version is published."}</div>}
            {error && <div className="fref-error">{error}</div>}
            <a className="fref-ambassador" href="/ambassadors" onClick={() => trackEvent("ambassador_program_clicked", { placement:"referral_settings" })}>{ar ? "لديك جمهور أو مجتمع؟ قدّم إلى برنامج السفراء ←" : "Build an audience or community? Apply to the Founding Ambassador Circle →"}</a>
          </div>

          <div className="fref-progress-card">
            <div className="fref-progress-top">
              <div><div className="fref-progress-title">{ar ? "مكافأة الـ30 يومًا التالية" : "Next 30-day reward"}</div><div className="fref-progress-sub">{ar ? "تُحتسب الإحالات النشطة فقط." : "Only activated referrals count."}</div></div>
              <div className="fref-progress-number">{progress}/3</div>
            </div>
            <div className="fref-track"><div className="fref-fill" style={{ width:(progress / 3 * 100) + "%" }} /></div>
            <div className="fref-stats">
              <div className="fref-stat"><strong>{summary.activated || 0}</strong><span>{ar ? "نشطة" : "Activated"}</span></div>
              <div className="fref-stat"><strong>{summary.pending || 0}</strong><span>{ar ? "قيد الانتظار" : "Pending"}</span></div>
              <div className="fref-stat"><strong>{earnedDays}</strong><span>{ar ? "أيام مكتسبة" : "Days earned"}</span></div>
            </div>
            <div className="fref-rule"><span className="fref-rule-num">1</span><span>{ar ? "يفتح صديقك رابط الدعوة وينشئ حسابًا." : "Your friend opens the invite link and creates an account."}</span></div>
            <div className="fref-rule"><span className="fref-rule-num">2</span><span>{ar ? "ينشئ أول فاتورة صحيحة ويحصل على 7 أيام Pro إضافية." : "They create their first valid invoice and receive 7 extra Pro days."}</span></div>
            <div className="fref-rule"><span className="fref-rule-num">3</span><span>{ar ? "تحصل أنت على 30 يومًا من Pro، وتُحفظ الأيام بأمان للمشتركين المدفوعين." : "You earn 30 Pro days. Paid subscribers keep the days safely banked."}</span></div>
          </div>
        </div>
      </section>
    </>
  );
}
