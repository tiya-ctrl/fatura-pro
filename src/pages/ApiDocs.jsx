import { useEffect } from "react";

const GOLD = "#c9a84c";
const BG = "#08080e";
const TEXT = "#e8e4dc";
const MUTED = "#9a9690";
const CARD = "#111118";

function Code({ children }) {
  return (
    <pre style={{ background: CARD, border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "16px 18px", overflowX: "auto", fontSize: 13, lineHeight: 1.7, color: TEXT, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", margin: "14px 0" }}>
      <code>{children}</code>
    </pre>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 44 }}>
      <h2 style={{ fontSize: 20, color: GOLD, marginBottom: 12, fontFamily: "Playfair Display, serif" }}>{title}</h2>
      {children}
    </div>
  );
}

function P({ children }) {
  return <p style={{ lineHeight: 1.8, color: MUTED, marginBottom: 12 }}>{children}</p>;
}

function Row({ name, type, req, desc }) {
  return (
    <tr>
      <td style={{ padding: "10px 12px", borderBottom: "1px solid rgba(255,255,255,0.06)", color: TEXT, fontFamily: "ui-monospace, monospace", fontSize: 13, whiteSpace: "nowrap" }}>{name}</td>
      <td style={{ padding: "10px 12px", borderBottom: "1px solid rgba(255,255,255,0.06)", color: MUTED, fontSize: 13 }}>{type}</td>
      <td style={{ padding: "10px 12px", borderBottom: "1px solid rgba(255,255,255,0.06)", color: req ? GOLD : MUTED, fontSize: 13 }}>{req ? "Required" : "Optional"}</td>
      <td style={{ padding: "10px 12px", borderBottom: "1px solid rgba(255,255,255,0.06)", color: MUTED, fontSize: 13 }}>{desc}</td>
    </tr>
  );
}

export default function ApiDocs() {
  useEffect(() => {
    document.title = "Invoicing API Documentation — Create Invoices Programmatically | Fatūra Pro";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "REST API documentation for Fatūra Pro: authenticate with an API key, list invoices and create invoices programmatically from your store, CRM or internal system. Examples in curl and JavaScript.");
    let canon = document.querySelector("link[rel=canonical]");
    if (!canon) { canon = document.createElement("link"); canon.setAttribute("rel", "canonical"); document.head.appendChild(canon); }
    canon.setAttribute("href", "https://faturapro.app/api-docs");
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: BG, color: TEXT, fontFamily: "DM Sans, sans-serif" }}>
      <div style={{ maxWidth: 820, margin: "0 auto", padding: "60px 24px 100px" }}>
        <a href="/" style={{ color: GOLD, fontSize: 13, textDecoration: "none", display: "inline-block", marginBottom: 32 }}>← Back to Fatūra Pro</a>

        <h1 style={{ fontFamily: "Playfair Display, serif", fontSize: 38, marginBottom: 10, lineHeight: 1.2 }}>Invoicing API</h1>
        <p style={{ color: MUTED, fontSize: 16, lineHeight: 1.7, marginBottom: 36 }}>
          Create and retrieve invoices programmatically. Connect your online store, CRM or internal system so every order becomes an invoice automatically — no manual data entry.
        </p>

        <div style={{ background: CARD, border: "1px solid " + GOLD + "33", borderLeft: "3px solid " + GOLD, borderRadius: 10, padding: "16px 18px", marginBottom: 40 }}>
          <div style={{ fontSize: 14, color: TEXT, marginBottom: 6, fontWeight: 600 }}>Available on the Business plan</div>
          <div style={{ fontSize: 13.5, color: MUTED, lineHeight: 1.7 }}>
            API access is included in Fatūra Pro Business (€19/month, 7-day free trial). Generate your key in the app under Settings → API access.
          </div>
        </div>

        <Section title="Base URL">
          <Code>https://faturapro.app/api/v1</Code>
        </Section>

        <Section title="Authentication">
          <P>Every request must include your API key as a Bearer token in the Authorization header. Keys start with <span style={{ color: TEXT }}>fp_live_</span> and are shown only once when generated, so store yours somewhere safe.</P>
          <Code>Authorization: Bearer fp_live_your_key_here</Code>
          <P>Keys are tied to your account: requests only ever return or create data belonging to you. You can hold up to three keys at a time and delete any of them from Settings → API access. If a key leaks, delete it there and generate a new one.</P>
        </Section>

        <Section title="List invoices">
          <Code>GET /api/v1/invoices</Code>
          <P>Returns your most recent invoices, newest first, up to 100 per request.</P>
          <Code>{`curl -H "Authorization: Bearer fp_live_your_key_here" \\
  https://faturapro.app/api/v1/invoices`}</Code>
          <P>Example response:</P>
          <Code>{`{
  "invoices": [
    {
      "id": "INV-API-482913-A7F2",
      "client": "Atlas Marketing GmbH",
      "email": "client@atlas-marketing.de",
      "date": "2026-08-01",
      "due": "2026-08-15",
      "status": "pending",
      "subtotal": 2400,
      "tax_amt": 504,
      "total": 2904,
      "currency": "EUR",
      "items": [
        { "desc": "Brand identity package", "qty": 1, "price": 2400 }
      ]
    }
  ]
}`}</Code>
        </Section>

        <Section title="Create an invoice">
          <Code>POST /api/v1/invoices</Code>
          <P>Creates a new invoice in your account with status <span style={{ color: TEXT }}>pending</span>. Totals are calculated server-side from the items you send, so you never need to compute them yourself.</P>

          <div style={{ overflowX: "auto", margin: "16px 0 20px" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", background: CARD, borderRadius: 10 }}>
              <thead>
                <tr>
                  {["Field", "Type", "", "Description"].map((h, i) => (
                    <th key={i} style={{ textAlign: "left", padding: "12px", fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: GOLD, borderBottom: "1px solid rgba(255,255,255,0.1)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <Row name="client" type="string" req desc="Client or company name" />
                <Row name="items" type="array" req desc="Line items: desc (string), qty (number), price (number)" />
                <Row name="email" type="string" desc="Client email address" />
                <Row name="date" type="string" desc="Invoice date, YYYY-MM-DD. Defaults to today" />
                <Row name="due" type="string" desc="Due date, YYYY-MM-DD" />
                <Row name="tax" type="number" desc="Tax percentage. Defaults to 21. Send 0 for no tax" />
                <Row name="discount" type="number" desc="Discount percentage applied before tax" />
                <Row name="currency" type="string" desc="Three-letter code such as EUR, USD, GBP. Defaults to EUR" />
                <Row name="notes" type="string" desc="Notes shown on the invoice" />
              </tbody>
            </table>
          </div>

          <Code>{`curl -X POST https://faturapro.app/api/v1/invoices \\
  -H "Authorization: Bearer fp_live_your_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "client": "Atlas Marketing GmbH",
    "email": "client@atlas-marketing.de",
    "items": [
      { "desc": "Order #1001 - Brand identity package", "qty": 1, "price": 2400 }
    ],
    "tax": 21,
    "currency": "EUR",
    "due": "2026-08-15"
  }'`}</Code>

          <P>Example response (HTTP 201):</P>
          <Code>{`{
  "invoice": {
    "id": "INV-API-482913-A7F2",
    "total": 2904,
    "currency": "EUR",
    "status": "pending"
  }
}`}</Code>
        </Section>

        <Section title="JavaScript example">
          <P>Creating an invoice from a Node.js backend or a serverless function:</P>
          <Code>{`const res = await fetch("https://faturapro.app/api/v1/invoices", {
  method: "POST",
  headers: {
    "Authorization": "Bearer " + process.env.FATURA_API_KEY,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    client: order.customerName,
    email: order.customerEmail,
    items: order.lines.map(l => ({
      desc: l.title,
      qty: l.quantity,
      price: l.unitPrice
    })),
    currency: order.currency,
    tax: 21
  })
});

const data = await res.json();
console.log(data.invoice.id);`}</Code>
          <P>Keep your API key on the server side only. Never expose it in browser code, mobile apps or public repositories.</P>
        </Section>

        <Section title="Response codes">
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", background: CARD, borderRadius: 10 }}>
              <tbody>
                {[
                  ["200", "Request succeeded (GET)"],
                  ["201", "Invoice created (POST)"],
                  ["400", "Missing or invalid fields — check that client and items are present"],
                  ["401", "Invalid or missing API key"],
                  ["405", "Method not allowed — only GET and POST are supported"],
                  ["500", "Something went wrong on our side. Retry, and contact support if it persists"],
                ].map(([code, desc]) => (
                  <tr key={code}>
                    <td style={{ padding: "10px 12px", borderBottom: "1px solid rgba(255,255,255,0.06)", color: GOLD, fontFamily: "ui-monospace, monospace", fontSize: 13, width: 70 }}>{code}</td>
                    <td style={{ padding: "10px 12px", borderBottom: "1px solid rgba(255,255,255,0.06)", color: MUTED, fontSize: 13 }}>{desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Section title="Common use cases">
          <P><span style={{ color: TEXT }}>Online stores.</span> Create an invoice automatically for every new order, with the order number in the line item description.</P>
          <P><span style={{ color: TEXT }}>Recurring services and SaaS.</span> Trigger an invoice when a subscription renews or when usage is billed.</P>
          <P><span style={{ color: TEXT }}>Internal tools and CRMs.</span> Turn a closed deal into an invoice without anyone retyping the numbers.</P>
          <P><span style={{ color: TEXT }}>No-code automation.</span> Tools such as Make or Zapier can call this API with a generic HTTP request module, so you can connect it without writing code.</P>
        </Section>

        <Section title="Support">
          <P>Questions about integrating the API? Email <span style={{ color: GOLD }}>support@faturapro.app</span> and we will help.</P>
        </Section>

        <div style={{ background: CARD, border: "1px solid " + GOLD + "33", borderRadius: 12, padding: "26px 24px", textAlign: "center", marginTop: 50 }}>
          <div style={{ fontFamily: "Playfair Display, serif", fontSize: 22, marginBottom: 8 }}>Get your API key</div>
          <div style={{ color: MUTED, fontSize: 14, lineHeight: 1.7, marginBottom: 18 }}>
            API access is part of the Business plan — along with quotes, recurring invoices, VAT reports and team access. Start with a 7-day free trial.
          </div>
          <a href="/app" style={{ display: "inline-block", background: GOLD, color: "#000", padding: "12px 26px", borderRadius: 8, textDecoration: "none", fontWeight: 600, fontSize: 14 }}>Start free →</a>
        </div>
      </div>
    </div>
  );
}
