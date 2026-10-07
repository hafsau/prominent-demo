/*
 * The audit's data model. Every finding is tied to a place in the "before"
 * portal (data-finding attributes), a Nielsen heuristic, a severity from three
 * independent passes, WCAG 2.1 criteria where they apply, and an effort
 * estimate made with the solutions architect. The backlog, roadmap, report and
 * readout are all derived from this one list, so they can't drift apart.
 */

export type Screen = "login" | "home" | "eligibility" | "claims" | "documents" | "global";
export type TaskId = "eligibility" | "claims" | "documents" | "remittance" | "admin" | "all";

export const HEURISTICS = {
  1: "Visibility of system status",
  2: "Match between system and the real world",
  3: "User control and freedom",
  4: "Consistency and standards",
  5: "Error prevention",
  6: "Recognition rather than recall",
  7: "Flexibility and efficiency of use",
  8: "Aesthetic and minimalist design",
  9: "Help users recognize, diagnose, and recover from errors",
  10: "Help and documentation",
} as const;
export type Heuristic = keyof typeof HEURISTICS;

export const SEVERITY_LABEL = ["Not a problem", "Cosmetic", "Minor", "Major", "Catastrophe"] as const;

/** Share of portal sessions that include each task. Assumed for the demo; week 1 replaces it with the client's analytics. */
export const TASK_REACH: Record<TaskId, number> = {
  all: 1,
  eligibility: 0.35,
  claims: 0.3,
  remittance: 0.12,
  documents: 0.08,
  admin: 0.05,
};

export const SCREEN_LABEL: Record<Screen, string> = {
  login: "Sign in",
  home: "Home",
  eligibility: "Eligibility",
  claims: "Claim status",
  documents: "Document submission",
  global: "Whole portal",
};

export type Finding = {
  id: string;
  title: string;
  screen: Screen;
  task: TaskId;
  heuristics: Heuristic[];
  /** Severity 0–4 from three independent evaluators. */
  ratings: [number, number, number];
  wcag?: string[];
  /** 1 (hours) to 5 (multi-sprint), estimated with the solutions architect. */
  effort: 1 | 2 | 3 | 4 | 5;
  evidence: string;
  recommendation: string;
  /** Rule ids an axe scan of the "before" portal should report for this finding. */
  axe?: string[];
};

export const FINDINGS: Finding[] = [
  {
    id: "F-01",
    title: "Three provider IDs before you can do anything",
    screen: "login",
    task: "all",
    heuristics: [6, 7],
    ratings: [3, 3, 2],
    effort: 3,
    evidence: "Every sign-in asks for TIN, NPI and PTAN after the password. Office staff who work for several providers keep the numbers on sticky notes.",
    recommendation: "Store provider profiles on the account. After sign-in, pick a provider from a list, with the last one used preselected.",
  },
  {
    id: "F-02",
    title: "Field labels are placeholders that vanish while typing",
    screen: "login",
    task: "all",
    heuristics: [6],
    ratings: [3, 2, 3],
    wcag: ["1.3.1", "3.3.2", "4.1.2"],
    effort: 1,
    evidence: "Sign-in and provider fields use placeholder text as their only label. Once a user types, nothing says which ID went where, and screen readers announce “edit text, blank”.",
    recommendation: "Persistent visible labels tied to inputs, with format hints below the field.",
    axe: ["label"],
  },
  {
    id: "F-03",
    title: "The session ends with no warning, and unsaved work is lost",
    screen: "global",
    task: "all",
    heuristics: [1, 3],
    ratings: [4, 4, 3],
    wcag: ["2.2.1"],
    effort: 2,
    evidence: "After inactivity the portal returns to sign-in without warning. A half-written document submission is gone. (Shortened to 2 minutes in this demo.)",
    recommendation: "Warn 2 minutes before timeout with a single “Stay signed in” action, and keep drafts of long forms.",
  },
  {
    id: "F-04",
    title: "Error codes instead of explanations",
    screen: "login",
    task: "all",
    heuristics: [9],
    ratings: [3, 3, 3],
    wcag: ["3.3.1", "3.3.3"],
    effort: 1,
    evidence: "A mismatched provider combination returns “ERR-4021: Invalid request”. It doesn't say which of the three numbers is wrong.",
    recommendation: "Name the field, say what's wrong in plain language, and say how to fix it. Keep the code in small print for the help desk.",
  },
  {
    id: "F-05",
    title: "Fourteen menu items in internal jargon",
    screen: "home",
    task: "all",
    heuristics: [2, 8],
    ratings: [3, 2, 3],
    effort: 3,
    evidence: "“Elig/Benefits”, “Claim Inq”, “ADR Doc Sub”, “Fin Inq”, “Reopen”, “Redeterm”… ordered by when they were built, not by task.",
    recommendation: "Group into five task-based sections with plain labels, validated by a tree test (see IA review).",
  },
  {
    id: "F-06",
    title: "A stale maintenance banner is the loudest thing on the page",
    screen: "home",
    task: "all",
    heuristics: [1, 8],
    ratings: [2, 1, 2],
    effort: 1,
    evidence: "A red banner about last month's maintenance window sits above everything, so real alerts get ignored.",
    recommendation: "Expire banners automatically and reserve red for things that need action today.",
  },
  {
    id: "F-07",
    title: "Light-gray text fails contrast across the portal",
    screen: "global",
    task: "all",
    heuristics: [8],
    ratings: [2, 3, 2],
    wcag: ["1.4.3"],
    effort: 1,
    evidence: "Help text, table metadata and footer links use #9A9A9A on white (2.8:1). WCAG AA needs 4.5:1.",
    recommendation: "Adopt a text palette where every pairing is checked, enforced in the pattern library tokens.",
    axe: ["color-contrast"],
  },
  {
    id: "F-08",
    title: "Icon-only links have no accessible name",
    screen: "home",
    task: "all",
    heuristics: [4],
    ratings: [2, 3, 2],
    wcag: ["2.4.4", "4.1.2"],
    effort: 1,
    evidence: "The print, help and mail icons on Home are images in links with no alt text. Screen readers announce “link”.",
    recommendation: "Give icon links visible text or an accessible name; add these to the automated checks in CI.",
    axe: ["link-name", "image-alt"],
  },
  {
    id: "F-09",
    title: "Date of birth must be MM/DD/YYYY, but the format is a secret",
    screen: "eligibility",
    task: "eligibility",
    heuristics: [5],
    ratings: [3, 3, 2],
    wcag: ["3.3.2"],
    effort: 1,
    evidence: "Typing 3/4/1952 fails. The required format only appears in the error after submitting.",
    recommendation: "Accept common date formats, show the expected format next to the label, and validate as the user leaves the field.",
  },
  {
    id: "F-10",
    title: "A failed search clears every field",
    screen: "eligibility",
    task: "eligibility",
    heuristics: [3, 5],
    ratings: [4, 3, 4],
    wcag: ["3.3.1"],
    effort: 1,
    evidence: "One bad field wipes the MBI, names and dates the user just typed. On the highest-volume task, every mistake costs a full re-entry.",
    recommendation: "Keep all input; mark only the field in error and move focus to the error summary.",
  },
  {
    id: "F-11",
    title: "Results are codes, not answers",
    screen: "eligibility",
    task: "eligibility",
    heuristics: [2],
    ratings: [3, 3, 3],
    effort: 2,
    evidence: "The result reads “PART A: Y  PART B: Y  MSP: N  HETS: 1”. The question was “Can I see this patient today, and what will they owe?”.",
    recommendation: "Lead with a plain answer (“Covered: Part A and B, active”), then deductible remaining, then the codes for staff who need them.",
  },
  {
    id: "F-12",
    title: "No way to re-check a patient you just looked up",
    screen: "eligibility",
    task: "eligibility",
    heuristics: [6, 7],
    ratings: [2, 2, 1],
    effort: 2,
    evidence: "Front desks check the same patients at check-in and again at checkout. Every check starts from a blank form.",
    recommendation: "A “Recent lookups” list for the session, cleared on sign-out.",
  },
  {
    id: "F-13",
    title: "Claim statuses need the training manual",
    screen: "claims",
    task: "claims",
    heuristics: [2, 10],
    ratings: [3, 4, 3],
    effort: 2,
    evidence: "Statuses show as “T1”, “R2” or “A2-20”. The meaning is on page 41 of the PDF user guide.",
    recommendation: "Plain status (“Paid”, “Needs records”, “Denied: duplicate”) with the next step, and the code kept as secondary detail.",
  },
  {
    id: "F-14",
    title: "No search or filter: 10 rows per page across hundreds of claims",
    screen: "claims",
    task: "claims",
    heuristics: [7],
    ratings: [3, 2, 3],
    effort: 3,
    evidence: "Finding one claim means paging through results sorted by internal ID.",
    recommendation: "Search by patient, claim number or date of service, plus filters for “needs action” and status.",
  },
  {
    id: "F-15",
    title: "The claims table isn't a table to a screen reader",
    screen: "claims",
    task: "claims",
    heuristics: [4],
    ratings: [2, 3, 2],
    wcag: ["1.3.1"],
    effort: 1,
    evidence: "Column titles are bold cells, not headers, so screen reader users hear values with no column names.",
    recommendation: "Real header cells with scope, a caption, and sortable columns that announce their sort state.",
  },
  {
    id: "F-16",
    title: "A 17-digit claim number with no way to copy it or act on it",
    screen: "claims",
    task: "documents",
    heuristics: [7],
    ratings: [2, 2, 2],
    effort: 1,
    evidence: "Staff retype the ICN into the document submission screen, one digit at a time.",
    recommendation: "A copy button, and “Send records for this claim” directly from the claim row.",
  },
  {
    id: "F-17",
    title: "Responding to a records request starts with retyping a 17-digit number",
    screen: "documents",
    task: "documents",
    heuristics: [5, 6],
    ratings: [3, 3, 4],
    effort: 2,
    evidence: "The portal knows which claims have open requests but asks the user to type the claim number from the letter.",
    recommendation: "List open requests with due dates. Pick one; the claim is already attached.",
  },
  {
    id: "F-18",
    title: "One PDF per submission: multi-part records must be merged offline",
    screen: "documents",
    task: "documents",
    heuristics: [7],
    ratings: [3, 3, 3],
    effort: 4,
    evidence: "Records arrive as several scans and exports. The portal accepts a single PDF under 5 MB, so staff merge and compress files in other tools.",
    recommendation: "Accept multiple files and common formats, merged server-side through the document management integration.",
  },
  {
    id: "F-19",
    title: "“Submitted” with no confirmation number and no due date",
    screen: "documents",
    task: "documents",
    heuristics: [1],
    ratings: [4, 3, 4],
    effort: 2,
    evidence: "After upload the page says “Submitted” and nothing else. With money at stake, offices call the help desk to confirm.",
    recommendation: "A confirmation with a reference number, what was received, the due date met, and where to track it.",
  },
  {
    id: "F-20",
    title: "File field has no label; errors are only a red border",
    screen: "documents",
    task: "documents",
    heuristics: [9],
    ratings: [3, 3, 2],
    wcag: ["1.3.1", "1.4.1", "3.3.1"],
    effort: 1,
    evidence: "A screen reader announces “Browse, button” with no purpose. A rejected file turns the box red with no message.",
    recommendation: "Labelled upload with accepted types and size stated up front; errors in text, tied to the field.",
    axe: ["label"],
  },
  {
    id: "F-21",
    title: "Seven button styles for the same kind of action",
    screen: "global",
    task: "all",
    heuristics: [4],
    ratings: [1, 2, 1],
    effort: 3,
    evidence: "Gray bevel, blue gradient, text link, image button, red pill… for Submit, Search and Continue.",
    recommendation: "One primary, one secondary, one destructive style in a shared pattern library (see Consistency).",
  },
  {
    id: "F-22",
    title: "Fixed 980px layout: on a tablet, half the claims table is off-screen",
    screen: "global",
    task: "claims",
    heuristics: [7],
    ratings: [2, 3, 2],
    wcag: ["1.4.10"],
    effort: 4,
    evidence: "At 768px wide the page scrolls sideways. At 390px it's unusable.",
    recommendation: "A responsive grid, and on small screens tables reflow to cards. Ship with the pattern library rather than retrofitting each page.",
  },
  {
    id: "F-23",
    title: "Help is a 64-page PDF",
    screen: "global",
    task: "all",
    heuristics: [10],
    ratings: [2, 2, 2],
    effort: 2,
    evidence: "The only help link opens the full user guide. Nothing is contextual.",
    recommendation: "Short help next to each task, written from the training material, with the guide kept for reference.",
  },
  {
    id: "F-24",
    title: "No skip link: 30 tab stops before the main content",
    screen: "global",
    task: "all",
    heuristics: [7],
    ratings: [2, 3, 2],
    wcag: ["2.4.1"],
    effort: 1,
    evidence: "Keyboard users pass the logo, utility links and the full menu on every page.",
    recommendation: "A skip link and landmarks on every page.",
  },
];

export const FINDING_BY_ID = Object.fromEntries(FINDINGS.map((f) => [f.id, f])) as Record<string, Finding>;

/* ---------- Scoring ---------- */

export function severityMean(f: Finding): number {
  return Math.round(((f.ratings[0] + f.ratings[1] + f.ratings[2]) / 3) * 10) / 10;
}

/** Spread between evaluators. Large spreads get discussed before the readout. */
export function severitySpread(f: Finding): number {
  return Math.max(...f.ratings) - Math.min(...f.ratings);
}

/**
 * Impact on a 1–5 scale: severity, scaled by reach. A problem every session
 * hits counts in full; one on a low-traffic task counts at a little over half.
 * Multiplying (rather than adding) keeps cosmetic issues on busy pages from
 * outranking serious ones on important tasks.
 */
export function impact(f: Finding): number {
  const sev = severityMean(f) / 4;
  const reach = TASK_REACH[f.task];
  return Math.round((1 + 4 * sev * (0.55 + 0.45 * reach)) * 10) / 10;
}

export type Quadrant = "quick-win" | "big-bet" | "fill-in" | "later";
export const QUADRANT_LABEL: Record<Quadrant, string> = {
  "quick-win": "Quick wins",
  "big-bet": "Big bets",
  "fill-in": "Fill-ins",
  later: "Reconsider later",
};

export const IMPACT_THRESHOLD = 3;
export const EFFORT_THRESHOLD = 2.5;

export function quadrant(impactScore: number, effort: number): Quadrant {
  const high = impactScore >= IMPACT_THRESHOLD;
  const cheap = effort <= EFFORT_THRESHOLD;
  if (high && cheap) return "quick-win";
  if (high) return "big-bet";
  if (cheap) return "fill-in";
  return "later";
}

/** Priority order: quadrant first, then impact per unit of effort. */
export function prioritize<T extends { impact: number; effort: number }>(items: T[]): T[] {
  const order: Quadrant[] = ["quick-win", "big-bet", "fill-in", "later"];
  return [...items].sort((a, b) => {
    const q = order.indexOf(quadrant(a.impact, a.effort)) - order.indexOf(quadrant(b.impact, b.effort));
    return q || b.impact / b.effort - a.impact / a.effort;
  });
}

/* ---------- Backlog export ---------- */

function csvCell(v: string | number): string {
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** Jira CSV import format: Summary, Description, Labels, Priority, Story Points. */
export function backlogCsv(items: { id: string; title: string; impact: number; effort: number; recommendation: string; heuristics: Heuristic[]; wcag?: string[] }[]): string {
  const rows = [["Summary", "Description", "Labels", "Priority", "Story Points"]];
  for (const i of prioritize(items)) {
    const q = quadrant(i.impact, i.effort);
    const priority = q === "quick-win" ? "Highest" : q === "big-bet" ? "High" : q === "fill-in" ? "Medium" : "Low";
    const labels = ["ux-audit", q, ...(i.wcag?.length ? ["accessibility"] : [])].join(" ");
    const points = [1, 2, 3, 5, 8][i.effort - 1];
    rows.push([`${i.id}: ${i.title}`, `${i.recommendation} (Impact ${i.impact}/5. Heuristics: ${i.heuristics.map((h) => HEURISTICS[h]).join("; ")}${i.wcag?.length ? `. WCAG ${i.wcag.join(", ")}` : ""})`, labels, priority, String(points)]);
  }
  return rows.map((r) => r.map(csvCell).join(",")).join("\n");
}

export function summary() {
  const scored = FINDINGS.map((f) => ({ ...f, sev: severityMean(f), impact: impact(f) }));
  const bySeverity = [0, 1, 2, 3, 4].map((s) => scored.filter((f) => Math.round(f.sev) === s).length);
  const accessibility = FINDINGS.filter((f) => f.wcag?.length).length;
  const quick = scored.filter((f) => quadrant(f.impact, f.effort) === "quick-win").length;
  return { total: FINDINGS.length, bySeverity, accessibility, quick, critical: scored.filter((f) => f.sev >= 3).length };
}
