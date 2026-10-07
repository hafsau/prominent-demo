import type { Metadata } from "next";
import { AxeScanner } from "@/components/report/axe-scanner";
import { Callout, Card, SectionHeader, SeverityBadge } from "@/components/ui";
import { FINDINGS } from "@/lib/audit";

export const metadata: Metadata = { title: "Section 508, WCAG 2.1 and browsers", description: "Accessibility findings mapped to WCAG 2.1 and Section 508, a live axe-core scan of the portal before and after, and a browser and screen-size matrix." };

const WCAG_NAMES: Record<string, string> = {
  "1.3.1": "Info and Relationships",
  "1.4.1": "Use of Color",
  "1.4.3": "Contrast (Minimum)",
  "1.4.10": "Reflow",
  "2.2.1": "Timing Adjustable",
  "2.4.1": "Bypass Blocks",
  "2.4.4": "Link Purpose (In Context)",
  "3.3.1": "Error Identification",
  "3.3.2": "Labels or Instructions",
  "3.3.3": "Error Suggestion",
  "4.1.2": "Name, Role, Value",
};
// WCAG 2.1 criteria that are not in WCAG 2.0, and so not in the Revised 508 Standards.
const NEW_IN_21 = new Set(["1.4.10"]);

const BROWSERS = ["Chrome", "Edge", "Firefox", "Safari"];
const VIEWPORTS = [
  { w: 1440, label: "Desktop 1440" },
  { w: 1024, label: "Laptop 1024" },
  { w: 768, label: "Tablet 768" },
  { w: 390, label: "Phone 390" },
];
function cell(w: number, browser: string): { ok: "pass" | "issue" | "fail"; note: string } {
  if (w <= 390) return { ok: "fail", note: "Fixed 980px layout; content off-screen" };
  if (w <= 768) return { ok: "issue", note: "Sideways scrolling; claims table clipped" };
  if (browser === "Safari") return { ok: "issue", note: "Date fields fall back to free text" };
  return { ok: "pass", note: "Renders as designed" };
}

export default function AccessibilityPage() {
  const rows = FINDINGS.filter((f) => f.wcag?.length).flatMap((f) => f.wcag!.map((sc) => ({ sc, f })));
  rows.sort((a, b) => a.sc.localeCompare(b.sc, undefined, { numeric: true }));

  return (
    <div className="space-y-12">
      <SectionHeader n="06" eyebrow="Section 508, WCAG 2.1 and cross-browser" title="Eleven accessibility findings, and a compliance clock">
        Measured against WCAG 2.1 AA, which covers the Revised Section 508 Standards (WCAG 2.0 AA) and the newer HHS requirement. Automated checks run live below; manual testing covers the rest.
      </SectionHeader>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Callout title="Section 508 applies now">A Medicare contractor builds and runs IT on behalf of CMS, so its portal falls under Section 508 and CMS&apos;s 508 policy. The Revised 508 Standards incorporate WCAG 2.0 AA.</Callout>
        <Callout title="WCAG 2.1 AA is coming" tone="orange">
          HHS&apos;s 2024 Section 504 rule requires WCAG 2.1 AA from organizations that receive HHS funding. An interim final rule in May 2026 moved the date to <b>May 11, 2027</b> for organizations with 15 or more employees. Auditing to 2.1 now covers both.
        </Callout>
      </div>

      <AxeScanner />

      <section aria-labelledby="wcag-h">
        <h2 id="wcag-h" className="text-2xl font-extrabold text-ink">
          Findings by success criterion
        </h2>
        <Card className="mt-4 overflow-x-auto p-0">
          <table className="w-full min-w-[720px] text-left text-sm">
            <caption className="sr-only">Accessibility findings mapped to WCAG 2.1 success criteria and Section 508</caption>
            <thead className="bg-mist text-dim">
              <tr>
                <th scope="col" className="px-4 py-3 font-bold">
                  Criterion
                </th>
                <th scope="col" className="px-4 py-3 font-bold">
                  Section 508
                </th>
                <th scope="col" className="px-4 py-3 font-bold">
                  Finding
                </th>
                <th scope="col" className="px-4 py-3 font-bold">
                  Severity
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ sc, f }) => (
                <tr key={`${sc}-${f.id}`} className="border-t border-line align-top">
                  <th scope="row" className="px-4 py-3 font-normal">
                    <span className="font-mono font-bold text-ink">{sc}</span> <span className="text-body">{WCAG_NAMES[sc]}</span>
                  </th>
                  <td className="px-4 py-3 text-muted">{NEW_IN_21.has(sc) ? "WCAG 2.1 only (HHS 504)" : "Yes (WCAG 2.0 AA)"}</td>
                  <td className="px-4 py-3">
                    <a href={`/findings#${f.id}`} className="link">
                      {f.id}
                    </a>{" "}
                    <span className="text-body">{f.title}</span>
                  </td>
                  <td className="px-4 py-3">
                    <SeverityBadge finding={f} compact />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </section>

      <section aria-labelledby="manual-h">
        <h2 id="manual-h" className="text-2xl font-extrabold text-ink">
          Manual checks automation can&apos;t make
        </h2>
        <ul className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          {[
            ["Keyboard only", "Every top task end to end without a mouse; focus always visible and in order."],
            ["Screen readers", "NVDA with Chrome and JAWS (common in offices), VoiceOver with Safari; forms, errors and tables."],
            ["Zoom and reflow", "200% and 400% zoom; nothing lost or overlapping."],
            ["Timeouts", "Warning before sign-out, enough time to respond, work preserved."],
            ["Documents", "Remittance and letter PDFs tagged and readable; uploads announced."],
            ["Plain language", "Error messages and labels understandable without the user guide."],
          ].map(([t, b]) => (
            <li key={t} className="rounded-lg bg-mist p-4">
              <p className="font-bold text-ink">{t}</p>
              <p className="text-sm text-muted">{b}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="browsers-h">
        <h2 id="browsers-h" className="text-2xl font-extrabold text-ink">
          Browsers and screen sizes
        </h2>
        <p className="mt-1 text-muted">Current portal. The redesign targets “renders as designed” in every cell.</p>
        <Card className="mt-4 overflow-x-auto p-0">
          <table className="w-full min-w-[720px] text-left text-sm">
            <caption className="sr-only">Browser and viewport matrix for the current portal</caption>
            <thead className="bg-mist text-dim">
              <tr>
                <th scope="col" className="px-4 py-3 font-bold">
                  Viewport
                </th>
                {BROWSERS.map((b) => (
                  <th key={b} scope="col" className="px-4 py-3 font-bold">
                    {b}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {VIEWPORTS.map((v) => (
                <tr key={v.w} className="border-t border-line align-top">
                  <th scope="row" className="px-4 py-3 font-bold text-ink">
                    {v.label}
                  </th>
                  {BROWSERS.map((b) => {
                    const c = cell(v.w, b);
                    return (
                      <td key={b} className="px-4 py-3">
                        <span className={`font-bold ${c.ok === "pass" ? "text-good" : c.ok === "issue" ? "text-[var(--sev-2)]" : "text-[var(--sev-4)]"}`}>
                          <span aria-hidden="true">{c.ok === "pass" ? "✓ " : c.ok === "issue" ? "! " : "✕ "}</span>
                          {c.ok === "pass" ? "Pass" : c.ok === "issue" ? "Issue" : "Fail"}
                        </span>
                        <span className="block text-xs text-dim">{c.note}</span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </section>
    </div>
  );
}
