import { nextInvoiceId, nextInvoiceSequence } from "./invoiceNumber";

test("continues from the highest number, not the invoice count", () => {
  const ids = ["INV-001-6462", "INV-007-0663", "INV-003-2136", "CN-2026-001", "INV-R-756123-9CJ"];
  expect(nextInvoiceSequence(ids, "INV-")).toBe(8);
});

test("old recurring numbers and credit notes do not break the series", () => {
  expect(nextInvoiceSequence(["INV-R-756123-9CJ", "CN-2026-001"], "INV-")).toBe(1);
});

test("uses the prefix from the settings", () => {
  expect(nextInvoiceSequence(["INV-009-1111", "FP-2026-004-2222", "FP-2026-012-3333"], "FP-2026-")).toBe(13);
  expect(nextInvoiceId(["FP-2026-012-3333"], "FP-2026-")).toMatch(/^FP-2026-013-\d{4}$/);
});

test("empty prefix falls back to INV-", () => {
  expect(nextInvoiceId([], "  ")).toMatch(/^INV-001-\d{4}$/);
  expect(nextInvoiceId(["INV-010-1234"], undefined)).toMatch(/^INV-011-\d{4}$/);
});
