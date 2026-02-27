/**
 * Shared date utilities. All dates are formatted and interpreted in
 * America/Los_Angeles (PST/PDT depending on DST).
 */
const PACIFIC_TZ = "America/Los_Angeles";

/** Format: YYYY-MM-DD (date-only, used for storage and API queries) */
export function toDateOnlyString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Format a month Date as "Month Year" (e.g. "February 2026"). */
export function monthTitle(month: Date): string {
  return month.toLocaleString(undefined, { month: "long", year: "numeric" });
}

/** Parse YYYY-MM-DD string to Date (local midnight). */
export function parseDateOnly(dateString: string): Date {
  const parts = dateString.split("-");
  if (parts.length === 3) {
    const year = Number(parts[0]);
    const month = Number(parts[1]);
    const day = Number(parts[2]);
    if (!Number.isNaN(year) && !Number.isNaN(month) && !Number.isNaN(day)) {
      return new Date(year, month - 1, day);
    }
  }
  return new Date(dateString);
}

/** Format YYYY-MM-DD to display string MM/DD/YYYY. */
export function formatDateOnlyForDisplay(dateString: string): string {
  if (!dateString) return "Any";
  const [year, month, day] = dateString.split("-");
  return `${month}/${day}/${year}`;
}

/** Build range label for date filter: "All dates" | "MM/DD/YYYY" | "MM/DD/YYYY to MM/DD/YYYY". */
export function dateRangeLabel(range: { startDate: string | null; endDate: string | null }): string {
  if (!range.startDate) return "All dates";
  if (!range.endDate) return formatDateOnlyForDisplay(range.startDate);
  return `${formatDateOnlyForDisplay(range.startDate)} to ${formatDateOnlyForDisplay(range.endDate)}`;
}

/** Format ISO timestamp to MM/DD/YYYY in Pacific time. */
export function formatIsoToPstDisplay(isoString: string): string {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return isoString;
  return date.toLocaleDateString("en-US", {
    timeZone: PACIFIC_TZ,
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });
}

/** Convert order date (ISO or YYYY-MM-DD) to YYYY-MM-DD for filtering. Uses Pacific time for ISO timestamps. */
export function toDateOnlyForFilter(input: string): string | null {
  if (!input) return null;
  if (/^\d{4}-\d{2}-\d{2}/.test(input)) return input.slice(0, 10);

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(input)) {
    const [month, day, year] = input.split("/");
    return `${year}-${month}-${day}`;
  }

  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-CA", { timeZone: PACIFIC_TZ });
}

/**
 * Returns UTC offset in minutes for a timezone at a given instant.
 */
function getOffsetMinutesForTimeZone(date: Date, timeZone: string): number {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    timeZoneName: "shortOffset",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const tzPart = formatter
    .formatToParts(date)
    .find((part) => part.type === "timeZoneName")?.value;

  if (!tzPart || tzPart === "GMT" || tzPart === "UTC") return 0;

  const match = tzPart.match(/^GMT([+-])(\d{1,2})(?::?(\d{2}))?$/);
  if (!match) return 0;

  const sign = match[1] === "-" ? -1 : 1;
  const hours = Number(match[2]);
  const minutes = Number(match[3] ?? "0");
  return sign * (hours * 60 + minutes);
}

/**
 * Converts an America/Los_Angeles wall-clock datetime to a UTC ISO string.
 */
function pacificWallClockToUtcIso(
  year: number,
  month: number,
  day: number,
  hours: number,
  minutes: number,
  seconds: number,
  millis: number
): string {
  const approxUtc = new Date(Date.UTC(year, month - 1, day, hours, minutes, seconds, millis));
  const offsetMinutes = getOffsetMinutesForTimeZone(approxUtc, PACIFIC_TZ);
  return new Date(approxUtc.getTime() - offsetMinutes * 60_000).toISOString();
}

function parseDateOnlyParts(dateString: string): { year: number; month: number; day: number } | null {
  const parts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateString);
  if (!parts) return null;
  return {
    year: Number(parts[1]),
    month: Number(parts[2]),
    day: Number(parts[3]),
  };
}

/**
 * Convert YYYY-MM-DD (Pacific date) to UTC start-of-day for Supabase queries.
 */
export function dateOnlyToUtcStart(dateString: string): string {
  const parts = parseDateOnlyParts(dateString);
  if (!parts) return `${dateString}T00:00:00.000Z`;
  return pacificWallClockToUtcIso(parts.year, parts.month, parts.day, 0, 0, 0, 0);
}

/**
 * Convert YYYY-MM-DD (Pacific date) to UTC end-of-day for Supabase queries.
 */
export function dateOnlyToUtcEnd(dateString: string): string {
  const parts = parseDateOnlyParts(dateString);
  if (!parts) return `${dateString}T23:59:59.999Z`;
  return pacificWallClockToUtcIso(parts.year, parts.month, parts.day, 23, 59, 59, 999);
}
