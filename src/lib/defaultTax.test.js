import { defaultTaxForCountry } from "./defaultTax";

test("Dutch accounts start at 21%", () => {
  expect(defaultTaxForCountry("Netherlands")).toBe(21);
  expect(defaultTaxForCountry("NL")).toBe(21);
  expect(defaultTaxForCountry(" nederland ")).toBe(21);
});

test("accounts in other countries start at 0%", () => {
  expect(defaultTaxForCountry("United Arab Emirates")).toBe(0);
  expect(defaultTaxForCountry("GB")).toBe(0);
});

test("an unknown country keeps 21%", () => {
  expect(defaultTaxForCountry(null)).toBe(21);
  expect(defaultTaxForCountry("")).toBe(21);
});
