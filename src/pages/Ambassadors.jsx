import { useEffect, useRef, useState } from "react";
import { trackEvent } from "../lib/tracking";

const CSS = `
  .amb-page { min-height:100vh; overflow:hidden; background:#08080e; color:#e8e4dc; font-family:'DM Sans',sans-serif; }
  .amb-page * { box-sizing:border-box; }
  .amb-wrap { width:min(1160px,calc(100% - 40px)); margin:0 auto; }
  .amb-nav { height:76px; display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid rgba(255,255,255,.07); }
  .amb-brand { display:flex; align-items:center; gap:10px; color:#c9a84c; font-family:'Playfair Display',serif; font-size:20px; text-decoration:none; }
  .amb-brand img { width:34px; height:34px; object-fit:contain; }
  .amb-back { color:#9a9690; font-size:13px; text-decoration:none; transition:color .2s; }
  .amb-back:hover { color:#e8c97a; }
  .amb-hero { position:relative; padding:92px 0 78px; }
  .amb-hero:before { content:""; position:absolute; width:620px; height:620px; right:-260px; top:-230px; border-radius:50%; background:radial-gradient(circle,rgba(201,168,76,.17),transparent 67%); pointer-events:none; }
  .amb-grid { position:relative; z-index:1; display:grid; grid-template-columns:minmax(0,1.04fr) minmax(390px,.96fr); gap:72px; align-items:start; }
  .amb-kicker { display:inline-flex; align-items:center; gap:9px; padding:7px 13px; border:1px solid rgba(201,168,76,.25); border-radius:999px; background:rgba(201,168,76,.09); color:#c9a84c; font-size:10px; font-weight:800; letter-spacing:1.6px; text-transform:uppercase; }
  .amb-kicker:before { content:""; width:6px; height:6px; border-radius:50%; background:#4caf89; box-shadow:0 0 0 5px rgba(76,175,137,.1); }
  .amb-title { margin:28px 0 20px; font-family:'Playfair Display',serif; font-size:clamp(48px,6vw,78px); line-height:1.02; letter-spacing:-1.8px; }
  .amb-title em { display:block; color:#c9a84c; font-weight:500; }
  .amb-lead { max-width:650px; color:#9a9690; font-size:17px; line-height:1.75; }
  .amb-promise { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; margin:34px 0; }
  .amb-promise div { min-height:112px; padding:17px; border:1px solid rgba(255,255,255,.08); border-radius:13px; background:rgba(17,17,24,.72); }
  .amb-promise strong { display:block; color:#e8c97a; font-family:'Playfair Display',serif; font-size:23px; margin-bottom:7px; }
  .amb-promise span { display:block; color:#9a9690; font-size:11px; line-height:1.5; }
  .amb-principle { display:flex; gap:13px; align-items:flex-start; padding:17px 19px; border-left:2px solid #c9a84c; background:linear-gradient(90deg,rgba(201,168,76,.08),transparent); color:#9a9690; font-size:12px; line-height:1.65; }
  .amb-principle b { color:#e8e4dc; }
  .amb-card { position:relative; overflow:hidden; padding:28px; border:1px solid rgba(201,168,76,.25); border-radius:22px; background:linear-gradient(155deg,rgba(29,25,31,.98),rgba(14,14,21,.98)); box-shadow:0 30px 90px rgba(0,0,0,.35); }
  .amb-card:after { content:"A"; position:absolute; right:-8px; top:-58px; color:rgba(201,168,76,.045); font-family:'Playfair Display',serif; font-size:220px; font-weight:700; pointer-events:none; }
  .amb-card-inner { position:relative; z-index:1; }
  .amb-card h2 { font-family:'Playfair Display',serif; font-size:28px; margin-bottom:7px; }
  .amb-card-sub { color:#9a9690; font-size:12px; line-height:1.6; margin-bottom:22px; }
  .amb-form-grid { display:grid; grid-template-columns:1fr 1fr; gap:13px; }
  .amb-field { display:flex; flex-direction:column; gap:6px; }
  .amb-field.full { grid-column:1/-1; }
  .amb-field label { color:#b9b4ac; font-size:10px; font-weight:700; letter-spacing:.7px; text-transform:uppercase; }
  .amb-field input,.amb-field select,.amb-field textarea { width:100%; border:1px solid rgba(255,255,255,.09); border-radius:9px; outline:none; background:#0d0d14; color:#e8e4dc; font:13px 'DM Sans',sans-serif; padding:11px 12px; transition:border-color .2s,box-shadow .2s; }
  .amb-field input:focus,.amb-field select:focus,.amb-field textarea:focus { border-color:rgba(201,168,76,.65); box-shadow:0 0 0 3px rgba(201,168,76,.08); }
  .amb-field textarea { min-height:102px; resize:vertical; line-height:1.6; }
  .amb-field option { background:#111118; }
  .amb-submit { width:100%; margin-top:17px; padding:13px 18px; border:0; border-radius:10px; background:#c9a84c; color:#09090d; font:700 14px 'DM Sans',sans-serif; cursor:pointer; transition:transform .2s,background .2s,box-shadow .2s; }
  .amb-submit:hover { background:#e8c97a; transform:translateY(-1px); box-shadow:0 8px 30px rgba(201,168,76,.25); }
  .amb-submit:disabled { opacity:.55; cursor:not-allowed; transform:none; box-shadow:none; }
  .amb-form-note { margin-top:12px; color:#5f5b56; font-size:10px; line-height:1.5; text-align:center; }
  .amb-error { margin-top:12px; padding:10px 12px; border:1px solid rgba(224,85,85,.26); border-radius:9px; background:rgba(224,85,85,.08); color:#ef8b8b; font-size:11px; line-height:1.5; }
  .amb-success { padding:38px 14px 28px; text-align:center; }
  .amb-success-mark { width:58px; height:58px; margin:0 auto 18px; display:flex; align-items:center; justify-content:center; border-radius:50%; background:rgba(76,175,137,.12); border:1px solid rgba(76,175,137,.32); color:#72c7a4; font-size:25px; }
  .amb-success h2 { font-size:32px; }
  .amb-success p { max-width:390px; margin:10px auto 22px; color:#9a9690; font-size:13px; line-height:1.7; }
  .amb-secondary { padding:88px 0 104px; border-top:1px solid rgba(255,255,255,.07); background:#0d0d14; }
  .amb-section-head { max-width:720px; margin-bottom:42px; }
  .amb-section-tag { color:#c9a84c; font-size:10px; font-weight:800; letter-spacing:1.8px; text-transform:uppercase; margin-bottom:13px; }
  .amb-section-title { font-family:'Playfair Display',serif; font-size:clamp(32px,4vw,48px); line-height:1.12; }
  .amb-path { display:grid; grid-template-columns:repeat(4,1fr); border:1px solid rgba(255,255,255,.08); border-radius:18px; overflow:hidden; }
  .amb-step { min-height:210px; padding:26px; border-right:1px solid rgba(255,255,255,.08); background:#111118; }
  .amb-step:last-child { border-right:0; }
  .amb-step-num { color:#c9a84c; font-family:'Playfair Display',serif; font-size:30px; margin-bottom:34px; }
  .amb-step h3 { font-size:14px; margin-bottom:8px; }
  .amb-step p { color:#8f8a84; font-size:12px; line-height:1.65; }
  .amb-footer { padding:28px 0; border-top:1px solid rgba(255,255,255,.07); color:#68645f; font-size:11px; }
  .amb-footer .amb-wrap { display:flex; justify-content:space-between; gap:20px; flex-wrap:wrap; }
  .amb-footer a { color:#8f8a84; text-decoration:none; }
  .amb-honeypot { position:absolute !important; left:-10000px !important; width:1px !important; height:1px !important; overflow:hidden !important; }
  @media(max-width:900px){ .amb-grid{grid-template-columns:1fr;gap:44px}.amb-promise{grid-template-columns:1fr 1fr 1fr}.amb-path{grid-template-columns:1fr 1fr}.amb-step:nth-child(2){border-right:0}.amb-step:nth-child(-n+2){border-bottom:1px solid rgba(255,255,255,.08)} }
  @media(max-width:560px){ .amb-wrap{width:min(100% - 28px,1160px)}.amb-nav{height:66px}.amb-hero{padding:65px 0 56px}.amb-title{font-size:43px;letter-spacing:-.9px}.amb-lead{font-size:15px}.amb-promise{grid-template-columns:1fr}.amb-promise div{min-height:0}.amb-card{padding:22px 17px}.amb-form-grid{grid-template-columns:1fr}.amb-field.full{grid-column:auto}.amb-path{grid-template-columns:1fr}.amb-step{min-height:0;border-right:0;border-bottom:1px solid rgba(255,255,255,.08)}.amb-step:last-child{border-bottom:0}.amb-step-num{margin-bottom:18px}.amb-secondary{padding:65px 0 78px} }
`;

const EMPTY = {
  name:"", email:"", channel:"", profileUrl:"", audienceSize:"", languages:"", country:"", motivation:"", website:"",
};

export default function Ambassadors() {
  const [form, setForm] = useState(EMPTY);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const startedAt = useRef(Date.now());
  const trackedStart = useRef(false);

  useEffect(() => {
    document.title = "Founding Ambassador Program | Fatūra Pro";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Apply to the Fatūra Pro Founding Ambassador Circle. Earn transparent cash commission on qualified paid subscriptions with a personal tracked link and live partner dashboard.");
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement("link"); canonical.rel = "canonical"; document.head.appendChild(canonical); }
    canonical.href = "https://faturapro.app/ambassadors";
    trackEvent("ambassador_page_viewed", { source:new URLSearchParams(window.location.search).get("utm_source") || "direct" });
  }, []);

  const update = (key, value) => {
    setForm(current => ({ ...current, [key]:value }));
    if (!trackedStart.current) {
      trackedStart.current = true;
      trackEvent("ambassador_application_started", { field:key });
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setStatus("submitting");
    try {
      const params = new URLSearchParams(window.location.search);
      const response = await fetch("/api/waitlist-confirm?intent=ambassador", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body:JSON.stringify({
          ...form,
          startedAt:startedAt.current,
          source:(params.get("utm_source") || "website").slice(0, 60),
          medium:(params.get("utm_medium") || "organic").slice(0, 60),
          campaign:(params.get("utm_campaign") || "founding_ambassadors").slice(0, 80),
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "We could not submit your application. Please try again.");
      setStatus("success");
      trackEvent("ambassador_application_submitted", { channel:form.channel, audience_size:form.audienceSize, duplicate:!!data.already });
    } catch (err) {
      setStatus("error");
      setError(err.message || "We could not submit your application. Please try again.");
    }
  };

  return (
    <div className="amb-page">
      <style>{CSS}</style>
      <header className="amb-wrap amb-nav">
        <a className="amb-brand" href="/"><img src="/fatura-mark.svg" alt="" />Fatūra Pro</a>
        <a className="amb-back" href="/">← Back to the product</a>
      </header>

      <main>
        <section className="amb-hero">
          <div className="amb-wrap amb-grid">
            <div>
              <div className="amb-kicker">Founding Ambassador Circle · Applications open</div>
              <h1 className="amb-title">Teach useful business skills.<em>Grow with the people you help.</em></h1>
              <p className="amb-lead">We are building a small first circle of creators, consultants and community leaders who help freelancers and service businesses work more professionally. Share Fatūra Pro only when it genuinely solves a problem—and earn recurring cash commission from qualified paid subscriptions.</p>
              <div className="amb-promise" aria-label="Ambassador program benefits">
                <div><strong>Your link</strong><span>A personal tracked link with clicks, sign-ups, paid customers and earnings.</span></div>
                <div><strong>Your voice</strong><span>Direct product feedback and early access to useful releases.</span></div>
                <div><strong>25% / 35%</strong><span>Standard offer: Pro pays 25%; Business pays 35% for each customer’s first 12 paid months.</span></div>
              </div>
              <div className="amb-principle"><span>✦</span><span><b>This is not an affiliate-link dump.</b> We value honest tutorials, useful templates and real recommendations. Spam, fake accounts and misleading claims are never rewarded.</span></div>
            </div>

            <aside className="amb-card" id="apply" aria-labelledby="amb-apply-title">
              <div className="amb-card-inner">
                {status === "success" ? (
                  <div className="amb-success">
                    <div className="amb-success-mark">✓</div>
                    <h2 id="amb-apply-title">Application received.</h2>
                    <p>Thank you for telling us about your work. We review founding-circle applications in batches and will contact you by email if there is a strong fit.</p>
                    <a className="amb-submit" href="/" style={{ display:"inline-block", width:"auto", textDecoration:"none", padding:"12px 22px" }}>Explore Fatūra Pro →</a>
                  </div>
                ) : (
                  <>
                    <h2 id="amb-apply-title">Apply to the founding circle</h2>
                    <p className="amb-card-sub">A focused application—usually under three minutes. No follower minimum; relevance and trust matter more.</p>
                    <form onSubmit={submit}>
                      <div className="amb-form-grid">
                        <div className="amb-field"><label htmlFor="amb-name">Name</label><input id="amb-name" required maxLength="80" autoComplete="name" value={form.name} onChange={e => update("name",e.target.value)} /></div>
                        <div className="amb-field"><label htmlFor="amb-email">Email</label><input id="amb-email" required type="email" maxLength="160" autoComplete="email" value={form.email} onChange={e => update("email",e.target.value)} /></div>
                        <div className="amb-field"><label htmlFor="amb-channel">Primary channel</label><select id="amb-channel" required value={form.channel} onChange={e => update("channel",e.target.value)}><option value="">Choose one</option><option>YouTube</option><option>TikTok</option><option>Instagram</option><option>LinkedIn</option><option>Newsletter</option><option>Community</option><option>Consulting</option><option>Other</option></select></div>
                        <div className="amb-field"><label htmlFor="amb-size">Audience size</label><select id="amb-size" required value={form.audienceSize} onChange={e => update("audienceSize",e.target.value)}><option value="">Choose a range</option><option value="under_1k">Under 1,000</option><option value="1k_5k">1,000–5,000</option><option value="5k_25k">5,000–25,000</option><option value="25k_plus">25,000+</option></select></div>
                        <div className="amb-field full"><label htmlFor="amb-url">Profile, channel or community URL</label><input id="amb-url" required type="url" maxLength="300" placeholder="https://" value={form.profileUrl} onChange={e => update("profileUrl",e.target.value)} /></div>
                        <div className="amb-field"><label htmlFor="amb-language">Content language(s)</label><input id="amb-language" required maxLength="100" placeholder="e.g. English, Arabic" value={form.languages} onChange={e => update("languages",e.target.value)} /></div>
                        <div className="amb-field"><label htmlFor="amb-country">Country / market</label><input id="amb-country" required maxLength="80" autoComplete="country-name" value={form.country} onChange={e => update("country",e.target.value)} /></div>
                        <div className="amb-field full"><label htmlFor="amb-why">Why is Fatūra Pro relevant to your audience?</label><textarea id="amb-why" required minLength="40" maxLength="1000" placeholder="Tell us who you help and what kind of useful content or resource you would create." value={form.motivation} onChange={e => update("motivation",e.target.value)} /></div>
                        <div className="amb-honeypot" aria-hidden="true"><label htmlFor="amb-website">Website</label><input id="amb-website" tabIndex="-1" autoComplete="off" value={form.website} onChange={e => update("website",e.target.value)} /></div>
                      </div>
                      <button className="amb-submit" type="submit" disabled={status === "submitting"}>{status === "submitting" ? "Sending application…" : "Submit application →"}</button>
                      {error && <div className="amb-error" role="alert">{error}</div>}
                      <div className="amb-form-note">By submitting, you agree that Fatūra Pro may contact you about this ambassador application. No marketing list is created from this form. <a href="/privacy" style={{ color:"#8f8a84" }}>Privacy</a> · <a href="/ambassador-terms" style={{ color:"#8f8a84" }}>Program terms</a>.</div>
                    </form>
                  </>
                )}
              </div>
            </aside>
          </div>
        </section>

        <section className="amb-secondary">
          <div className="amb-wrap">
            <div className="amb-section-head"><div className="amb-section-tag">A deliberate first cohort</div><h2 className="amb-section-title">From application to useful, measurable partnership.</h2></div>
            <div className="amb-path">
              <article className="amb-step"><div className="amb-step-num">01</div><h3>Show us your audience</h3><p>Tell us who you help, where you publish and why invoicing is relevant to their work.</p></article>
              <article className="amb-step"><div className="amb-step-num">02</div><h3>We review the fit</h3><p>We review content quality and audience relevance. Standard terms apply automatically unless your written approval includes a custom offer.</p></article>
              <article className="amb-step"><div className="amb-step-num">03</div><h3>Receive your link & dashboard</h3><p>See aggregate clicks, sign-ups, paying customers, pending commission and completed payouts.</p></article>
              <article className="amb-step"><div className="amb-step-num">04</div><h3>Get paid automatically</h3><p>Connect Stripe once. Eligible commission is transferred after the holding period and stops automatically at the customer term shown in your dashboard.</p></article>
            </div>
          </div>
        </section>
      </main>

      <footer className="amb-footer"><div className="amb-wrap"><span>© 2026 Fatūra Pro · Founding Ambassador Circle</span><span><a href="/ambassador-terms">Program terms</a> · <a href="/privacy">Privacy</a> · <a href="mailto:support@faturapro.app">Questions?</a></span></div></footer>
    </div>
  );
}
