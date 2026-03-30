const IST_OPTIONS_DATETIME: Intl.DateTimeFormatOptions = {
  timeZone: "Asia/Kolkata",
  dateStyle: "medium",
  timeStyle: "short",
};

const IST_OPTIONS_DATE: Intl.DateTimeFormatOptions = {
  timeZone: "Asia/Kolkata",
  dateStyle: "medium",
};

/** Format a date string to IST with date and time — e.g. "15 Feb 2026, 4:00 pm" */
export function formatDateIST(d: string | null | undefined): string {
  if (!d) return "-";
  return new Date(d).toLocaleString("en-IN", IST_OPTIONS_DATETIME);
}

/** Format a date string to IST date only — e.g. "15 Feb 2026" */
export function formatDateOnlyIST(d: string | null | undefined): string {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("en-IN", IST_OPTIONS_DATE);
}

/** Current timestamp in IST — for PDF "Generated" headers */
export function nowIST(): string {
  return new Date().toLocaleString("en-IN", IST_OPTIONS_DATETIME);
}
