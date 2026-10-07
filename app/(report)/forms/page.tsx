import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Callout, SectionHeader } from "@/components/ui";

export const metadata: Metadata = { title: "Forms and error messages", description: "Before-and-after rewrites of the MedLink portal's error messages and form validation." };

type Pair = { finding: string; context: string; before: ReactNode; after: ReactNode; why: string };

const PAIRS: Pair[] = [
  {
    finding: "F-04",
    context: "Provider selection, one ID mistyped",
    before: <span className="font-bold text-[#c00]">ERR-4021: Invalid request.</span>,
    after: (
      <>
        <b>PTAN not found for this NPI.</b> Check the 9-character PTAN on your enrollment letter. <span className="text-xs text-dim">(Ref ERR-4021)</span>
      </>
    ),
    why: "Names the field, states the fix, keeps the code for the help desk.",
  },
  {
    finding: "F-09 · F-10",
    context: "Eligibility search, date of birth typed 3/4/1952",
    before: <span className="font-bold text-[#c00]">ELG-102: The request could not be processed. Verify all fields and resubmit. Date fields must be MM/DD/YYYY.</span>,
    after: (
      <>
        Accepted as <b>March 4, 1952</b>. <span className="text-dim">(Any common format works; the field shows how it was read.)</span>
      </>
    ),
    why: "Prevents the error instead of explaining it, and never clears what the user typed.",
  },
  {
    finding: "F-20",
    context: "Records upload, a .docx chosen",
    before: <span className="inline-block border-2 border-[#c00] px-2 py-0.5 text-[#6b6b6b]">Browse… letter.docx</span>,
    after: (
      <>
        <b>letter.docx can&apos;t be sent as-is.</b> Save it as PDF, or send PDF, TIFF, JPG or PNG files. Other files are kept.
      </>
    ),
    why: "Says it in text, not just a red border; tied to the field so screen readers announce it.",
  },
  {
    finding: "F-03",
    context: "Inactivity during a long form",
    before: <span className="text-[#c00]">Your session has expired due to inactivity. Any unsaved information has been lost.</span>,
    after: (
      <>
        <b>You&apos;ll be signed out in 2 minutes</b> to protect patient information. Your draft is saved. <span className="ml-1 rounded-full bg-gold px-2 py-0.5 text-xs font-bold text-ink">Stay signed in</span>
      </>
    ),
    why: "Warns first (WCAG 2.2.1), offers one action, keeps the work.",
  },
  {
    finding: "F-19",
    context: "After sending records",
    before: <span className="font-bold text-[#060]">Submitted.</span>,
    after: (
      <>
        <b>Received: 3 files for claim …5601.</b> Reference DOC-4F7K-21. Due Nov 14, received Oct 30. Track it under Requests.
      </>
    ),
    why: "Answers the questions people otherwise call to ask.",
  },
  {
    finding: "F-02",
    context: "Any form field",
    before: <span className="inline-block w-48 border border-[#999] px-1 text-[#6b6b6b]">NPI</span>,
    after: (
      <span className="inline-flex flex-col">
        <span className="text-sm font-bold">NPI</span>
        <span className="inline-block w-48 rounded border border-line-strong px-2 py-1">1234567893</span>
        <span className="text-xs text-dim">10 digits, on your NPPES record</span>
      </span>
    ),
    why: "A label that stays visible, and a hint that tells people where to find the number.",
  },
];

const RULES = [
  ["Say what happened, in their words", "“PTAN not found for this NPI”, not “Invalid request”."],
  ["Say how to fix it", "Point at the field and the source of the right value."],
  ["Never discard input", "Errors mark fields. They don't clear them."],
  ["Validate when the user leaves a field", "Not on every keystroke, and not only after submit."],
  ["Text, not just colour", "Every error has words, tied to the field with aria-describedby, and an error summary that takes focus."],
  ["Keep the code, quietly", "Reference codes stay in small print so the help desk can still use them."],
];

export default function FormsPage() {
  return (
    <div className="space-y-12">
      <SectionHeader n="04" eyebrow="Forms, validation and error messages" title="Errors that explain, prevent, and keep your work">
        The portal&apos;s errors are written for the system that raised them. These rewrites are written for the person who has to recover, and they become the content rules for every form in the follow-on build.
      </SectionHeader>

      <ul className="space-y-4">
        {PAIRS.map((p) => (
          <li key={p.context} className="avoid-break rounded-xl border border-line p-5">
            <p className="flex flex-wrap items-baseline justify-between gap-2">
              <span className="font-extrabold text-ink">{p.context}</span>
              <span className="font-mono text-xs font-bold text-teal-2">{p.finding}</span>
            </p>
            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="rounded-lg border border-line bg-[#f7f7f7] p-3 text-[13px]" style={{ fontFamily: "Verdana, sans-serif" }}>
                <p className="mb-1 text-xs font-bold tracking-wide text-dim uppercase" style={{ fontFamily: "var(--font-urbanist)" }}>
                  Today
                </p>
                {p.before}
              </div>
              <div className="rounded-lg border border-good/30 bg-good-soft/50 p-3 text-[15px] text-body">
                <p className="mb-1 text-xs font-bold tracking-wide text-good uppercase">Proposed</p>
                {p.after}
              </div>
            </div>
            <p className="mt-2 text-sm text-muted">{p.why}</p>
          </li>
        ))}
      </ul>

      <section aria-labelledby="rules-h">
        <h2 id="rules-h" className="text-2xl font-extrabold text-ink">
          Six rules for every form
        </h2>
        <ol className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          {RULES.map(([t, b], i) => (
            <li key={t} className="flex gap-3 rounded-lg bg-mist p-4">
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-gold font-extrabold text-ink">{i + 1}</span>
              <span>
                <span className="block font-bold text-ink">{t}</span>
                <span className="text-sm text-muted">{b}</span>
              </span>
            </li>
          ))}
        </ol>
        <div className="mt-4">
          <Callout title="Feasibility note from the architect pass" tone="orange">
            Rewording errors is front-end only where the API returns structured error fields. Where it returns only a code (ERR-4021, ELG-102), the build needs a small mapping table from code to field and message. That&apos;s sized into the backlog.
          </Callout>
        </div>
      </section>
    </div>
  );
}
