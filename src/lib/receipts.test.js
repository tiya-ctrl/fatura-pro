import { receiptToForm } from "./receipts";

const base = { date: "2026-10-08", supplier: "Albert Heijn", description: "Boodschappen", category: "other", currency: "EUR" };

test("only the total on the receipt: the amount is kept, VAT 0%, flagged to check", () => {
  const out = receiptToForm({ ...base, amount_incl: 23.4, amount_excl: null, vat_amount: null, vat_rate: null });
  expect(out.amount_excl).toBe(23.4);
  expect(out.vat_rate).toBe(0);
  expect(out.vat_unknown).toBe(true);
});

test("total and one VAT rate", () => {
  const out = receiptToForm({ ...base, amount_incl: 121, amount_excl: null, vat_amount: null, vat_rate: 21 });
  expect(out.amount_excl).toBe(100);
  expect(out.vat_rate).toBe(21);
  expect(out.vat_unknown).toBeUndefined();
});

test("total and VAT amount, mixed rates: effective rate keeps the VAT total", () => {
  const out = receiptToForm({ ...base, amount_incl: 50, amount_excl: null, vat_amount: 6.2, vat_rate: null });
  expect(out.amount_excl).toBe(43.8);
  expect(out.vat_rate).toBeCloseTo(14.16, 1);
});

test("all three printed", () => {
  const out = receiptToForm({ ...base, amount_incl: 10.9, amount_excl: 10, vat_amount: 0.9, vat_rate: 9 });
  expect(out).toMatchObject({ amount_excl: 10, vat_rate: 9, supplier: "Albert Heijn", date: "2026-10-08" });
});

test("no amounts at all: no amount field, so the form says it could not read it", () => {
  const out = receiptToForm({ ...base, amount_incl: null, amount_excl: null, vat_amount: null, vat_rate: null });
  expect(out.amount_excl).toBeUndefined();
  expect(out.supplier).toBe("Albert Heijn");
});
