import { useEffect, useMemo, useState } from "react";
import { connectAmbassadorPayout, fetchAmbassadorSummary } from "../lib/ambassadors";
import { getLocale, localeHome } from "../lib/locale";

const CSS = `
  .apage{min-height:100vh;background:#08080e;color:#e8e4dc;font-family:'DM Sans',sans-serif}.awrap{width:min(100% - 32px,1100px);margin:auto}.anav{height:74px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(255,255,255,.07)}.abrand{display:flex;align-items:center;gap:10px;color:#e8e4dc;text-decoration:none;font-family:'Playfair Display',serif;font-size:20px;font-weight:700}.abrand img{width:29px;height:29px}.anav a:last-child{color:#9a9690;text-decoration:none;font-size:12px}.amain{padding:48px 0 90px}.akicker{color:#6366F1;font-size:10px;font-weight:800;letter-spacing:1.8px;text-transform:uppercase}.atitle{font:700 clamp(34px,5vw,54px)/1.08 'Playfair Display',serif;margin:12px 0 9px}.asub{color:#97928b;font-size:14px;line-height:1.7}.atop{display:flex;justify-content:space-between;gap:30px;align-items:flex-end;margin-bottom:32px}.astatus{padding:8px 12px;border:1px solid rgba(90,196,147,.28);border-radius:99px;background:rgba(90,196,147,.08);color:#72c7a4;font-size:11px;font-weight:800;text-transform:capitalize}.agrid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}.acard{border:1px solid rgba(255,255,255,.08);border-radius:15px;background:#111118;padding:20px}.alabel{color:#77726c;font-size:10px;font-weight:800;letter-spacing:.8px;text-transform:uppercase}.avalue{font:700 31px/1.2 'Playfair Display',serif;color:#e8e4dc;margin-top:8px}.acard.gold .avalue{color:#7C6CF2}.asection{margin-top:24px;border:1px solid rgba(255,255,255,.08);border-radius:17px;background:#111118;padding:24px}.asection h2{font:700 23px 'Playfair Display',serif;margin:0 0 7px}.asection p{color:#8f8a84;font-size:12px;line-height:1.7}.alinkrow{display:flex;gap:10px;margin-top:18px}.alink{min-width:0;flex:1;padding:12px 14px;border:1px solid rgba(99,102,241,.24);border-radius:9px;background:#0b0b11;color:#bdb7ad;font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.abtn{border:0;border-radius:9px;background:#6366F1;color:#09090d;padding:12px 17px;font:800 12px 'DM Sans',sans-serif;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center;justify-content:center}.abtn.secondary{border:1px solid rgba(255,255,255,.12);background:transparent;color:#d9d4cc}.abtn:disabled{opacity:.5;cursor:not-allowed}.aterms{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;margin-top:19px;border:1px solid rgba(255,255,255,.08);border-radius:12px;overflow:hidden;background:rgba(255,255,255,.08)}.aterms>div{background:#0d0d14;padding:16px}.aterms strong{display:block;color:#e8e4dc;font-size:15px;margin-bottom:4px}.aterms span{color:#77726c;font-size:10px}.anotice{margin-top:16px;padding:13px 15px;border-inline-start:2px solid #6366F1;background:rgba(99,102,241,.06);color:#aaa49b;font-size:11px;line-height:1.6}.aempty{max-width:620px;margin:70px auto;padding:40px;border:1px solid rgba(255,255,255,.08);border-radius:18px;background:#111118;text-align:center}.aempty h1{font:700 35px 'Playfair Display',serif}.aempty p{color:#918c85;line-height:1.7}.aerror{margin:20px 0;padding:12px;border:1px solid rgba(225,86,86,.28);border-radius:9px;color:#ef9999;background:rgba(225,86,86,.07);font-size:12px}.apayouts{width:100%;border-collapse:collapse;margin-top:14px}.apayouts th,.apayouts td{padding:11px 8px;border-bottom:1px solid rgba(255,255,255,.07);text-align:left;font-size:11px}.apage[dir="rtl"] .apayouts th,.apage[dir="rtl"] .apayouts td{text-align:right}.apayouts th{color:#77726c;text-transform:uppercase;letter-spacing:.6px}.apayouts td{color:#bcb6ad}.apayouts td:last-child{text-transform:capitalize}.aload{min-height:65vh;display:flex;align-items:center;justify-content:center;color:#8f8a84}@media(max-width:760px){.agrid{grid-template-columns:1fr 1fr}.atop{align-items:flex-start;flex-direction:column}.aterms{grid-template-columns:1fr}.alinkrow{flex-direction:column}}@media(max-width:440px){.agrid{grid-template-columns:1fr}.amain{padding-top:34px}}
`;

function euros(cents) {
  return new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR" }).format(Number(cents || 0) / 100);
}

function date(value, locale = "en") {
  if (!value) return locale === "ar" ? "لا توجد نهاية ثابتة" : "No fixed end";
  return new Date(value).toLocaleDateString(locale === "ar" ? "ar" : "en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function statusText(value, locale = "en") {
  if (locale !== "ar") return value;
  return ({ pending:"قيد الانتظار", reviewing:"قيد المراجعة", approved:"مقبول", active:"نشط", paused:"متوقف مؤقتًا", rejected:"مرفوض", available:"جاهز", processing:"قيد المعالجة", paid:"مدفوع", failed:"فشل" })[value] || value;
}

export default function AmbassadorDashboard() {
  const locale = getLocale();
  const ar = locale === "ar";
  const ui = (english, arabic) => ar ? arabic : english;
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

  if (!data && !error) return <div className="apage" dir={ar ? "rtl" : "ltr"} lang={ar ? "ar" : "en"}><style>{CSS}</style><div className="aload">{ui("Loading your ambassador dashboard…", "جارٍ تحميل لوحة السفير…")}</div></div>;
  if (data && !data.approved) return (
    <div className="apage" dir={ar ? "rtl" : "ltr"} lang={ar ? "ar" : "en"}><style>{CSS}</style><header className="awrap anav"><a className="abrand" href={localeHome(locale)}><img src="/fatura-mark.svg" alt="" />Fatūra Pro</a><a href="/app">{ui("Open app →", "فتح التطبيق ←")}</a></header><main className="awrap"><div className="aempty"><div className="akicker">{ui("Ambassador Circle", "دائرة السفراء")}</div><h1>{data.application ? ui("Your application is being reviewed.", "طلبك قيد المراجعة.") : ui("Apply to become an ambassador.", "قدّم لتصبح سفيرًا.")}</h1><p>{data.application ? ui(`Current status: ${data.application.status}. Your decision and agreed terms will appear securely in this dashboard.`, `الحالة الحالية: ${statusText(data.application.status, locale)}. ستظهر نتيجة الطلب والشروط المتفق عليها بأمان في هذه اللوحة.`) : ui("This dashboard becomes available after your application is approved.", "تتوفر هذه اللوحة بعد الموافقة على طلبك.")}</p><a className="abtn" href="/ambassadors">{ui("View the ambassador program →", "عرض برنامج السفراء ←")}</a></div></main></div>
  );

  const earnings = data?.earnings || {};
  return (
    <div className="apage" dir={ar ? "rtl" : "ltr"} lang={ar ? "ar" : "en"} style={{ fontFamily:ar ? "Noto Sans Arabic, Segoe UI, sans-serif" : undefined }}><style>{CSS}</style>
      <header className="awrap anav"><a className="abrand" href={localeHome(locale)}><img src="/fatura-mark.svg" alt="" />Fatūra Pro</a><a href="/app">{ui("Open app →", "فتح التطبيق ←")}</a></header>
      <main className="awrap amain">
        <div className="atop"><div><div className="akicker">{ui("Ambassador dashboard", "لوحة السفير")}</div><h1 className="atitle">{ui("Your reach. Clearly measured.", "أثر وصولك، محسوب بوضوح.")}</h1><p className="asub">{ui("Only real paid subscriptions earn commission. Customer identities stay private.", "تُحتسب العمولة على الاشتراكات المدفوعة الحقيقية فقط، وتبقى هوية العملاء خاصة.")}</p></div><div className="astatus">● {statusText(data.account.status, locale)}</div></div>
        {error && <div className="aerror">{error}</div>}
        <div className="agrid">
          <div className="acard"><div className="alabel">{ui("Link clicks", "نقرات الرابط")}</div><div className="avalue">{data.counts.clicks}</div></div>
          <div className="acard"><div className="alabel">{ui("Sign-ups", "التسجيلات")}</div><div className="avalue">{data.counts.signups}</div></div>
          <div className="acard"><div className="alabel">{ui("Paying customers", "العملاء المدفوعون")}</div><div className="avalue">{data.counts.paying}</div></div>
          <div className="acard gold"><div className="alabel">{ui("Paid to you", "المدفوع لك")}</div><div className="avalue">{euros(data.paidOutCents)}</div></div>
        </div>

        <section className="asection"><h2>{ui("Your tracked link", "رابطك المتتبَّع")}</h2><p>{ui("Share this exact link. Visits, accounts and paid customers will be attributed automatically for 30 days.", "شارك هذا الرابط نفسه. ستُنسب الزيارات والحسابات والعملاء المدفوعون إليك تلقائيًا لمدة 30 يومًا.")}</p><div className="alinkrow"><div className="alink" dir="ltr">{link}</div><button className="abtn" onClick={async () => { await navigator.clipboard.writeText(link); setCopied(true); setTimeout(() => setCopied(false), 1800); }}>{copied ? ui("Copied ✓", "تم النسخ ✓") : ui("Copy link", "نسخ الرابط")}</button></div></section>

        <section className="asection"><h2>{ui("Your automatic commission rules", "قواعد عمولتك التلقائية")}</h2><p>{ui("These are the terms approved for your partnership. The customer’s subscription plan selects the matching rate automatically.", "هذه هي الشروط الموافق عليها لشراكتك. تحدد خطة اشتراك العميل النسبة المناسبة تلقائيًا.")}</p><div className="aterms"><div><strong>{data.account.commissionByPlan?.pro?.commissionPercent ?? 25}%</strong><span>{ui("Eligible Pro subscription revenue, excluding tax", "إيراد اشتراك Pro المؤهل، دون الضريبة")}</span></div><div><strong>{data.account.commissionByPlan?.business?.commissionPercent ?? 35}%</strong><span>{ui("Eligible Business subscription revenue, excluding tax", "إيراد اشتراك Business المؤهل، دون الضريبة")}</span></div><div><strong>{data.account.commissionMonths} {ui("months", "شهرًا")}</strong><span>{ui("From each customer’s first successful paid subscription", "من أول اشتراك مدفوع ناجح لكل عميل")}</span></div></div><div className="anotice">{ui(`After each customer’s first ${data.account.commissionMonths} paid months, future payments create no commission. The stop is automatic. Fatūra Pro can also pause or end a partnership for the reasons in the program terms.`, `بعد أول ${data.account.commissionMonths} شهرًا مدفوعًا لكل عميل، لا تنشئ الدفعات اللاحقة أي عمولة. يتوقف ذلك تلقائيًا، ويمكن لـFatūra Pro إيقاف الشراكة أو إنهاؤها للأسباب الواردة في شروط البرنامج.`)}</div></section>

        <section className="asection"><h2>{ui("Payouts", "المدفوعات")}</h2><p>{ui("Pending", "قيد الانتظار")}: <b>{euros(earnings.pending)}</b> · {ui("Ready", "جاهز")}: <b>{euros(earnings.available)}</b> · {ui("Processing", "قيد المعالجة")}: <b>{euros(earnings.processing)}</b>. {ui(`Automatic transfer starts at ${euros(data.account.payoutThresholdCents)} after the holding period.`, `يبدأ التحويل التلقائي عند بلوغ ${euros(data.account.payoutThresholdCents)} بعد فترة الانتظار.`)}</p>{data.account.recoveryCents > 0 && <div className="anotice">{ui(`A ${euros(data.account.recoveryCents)} payment-reversal or dispute adjustment will be offset against future available commission before the next transfer.`, `سيُخصم تعديل بقيمة ${euros(data.account.recoveryCents)} بسبب عكس دفعة أو نزاع من العمولة المتاحة مستقبلًا قبل التحويل التالي.`)}</div>}<div className="alinkrow">{data.account.payoutConnected ? <><button className="abtn secondary" disabled={busy} onClick={() => stripeAction("dashboard")}>{ui("Open Stripe payout details →", "فتح تفاصيل الدفع في Stripe ←")}</button><span className="astatus">● {ui("Bank payout connected", "تم ربط الدفع البنكي")}</span></> : <button className="abtn" disabled={busy} onClick={() => stripeAction("connect")}>{busy ? ui("Opening Stripe…", "جارٍ فتح Stripe…") : ui("Connect bank payout →", "ربط الدفع البنكي ←")}</button>}</div>
          {data.payouts?.length > 0 && <table className="apayouts"><thead><tr><th>{ui("Date", "التاريخ")}</th><th>{ui("Amount", "المبلغ")}</th><th>{ui("Status", "الحالة")}</th></tr></thead><tbody>{data.payouts.map(row => <tr key={row.id}><td>{date(row.paid_at || row.created_at, locale)}</td><td>{euros(row.amount_cents)}</td><td>{statusText(row.status, locale)}</td></tr>)}</tbody></table>}
        </section>
      </main>
    </div>
  );
}
