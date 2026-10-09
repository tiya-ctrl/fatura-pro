import { useState, useEffect } from "react";
import { trackEvent } from "../lib/tracking";
import { applyPageSeo, suspendBaseSiteSchema } from "../lib/pageSeo";
import { printOnlyCss, printWithTitle } from "../lib/printDocument";
import { CURRENCIES as CURRENCY_GROUPS } from "../lib/currencies";

const INVOICE_ATTRIBUTION_URL = "https://faturapro.app/?utm_source=invoice&utm_medium=footer&utm_campaign=free_invoice_generator";
const URLS = { en: "https://faturapro.app/invoice-generator", nl: "https://faturapro.app/nl/factuur-maken" };
const ALTERNATES = { en: URLS.en, nl: URLS.nl, "x-default": URLS.en };

// The same 18 currencies as the app. Latin symbols are shown as-is; others by their code.
const CURRENCIES = CURRENCY_GROUPS.flatMap((group) => group.items).map((c) => ({
  code: c.value,
  symbol: ["$", "€", "£"].includes(c.symbol) ? c.symbol : c.value,
}));

const h2Style = { fontFamily:"Playfair Display, Georgia, serif", fontSize:24, color:"#6366F1", margin:"44px 0 12px" };
const pStyle = { fontSize:14.5, lineHeight:1.9, color:"rgba(232,228,220,0.75)", margin:"0 0 14px" };
const linkStyle = { color:"#9b8cff" };

function CompareTable({ head, rows }) {
  return (
    <div style={{ overflowX:"auto" }}>
      <table className="gen-table" style={{ width:"100%", borderCollapse:"collapse", fontSize:14, color:"rgba(232,228,220,0.85)" }}>
        <thead><tr><th></th><th>{head[0]}</th><th>{head[1]}</th></tr></thead>
        <tbody>{rows.map((r) => <tr key={r[0]}><td>{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td></tr>)}</tbody>
      </table>
    </div>
  );
}

const COPY = {
  en: {
    locale: "en_US",
    home: "/",
    signup: "/login?signup=1&source=invoice_generator",
    title: "Free Invoice Generator (No Signup) – Download PDF | FaturaPro",
    description: "Make a professional invoice online and download it as a PDF. No signup or email. Add your business and bank details, VAT and line items, in 18 currencies.",
    appName: "FaturaPro Free Invoice Generator",
    crumbHome: "Home",
    crumb: "Free invoice generator",
    otherLang: { href: "/nl/factuur-maken", label: "Nederlands", lang: "nl" },
    h1: "Free Invoice Generator",
    intro: "Create a professional invoice and download it as a PDF: free, no signup, no account needed. Add your business and bank details, your client, line items and VAT, and check the invoice as you build it. Nothing you type is stored.",
    yourName: "Your Name / Business", yourNamePh: "e.g. Sarah Design Studio",
    clientName: "Client Name", clientNamePh: "e.g. Acme BV",
    yourAddress: "Your Address", yourAddressPh: "Street 1\n1011 AB Amsterdam",
    clientAddress: "Client Address", clientAddressPh: "Client street 5\n3011 AA Rotterdam",
    taxId: "Your VAT ID / Company No. (optional)", taxIdPh: "e.g. VAT NL001234567B01 · KVK 12345678",
    number: "Invoice #", date: "Date", due: "Due Date", currency: "Currency", tax: "Tax / VAT %", taxPh: "0",
    items: "Items", itemDesc: "Service description", itemLabel: (i, what) => "Item " + i + " " + what, what: { desc: "description", qty: "quantity", price: "price" },
    removeItem: (i) => "Remove item " + i, addItem: "+ Add Item",
    payment: "Payment Details (optional)", paymentPh: "IBAN NL00 BANK 0123 4567 89\nPlease pay within 30 days",
    notes: "Notes (optional)", notesPh: "e.g. Thank you for your business",
    pYourBusiness: "Your Business", pInvoice: "Invoice", pDate: "Date", pDue: "Due", pBillTo: "Bill To", pClient: "Client Name",
    pDesc: "Description", pQty: "Qty", pAmount: "Amount", pService: "Service", pSubtotal: "Subtotal", pTax: "Tax", pTotal: "Total",
    pPayment: "Payment details", madeWith: "Made with FaturaPro ↗", fileName: "Invoice-",
    download: "Download PDF", downloadHelp: "Opens your browser's print window. Choose \"Save as PDF\" as the destination.",
    ctaTitle: "Invoicing more than once?", ctaText: "A free account keeps your invoices, clients and numbering, adds your logo, and shows who has paid.",
    ctaButton: "Create a free account →", ctaFoot: "No credit card · Free plan: 20 invoices and 5 clients",
    formatDate: (d) => d,
    formatNumber: (n) => n.toFixed(2),
    faqTitle: "Questions",
    faqs: [
      { q: "Is this invoice generator really free?", a: "Yes. You can create and download as many invoices as you like, without an account, an email address or a credit card." },
      { q: "Is my invoice data stored?", a: "No. Everything you type stays in your browser and is not sent to FaturaPro. When you close the page, it is gone, so download the PDF first." },
      { q: "Which currencies can I use?", a: "18 currencies, including EUR, USD, GBP, AED, SAR, TRY and JPY. Amounts are shown in the currency you choose; nothing is converted." },
      { q: "Can I add VAT?", a: "Yes. Enter the VAT or sales tax percentage and the tax and total are calculated for you. For clients in other EU countries you may need to reverse-charge VAT instead; see the guide on invoicing international clients." },
      { q: "Can I edit or resend the invoice later?", a: "Not in the generator, because nothing is saved. With a free FaturaPro account your invoices, clients and numbering are kept, and you can edit, duplicate or correct an invoice with a credit note." },
    ],
    Guide: ({ signup }) => (
      <>
        <h2 style={{ ...h2Style, marginTop:0 }}>How to make an invoice in 4 steps</h2>
        <ol style={{ ...pStyle, paddingLeft:20 }}>
          <li><b>Add your details.</b> Your name or business name, address and, if you are VAT-registered, your VAT ID and company number.</li>
          <li><b>Add your client.</b> Their name and address. For a business client in another EU country, add their VAT ID too.</li>
          <li><b>List the work.</b> One line per service or product with quantity and price. Set the VAT or sales tax percentage; the totals are calculated for you.</li>
          <li><b>Set the terms and download.</b> Give the invoice a number and a due date, add your bank details, then press Download PDF and send it to your client.</li>
        </ol>

        <h2 style={h2Style}>What an invoice should include</h2>
        <p style={pStyle}>Requirements differ per country, but in the EU most invoices need the following. Missing details are a common reason clients pay late.</p>
        <ul style={{ ...pStyle, paddingLeft:20 }}>
          <li>A unique, sequential invoice number and the invoice date</li>
          <li>Your name, address and VAT ID (and company number where required, such as the KVK number in the Netherlands)</li>
          <li>Your client's name and address</li>
          <li>A description of the work, the quantity and the date or period it was done</li>
          <li>The amount excluding VAT, the VAT rate and VAT amount, and the total</li>
          <li>A payment term and how to pay, such as your IBAN</li>
        </ul>
        <p style={pStyle}>For more detail, read <a href="/blog/how-to-create-professional-invoice" style={linkStyle}>how to create a professional invoice</a>, or, if you work in the Netherlands, <a href="/blog/how-to-invoice-zzp-netherlands-english" style={linkStyle}>how to invoice as a ZZP</a>.</p>

        <h2 style={h2Style}>Free generator or free account?</h2>
        <CompareTable head={["This generator", "Free FaturaPro account"]} rows={[
          ["Price", "Free, no signup", "Free, no credit card"],
          ["Invoices", "One at a time, not saved", "20 invoices and 5 clients, saved"],
          ["Numbering", "You type it", "Follows on automatically"],
          ["Logo and branding", "No", "Yes"],
          ["Invoice languages", "English or Dutch", "English, Dutch, French, Spanish, Arabic"],
          ["Corrections", "Make a new PDF", "Credit notes"],
          ["Payment status", "No", "Paid, open and overdue at a glance"],
        ]} />
        <p style={{ ...pStyle, marginTop:14 }}>Paid plans add payment reminders by email and WhatsApp, deposits, UBL/XML export, expenses with receipt scanning and a quarterly VAT summary, and on Advanced also quotes and recurring invoices. <a href="/blog/invoicing-plans-free-vs-pro-vs-business" style={linkStyle}>Compare the plans</a> or <a href={signup} style={linkStyle}>start free</a>.</p>

        <h2 style={h2Style}>Invoicing a client in another country?</h2>
        <p style={pStyle}>Pick the client's currency above, and check whether you should charge VAT: for business clients in other EU countries, VAT is often <a href="/blog/reverse-charge-vat-invoice-btw-verlegd" style={linkStyle}>reverse-charged</a>. The guide on <a href="/blog/how-to-invoice-international-clients" style={linkStyle}>invoicing international clients</a> explains currency, language and VAT step by step. Clients that ask for an e-invoice can be sent a UBL/XML file from a FaturaPro account (<a href="/blog/how-to-create-ubl-invoice-en16931" style={linkStyle}>what UBL is</a>).</p>
      </>
    ),
    after: <>Late payment? Copy a free <a href="/late-payment-scripts" style={linkStyle}>payment reminder template</a>.</>,
  },

  nl: {
    locale: "nl_NL",
    home: "/nl",
    signup: "/login?signup=1&lang=nl&source=invoice_generator_nl",
    title: "Gratis factuur maken online (zonder account) – PDF | FaturaPro",
    description: "Maak gratis een factuur en download hem als PDF. Zonder account of e-mailadres. Met je KVK-nummer, btw-id, IBAN, btw-berekening en 18 valuta.",
    appName: "FaturaPro gratis factuur maken",
    crumbHome: "FaturaPro",
    crumb: "Gratis factuur maken",
    otherLang: { href: "/invoice-generator", label: "English", lang: "en" },
    h1: "Gratis factuur maken",
    intro: "Maak online een nette factuur en download hem als PDF: gratis, zonder account en zonder e-mailadres. Vul je bedrijfsgegevens, je klant, de regels en de btw in en zie de factuur meteen ontstaan. Wat je typt, wordt niet opgeslagen.",
    yourName: "Jouw naam / bedrijfsnaam", yourNamePh: "bijv. Studio Sanne",
    clientName: "Klant", clientNamePh: "bijv. Bakkerij Jansen BV",
    yourAddress: "Jouw adres", yourAddressPh: "Straat 1\n1011 AB Amsterdam",
    clientAddress: "Adres klant", clientAddressPh: "Klantstraat 5\n3011 AA Rotterdam",
    taxId: "KVK-nummer en btw-id", taxIdPh: "bijv. KVK 12345678 · btw-id NL001234567B01",
    number: "Factuurnummer", date: "Factuurdatum", due: "Vervaldatum", currency: "Valuta", tax: "Btw %", taxPh: "21",
    items: "Regels", itemDesc: "Omschrijving", itemLabel: (i, what) => "Regel " + i + " " + what, what: { desc: "omschrijving", qty: "aantal", price: "prijs" },
    removeItem: (i) => "Regel " + i + " verwijderen", addItem: "+ Regel toevoegen",
    payment: "Betaalgegevens (optioneel)", paymentPh: "IBAN NL00 BANK 0123 4567 89\nGraag betalen binnen 30 dagen",
    notes: "Opmerkingen (optioneel)", notesPh: "bijv. Bedankt voor de opdracht",
    pYourBusiness: "Jouw bedrijf", pInvoice: "Factuur", pDate: "Datum", pDue: "Vervaldatum", pBillTo: "Factuur aan", pClient: "Klant",
    pDesc: "Omschrijving", pQty: "Aantal", pAmount: "Bedrag", pService: "Dienst", pSubtotal: "Subtotaal", pTax: "Btw", pTotal: "Totaal",
    pPayment: "Betaalgegevens", madeWith: "Gemaakt met FaturaPro ↗", fileName: "Factuur-",
    download: "Download PDF", downloadHelp: "Opent het printvenster van je browser. Kies \"Opslaan als PDF\".",
    ctaTitle: "Vaker factureren?", ctaText: "Met een gratis account bewaar je facturen en klanten, loopt je nummering vanzelf door, staat je logo erop en zie je wie betaald heeft.",
    ctaButton: "Gratis account maken →", ctaFoot: "Geen creditcard · Gratis plan: 20 facturen en 5 klanten",
    formatDate: (d) => { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(d || ""); return m ? m[3] + "-" + m[2] + "-" + m[1] : d; },
    formatNumber: (n) => n.toLocaleString("nl-NL", { minimumFractionDigits:2, maximumFractionDigits:2 }),
    faqTitle: "Veelgestelde vragen",
    faqs: [
      { q: "Is factuur maken hier echt gratis?", a: "Ja. Je maakt en downloadt zoveel facturen als je wilt, zonder account, e-mailadres of creditcard." },
      { q: "Worden mijn gegevens opgeslagen?", a: "Nee. Alles wat je typt blijft in je browser en wordt niet naar FaturaPro gestuurd. Sluit je de pagina, dan is het weg; download de PDF dus eerst." },
      { q: "Welk btw-tarief moet ik invullen?", a: "Voor de meeste diensten 21%, voor sommige goederen en diensten 9%. Voor een zakelijke klant in een ander EU-land is de btw meestal verlegd: vul 0% in en zet 'btw verlegd' en het btw-id van je klant bij de opmerkingen." },
      { q: "Ik gebruik de KOR. Wat zet ik op mijn factuur?", a: "Met de kleineondernemersregeling reken je geen btw: vul 0% in. Veel ondernemers vermelden er een korte zin bij, zoals 'Vrijgesteld van btw op grond van de kleineondernemersregeling (KOR)'." },
      { q: "Kan ik de factuur later aanpassen?", a: "Niet in deze generator, want er wordt niets bewaard. Met een gratis FaturaPro-account blijven je facturen, klanten en nummering bewaard en corrigeer je een factuur met een creditnota." },
    ],
    Guide: ({ signup }) => (
      <>
        <h2 style={{ ...h2Style, marginTop:0 }}>Zo maak je een factuur in 4 stappen</h2>
        <ol style={{ ...pStyle, paddingLeft:20 }}>
          <li><b>Vul je eigen gegevens in.</b> Je (bedrijfs)naam, adres, KVK-nummer en btw-id.</li>
          <li><b>Vul je klant in.</b> Naam en adres. Is je klant een bedrijf in een ander EU-land, zet dan ook zijn btw-id op de factuur.</li>
          <li><b>Zet het werk erop.</b> Eén regel per dienst of product, met aantal en prijs exclusief btw. Vul het btw-tarief in; subtotaal, btw en totaal worden berekend.</li>
          <li><b>Kies nummer, termijn en download.</b> Geef de factuur een volgnummer en vervaldatum, zet je IBAN erbij, klik op Download PDF en stuur hem naar je klant.</li>
        </ol>

        <h2 style={h2Style}>Wat moet er op een factuur?</h2>
        <p style={pStyle}>De Belastingdienst stelt eisen aan facturen. Ontbreekt er iets, dan kan je klant problemen krijgen met het aftrekken van de btw, en wordt er vaak later betaald. Op een factuur van een Nederlandse ondernemer staan in elk geval:</p>
        <ul style={{ ...pStyle, paddingLeft:20 }}>
          <li>Een uniek, opeenvolgend factuurnummer en de factuurdatum</li>
          <li>Jouw naam en adres, je btw-id en je KVK-nummer</li>
          <li>De naam en het adres van je klant</li>
          <li>Een omschrijving van het werk, de hoeveelheid en de datum of periode waarin je het deed</li>
          <li>Het bedrag exclusief btw, het btw-tarief, het btw-bedrag en het totaal</li>
          <li>Bij verlegde btw: de tekst 'btw verlegd' en het btw-id van je klant</li>
        </ul>
        <p style={pStyle}>Zet er ook een betaaltermijn en je IBAN op. Heb je niets afgesproken, dan geldt tussen bedrijven een betaaltermijn van 30 dagen. Bewaar je facturen zeven jaar; dat geldt ook voor je <a href="/blog/bonnetjes-bewaren-belastingdienst" style={linkStyle}>bonnetjes</a>.</p>

        <h2 style={h2Style}>Gratis generator of gratis account?</h2>
        <CompareTable head={["Deze generator", "Gratis FaturaPro-account"]} rows={[
          ["Prijs", "Gratis, zonder account", "Gratis, zonder creditcard"],
          ["Facturen", "Eén tegelijk, niet bewaard", "20 facturen en 5 klanten, bewaard"],
          ["Factuurnummer", "Typ je zelf", "Loopt vanzelf door"],
          ["Logo en huisstijl", "Nee", "Ja"],
          ["Taal van de factuur", "Nederlands of Engels", "Nederlands, Engels, Frans, Spaans, Arabisch"],
          ["Correcties", "Nieuwe PDF maken", "Creditnota's"],
          ["Betaalstatus", "Nee", "Betaald, open en te laat in één overzicht"],
        ]} />
        <p style={{ ...pStyle, marginTop:14 }}>Met Essential (€9 per maand) krijg je onbeperkt facturen, herinneringen via e-mail en WhatsApp, aanbetalingen, UBL/XML-export, uitgaven met <a href="/blog/bonnetjes-scannen-app-zzp" style={linkStyle}>bonnetjes scannen</a> en een btw-overzicht per kwartaal voor je aangifte. Advanced voegt offertes en terugkerende facturen toe. <a href="/nl" style={linkStyle}>Bekijk FaturaPro</a> of <a href={signup} style={linkStyle}>start gratis</a>.</p>

        <h2 style={h2Style}>Btw verlegd, buitenlandse klant of e-factuur?</h2>
        <p style={pStyle}>Werk je voor een bedrijf in een ander EU-land, dan is de btw meestal verlegd: 0% btw, de tekst 'btw verlegd' en het btw-id van je klant. Je geeft die omzet aan in rubriek 3b van je btw-aangifte en in de opgaaf ICP. Meer uitleg vind je in de Engelstalige gids over <a href="/blog/reverse-charge-vat-invoice-btw-verlegd" style={linkStyle}>btw verlegd</a>. Vraagt je klant om een e-factuur, lees dan <a href="/ubl-factuur-maken" style={linkStyle}>hoe je een UBL-factuur maakt</a>. Wil je weten hoe je de btw op je kosten terugkrijgt? Lees <a href="/blog/btw-terugvragen-kosten-zzp" style={linkStyle}>btw terugvragen als zzp'er</a>.</p>
      </>
    ),
    after: <>Betaalt je klant niet op tijd? Gebruik een gratis <a href="/late-payment-scripts" style={linkStyle}>betalingsherinnering</a>.</>,
  },
};

export default function InvoiceGenerator({ lang = "en" }) {
  const T = COPY[lang] || COPY.en;
  useEffect(() => {
    const canonical = URLS[lang] || URLS.en;
    const cleanupSeo = applyPageSeo({ title:T.title, description:T.description, canonical, language:lang, locale:T.locale, imageAlt:T.appName, alternates:ALTERNATES });
    const restoreSiteSchema = suspendBaseSiteSchema();
    const schema = document.createElement("script");
    schema.id = "invoice-generator-schema";
    schema.type = "application/ld+json";
    schema.textContent = JSON.stringify({
      "@context":"https://schema.org",
      "@graph":[
        { "@type":"SoftwareApplication", name:T.appName, url:canonical, inLanguage:lang, applicationCategory:"BusinessApplication", operatingSystem:"Web browser", description:T.description, offers:{ "@type":"Offer", price:"0", priceCurrency:"EUR" }, publisher:{ "@type":"Organization", name:"FaturaPro", url:"https://faturapro.app/" } },
        { "@type":"BreadcrumbList", itemListElement:[{ "@type":"ListItem", position:1, name:T.crumbHome, item:"https://faturapro.app" + T.home }, { "@type":"ListItem", position:2, name:T.crumb, item:canonical }] },
      ],
    });
    document.head.appendChild(schema);
    trackEvent("seo_page_viewed", { page:"invoice_generator", language:lang });
    return () => { schema.remove(); restoreSiteSchema(); cleanupSeo(); };
  }, [lang, T]);

  const [form, setForm] = useState({
    yourName: "", yourAddress: "", yourTaxId: "",
    clientName: "", clientAddress: "",
    invoiceNumber: lang === "nl" ? "2026-001" : "INV-001",
    date: new Date().toLocaleDateString("en-CA"), // local YYYY-MM-DD, not UTC
    due: "", currency: "EUR", tax: 0, payment: "", notes: "",
  });
  const [items, setItems] = useState([{ desc: "", qty: 1, price: 0 }]);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setItem = (i, k, v) => setItems(prev => prev.map((it, idx) => idx === i ? { ...it, [k]: v } : it));
  const cur = CURRENCIES.find(c => c.code === form.currency) || CURRENCIES[0];
  const subtotal = items.reduce((a, b) => a + (b.qty * b.price), 0);
  const taxAmt = subtotal * (form.tax / 100);
  const total = subtotal + taxAmt;
  const f = (n) => cur.symbol + " " + T.formatNumber(n);

  const inputStyle = { width:"100%", background:"#18181f", border:"1px solid rgba(99,102,241,0.18)", borderRadius:8, color:"#e8e4dc", fontSize:14, padding:"10px 12px", outline:"none", boxSizing:"border-box", fontFamily:"DM Sans, sans-serif" };
  const labelStyle = { fontSize:11, fontWeight:700, color:"#9a9690", letterSpacing:0.5, textTransform:"uppercase", marginBottom:6, display:"block" };
  const small = { fontSize:11, color:"#777", whiteSpace:"pre-line", lineHeight:1.5 };
  const Guide = T.Guide;

  return (
    <div style={{ minHeight:"100vh", background:"#08080e", color:"#e8e4dc", fontFamily:"DM Sans, sans-serif" }}>
      <div style={{ maxWidth:1100, margin:"0 auto", padding:"40px 20px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
          <a href={T.home} style={{ color:"#6366F1", fontSize:13, textDecoration:"none" }}>← FaturaPro</a>
          <a href={T.otherLang.href} hrefLang={T.otherLang.lang} lang={T.otherLang.lang} style={{ color:"#9a9690", fontSize:13 }}>{T.otherLang.label}</a>
        </div>
        <h1 style={{ fontFamily:"Playfair Display, Georgia, serif", fontSize:34, marginBottom:8 }}>{T.h1}</h1>
        <p style={{ color:"#9a9690", marginBottom:36, fontSize:15, lineHeight:1.7 }}>{T.intro}</p>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:28, alignItems:"start" }} className="gen-grid">
          <style>{`
            @media (max-width: 800px) { .gen-grid { grid-template-columns: 1fr !important; } }
            @media print { .gen-noprint { display: none !important; } }
            .gen-table td, .gen-table th { padding: 10px 12px; border-bottom: 1px solid rgba(255,255,255,0.08); text-align: left; vertical-align: top; }
          ` + printOnlyCss(".gen-invoice")}</style>

          {/* FORM */}
          <div style={{ background:"#111118", border:"1px solid rgba(99,102,241,0.15)", borderRadius:16, padding:28 }}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:14 }}>
              <div><label style={labelStyle} htmlFor="gen-your-name">{T.yourName}</label><input id="gen-your-name" style={inputStyle} value={form.yourName} onChange={e => set("yourName", e.target.value)} placeholder={T.yourNamePh} /></div>
              <div><label style={labelStyle} htmlFor="gen-client-name">{T.clientName}</label><input id="gen-client-name" style={inputStyle} value={form.clientName} onChange={e => set("clientName", e.target.value)} placeholder={T.clientNamePh} /></div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:14 }}>
              <div><label style={labelStyle} htmlFor="gen-your-address">{T.yourAddress}</label><textarea id="gen-your-address" rows={2} style={inputStyle} value={form.yourAddress} onChange={e => set("yourAddress", e.target.value)} placeholder={T.yourAddressPh} /></div>
              <div><label style={labelStyle} htmlFor="gen-client-address">{T.clientAddress}</label><textarea id="gen-client-address" rows={2} style={inputStyle} value={form.clientAddress} onChange={e => set("clientAddress", e.target.value)} placeholder={T.clientAddressPh} /></div>
            </div>
            <div style={{ marginBottom:14 }}>
              <label style={labelStyle} htmlFor="gen-tax-id">{T.taxId}</label>
              <input id="gen-tax-id" style={inputStyle} value={form.yourTaxId} onChange={e => set("yourTaxId", e.target.value)} placeholder={T.taxIdPh} />
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14, marginBottom:14 }}>
              <div><label style={labelStyle} htmlFor="gen-number">{T.number}</label><input id="gen-number" style={inputStyle} value={form.invoiceNumber} onChange={e => set("invoiceNumber", e.target.value)} /></div>
              <div><label style={labelStyle} htmlFor="gen-date">{T.date}</label><input id="gen-date" type="date" style={inputStyle} value={form.date} onChange={e => set("date", e.target.value)} /></div>
              <div><label style={labelStyle} htmlFor="gen-due">{T.due}</label><input id="gen-due" type="date" style={inputStyle} value={form.due} onChange={e => set("due", e.target.value)} /></div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:20 }}>
              <div><label style={labelStyle} htmlFor="gen-currency">{T.currency}</label>
                <select id="gen-currency" style={inputStyle} value={form.currency} onChange={e => set("currency", e.target.value)}>
                  {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code}{c.symbol !== c.code ? " (" + c.symbol + ")" : ""}</option>)}
                </select>
              </div>
              <div><label style={labelStyle} htmlFor="gen-tax">{T.tax}</label><input id="gen-tax" type="number" style={inputStyle} value={form.tax === 0 ? "" : form.tax} min={0} onChange={e => set("tax", e.target.value === "" ? 0 : +e.target.value)} placeholder={T.taxPh} /></div>
            </div>

            <label style={labelStyle}>{T.items}</label>
            {items.map((it, i) => (
              <div key={i} style={{ display:"grid", gridTemplateColumns:"2fr 60px 90px 28px", gap:8, marginBottom:8 }}>
                <input aria-label={T.itemLabel(i + 1, T.what.desc)} style={inputStyle} value={it.desc} onChange={e => setItem(i, "desc", e.target.value)} placeholder={T.itemDesc} />
                <input aria-label={T.itemLabel(i + 1, T.what.qty)} type="number" style={{...inputStyle, textAlign:"center"}} value={it.qty === 0 ? "" : it.qty} min={0} onChange={e => setItem(i, "qty", e.target.value === "" ? 0 : +e.target.value)} placeholder="1" />
                <input aria-label={T.itemLabel(i + 1, T.what.price)} type="number" style={{...inputStyle, textAlign:"right"}} value={it.price === 0 ? "" : it.price} min={0} onChange={e => setItem(i, "price", e.target.value === "" ? 0 : +e.target.value)} placeholder="0.00" />
                <button aria-label={T.removeItem(i + 1)} onClick={() => setItems(prev => prev.filter((_, idx) => idx !== i))} style={{ background:"none", border:"none", color:"#e05555", cursor:"pointer", fontSize:18 }}>×</button>
              </div>
            ))}
            <button onClick={() => setItems(prev => [...prev, { desc:"", qty:1, price:0 }])} style={{ background:"none", border:"1px solid rgba(99,102,241,0.25)", color:"#6366F1", borderRadius:8, padding:"8px 16px", fontSize:13, cursor:"pointer", marginTop:6, marginBottom:18 }}>{T.addItem}</button>

            <div style={{ marginBottom:14 }}>
              <label style={labelStyle} htmlFor="gen-payment">{T.payment}</label>
              <textarea id="gen-payment" rows={2} style={inputStyle} value={form.payment} onChange={e => set("payment", e.target.value)} placeholder={T.paymentPh} />
            </div>
            <div>
              <label style={labelStyle} htmlFor="gen-notes">{T.notes}</label>
              <textarea id="gen-notes" rows={2} style={inputStyle} value={form.notes} onChange={e => set("notes", e.target.value)} placeholder={T.notesPh} />
            </div>
          </div>

          {/* PREVIEW */}
          <div>
            <div className="gen-invoice" style={{ background:"#fdfcf9", borderRadius:16, padding:"36px 34px", color:"#1a1a2e", boxShadow:"0 20px 60px rgba(0,0,0,0.5)" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:28, gap:16 }}>
                <div>
                  <div style={{ fontFamily:"Playfair Display, Georgia, serif", fontSize:22, fontWeight:700, color:"#6366F1" }}>{form.yourName || T.pYourBusiness}</div>
                  {form.yourAddress && <div style={small}>{form.yourAddress}</div>}
                  {form.yourTaxId && <div style={small}>{form.yourTaxId}</div>}
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontSize:10, letterSpacing:2, color:"#999", textTransform:"uppercase" }}>{T.pInvoice}</div>
                  <div style={{ fontWeight:700, fontSize:16 }}>{form.invoiceNumber}</div>
                  <div style={{ fontSize:11, color:"#777", marginTop:4 }}>{T.pDate}: {T.formatDate(form.date)}</div>
                  {form.due && <div style={{ fontSize:11, color:"#777" }}>{T.pDue}: {T.formatDate(form.due)}</div>}
                </div>
              </div>
              <div style={{ background:"#faf7f0", borderRadius:8, padding:"12px 16px", marginBottom:24 }}>
                <div style={{ fontSize:10, letterSpacing:1.5, color:"#6366F1", textTransform:"uppercase", fontWeight:800, marginBottom:4 }}>{T.pBillTo}</div>
                <div style={{ fontWeight:700, fontSize:14 }}>{form.clientName || T.pClient}</div>
                {form.clientAddress && <div style={small}>{form.clientAddress}</div>}
              </div>
              <table style={{ width:"100%", borderCollapse:"collapse", marginBottom:20 }}>
                <thead><tr style={{ borderBottom:"2px solid #eee" }}>
                  <th style={{ textAlign:"left", padding:"8px 0", fontSize:10, letterSpacing:1, color:"#999", textTransform:"uppercase" }}>{T.pDesc}</th>
                  <th style={{ textAlign:"center", padding:"8px 0", fontSize:10, letterSpacing:1, color:"#999", textTransform:"uppercase", width:50 }}>{T.pQty}</th>
                  <th style={{ textAlign:"right", padding:"8px 0", fontSize:10, letterSpacing:1, color:"#999", textTransform:"uppercase", width:90 }}>{T.pAmount}</th>
                </tr></thead>
                <tbody>
                  {items.map((it, i) => (
                    <tr key={i} style={{ borderBottom:"1px solid #f5f5f5" }}>
                      <td style={{ padding:"10px 0", fontSize:13 }}>{it.desc || T.pService}</td>
                      <td style={{ textAlign:"center", fontSize:13 }}>{it.qty}</td>
                      <td style={{ textAlign:"right", fontSize:13 }}>{f(it.qty * it.price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ display:"flex", justifyContent:"flex-end" }}>
                <div style={{ minWidth:200 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, padding:"4px 0" }}><span style={{ color:"#777" }}>{T.pSubtotal}</span><span>{f(subtotal)}</span></div>
                  {form.tax > 0 && <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, padding:"4px 0" }}><span style={{ color:"#777" }}>{T.pTax} ({form.tax}%)</span><span>{f(taxAmt)}</span></div>}
                  <div style={{ display:"flex", justifyContent:"space-between", fontWeight:800, fontSize:17, padding:"10px 0", borderTop:"2px solid #eee", marginTop:6 }}><span>{T.pTotal}</span><span style={{ color:"#6366F1" }}>{f(total)}</span></div>
                </div>
              </div>
              {(form.payment || form.notes) && (
                <div style={{ marginTop:20, paddingTop:14, borderTop:"1px solid #eee" }}>
                  {form.payment && <div style={{ ...small, color:"#444", marginBottom:6 }}><b>{T.pPayment}</b>{"\n"}{form.payment}</div>}
                  {form.notes && <div style={{ ...small, color:"#444" }}>{form.notes}</div>}
                </div>
              )}
              <div style={{ borderTop:"1px solid #eee", marginTop:26, paddingTop:12, textAlign:"center", fontSize:10, letterSpacing:0.6, color:"#b3aea4" }}>
                <a href={INVOICE_ATTRIBUTION_URL} target="_blank" rel="noreferrer" onClick={() => trackEvent("invoice_brand_link_clicked", { placement:"free_generator_footer", plan:"generator", language:lang })} style={{ color:"#6366F1", fontWeight:700, textDecoration:"none" }}>
                  {T.madeWith}
                </a>
              </div>
            </div>

            <button className="gen-noprint" onClick={() => { trackEvent("free_generator_pdf_downloaded", { has_items:items.some(item => item.desc || Number(item.price) > 0), language:lang }); printWithTitle(T.fileName + (form.invoiceNumber || "")); }} style={{ width:"100%", marginTop:20, padding:"14px 0", borderRadius:12, border:"none", background:"linear-gradient(135deg,#7C6CF2,#6366F1)", color:"#0a0a0f", fontWeight:800, fontSize:16, cursor:"pointer" }}>
              {T.download}
            </button>
            <div className="gen-noprint" style={{ fontSize:11.5, color:"#5a5750", textAlign:"center", marginTop:8, lineHeight:1.7 }}>
              {T.downloadHelp}
            </div>

            {/* CTA */}
            <div className="gen-noprint" style={{ background:"rgba(99,102,241,0.07)", border:"1px solid rgba(99,102,241,0.25)", borderRadius:14, padding:"22px 24px", marginTop:20, textAlign:"center" }}>
              <div style={{ fontSize:15, fontWeight:700, color:"#e8e4dc", marginBottom:6 }}>{T.ctaTitle}</div>
              <div style={{ fontSize:13, color:"#9a9690", marginBottom:14 }}>{T.ctaText}</div>
              <a href={T.signup} onClick={() => trackEvent("free_generator_signup_clicked", { placement:"preview_cta", language:lang })} style={{ display:"inline-block", padding:"12px 30px", borderRadius:10, background:"linear-gradient(135deg,#7C6CF2,#6366F1)", color:"#0a0a0f", fontWeight:700, fontSize:15, textDecoration:"none" }}>{T.ctaButton}</a>
              <div style={{ fontSize:11, color:"#5a5750", marginTop:10 }}>{T.ctaFoot}</div>
            </div>
          </div>
        </div>

        {/* Guide */}
        <div className="gen-noprint" style={{ maxWidth:760, margin:"60px auto 0" }}>
          <Guide signup={T.signup} />
          <h2 style={h2Style}>{T.faqTitle}</h2>
          {T.faqs.map((item) => (
            <div key={item.q} style={{ marginBottom:16 }}>
              <h3 style={{ fontSize:16, margin:"0 0 6px", color:"#e8e4dc" }}>{item.q}</h3>
              <p style={pStyle}>{item.a}</p>
            </div>
          ))}
          <p style={pStyle}>{T.after}</p>
        </div>
      </div>
    </div>
  );
}
