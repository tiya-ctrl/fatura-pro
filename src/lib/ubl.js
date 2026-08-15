// Fatura Pro - UBL 2.1 export (EN 16931 / European e-invoicing)
// Produces an XML file a client can import straight into their accounting
// system. Invoices are type 380, credit notes are type 381.
// No conversion of any kind: the document is exported in its own currency.

const esc = (v) => String(v == null ? "" : v)
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;").replace(/'/g, "&apos;");

const num = (v) => (Math.round((Number(v) || 0) * 100) / 100).toFixed(2);

// EN 16931 wants an ISO country code. We only store a free-text address, so we
// look for a country name in it and fall back to NL (the export warns about it).
const COUNTRIES = {
  netherlands: "NL", nederland: "NL", holland: "NL", belgium: "BE", belgie: "BE", belgique: "BE",
  germany: "DE", deutschland: "DE", france: "FR", spain: "ES", espana: "ES", italy: "IT", italia: "IT",
  portugal: "PT", ireland: "IE", austria: "AT", osterreich: "AT", luxembourg: "LU", sweden: "SE",
  denmark: "DK", finland: "FI", norway: "NO", poland: "PL", switzerland: "CH", schweiz: "CH",
  "united kingdom": "GB", england: "GB", scotland: "GB", wales: "GB", "great britain": "GB",
  "united states": "US", usa: "US", canada: "CA", australia: "AU", morocco: "MA", maroc: "MA",
  uae: "AE", "united arab emirates": "AE", "saudi arabia": "SA", egypt: "EG", turkey: "TR",
};

export const COUNTRY_OPTIONS = [
  ["NL","Netherlands"],["BE","Belgium"],["DE","Germany"],["FR","France"],["ES","Spain"],
  ["IT","Italy"],["PT","Portugal"],["IE","Ireland"],["AT","Austria"],["LU","Luxembourg"],
  ["SE","Sweden"],["DK","Denmark"],["FI","Finland"],["NO","Norway"],["PL","Poland"],
  ["CH","Switzerland"],["GB","United Kingdom"],["US","United States"],["CA","Canada"],
  ["AU","Australia"],["MA","Morocco"],["AE","United Arab Emirates"],["SA","Saudi Arabia"],
  ["EG","Egypt"],["TR","Turkey"],["QA","Qatar"],["KW","Kuwait"],["BH","Bahrain"],
  ["OM","Oman"],["JO","Jordan"],["LB","Lebanon"],["TN","Tunisia"],["DZ","Algeria"],
];

export function countryCodeFrom(address) {
  const t = String(address || "").toLowerCase();
  const hit = Object.keys(COUNTRIES).find((name) => t.indexOf(name) > -1);
  return hit ? COUNTRIES[hit] : "NL";
}

// Address lines -> { street, city, country }
function splitAddress(address) {
  const lines = String(address || "").split(/[\n,]/).map((s) => s.trim()).filter(Boolean);
  return {
    street: lines[0] || "",
    city: lines.length > 1 ? lines[1] : "",
    country: countryCodeFrom(address),
  };
}

function partyXml(tag, name, email, phone, address, vat, country) {
  const a = splitAddress(address);
  if (country) a.country = country;
  const out = [];
  out.push("  <cac:" + tag + ">");
  out.push("    <cac:Party>");
  if (email) out.push("      <cbc:EndpointID schemeID=\"EM\">" + esc(email) + "</cbc:EndpointID>");
  out.push("      <cac:PartyName><cbc:Name>" + esc(name || "-") + "</cbc:Name></cac:PartyName>");
  out.push("      <cac:PostalAddress>");
  if (a.street) out.push("        <cbc:StreetName>" + esc(a.street) + "</cbc:StreetName>");
  if (a.city) out.push("        <cbc:CityName>" + esc(a.city) + "</cbc:CityName>");
  out.push("        <cac:Country><cbc:IdentificationCode>" + a.country + "</cbc:IdentificationCode></cac:Country>");
  out.push("      </cac:PostalAddress>");
  if (vat) {
    out.push("      <cac:PartyTaxScheme>");
    out.push("        <cbc:CompanyID>" + esc(vat) + "</cbc:CompanyID>");
    out.push("        <cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme>");
    out.push("      </cac:PartyTaxScheme>");
  }
  out.push("      <cac:PartyLegalEntity><cbc:RegistrationName>" + esc(name || "-") + "</cbc:RegistrationName></cac:PartyLegalEntity>");
  if (email || phone) {
    out.push("      <cac:Contact>");
    if (phone) out.push("        <cbc:Telephone>" + esc(phone) + "</cbc:Telephone>");
    if (email) out.push("        <cbc:ElectronicMail>" + esc(email) + "</cbc:ElectronicMail>");
    out.push("      </cac:Contact>");
  }
  out.push("    </cac:Party>");
  out.push("  </cac:" + tag + ">");
  return out;
}

export function buildUBL(inv) {
  const isCredit = inv.docType === "credit_note";
  const root = isCredit ? "CreditNote" : "Invoice";
  const qtyTag = isCredit ? "CreditedQuantity" : "InvoicedQuantity";
  const lineTag = isCredit ? "CreditNoteLine" : "InvoiceLine";
  const cur = inv.currency || "EUR";
  const abs = (v) => Math.abs(Number(v) || 0);

  const items = (inv.items || []).filter((i) => i.desc || i.price);
  const subtotal = abs(inv.subtotal != null ? inv.subtotal : items.reduce((a, i) => a + (i.qty || 0) * (i.price || 0), 0));
  const discountAmt = abs(inv.discountAmt);
  const taxAmt = abs(inv.taxAmt);
  const taxRate = Number(inv.tax) || 0;
  const total = abs(inv.total != null ? inv.total : inv.amount);
  const prepaid = isCredit ? 0 : Math.min(abs(inv.paidAmount), total);
  const taxable = Math.max(0, subtotal - discountAmt);

  const x = [];
  x.push("<?xml version=\"1.0\" encoding=\"UTF-8\"?>");
  x.push("<" + root + " xmlns=\"urn:oasis:names:specification:ubl:schema:xsd:" + root + "-2\"");
  x.push("  xmlns:cac=\"urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2\"");
  x.push("  xmlns:cbc=\"urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2\">");
  x.push("  <cbc:CustomizationID>urn:cen.eu:en16931:2017</cbc:CustomizationID>");
  x.push("  <cbc:ProfileID>urn:fdc:peppol.eu:2017:poacc:billing:01:1.0</cbc:ProfileID>");
  x.push("  <cbc:ID>" + esc(inv.id) + "</cbc:ID>");
  x.push("  <cbc:IssueDate>" + esc(inv.date || new Date().toISOString().slice(0, 10)) + "</cbc:IssueDate>");
  if (!isCredit && inv.due) x.push("  <cbc:DueDate>" + esc(inv.due) + "</cbc:DueDate>");
  x.push("  <cbc:" + (isCredit ? "CreditNoteTypeCode" : "InvoiceTypeCode") + ">" + (isCredit ? "381" : "380") + "</cbc:" + (isCredit ? "CreditNoteTypeCode" : "InvoiceTypeCode") + ">");
  if (inv.notes) x.push("  <cbc:Note>" + esc(inv.notes) + "</cbc:Note>");
  x.push("  <cbc:DocumentCurrencyCode>" + esc(cur) + "</cbc:DocumentCurrencyCode>");
  if (isCredit && inv.creditOf) {
    x.push("  <cac:BillingReference><cac:InvoiceDocumentReference><cbc:ID>" + esc(inv.creditOf) + "</cbc:ID></cac:InvoiceDocumentReference></cac:BillingReference>");
  }
  partyXml("AccountingSupplierParty", inv.sellerName, inv.sellerEmail, inv.sellerPhone, inv.sellerAddress, inv.sellerVat, inv.sellerCountry).forEach((l) => x.push(l));
  partyXml("AccountingCustomerParty", inv.client, inv.email, inv.buyerPhone, inv.buyerAddress, null, inv.buyerCountry).forEach((l) => x.push(l));
  if (inv.bankInfo) {
    x.push("  <cac:PaymentMeans>");
    x.push("    <cbc:PaymentMeansCode>30</cbc:PaymentMeansCode>");
    x.push("    <cac:PayeeFinancialAccount><cbc:ID>" + esc(String(inv.bankInfo).replace(/\s+/g, " ").slice(0, 80)) + "</cbc:ID></cac:PayeeFinancialAccount>");
    x.push("  </cac:PaymentMeans>");
  }
  if (discountAmt > 0) {
    x.push("  <cac:AllowanceCharge>");
    x.push("    <cbc:ChargeIndicator>false</cbc:ChargeIndicator>");
    x.push("    <cbc:AllowanceChargeReason>Discount</cbc:AllowanceChargeReason>");
    x.push("    <cbc:Amount currencyID=\"" + esc(cur) + "\">" + num(discountAmt) + "</cbc:Amount>");
    x.push("  </cac:AllowanceCharge>");
  }
  x.push("  <cac:TaxTotal>");
  x.push("    <cbc:TaxAmount currencyID=\"" + esc(cur) + "\">" + num(taxAmt) + "</cbc:TaxAmount>");
  x.push("    <cac:TaxSubtotal>");
  x.push("      <cbc:TaxableAmount currencyID=\"" + esc(cur) + "\">" + num(taxable) + "</cbc:TaxableAmount>");
  x.push("      <cbc:TaxAmount currencyID=\"" + esc(cur) + "\">" + num(taxAmt) + "</cbc:TaxAmount>");
  x.push("      <cac:TaxCategory>");
  x.push("        <cbc:ID>" + (taxRate > 0 ? "S" : "Z") + "</cbc:ID>");
  x.push("        <cbc:Percent>" + num(taxRate) + "</cbc:Percent>");
  x.push("        <cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme>");
  x.push("      </cac:TaxCategory>");
  x.push("    </cac:TaxSubtotal>");
  x.push("  </cac:TaxTotal>");
  x.push("  <cac:LegalMonetaryTotal>");
  x.push("    <cbc:LineExtensionAmount currencyID=\"" + esc(cur) + "\">" + num(subtotal) + "</cbc:LineExtensionAmount>");
  x.push("    <cbc:TaxExclusiveAmount currencyID=\"" + esc(cur) + "\">" + num(taxable) + "</cbc:TaxExclusiveAmount>");
  x.push("    <cbc:TaxInclusiveAmount currencyID=\"" + esc(cur) + "\">" + num(total) + "</cbc:TaxInclusiveAmount>");
  if (discountAmt > 0) x.push("    <cbc:AllowanceTotalAmount currencyID=\"" + esc(cur) + "\">" + num(discountAmt) + "</cbc:AllowanceTotalAmount>");
  if (prepaid > 0) x.push("    <cbc:PrepaidAmount currencyID=\"" + esc(cur) + "\">" + num(prepaid) + "</cbc:PrepaidAmount>");
  x.push("    <cbc:PayableAmount currencyID=\"" + esc(cur) + "\">" + num(total - prepaid) + "</cbc:PayableAmount>");
  x.push("  </cac:LegalMonetaryTotal>");
  items.forEach((it, idx) => {
    const qty = Number(it.qty) || 0;
    const price = abs(it.price);
    x.push("  <cac:" + lineTag + ">");
    x.push("    <cbc:ID>" + (idx + 1) + "</cbc:ID>");
    x.push("    <cbc:" + qtyTag + " unitCode=\"C62\">" + (Math.round(qty * 1000) / 1000) + "</cbc:" + qtyTag + ">");
    x.push("    <cbc:LineExtensionAmount currencyID=\"" + esc(cur) + "\">" + num(qty * price) + "</cbc:LineExtensionAmount>");
    x.push("    <cac:Item>");
    x.push("      <cbc:Name>" + esc(it.desc || "Item " + (idx + 1)) + "</cbc:Name>");
    x.push("      <cac:ClassifiedTaxCategory>");
    x.push("        <cbc:ID>" + (taxRate > 0 ? "S" : "Z") + "</cbc:ID>");
    x.push("        <cbc:Percent>" + num(taxRate) + "</cbc:Percent>");
    x.push("        <cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme>");
    x.push("      </cac:ClassifiedTaxCategory>");
    x.push("    </cac:Item>");
    x.push("    <cac:Price><cbc:PriceAmount currencyID=\"" + esc(cur) + "\">" + num(price) + "</cbc:PriceAmount></cac:Price>");
    x.push("  </cac:" + lineTag + ">");
  });
  x.push("</" + root + ">");
  return x.join("\n");
}

// What is missing for a document to be accepted by a strict receiver.
export function ublWarnings(inv) {
  const w = [];
  if (!inv.sellerVat) w.push("Your VAT / BTW number");
  if (!inv.sellerName) w.push("Your company name");
  if (!inv.sellerAddress) w.push("Your address");
  if (!inv.buyerAddress) w.push("The client's address");
  if (!(inv.items || []).some((i) => i.desc)) w.push("Item descriptions");
  return w;
}

export function downloadUBL(inv) {
  const xml = buildUBL(inv);
  const blob = new Blob([xml], { type: "application/xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = inv.id + "-ubl.xml";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
