// Fatura Pro - next date of a recurring invoice (used by the app and the daily cron).
// Monthly and yearly schedules keep their day of the month: a schedule on the 31st
// runs on the last day of shorter months (Feb 28, Apr 30) and goes back to the 31st
// after that, instead of sliding to the 3rd of the next month.
// anchorDay: the day of the month the schedule started on (optional).

function daysInMonth(year, month) {
  return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
}

export function nextRecurringDate(from, frequency, anchorDay) {
  const base = typeof from === "string" && /^\d{4}-\d{2}-\d{2}$/.test(from)
    ? new Date(from + "T00:00:00Z")
    : new Date(from);
  const d = new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), base.getUTCDate()));
  if (frequency === "weekly") { d.setUTCDate(d.getUTCDate() + 7); return d; }
  if (frequency === "biweekly") { d.setUTCDate(d.getUTCDate() + 14); return d; }

  const day = Number(anchorDay) >= 1 && Number(anchorDay) <= 31 ? Number(anchorDay) : d.getUTCDate();
  let year = d.getUTCFullYear();
  let month = d.getUTCMonth();
  if (frequency === "yearly") year += 1;
  else { month += 1; if (month > 11) { month = 0; year += 1; } }
  return new Date(Date.UTC(year, month, Math.min(day, daysInMonth(year, month))));
}
