import { fireEvent, render, screen } from "@testing-library/react";
import { QuotePreview } from "./Quotes";

jest.mock("../supabase", () => ({ supabase: {} }));
jest.mock("../lib/tracking", () => ({ trackEvent:jest.fn() }));
jest.mock("../lib/activationEvents", () => ({ recordActivationEvent:jest.fn() }));

const quote = {
  id:"Q-001-TEST",
  client:"Klant BV",
  sellerName:"Studio BV",
  date:"2026-09-09",
  validUntil:"2026-09-30",
  documentLanguage:"nl",
  subtotal:100,
  discount:10,
  discountAmt:10,
  tax:21,
  taxAmt:18.9,
  total:108.9,
  currency:"EUR",
  items:[{ desc:"Ontwerp", note:"Eerste fase", qty:1, price:100 }],
  notes:"Geldig tot de vermelde datum.",
  bankInfo:"IBAN NL00 TEST",
};

describe("QuotePreview", () => {
  beforeEach(() => {
    window.print = jest.fn();
  });

  it("uses the selected document language and exposes browser PDF printing", () => {
    render(<QuotePreview quote={quote} onClose={jest.fn()} />);

    expect(screen.getByLabelText("Offerte Q-001-TEST")).toBeInTheDocument();
    expect(screen.getByText("Offertetotaal")).toBeInTheDocument();
    expect(screen.getByText("Betaalinformatie")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name:"Print / Save PDF" }));
    expect(window.print).toHaveBeenCalledTimes(1);
  });
});
