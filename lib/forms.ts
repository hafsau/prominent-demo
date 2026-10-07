/*
 * Input helpers for the redesign: accept what people actually type.
 */

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
export const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export type YMD = { y: number; m: number; d: number };

function valid({ y, m, d }: YMD): boolean {
  if (y < 1900 || y > 2100 || m < 1 || m > 12 || d < 1) return false;
  return d <= new Date(y, m, 0).getDate();
}

/** Parses 3/4/1952, 03-04-1952, 3.4.1952, 1952-03-04, "Mar 4 1952", "March 4, 1952". US month-first order. */
export function parseDate(input: string): YMD | null {
  const s = input.trim().toLowerCase();
  if (!s) return null;
  let m = s.match(/^(\d{1,2})[/.\-\s](\d{1,2})[/.\-\s](\d{4})$/);
  if (m) {
    const r = { y: +m[3], m: +m[1], d: +m[2] };
    return valid(r) ? r : null;
  }
  m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (m) {
    const r = { y: +m[1], m: +m[2], d: +m[3] };
    return valid(r) ? r : null;
  }
  m = s.match(/^([a-z]{3,9})\.?\s+(\d{1,2}),?\s+(\d{4})$/);
  if (m) {
    const mi = MONTHS.indexOf(m[1].slice(0, 3));
    if (mi < 0) return null;
    const r = { y: +m[3], m: mi + 1, d: +m[2] };
    return valid(r) ? r : null;
  }
  return null;
}

export function formatLong({ y, m, d }: YMD): string {
  return `${MONTH_NAMES[m - 1]} ${d}, ${y}`;
}

/*
 * Medicare Beneficiary Identifier: 11 characters in CMS's published pattern
 * (C A AN N A AN N A A N N), letters excluding S, L, O, I, B, Z.
 * Dashes and spaces are ignored.
 */
const A = "[AC-HJKMNP-RT-Y]";
const AN = "[AC-HJKMNP-RT-Y0-9]";
const MBI_RE = new RegExp(`^[1-9]${A}${AN}[0-9]${A}${AN}[0-9]${A}${A}[0-9][0-9]$`);

export function normalizeMbi(input: string): string {
  return input.replace(/[\s-]/g, "").toUpperCase();
}

export function mbiError(input: string): string | null {
  const v = normalizeMbi(input);
  if (!v) return "Enter the patient's Medicare number (MBI).";
  if (v.length !== 11) return `An MBI has 11 characters. This has ${v.length}.`;
  if (/[SLOIBZ]/.test(v)) return "MBIs never use the letters S, L, O, I, B or Z. Check for a 0 (zero) or 1 (one).";
  if (!MBI_RE.test(v)) return "That isn't in the MBI format. Check it against the patient's Medicare card.";
  return null;
}
