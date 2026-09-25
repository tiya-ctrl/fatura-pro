import { documentDirection, invoiceCopy, normalizeDocumentLanguage } from "./documentLanguage";

describe("document language", () => {
  it("keeps the invoice language independent and falls back safely", () => {
    expect(normalizeDocumentLanguage("ar")).toBe("ar");
    expect(normalizeDocumentLanguage("unknown")).toBe("en");
  });

  it("provides connected Arabic-ready copy and RTL direction", () => {
    expect(documentDirection("ar")).toBe("rtl");
    expect(documentDirection("nl")).toBe("ltr");
    expect(invoiceCopy("ar")).toMatchObject({ invoice:"فاتورة", totalDue:"المبلغ المستحق" });
    expect(invoiceCopy("nl").invoice).toBe("Factuur");
    expect(normalizeDocumentLanguage("es")).toBe("es");
    expect(invoiceCopy("es")).toMatchObject({ invoice:"Factura", creditNote:"Factura rectificativa", tax:"IVA" });
    expect(documentDirection("es")).toBe("ltr");
  });
});
