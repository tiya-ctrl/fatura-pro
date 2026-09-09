jest.mock("../supabase", () => ({ supabase: {} }));

import { quoteToInvoice } from "./quotes";

describe("quoteToInvoice", () => {
  it("preserves the commercial details and applies the configured payment terms", () => {
    jest.useFakeTimers().setSystemTime(new Date("2026-09-09T12:00:00Z"));
    const quote = {
      client:"International Client",
      email:"client@example.com",
      sellerName:"Fatura Studio",
      sellerEmail:"hello@example.com",
      sellerPhone:"+31 20 000 0000",
      sellerVat:"NL123",
      sellerAddress:"Amsterdam",
      sellerCountry:"NL",
      buyerPhone:"+33 1 00 00 00 00",
      buyerAddress:"Paris",
      buyerCountry:"FR",
      subtotal:1000,
      discountAmt:100,
      taxAmt:180,
      total:1080,
      tax:20,
      discount:10,
      notes:"Valid for this project scope.",
      bankInfo:"IBAN NL00 TEST",
      currency:"EUR",
      items:[{ desc:"Design", note:"Phase one", qty:2, price:500 }],
    };

    const invoice = quoteToInvoice(quote, "INV-001-TEST", { paymentTerms:14 });

    expect(invoice).toMatchObject({
      id:"INV-001-TEST",
      client:quote.client,
      email:quote.email,
      sellerName:quote.sellerName,
      sellerVat:quote.sellerVat,
      sellerCountry:quote.sellerCountry,
      buyerCountry:quote.buyerCountry,
      date:"2026-09-09",
      due:"2026-09-23",
      status:"pending",
      subtotal:1000,
      discountAmt:100,
      taxAmt:180,
      total:1080,
      tax:20,
      discount:10,
      notes:quote.notes,
      bankInfo:quote.bankInfo,
      currency:"EUR",
      items:quote.items,
    });
    expect(invoice.items).toBe(quote.items);
    jest.useRealTimers();
  });
});
