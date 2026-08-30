// Event start/end times are entered and displayed in Moscow time (UTC+3,
// no DST) regardless of where the admin or attendee physically are.

export function parseMskDatetimeLocal(value: string): Date {
  // value looks like "2026-09-15T10:00" (from <input type="datetime-local">)
  return new Date(`${value}:00+03:00`);
}

export function toMskDatetimeLocalValue(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Moscow",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "00";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}
