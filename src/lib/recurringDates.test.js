import { nextRecurringDate } from "./recurringDates";

const iso = (d) => d.toISOString().slice(0, 10);

test("monthly on the 31st uses the last day of short months and returns to the 31st", () => {
  expect(iso(nextRecurringDate("2026-01-31", "monthly", 31))).toBe("2026-02-28");
  expect(iso(nextRecurringDate("2026-02-28", "monthly", 31))).toBe("2026-03-31");
  expect(iso(nextRecurringDate("2026-03-31", "monthly", 31))).toBe("2026-04-30");
  expect(iso(nextRecurringDate("2026-12-31", "monthly", 31))).toBe("2027-01-31");
});

test("without an anchor day the current day is kept", () => {
  expect(iso(nextRecurringDate("2026-10-15", "monthly"))).toBe("2026-11-15");
});

test("weekly, biweekly and yearly", () => {
  expect(iso(nextRecurringDate("2026-12-28", "weekly"))).toBe("2027-01-04");
  expect(iso(nextRecurringDate("2026-10-03", "biweekly"))).toBe("2026-10-17");
  expect(iso(nextRecurringDate("2028-02-29", "yearly", 29))).toBe("2029-02-28");
});
