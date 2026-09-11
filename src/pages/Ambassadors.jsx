import { useEffect, useRef, useState } from "react";
import { trackEvent } from "../lib/tracking";
import { applyPageSeo, suspendBaseSiteSchema } from "../lib/pageSeo";
import { getLocale, localeHome } from "../lib/locale";

const CSS = `
  .amb-page { min-height:100vh; overflow:hidden; background:#08080e; color:#e8e4dc; font-family:'DM Sans',sans-serif; }
  .amb-page * { box-sizing:border-box; }
  .amb-wrap { width:min(1160px,calc(100% - 40px)); margin:0 auto; }
  .amb-nav { height:76px; display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid rgba(255,255,255,.07); }
  .amb-brand { display:flex; align-items:center; gap:10px; color:#6366F1; font-family:'Playfair Display',serif; font-size:20px; text-decoration:none; }
  .amb-brand img { width:34px; height:34px; object-fit:contain; }
  .amb-back { color:#9a9690; font-size:13px; text-decoration:none; transition:color .2s; }
  .amb-back:hover { color:#7C6CF2; }
  .amb-hero { position:relative; padding:92px 0 78px; }
  .amb-hero:before { content:""; position:absolute; width:620px; height:620px; right:-260px; top:-230px; border-radius:50%; background:radial-gradient(circle,rgba(99,102,241,.17),transparent 67%); pointer-events:none; }
  .amb-grid { position:relative; z-index:1; display:grid; grid-template-columns:minmax(0,1.04fr) minmax(390px,.96fr); gap:72px; align-items:start; }
  .amb-kicker { display:inline-flex; align-items:center; gap:9px; padding:7px 13px; border:1px solid rgba(99,102,241,.25); border-radius:999px; background:rgba(99,102,241,.09); color:#6366F1; font-size:10px; font-weight:800; letter-spacing:1.6px; text-transform:uppercase; }
  .amb-kicker:before { content:""; width:6px; height:6px; border-radius:50%; background:#4caf89; box-shadow:0 0 0 5px rgba(76,175,137,.1); }
  .amb-title { margin:28px 0 20px; font-family:'Playfair Display',serif; font-size:clamp(48px,6vw,78px); line-height:1.02; letter-spacing:-1.8px; }
  .amb-title em { display:block; color:#6366F1; font-weight:500; }
  .amb-lead { max-width:650px; color:#9a9690; font-size:17px; line-height:1.75; }
  .amb-promise { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; margin:34px 0; }
  .amb-promise div { min-height:112px; padding:17px; border:1px solid rgba(255,255,255,.08); border-radius:13px; background:rgba(17,17,24,.72); }
  .amb-promise strong { display:block; color:#7C6CF2; font-family:'Playfair Display',serif; font-size:23px; margin-bottom:7px; }
  .amb-promise span { display:block; color:#9a9690; font-size:11px; line-height:1.5; }
  .amb-principle { display:flex; gap:13px; align-items:flex-start; padding:17px 19px; border-left:2px solid #6366F1; background:linear-gradient(90deg,rgba(99,102,241,.08),transparent); color:#9a9690; font-size:12px; line-height:1.65; }
  .amb-principle b { color:#e8e4dc; }
  .amb-card { position:relative; overflow:hidden; padding:28px; border:1px solid rgba(99,102,241,.25); border-radius:22px; background:linear-gradient(155deg,rgba(29,25,31,.98),rgba(14,14,21,.98)); box-shadow:0 30px 90px rgba(0,0,0,.35); }
  .amb-card:after { content:"A"; position:absolute; right:-8px; top:-58px; color:rgba(99,102,241,.045); font-family:'Playfair Display',serif; font-size:220px; font-weight:700; pointer-events:none; }
  .amb-card-inner { position:relative; z-index:1; }
  .amb-card h2 { font-family:'Playfair Display',serif; font-size:28px; margin-bottom:7px; }
  .amb-card-sub { color:#9a9690; font-size:12px; line-height:1.6; margin-bottom:22px; }
  .amb-form-grid { display:grid; grid-template-columns:1fr 1fr; gap:13px; }
  .amb-field { display:flex; flex-direction:column; gap:6px; }
  .amb-field.full { grid-column:1/-1; }
  .amb-field label { color:#b9b4ac; font-size:10px; font-weight:700; letter-spacing:.7px; text-transform:uppercase; }
  .amb-field input,.amb-field select,.amb-field textarea { width:100%; border:1px solid rgba(255,255,255,.09); border-radius:9px; outline:none; background:#0d0d14; color:#e8e4dc; font:13px 'DM Sans',sans-serif; padding:11px 12px; transition:border-color .2s,box-shadow .2s; }
  .amb-field input:focus,.amb-field select:focus,.amb-field textarea:focus { border-color:rgba(99,102,241,.65); box-shadow:0 0 0 3px rgba(99,102,241,.08); }
  .amb-field textarea { min-height:102px; resize:vertical; line-height:1.6; }
  .amb-field option { background:#111118; }
  .amb-submit { width:100%; margin-top:17px; padding:13px 18px; border:0; border-radius:10px; background:#6366F1; color:#09090d; font:700 14px 'DM Sans',sans-serif; cursor:pointer; transition:transform .2s,background .2s,box-shadow .2s; }
  .amb-submit:hover { background:#7C6CF2; transform:translateY(-1px); box-shadow:0 8px 30px rgba(99,102,241,.25); }
  .amb-submit:disabled { opacity:.55; cursor:not-allowed; transform:none; box-shadow:none; }
  .amb-form-note { margin-top:12px; color:#5f5b56; font-size:10px; line-height:1.5; text-align:center; }
  .amb-error { margin-top:12px; padding:10px 12px; border:1px solid rgba(224,85,85,.26); border-radius:9px; background:rgba(224,85,85,.08); color:#ef8b8b; font-size:11px; line-height:1.5; }
  .amb-success { padding:38px 14px 28px; text-align:center; }
  .amb-success-mark { width:58px; height:58px; margin:0 auto 18px; display:flex; align-items:center; justify-content:center; border-radius:50%; background:rgba(76,175,137,.12); border:1px solid rgba(76,175,137,.32); color:#72c7a4; font-size:25px; }
  .amb-success h2 { font-size:32px; }
  .amb-success p { max-width:390px; margin:10px auto 22px; color:#9a9690; font-size:13px; line-height:1.7; }
  .amb-secondary { padding:88px 0 104px; border-top:1px solid rgba(255,255,255,.07); background:#0d0d14; }
  .amb-section-head { max-width:720px; margin-bottom:42px; }
  .amb-section-tag { color:#6366F1; font-size:10px; font-weight:800; letter-spacing:1.8px; text-transform:uppercase; margin-bottom:13px; }
  .amb-section-title { font-family:'Playfair Display',serif; font-size:clamp(32px,4vw,48px); line-height:1.12; }
  .amb-path { display:grid; grid-template-columns:repeat(4,1fr); border:1px solid rgba(255,255,255,.08); border-radius:18px; overflow:hidden; }
  .amb-step { min-height:210px; padding:26px; border-right:1px solid rgba(255,255,255,.08); background:#111118; }
  .amb-step:last-child { border-right:0; }
  .amb-step-num { color:#6366F1; font-family:'Playfair Display',serif; font-size:30px; margin-bottom:34px; }
  .amb-step h3 { font-size:14px; margin-bottom:8px; }
  .amb-step p { color:#8f8a84; font-size:12px; line-height:1.65; }
  .amb-footer { padding:28px 0; border-top:1px solid rgba(255,255,255,.07); color:#68645f; font-size:11px; }
  .amb-footer .amb-wrap { display:flex; justify-content:space-between; gap:20px; flex-wrap:wrap; }
  .amb-footer a { color:#8f8a84; text-decoration:none; }
  .amb-honeypot { position:absolute !important; left:-10000px !important; width:1px !important; height:1px !important; overflow:hidden !important; }
  .amb-page[dir="rtl"] { font-family:'Noto Sans Arabic','Segoe UI',sans-serif; }
  .amb-page[dir="rtl"] .amb-principle { border-left:0; border-right:2px solid #6366F1; background:linear-gradient(270deg,rgba(99,102,241,.08),transparent); }
  .amb-page[dir="rtl"] .amb-step { border-right:0; border-left:1px solid rgba(255,255,255,.08); }
  .amb-page[dir="rtl"] .amb-step:last-child { border-left:0; }
  @media(max-width:900px){ .amb-grid{grid-template-columns:1fr;gap:44px}.amb-promise{grid-template-columns:1fr 1fr 1fr}.amb-path{grid-template-columns:1fr 1fr}.amb-step:nth-child(2){border-right:0}.amb-step:nth-child(-n+2){border-bottom:1px solid rgba(255,255,255,.08)} }
  @media(max-width:560px){ .amb-wrap{width:min(100% - 28px,1160px)}.amb-nav{height:66px}.amb-hero{padding:65px 0 56px}.amb-title{font-size:43px;letter-spacing:-.9px}.amb-lead{font-size:15px}.amb-promise{grid-template-columns:1fr}.amb-promise div{min-height:0}.amb-card{padding:22px 17px}.amb-form-grid{grid-template-columns:1fr}.amb-field.full{grid-column:auto}.amb-path{grid-template-columns:1fr}.amb-step{min-height:0;border-right:0;border-bottom:1px solid rgba(255,255,255,.08)}.amb-step:last-child{border-bottom:0}.amb-step-num{margin-bottom:18px}.amb-secondary{padding:65px 0 78px} }
`;

const EMPTY = {
  name:"", email:"", channel:"", profileUrl:"", audienceSize:"", languages:"", country:"", motivation:"", website:"",
};

export default function Ambassadors() {
  const locale = getLocale();
  const ar = locale === "ar";
  const ui = (english, arabic) => ar ? arabic : english;
  const [form, setForm] = useState(EMPTY);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const startedAt = useRef(Date.now());
  const trackedStart = useRef(false);

  useEffect(() => {
    const canonical = "https://faturapro.app/ambassadors";
    const title = ui("FaturaPro Ambassador Program | Apply", "برنامج سفراء FaturaPro | قدّم الآن");
    const description = ui("Apply to the FaturaPro ambassador program. Approved partners receive a tracked link, private dashboard and commission terms for eligible paid subscriptions.", "قدّم إلى برنامج سفراء FaturaPro. يحصل الشركاء المقبولون على رابط تتبع ولوحة خاصة وشروط عمولة واضحة للاشتراكات المدفوعة المؤهلة.");
    const cleanupSeo = applyPageSeo({ title, description, canonical, language:ar ? "ar" : "en", locale:ar ? "ar_AR" : "en_US", imageAlt:ui("FaturaPro ambassador program", "برنامج سفراء FaturaPro"), alternates:{ en:canonical, "x-default":canonical } });
    const restoreSiteSchema = suspendBaseSiteSchema();
    trackEvent("ambassador_page_viewed", { source:new URLSearchParams(window.location.search).get("utm_source") || "direct" });
    return () => { restoreSiteSchema(); cleanupSeo(); };
  }, [ar]);

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
      if (!response.ok) throw new Error(data.error || ui("We could not submit your application. Please try again.", "تعذّر إرسال طلبك. حاول مرة أخرى."));
      setStatus("success");
      trackEvent("ambassador_application_submitted", { channel:form.channel, audience_size:form.audienceSize, duplicate:!!data.already });
    } catch (err) {
      setStatus("error");
      setError(err.message || ui("We could not submit your application. Please try again.", "تعذّر إرسال طلبك. حاول مرة أخرى."));
    }
  };

  return (
    <div className="amb-page" dir={ar ? "rtl" : "ltr"} lang={ar ? "ar" : "en"}>
      <style>{CSS}</style>
      <header className="amb-wrap amb-nav">
        <a className="amb-brand" href={localeHome(locale)}><img src="/fatura-mark.svg" alt="" />Fatūra Pro</a>
        <a className="amb-back" href={localeHome(locale)}>{ui("← Back to the product", "العودة إلى المنتج →")}</a>
      </header>

      <main>
        <section className="amb-hero">
          <div className="amb-wrap amb-grid">
            <div>
              <div className="amb-kicker">{ui("Founding Ambassador Circle · Applications open", "دائرة السفراء المؤسسين · التقديم مفتوح")}</div>
              <h1 className="amb-title">{ui("Teach useful business skills.", "شارك معرفة عملية مفيدة.")}<em>{ui("Grow with the people you help.", "وانمُ مع الأشخاص الذين تساعدهم.")}</em></h1>
              <p className="amb-lead">{ui("We are building a small first circle of creators, consultants and community leaders who help freelancers and service businesses work more professionally. Share Fatūra Pro only when it genuinely solves a problem—and earn recurring cash commission from qualified paid subscriptions.", "نبني دائرة أولى صغيرة من صنّاع المحتوى والمستشارين وقادة المجتمعات الذين يساعدون المستقلين وأصحاب الخدمات على العمل باحتراف. شارك Fatūra Pro عندما يحل مشكلة فعلية، واكسب عمولة نقدية متكررة من الاشتراكات المدفوعة المؤهلة.")}</p>
              <div className="amb-promise" aria-label={ui("Ambassador program benefits", "مزايا برنامج السفراء")}>
                <div><strong>{ui("Your link", "رابطك")}</strong><span>{ui("A personal tracked link with clicks, sign-ups, paid customers and earnings.", "رابط شخصي يعرض النقرات والتسجيلات والعملاء المدفوعين والأرباح.")}</span></div>
                <div><strong>{ui("Your voice", "رأيك")}</strong><span>{ui("Direct product feedback and early access to useful releases.", "ملاحظات مباشرة على المنتج ووصول مبكر إلى الإصدارات المفيدة.")}</span></div>
                <div><strong>25% / 35%</strong><span>{ui("Standard offer: Pro pays 25%; Business pays 35% for each customer’s first 12 paid months.", "العرض القياسي: 25% لخطة Pro و35% لخطة Business خلال أول 12 شهرًا مدفوعًا لكل عميل.")}</span></div>
              </div>
              <div className="amb-principle"><span>✦</span><span><b>{ui("This is not an affiliate-link dump.", "هذا ليس مكانًا لنشر روابط عشوائية.")}</b> {ui("We value honest tutorials, useful templates and real recommendations. Spam, fake accounts and misleading claims are never rewarded.", "نقدّر الشروحات الصادقة والقوالب المفيدة والتوصيات الحقيقية. لا نكافئ الرسائل المزعجة أو الحسابات الوهمية أو الادعاءات المضللة.")}</span></div>
            </div>

            <aside className="amb-card" id="apply" aria-labelledby="amb-apply-title">
              <div className="amb-card-inner">
                {status === "success" ? (
                  <div className="amb-success">
                    <div className="amb-success-mark">✓</div>
                    <h2 id="amb-apply-title">{ui("Application received.", "تم استلام الطلب.")}</h2>
                    <p>{ui("Thank you for telling us about your work. We review founding-circle applications in batches and will contact you by email if there is a strong fit.", "شكرًا لتعريفنا بعملك. نراجع طلبات الدائرة التأسيسية على دفعات، وسنتواصل معك عبر البريد إذا كان هناك توافق مناسب.")}</p>
                    <a className="amb-submit" href={localeHome(locale)} style={{ display:"inline-block", width:"auto", textDecoration:"none", padding:"12px 22px" }}>{ui("Explore Fatūra Pro →", "استكشف Fatūra Pro ←")}</a>
                  </div>
                ) : (
                  <>
                    <h2 id="amb-apply-title">{ui("Apply to the founding circle", "قدّم إلى الدائرة التأسيسية")}</h2>
                    <p className="amb-card-sub">{ui("A focused application—usually under three minutes. No follower minimum; relevance and trust matter more.", "طلب مختصر يستغرق عادة أقل من ثلاث دقائق. لا يوجد حد أدنى للمتابعين؛ الأهم هو الصلة والثقة.")}</p>
                    <form onSubmit={submit}>
                      <div className="amb-form-grid">
                        <div className="amb-field"><label htmlFor="amb-name">{ui("Name", "الاسم")}</label><input id="amb-name" required maxLength="80" autoComplete="name" value={form.name} onChange={e => update("name",e.target.value)} /></div>
                        <div className="amb-field"><label htmlFor="amb-email">{ui("Email", "البريد الإلكتروني")}</label><input id="amb-email" required type="email" maxLength="160" autoComplete="email" value={form.email} onChange={e => update("email",e.target.value)} /></div>
                        <div className="amb-field"><label htmlFor="amb-channel">{ui("Primary channel", "القناة الرئيسية")}</label><select id="amb-channel" required value={form.channel} onChange={e => update("channel",e.target.value)}><option value="">{ui("Choose one", "اختر قناة")}</option><option value="YouTube">YouTube</option><option value="TikTok">TikTok</option><option value="Instagram">Instagram</option><option value="LinkedIn">LinkedIn</option><option value="Newsletter">{ui("Newsletter", "نشرة بريدية")}</option><option value="Community">{ui("Community", "مجتمع")}</option><option value="Consulting">{ui("Consulting", "استشارات")}</option><option value="Other">{ui("Other", "أخرى")}</option></select></div>
                        <div className="amb-field"><label htmlFor="amb-size">{ui("Audience size", "حجم الجمهور")}</label><select id="amb-size" required value={form.audienceSize} onChange={e => update("audienceSize",e.target.value)}><option value="">{ui("Choose a range", "اختر نطاقًا")}</option><option value="under_1k">{ui("Under 1,000", "أقل من 1,000")}</option><option value="1k_5k">1,000–5,000</option><option value="5k_25k">5,000–25,000</option><option value="25k_plus">25,000+</option></select></div>
                        <div className="amb-field full"><label htmlFor="amb-url">{ui("Profile, channel or community URL", "رابط الحساب أو القناة أو المجتمع")}</label><input id="amb-url" required type="url" maxLength="300" placeholder="https://" value={form.profileUrl} onChange={e => update("profileUrl",e.target.value)} /></div>
                        <div className="amb-field"><label htmlFor="amb-language">{ui("Content language(s)", "لغة أو لغات المحتوى")}</label><input id="amb-language" required maxLength="100" placeholder={ui("e.g. English, Arabic", "مثل: العربية، الإنجليزية")} value={form.languages} onChange={e => update("languages",e.target.value)} /></div>
                        <div className="amb-field"><label htmlFor="amb-country">{ui("Country / market", "البلد / السوق")}</label><input id="amb-country" required maxLength="80" autoComplete="country-name" value={form.country} onChange={e => update("country",e.target.value)} /></div>
                        <div className="amb-field full"><label htmlFor="amb-why">{ui("Why is Fatūra Pro relevant to your audience?", "لماذا يناسب Fatūra Pro جمهورك؟")}</label><textarea id="amb-why" required minLength="40" maxLength="1000" placeholder={ui("Tell us who you help and what kind of useful content or resource you would create.", "عرّفنا بمن تساعد ونوع المحتوى أو المورد المفيد الذي ستنشئه.")} value={form.motivation} onChange={e => update("motivation",e.target.value)} /></div>
                        <div className="amb-honeypot" aria-hidden="true"><label htmlFor="amb-website">Website</label><input id="amb-website" tabIndex="-1" autoComplete="off" value={form.website} onChange={e => update("website",e.target.value)} /></div>
                      </div>
                      <button className="amb-submit" type="submit" disabled={status === "submitting"}>{status === "submitting" ? ui("Sending application…", "جارٍ إرسال الطلب…") : ui("Submit application →", "إرسال الطلب ←")}</button>
                      {error && <div className="amb-error" role="alert">{error}</div>}
                      <div className="amb-form-note">{ui("By submitting, you agree that Fatūra Pro may contact you about this ambassador application. No marketing list is created from this form.", "بإرسال الطلب، توافق على أن يتواصل معك Fatūra Pro بشأن طلب السفراء. لا ننشئ قائمة تسويقية من هذا النموذج.")} <a href="/privacy" style={{ color:"#8f8a84" }}>{ui("Privacy", "الخصوصية")}</a> · <a href="/ambassador-terms" style={{ color:"#8f8a84" }}>{ui("Program terms", "شروط البرنامج")}</a>.</div>
                    </form>
                  </>
                )}
              </div>
            </aside>
          </div>
        </section>

        <section className="amb-secondary">
          <div className="amb-wrap">
            <div className="amb-section-head"><div className="amb-section-tag">{ui("A deliberate first cohort", "دفعة أولى مختارة بعناية")}</div><h2 className="amb-section-title">{ui("From application to useful, measurable partnership.", "من الطلب إلى شراكة مفيدة وقابلة للقياس.")}</h2></div>
            <div className="amb-path">
              <article className="amb-step"><div className="amb-step-num">01</div><h3>{ui("Show us your audience", "عرّفنا بجمهورك")}</h3><p>{ui("Tell us who you help, where you publish and why invoicing is relevant to their work.", "أخبرنا بمن تساعد وأين تنشر ولماذا تهم الفوترة في عملهم.")}</p></article>
              <article className="amb-step"><div className="amb-step-num">02</div><h3>{ui("We review the fit", "نراجع مدى التوافق")}</h3><p>{ui("We review content quality and audience relevance. Standard terms apply automatically unless your written approval includes a custom offer.", "نراجع جودة المحتوى وصلته بالجمهور. تُطبّق الشروط القياسية تلقائيًا ما لم تتضمن موافقتك المكتوبة عرضًا مخصصًا.")}</p></article>
              <article className="amb-step"><div className="amb-step-num">03</div><h3>{ui("Receive your link & dashboard", "استلم رابطك ولوحتك")}</h3><p>{ui("See aggregate clicks, sign-ups, paying customers, pending commission and completed payouts.", "تابع إجمالي النقرات والتسجيلات والعملاء المدفوعين والعمولات والمدفوعات المكتملة.")}</p></article>
              <article className="amb-step"><div className="amb-step-num">04</div><h3>{ui("Get paid automatically", "استلم عمولتك تلقائيًا")}</h3><p>{ui("Connect Stripe once. Eligible commission is transferred after the holding period and stops automatically at the customer term shown in your dashboard.", "اربط Stripe مرة واحدة. تُحوّل العمولة المؤهلة بعد فترة الانتظار وتتوقف تلقائيًا عند نهاية مدة العميل الموضحة في لوحتك.")}</p></article>
            </div>
          </div>
        </section>
      </main>

      <footer className="amb-footer"><div className="amb-wrap"><span>© 2026 Fatūra Pro · {ui("Founding Ambassador Circle", "دائرة السفراء المؤسسين")}</span><span><a href="/ambassador-terms">{ui("Program terms", "شروط البرنامج")}</a> · <a href="/privacy">{ui("Privacy", "الخصوصية")}</a> · <a href="mailto:support@faturapro.app">{ui("Questions?", "لديك سؤال؟")}</a></span></div></footer>
    </div>
  );
}
