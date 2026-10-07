import type { TaskId } from "@/lib/audit";

/*
 * Top-task walkthroughs. Each "before" step is checked against the four
 * cognitive-walkthrough questions:
 *   1. Will the user try to do the right thing?
 *   2. Will they notice the control that does it?
 *   3. Will they connect the control to their goal?
 *   4. Will they understand the feedback?
 * A "no" on any question is a likely failure point and links to a finding.
 * Times are keystroke-level estimates, to be replaced by moderated sessions.
 */

export type CW = [boolean, boolean, boolean, boolean];

export type Step = {
  action: string;
  cw?: CW;
  findings?: string[];
  deadEnd?: boolean;
};

export type Walkthrough = {
  id: Exclude<TaskId, "all">;
  title: string;
  goal: string;
  who: string;
  before: { steps: Step[]; fields: number; seconds: number };
  after: { steps: Step[]; fields: number; seconds: number };
  built?: string;
};

export const CW_QUESTIONS = ["Will they try it?", "Will they see the control?", "Will they connect it to the goal?", "Will they understand the result?"];

const ok: CW = [true, true, true, true];

export const WALKTHROUGHS: Walkthrough[] = [
  {
    id: "eligibility",
    title: "Check a patient's coverage",
    goal: "Can I see this patient today, and what will they owe?",
    who: "Front-desk staff, 30–60 times a day",
    built: "/after/eligibility",
    before: {
      fields: 9,
      seconds: 170,
      steps: [
        { action: "Sign in, then re-enter TIN, NPI and PTAN", cw: [true, true, true, false], findings: ["F-01", "F-02", "F-04"] },
        { action: "Find “Elig/Benefits” among 14 menu items", cw: [true, false, false, true], findings: ["F-05"] },
        { action: "Enter MBI, last name, first name, date of birth and date of service", cw: [true, true, true, true], findings: ["F-09"] },
        { action: "Submit; date rejected (3/4/1952 isn't MM/DD/YYYY)", cw: [true, true, true, false], findings: ["F-09", "F-04"] },
        { action: "Every field cleared: retype all five", cw: [true, true, true, false], findings: ["F-10"], deadEnd: true },
        { action: "Read “PART A: Y  PART B: Y  MSP: N” and decode it", cw: [true, true, false, false], findings: ["F-11"] },
      ],
    },
    after: {
      fields: 3,
      seconds: 45,
      steps: [
        { action: "Sign in; last provider profile is preselected", cw: ok },
        { action: "“Check coverage” is the first item under Patients", cw: ok },
        { action: "Enter MBI, or name + date of birth in any common format", cw: ok },
        { action: "Read “Covered today: Part A and B” with deductible remaining", cw: ok },
      ],
    },
  },
  {
    id: "claims",
    title: "Find out why a claim hasn't paid",
    goal: "What's happening with this claim, and do I need to do anything?",
    who: "Billing staff, daily",
    before: {
      fields: 0,
      seconds: 240,
      steps: [
        { action: "Open “Claim Inq” (third guess in the menu)", cw: [true, false, false, true], findings: ["F-05"] },
        { action: "Page through 10 rows at a time sorted by internal ID", cw: [true, true, true, true], findings: ["F-14"] },
        { action: "See status “A2-20”", cw: [true, true, true, false], findings: ["F-13"] },
        { action: "Open the 64-page PDF guide to decode it", cw: [false, true, true, false], findings: ["F-23"], deadEnd: true },
      ],
    },
    after: {
      fields: 1,
      seconds: 40,
      steps: [
        { action: "Claims → “Needs action” filter shows two claims", cw: ok },
        { action: "Status reads “Needs records: due Nov 14”", cw: ok },
        { action: "“Send records” opens submission with the claim attached", cw: ok },
      ],
    },
  },
  {
    id: "documents",
    title: "Respond to a request for medical records",
    goal: "Send what was asked for, before the deadline, and know it arrived.",
    who: "Medical records or billing staff, weekly",
    built: "/after/documents",
    before: {
      fields: 4,
      seconds: 420,
      steps: [
        { action: "Find “ADR Doc Sub” in the menu", cw: [true, false, false, true], findings: ["F-05"] },
        { action: "Retype the 17-digit claim number from the letter", cw: [true, true, true, true], findings: ["F-17", "F-16"] },
        { action: "Merge three scans into one PDF under 5 MB, outside the portal", cw: [false, true, true, true], findings: ["F-18"], deadEnd: true },
        { action: "Choose the file in an unlabelled field", cw: [true, false, true, true], findings: ["F-20"] },
        { action: "See “Submitted”, with no reference number or due date", cw: [true, true, true, false], findings: ["F-19"] },
        { action: "Call the help desk to confirm it arrived", deadEnd: true, findings: ["F-19"] },
      ],
    },
    after: {
      fields: 1,
      seconds: 90,
      steps: [
        { action: "Documents → “Open requests” lists due dates", cw: ok },
        { action: "Pick the request; the claim is attached", cw: ok },
        { action: "Add all files at once (PDF, TIFF, JPG), merged server-side", cw: ok },
        { action: "Get a reference number and “Received before the Nov 14 due date”", cw: ok },
      ],
    },
  },
  {
    id: "remittance",
    title: "Download a remittance advice",
    goal: "Reconcile a payment against what was billed.",
    who: "Billing staff, weekly",
    before: {
      fields: 3,
      seconds: 150,
      steps: [
        { action: "Find “Fin Inq”, then “RA” in a second menu", cw: [true, false, false, true], findings: ["F-05"] },
        { action: "Enter check number and date range in MM/DD/YYYY", cw: [true, true, true, true], findings: ["F-09"] },
        { action: "Open a fixed-width PDF that isn't tagged for screen readers", cw: [true, true, true, false], findings: ["F-07"] },
      ],
    },
    after: {
      fields: 1,
      seconds: 50,
      steps: [
        { action: "Claims → Payments lists recent payments", cw: ok },
        { action: "Open one: lines matched to claims, with export to CSV", cw: ok },
      ],
    },
  },
  {
    id: "admin",
    title: "Give a new staff member access",
    goal: "Get a new hire working on day one, with the right permissions.",
    who: "Provider office administrators, monthly",
    before: {
      fields: 11,
      seconds: 600,
      steps: [
        { action: "Find user admin (not in the menu; under the account icon)", cw: [true, false, false, true], findings: ["F-05", "F-08"] },
        { action: "Fill 11 fields, including the new user's PTAN list", cw: [true, true, true, true], findings: ["F-01"] },
        { action: "Assign roles from a list of internal codes", cw: [true, true, false, false], findings: ["F-13"] },
        { action: "New user's invite link expires in 48 hours, unexplained", cw: [true, true, true, false], findings: ["F-04"], deadEnd: true },
      ],
    },
    after: {
      fields: 3,
      seconds: 120,
      steps: [
        { action: "Account → Users → “Invite someone”", cw: ok },
        { action: "Name, email, and a role described in plain words", cw: ok },
        { action: "Invite shows its expiry, with “Resend” one click away", cw: ok },
      ],
    },
  },
];

export function cwFailures(steps: Step[]): number {
  return steps.reduce((n, s) => n + (s.cw ? s.cw.filter((x) => !x).length : 0), 0);
}
