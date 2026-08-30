import { useEffect, useState } from "react";

const GOLD = "#c9a84c";
const GOLD_L = "#e8c97a";
const BG = "#08080e";
const TEXT = "#e8e4dc";
const MUTED = "#9a9690";
const CARD = "#111118";
const BORDER = "rgba(255,255,255,0.08)";

/* ─── SCRIPT DATA ──────────────────────────────────────────────
   Placeholders in [brackets] are meant to be replaced by the user. */

const STAGES = [
  { key: "heads-up", label: "3 days before due", tone: "Heads-up", color: "#7aa7c9" },
  { key: "due-today", label: "On the due date", tone: "Due today", color: "#c9a84c" },
  { key: "polite", label: "3 days overdue", tone: "Polite", color: "#c9a84c" },
  { key: "firm", label: "14 days overdue", tone: "Firm", color: "#d98b45" },
  { key: "final", label: "30 days overdue", tone: "Final notice", color: "#e05555" },
];

const SCRIPTS = {
  en: {
    email: {
      "heads-up": {
        subject: "Invoice [Invoice number] — due [Due date]",
        body: `Hi [Client name],

A quick heads-up that invoice [Invoice number] for [Amount] is due on [Due date].

You can pay it directly here: [Payment link]

If anything on the invoice needs changing before then, just let me know.

Best regards,
[Your name]`,
      },
      "due-today": {
        subject: "Invoice [Invoice number] is due today",
        body: `Hi [Client name],

Invoice [Invoice number] for [Amount] is due today.

You can settle it here: [Payment link]

If the payment is already on its way, please ignore this message — and thank you.

Best regards,
[Your name]`,
      },
      polite: {
        subject: "Friendly reminder — invoice [Invoice number]",
        body: `Hi [Client name],

A friendly reminder that invoice [Invoice number] for [Amount] was due on [Due date] and is still showing as unpaid on my side.

If it is already scheduled, could you let me know the payment date? And if something is holding it up, tell me and we will sort it out.

Payment link: [Payment link]

Thanks a lot,
[Your name]`,
      },
      firm: {
        subject: "Overdue — invoice [Invoice number] ([Days] days)",
        body: `Hi [Client name],

Invoice [Invoice number] for [Amount] is now [Days] days overdue. I have not received the payment or a payment date.

Please arrange payment within 5 business days, by [New deadline] at the latest. If there is a problem with the invoice itself, let me know today and I will correct it immediately.

Payment link: [Payment link]

Best regards,
[Your name]`,
      },
      final: {
        subject: "Final notice — invoice [Invoice number]",
        body: `Dear [Client name],

This is a final notice regarding invoice [Invoice number] for [Amount], now [Days] days overdue and unpaid despite my reminders of [Dates of previous reminders].

Please pay the full amount within 7 days, by [Final deadline]. If payment has not been received by that date, I will hand the invoice over for collection and claim the statutory late-payment interest and recovery costs I am entitled to.

I would much rather settle this directly with you. Payment link: [Payment link]

Regards,
[Your name]`,
      },
    },
    whatsapp: {
      "heads-up": { body: `Hi [Client name], quick heads-up — invoice [Invoice number] ([Amount]) is due on [Due date]. Here is the link if that is easier: [Payment link]. Let me know if anything needs changing.` },
      "due-today": { body: `Hi [Client name], invoice [Invoice number] ([Amount]) is due today. You can pay here: [Payment link]. If it is already on its way, please ignore this — thank you!` },
      polite: { body: `Hi [Client name], friendly reminder that invoice [Invoice number] ([Amount]) was due on [Due date] and is still open on my side. Could you let me know when it will be paid? Link: [Payment link]. Thank you!` },
      firm: { body: `Hi [Client name], invoice [Invoice number] ([Amount]) is now [Days] days overdue. Could you arrange payment within 5 business days? If something is wrong with the invoice, tell me today and I will fix it. Link: [Payment link]` },
      final: { body: `Dear [Client name], final notice: invoice [Invoice number] ([Amount]) is [Days] days overdue. Please pay in full within 7 days. After that I will pass it to collection with statutory interest and recovery costs. Payment link: [Payment link]` },
    },
  },

  nl: {
    email: {
      "heads-up": {
        subject: "Factuur [Factuurnummer] — vervalt op [Vervaldatum]",
        body: `Beste [Klantnaam],

Even een vriendelijke herinnering vooraf: factuur [Factuurnummer] van [Bedrag] vervalt op [Vervaldatum].

U kunt direct betalen via deze link: [Betaallink]

Als er nog iets aangepast moet worden aan de factuur, hoor ik het graag.

Met vriendelijke groet,
[Uw naam]`,
      },
      "due-today": {
        subject: "Factuur [Factuurnummer] vervalt vandaag",
        body: `Beste [Klantnaam],

Factuur [Factuurnummer] van [Bedrag] vervalt vandaag.

U kunt deze hier voldoen: [Betaallink]

Is de betaling al onderweg? Dan kunt u dit bericht negeren — en alvast bedankt.

Met vriendelijke groet,
[Uw naam]`,
      },
      polite: {
        subject: "Vriendelijke herinnering — factuur [Factuurnummer]",
        body: `Beste [Klantnaam],

Een vriendelijke herinnering: factuur [Factuurnummer] van [Bedrag] was verschuldigd op [Vervaldatum] en staat bij mij nog open.

Is de betaling al ingepland? Laat u mij dan de betaaldatum weten? En als er iets in de weg staat, hoor ik het graag zodat we het kunnen oplossen.

Betaallink: [Betaallink]

Hartelijk dank,
[Uw naam]`,
      },
      firm: {
        subject: "Betalingsachterstand — factuur [Factuurnummer] ([Dagen] dagen)",
        body: `Beste [Klantnaam],

Factuur [Factuurnummer] van [Bedrag] is inmiddels [Dagen] dagen te laat. Ik heb nog geen betaling of betaaldatum ontvangen.

Gelieve de betaling binnen 5 werkdagen te voldoen, uiterlijk op [Nieuwe deadline]. Klopt er iets niet aan de factuur, laat het mij vandaag weten en ik pas het direct aan.

Betaallink: [Betaallink]

Met vriendelijke groet,
[Uw naam]`,
      },
      final: {
        subject: "Laatste aanmaning — factuur [Factuurnummer]",
        body: `Geachte [Klantnaam],

Dit is een laatste aanmaning voor factuur [Factuurnummer] van [Bedrag], inmiddels [Dagen] dagen te laat en onbetaald ondanks mijn herinneringen van [Data eerdere herinneringen].

Gelieve het volledige bedrag binnen 7 dagen te voldoen, uiterlijk op [Uiterste datum]. Is de betaling dan niet ontvangen, dan draag ik de vordering over ter incasso en breng ik de wettelijke rente en incassokosten in rekening.

Ik regel dit liever rechtstreeks met u. Betaallink: [Betaallink]

Met vriendelijke groet,
[Uw naam]`,
      },
    },
    whatsapp: {
      "heads-up": { body: `Hoi [Klantnaam], even een seintje: factuur [Factuurnummer] ([Bedrag]) vervalt op [Vervaldatum]. Hier is de betaallink als dat makkelijker is: [Betaallink]. Laat maar weten als er iets aangepast moet worden.` },
      "due-today": { body: `Hoi [Klantnaam], factuur [Factuurnummer] ([Bedrag]) vervalt vandaag. Betalen kan hier: [Betaallink]. Is de betaling al onderweg? Dan mag je dit negeren — bedankt!` },
      polite: { body: `Hoi [Klantnaam], vriendelijke herinnering: factuur [Factuurnummer] ([Bedrag]) was verschuldigd op [Vervaldatum] en staat nog open. Kun je laten weten wanneer die betaald wordt? Link: [Betaallink]. Dank je!` },
      firm: { body: `Hoi [Klantnaam], factuur [Factuurnummer] ([Bedrag]) is nu [Dagen] dagen te laat. Kun je de betaling binnen 5 werkdagen regelen? Klopt er iets niet, laat het me vandaag weten en ik pas het aan. Link: [Betaallink]` },
      final: { body: `Geachte [Klantnaam], laatste aanmaning: factuur [Factuurnummer] ([Bedrag]) is [Dagen] dagen te laat. Gelieve binnen 7 dagen volledig te betalen. Daarna draag ik de vordering over ter incasso, met wettelijke rente en incassokosten. Betaallink: [Betaallink]` },
    },
  },

  ar: {
    email: {
      "heads-up": {
        subject: "الفاتورة [رقم الفاتورة] — تستحق في [تاريخ الاستحقاق]",
        body: `مرحباً [اسم العميل]،

تذكير مسبق بأن الفاتورة [رقم الفاتورة] بمبلغ [المبلغ] تستحق في [تاريخ الاستحقاق].

يمكنك الدفع مباشرة عبر هذا الرابط: [رابط الدفع]

وإذا كان هناك ما يحتاج إلى تعديل في الفاتورة قبل ذلك، فأرجو إعلامي.

مع خالص التحية،
[اسمك]`,
      },
      "due-today": {
        subject: "الفاتورة [رقم الفاتورة] مستحقة اليوم",
        body: `مرحباً [اسم العميل]،

الفاتورة [رقم الفاتورة] بمبلغ [المبلغ] مستحقة اليوم.

يمكنك سدادها من هنا: [رابط الدفع]

وإذا كان التحويل قد تم بالفعل، فيرجى تجاهل هذه الرسالة، مع الشكر.

مع خالص التحية،
[اسمك]`,
      },
      polite: {
        subject: "تذكير ودّي — الفاتورة [رقم الفاتورة]",
        body: `مرحباً [اسم العميل]،

تذكير ودّي بأن الفاتورة [رقم الفاتورة] بمبلغ [المبلغ] كانت مستحقة في [تاريخ الاستحقاق] ولا تزال غير مسددة لدينا.

إن كان الدفع مجدولاً، فهل يمكنك إعلامي بالتاريخ المتوقع؟ وإن كان هناك ما يعيق السداد، فأخبرني لنجد حلاً معاً.

رابط الدفع: [رابط الدفع]

شكراً جزيلاً،
[اسمك]`,
      },
      firm: {
        subject: "تأخر السداد — الفاتورة [رقم الفاتورة] ([عدد الأيام] يوماً)",
        body: `مرحباً [اسم العميل]،

الفاتورة [رقم الفاتورة] بمبلغ [المبلغ] متأخرة الآن [عدد الأيام] يوماً، ولم أستلم السداد ولا تاريخاً محدداً للدفع.

أرجو ترتيب السداد خلال 5 أيام عمل، بحد أقصى [الموعد الجديد]. وإذا كان هناك خطأ في الفاتورة نفسها، فأعلمني اليوم وسأصححه فوراً.

رابط الدفع: [رابط الدفع]

مع التحية،
[اسمك]`,
      },
      final: {
        subject: "إشعار أخير — الفاتورة [رقم الفاتورة]",
        body: `السيد/السيدة [اسم العميل]،

هذا إشعار أخير بخصوص الفاتورة [رقم الفاتورة] بمبلغ [المبلغ]، المتأخرة [عدد الأيام] يوماً وغير المسددة رغم تذكيراتي بتاريخ [تواريخ التذكيرات السابقة].

أرجو سداد كامل المبلغ خلال 7 أيام، بحد أقصى [الموعد النهائي]. وفي حال عدم استلام السداد في هذا الموعد، سأحيل الفاتورة إلى التحصيل مع المطالبة بفوائد التأخير وتكاليف التحصيل المقررة قانوناً.

وأفضّل بالطبع تسوية الأمر مباشرة معك. رابط الدفع: [رابط الدفع]

مع التحية،
[اسمك]`,
      },
    },
    whatsapp: {
      "heads-up": { body: `مرحباً [اسم العميل]، تذكير سريع: الفاتورة [رقم الفاتورة] ([المبلغ]) تستحق في [تاريخ الاستحقاق]. هذا رابط الدفع إن كان أسهل: [رابط الدفع]. وأخبرني إن احتجت أي تعديل.` },
      "due-today": { body: `مرحباً [اسم العميل]، الفاتورة [رقم الفاتورة] ([المبلغ]) مستحقة اليوم. يمكنك الدفع من هنا: [رابط الدفع]. وإن كان التحويل تم بالفعل فتجاهل الرسالة، شكراً لك!` },
      polite: { body: `مرحباً [اسم العميل]، تذكير ودّي بأن الفاتورة [رقم الفاتورة] ([المبلغ]) كانت مستحقة في [تاريخ الاستحقاق] ولا تزال مفتوحة. هل يمكنك إعلامي بموعد السداد؟ الرابط: [رابط الدفع]. شكراً لك!` },
      firm: { body: `مرحباً [اسم العميل]، الفاتورة [رقم الفاتورة] ([المبلغ]) متأخرة الآن [عدد الأيام] يوماً. هل يمكنك ترتيب السداد خلال 5 أيام عمل؟ وإن كان هناك خطأ في الفاتورة فأعلمني اليوم وسأصححه. الرابط: [رابط الدفع]` },
      final: { body: `السيد/السيدة [اسم العميل]، إشعار أخير: الفاتورة [رقم الفاتورة] ([المبلغ]) متأخرة [عدد الأيام] يوماً. أرجو السداد الكامل خلال 7 أيام، وبعدها سأحيلها إلى التحصيل مع فوائد التأخير وتكاليفه. رابط الدفع: [رابط الدفع]` },
    },
  },

  fr: {
    email: {
      "heads-up": {
        subject: "Facture [Numéro de facture] — échéance le [Date d'échéance]",
        body: `Bonjour [Nom du client],

Un petit rappel en amont : la facture [Numéro de facture] d'un montant de [Montant] arrive à échéance le [Date d'échéance].

Vous pouvez la régler directement ici : [Lien de paiement]

Si quelque chose doit être modifié sur la facture d'ici là, dites-le moi.

Cordialement,
[Votre nom]`,
      },
      "due-today": {
        subject: "La facture [Numéro de facture] est due aujourd'hui",
        body: `Bonjour [Nom du client],

La facture [Numéro de facture] d'un montant de [Montant] est due aujourd'hui.

Vous pouvez la régler ici : [Lien de paiement]

Si le paiement est déjà parti, merci d'ignorer ce message.

Cordialement,
[Votre nom]`,
      },
      polite: {
        subject: "Rappel amical — facture [Numéro de facture]",
        body: `Bonjour [Nom du client],

Un rappel amical : la facture [Numéro de facture] d'un montant de [Montant] était due le [Date d'échéance] et apparaît toujours comme impayée de mon côté.

Si le paiement est déjà programmé, pourriez-vous m'indiquer la date ? Et si quelque chose bloque, dites-le moi et nous trouverons une solution.

Lien de paiement : [Lien de paiement]

Merci beaucoup,
[Votre nom]`,
      },
      firm: {
        subject: "Retard de paiement — facture [Numéro de facture] ([Jours] jours)",
        body: `Bonjour [Nom du client],

La facture [Numéro de facture] d'un montant de [Montant] accuse désormais [Jours] jours de retard. Je n'ai reçu ni le paiement, ni une date de règlement.

Merci de procéder au paiement sous 5 jours ouvrés, au plus tard le [Nouvelle échéance]. Si un élément de la facture pose problème, faites-le moi savoir aujourd'hui et je le corrigerai immédiatement.

Lien de paiement : [Lien de paiement]

Cordialement,
[Votre nom]`,
      },
      final: {
        subject: "Mise en demeure — facture [Numéro de facture]",
        body: `Madame, Monsieur [Nom du client],

Ceci constitue un dernier avis concernant la facture [Numéro de facture] d'un montant de [Montant], impayée depuis [Jours] jours malgré mes relances du [Dates des relances].

Merci de régler l'intégralité du montant sous 7 jours, au plus tard le [Échéance finale]. À défaut de paiement à cette date, je confierai la créance au recouvrement et réclamerai les intérêts de retard ainsi que les frais de recouvrement prévus par la loi.

Je préfère de loin régler cela directement avec vous. Lien de paiement : [Lien de paiement]

Cordialement,
[Votre nom]`,
      },
    },
    whatsapp: {
      "heads-up": { body: `Bonjour [Nom du client], petit rappel : la facture [Numéro de facture] ([Montant]) arrive à échéance le [Date d'échéance]. Voici le lien si c'est plus simple : [Lien de paiement]. Dites-moi si quelque chose doit être modifié.` },
      "due-today": { body: `Bonjour [Nom du client], la facture [Numéro de facture] ([Montant]) est due aujourd'hui. Règlement possible ici : [Lien de paiement]. Si le paiement est déjà parti, merci d'ignorer ce message !` },
      polite: { body: `Bonjour [Nom du client], rappel amical : la facture [Numéro de facture] ([Montant]) était due le [Date d'échéance] et reste impayée. Pourriez-vous m'indiquer la date de règlement ? Lien : [Lien de paiement]. Merci !` },
      firm: { body: `Bonjour [Nom du client], la facture [Numéro de facture] ([Montant]) a [Jours] jours de retard. Pouvez-vous procéder au paiement sous 5 jours ouvrés ? Si un élément pose problème, dites-le moi aujourd'hui. Lien : [Lien de paiement]` },
      final: { body: `Madame, Monsieur [Nom du client], dernier avis : la facture [Numéro de facture] ([Montant]) accuse [Jours] jours de retard. Merci de régler sous 7 jours ; à défaut, la créance sera confiée au recouvrement avec intérêts et frais. Lien de paiement : [Lien de paiement]` },
    },
  },
};

const LANGS = [
  { code: "en", label: "English", dir: "ltr" },
  { code: "nl", label: "Nederlands", dir: "ltr" },
  { code: "ar", label: "العربية", dir: "rtl" },
  { code: "fr", label: "Français", dir: "ltr" },
];

const FAQ = [
  {
    q: "How long should I wait before chasing an unpaid invoice?",
    a: "Do not wait. Send a short heads-up three days before the due date, a reminder on the due date itself, and a polite chase three days after. Most late payments are not refusals — they are invoices sitting unopened in an inbox. The freelancers who get paid fastest are the ones who follow a fixed schedule instead of deciding, invoice by invoice, whether it feels too pushy.",
  },
  {
    q: "Can I charge interest on a late invoice?",
    a: "In the European Union, business-to-business contracts fall under the Late Payment Directive (2011/7/EU), which gives you a right to statutory interest and a fixed minimum compensation for recovery costs once payment is late — even when your contract says nothing about it. Rules and rates differ per country and the situation is different for consumer clients, so check what applies where you are registered. This page is practical guidance, not legal advice.",
  },
  {
    q: "What do I do if the client ignores every message?",
    a: "Escalate through channels rather than repeating the same one. Move from email to WhatsApp or a phone call, then address the final notice to the person who signs off payments rather than your day-to-day contact. If the final notice deadline passes, your options are a collection agency, a formal demand letter, or small claims court, depending on the amount and your country.",
  },
  {
    q: "Should I stop working while an invoice is unpaid?",
    a: "Pausing work is legitimate leverage, but say it before it happens rather than after: state in the firm reminder that new work is on hold until the outstanding invoice is settled. Announcing it in advance keeps it a business decision rather than a punishment, and it is far more effective than a fourth polite reminder.",
  },
  {
    q: "Is it rude to send a payment reminder?",
    a: "No. You are following up on an agreement, not asking for a favour. Keep the tone neutral, never apologise for sending it, and never bury the ask in three paragraphs of small talk. A short message that names the invoice, the amount and the date reads as professional; a long apologetic one signals that the deadline is negotiable.",
  },
];

/* ─── UI ────────────────────────────────────────────────────── */

function ScriptCard({ stage, script, channel, dir }) {
  const [copied, setCopied] = useState(false);
  const text = (script.subject ? script.subject + "\n\n" : "") + script.body;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div style={{ background: CARD, border: "1px solid " + BORDER, borderLeft: "3px solid " + stage.color, borderRadius: 12, padding: "18px 20px", marginBottom: 18 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 600, color: TEXT }}>{stage.tone}</div>
          <div style={{ fontSize: 12.5, color: MUTED, marginTop: 2 }}>{stage.label} · {channel === "email" ? "Email" : "WhatsApp"}</div>
        </div>
        <button
          onClick={copy}
          style={{ background: copied ? "transparent" : GOLD, color: copied ? GOLD : "#14110a", border: copied ? "1px solid " + GOLD : "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "DM Sans, sans-serif", whiteSpace: "nowrap" }}
        >
          {copied ? "Copied ✓" : "Copy"}
        </button>
      </div>

      {script.subject && (
        <div dir={dir} style={{ fontSize: 13.5, color: TEXT, background: "rgba(255,255,255,0.03)", border: "1px solid " + BORDER, borderRadius: 8, padding: "9px 12px", marginBottom: 10, textAlign: dir === "rtl" ? "right" : "left" }}>
          <span style={{ color: MUTED }}>Subject: </span>{script.subject}
        </div>
      )}

      <div dir={dir} style={{ whiteSpace: "pre-wrap", fontSize: 14, lineHeight: 1.75, color: TEXT, textAlign: dir === "rtl" ? "right" : "left" }}>
        {script.body}
      </div>
    </div>
  );
}

function Section({ title, children, id }) {
  return (
    <div id={id} style={{ marginBottom: 52 }}>
      <h2 style={{ fontSize: 23, color: GOLD, marginBottom: 14, fontFamily: "Playfair Display, serif", lineHeight: 1.3 }}>{title}</h2>
      {children}
    </div>
  );
}

function P({ children }) {
  return <p style={{ lineHeight: 1.85, color: MUTED, marginBottom: 14, fontSize: 15 }}>{children}</p>;
}

export default function LatePaymentScripts() {
  const [lang, setLang] = useState("en");
  const [channel, setChannel] = useState("email");

  useEffect(() => {
    document.title = "Late Payment Scripts — Free Copy-Paste Templates to Chase Unpaid Invoices | Fatūra Pro";

    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute(
        "content",
        "Free copy-paste scripts to chase late payments: five escalation stages from a friendly heads-up to a final notice, for email and WhatsApp, in English, Dutch, Arabic and French. No signup required."
      );
    }

    let canon = document.querySelector("link[rel=canonical]");
    if (!canon) {
      canon = document.createElement("link");
      canon.setAttribute("rel", "canonical");
      document.head.appendChild(canon);
    }
    canon.setAttribute("href", "https://faturapro.app/late-payment-scripts");

    const sc = document.createElement("script");
    sc.type = "application/ld+json";
    sc.id = "late-payment-faq-schema";
    sc.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQ.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    });
    document.head.appendChild(sc);

    return () => {
      const old = document.getElementById("late-payment-faq-schema");
      if (old) old.remove();
    };
  }, []);

  const dir = LANGS.find((l) => l.code === lang).dir;
  const set = SCRIPTS[lang][channel];

  const tab = (active) => ({
    background: active ? GOLD : "transparent",
    color: active ? "#14110a" : MUTED,
    border: "1px solid " + (active ? GOLD : BORDER),
    borderRadius: 8,
    padding: "8px 15px",
    fontSize: 13.5,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "DM Sans, sans-serif",
  });

  return (
    <div style={{ minHeight: "100vh", background: BG, color: TEXT, fontFamily: "DM Sans, sans-serif" }}>
      <div style={{ maxWidth: 820, margin: "0 auto", padding: "56px 24px 100px" }}>
        <a href="/" style={{ color: GOLD, fontSize: 13, textDecoration: "none", display: "inline-block", marginBottom: 30 }}>← Back to Fatūra Pro</a>

        <div style={{ display: "inline-block", background: "rgba(201,168,76,0.12)", border: "1px solid rgba(201,168,76,0.3)", color: GOLD_L, borderRadius: 999, padding: "5px 13px", fontSize: 12, fontWeight: 600, letterSpacing: 0.4, marginBottom: 18 }}>
          Free toolkit · no signup, no email required
        </div>

        <h1 style={{ fontFamily: "Playfair Display, serif", fontSize: 40, marginBottom: 14, lineHeight: 1.18 }}>
          Late payment scripts that get you paid
        </h1>

        <p style={{ color: MUTED, fontSize: 16.5, lineHeight: 1.8, marginBottom: 30 }}>
          Chasing money is the worst part of working for yourself — mostly because writing the message is harder than sending it. Below are the exact messages, from a friendly heads-up before the due date to a final notice at thirty days. Copy one, replace the details in brackets, send. Available for email and WhatsApp, in four languages.
        </p>

        <div style={{ background: CARD, border: "1px solid " + BORDER, borderRadius: 12, padding: "18px 20px", marginBottom: 44 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: TEXT, marginBottom: 10 }}>The escalation ladder</div>
          <div style={{ fontSize: 14, color: MUTED, lineHeight: 1.9 }}>
            One message is a reminder. A sequence is a system. Each stage below is firmer than the last, and the deadline gets shorter — that pattern is what makes a client move you up their payment queue. Send every stage from the same email thread so the history is visible in one place.
          </div>
        </div>

        {/* controls */}
        <div style={{ position: "sticky", top: 0, background: BG, paddingTop: 12, paddingBottom: 14, zIndex: 10, marginBottom: 6, borderBottom: "1px solid " + BORDER }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
            {LANGS.map((l) => (
              <button key={l.code} onClick={() => setLang(l.code)} style={tab(lang === l.code)}>{l.label}</button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {[["email", "Email"], ["whatsapp", "WhatsApp"]].map(([c, label]) => (
              <button key={c} onClick={() => setChannel(c)} style={tab(channel === c)}>{label}</button>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 26, marginBottom: 44 }}>
          {lang === "fr" && (
            <div style={{ background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.26)", borderRadius: 10, padding: "14px 16px", marginBottom: 20, color: MUTED, fontSize: 14, lineHeight: 1.7 }}>
              Besoin d'explications en français&nbsp;? Consultez le guide complet avec cinq <a href="/fr/relance-facture-impayee-anglais" style={{ color: GOLD_L, fontWeight: 600 }}>modèles de relance pour facture impayée en anglais</a>.
            </div>
          )}
          {STAGES.map((s) => (
            <ScriptCard key={s.key} stage={s} script={set[s.key]} channel={channel} dir={dir} />
          ))}
        </div>

        {/* CTA */}
        <div style={{ background: "linear-gradient(135deg, rgba(201,168,76,0.14), rgba(201,168,76,0.04))", border: "1px solid rgba(201,168,76,0.3)", borderRadius: 14, padding: "26px 24px", marginBottom: 52 }}>
          <div style={{ fontFamily: "Playfair Display, serif", fontSize: 22, color: TEXT, marginBottom: 10 }}>Or let Fatūra send them for you</div>
          <div style={{ fontSize: 14.5, color: MUTED, lineHeight: 1.8, marginBottom: 18 }}>
            Fatūra Pro tracks which invoices have passed their due date and has these reminders built in — polite, firm and final, by email or WhatsApp, in the language your client speaks. It also logs which reminders you already sent, so the final notice can say so with confidence. Free plan, no credit card.
          </div>
          <a href="/login" style={{ display: "inline-block", background: GOLD, color: "#14110a", borderRadius: 9, padding: "13px 26px", fontSize: 15, fontWeight: 600, textDecoration: "none" }}>
            Start free — no card required →
          </a>
          <div style={{ fontSize: 12.5, color: MUTED, marginTop: 12 }}>
            Or <a href="/invoice-generator" style={{ color: GOLD_L }}>make an invoice right now</a> without an account.
          </div>
        </div>

        <Section title="When to send each message" id="timeline">
          <P>
            The dates below are a default, not a rule — shorten every step if the amount is large or the client is new, and never let the gap between two messages be longer than the previous one. Silence is what teaches a client that your deadline is soft.
          </P>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
              <thead>
                <tr>
                  {["When", "Message", "Channel", "What it does"].map((h) => (
                    <th key={h} style={{ textAlign: "left", padding: "10px 12px", borderBottom: "1px solid " + BORDER, color: GOLD, fontWeight: 600, whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ["3 days before", "Heads-up", "Email", "Puts the invoice back on top of the inbox before it is late"],
                  ["Due date", "Due today", "Email", "Removes the excuse of not knowing the date"],
                  ["+3 days", "Polite", "Email", "Asks for a payment date, not just payment"],
                  ["+14 days", "Firm", "Email + WhatsApp", "Sets a new deadline and offers to fix any invoice problem"],
                  ["+30 days", "Final notice", "Email + WhatsApp", "States the consequence and the last date to avoid it"],
                ].map((row) => (
                  <tr key={row[0]}>
                    {row.map((cell, i) => (
                      <td key={i} style={{ padding: "10px 12px", borderBottom: "1px solid rgba(255,255,255,0.05)", color: i === 1 ? TEXT : MUTED, verticalAlign: "top" }}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Section title="Six things that get you paid faster than any script">
          {[
            ["Put the payment terms on the invoice itself", "Not in the contract, not in an email from three weeks ago. A due date, an amount, and how to pay — visible without scrolling."],
            ["Send the invoice the day the work is delivered", "An invoice that arrives a week late signals that the deadline on it is decorative."],
            ["Make paying one click", "Every extra step — a bank app, an IBAN typed by hand, a login — is a day of delay. A payment link on the invoice removes most of them."],
            ["Send reminders on Tuesday morning", "Monday inboxes get triaged and Friday requests get postponed to the following week."],
            ["Name a date, not a feeling", "\"As soon as possible\" is not a deadline. \"Within 5 business days, by the 14th\" is."],
            ["Never apologise for asking", "\"Sorry to bother you about this\" tells the client the invoice is a favour. It is not — it is an agreement they already accepted."],
          ].map(([t, d]) => (
            <div key={t} style={{ display: "flex", gap: 14, marginBottom: 16 }}>
              <div style={{ color: GOLD, fontSize: 18, lineHeight: 1.4 }}>·</div>
              <div>
                <div style={{ fontSize: 15, color: TEXT, fontWeight: 600, marginBottom: 4 }}>{t}</div>
                <div style={{ fontSize: 14.5, color: MUTED, lineHeight: 1.8 }}>{d}</div>
              </div>
            </div>
          ))}
        </Section>

        <Section title="Questions freelancers ask about late payments" id="faq">
          {FAQ.map((f) => (
            <div key={f.q} style={{ marginBottom: 22 }}>
              <div style={{ fontSize: 15.5, color: TEXT, fontWeight: 600, marginBottom: 7 }}>{f.q}</div>
              <div style={{ fontSize: 14.5, color: MUTED, lineHeight: 1.85 }}>{f.a}</div>
            </div>
          ))}
          <div style={{ fontSize: 12.5, color: "#5a5750", lineHeight: 1.8, marginTop: 22, borderTop: "1px solid " + BORDER, paddingTop: 16 }}>
            These scripts and notes are practical guidance from everyday invoicing, not legal advice. Rules on interest, recovery costs and formal demand letters differ per country — check what applies where your business is registered before relying on the final notice.
          </div>
        </Section>

        <div style={{ textAlign: "center", borderTop: "1px solid " + BORDER, paddingTop: 32 }}>
          <div style={{ fontSize: 15, color: TEXT, marginBottom: 14 }}>Stop writing these messages by hand.</div>
          <a href="/login" style={{ display: "inline-block", background: GOLD, color: "#14110a", borderRadius: 9, padding: "13px 28px", fontSize: 15, fontWeight: 600, textDecoration: "none" }}>
            Try Fatūra Pro free →
          </a>
          <div style={{ marginTop: 26, fontSize: 13 }}>
            <a href="/blog" style={{ color: MUTED, textDecoration: "none", marginRight: 16 }}>Invoicing guides</a>
            <a href="/invoice-generator" style={{ color: MUTED, textDecoration: "none", marginRight: 16 }}>Free invoice generator</a>
            <a href="/" style={{ color: MUTED, textDecoration: "none" }}>Home</a>
          </div>
        </div>
      </div>
    </div>
  );
}
