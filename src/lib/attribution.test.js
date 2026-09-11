import { attributionEventProperties, captureAttribution, copyCampaignParams, readCampaignParams } from "./attribution";

describe("campaign attribution", () => {
  beforeEach(() => localStorage.clear());

  it("keeps only supported campaign and referral parameters", () => {
    expect(readCampaignParams("?utm_source=qr&utm_campaign=ams&ref=FP123&ignored=1")).toEqual({
      utm_source:"qr", utm_campaign:"ams", ref:"FP123",
    });
  });

  it("preserves first touch and updates last touch", () => {
    captureAttribution("?utm_source=instagram&utm_campaign=launch");
    captureAttribution("?utm_source=google&utm_medium=organic");
    const stored = JSON.parse(localStorage.getItem("fatura_attribution"));
    expect(stored.first.utm_source).toBe("instagram");
    expect(stored.last.utm_source).toBe("google");
    expect(attributionEventProperties()).toMatchObject({ acquisition_source:"google", acquisition_medium:"organic" });
  });

  it("forwards campaign parameters to sign-up links", () => {
    const result = copyCampaignParams(new URLSearchParams("signup=1"), "?utm_source=flyer&ref=FP123");
    expect(result.get("signup")).toBe("1");
    expect(result.get("utm_source")).toBe("flyer");
    expect(result.get("ref")).toBe("FP123");
  });
});
