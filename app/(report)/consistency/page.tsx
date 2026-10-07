import type { Metadata } from "next";
import { Callout, Card, SectionHeader } from "@/components/ui";
import { contrast } from "@/lib/contrast";

export const metadata: Metadata = { title: "Consistency and design system", description: "Component inventory of the MedLink portal and a proposed pattern library to replace seven button styles, four date pickers and three table designs." };

const INVENTORY = [
  { component: "Buttons", found: 7, where: "Gray bevel, blue gradient, red pill, green flat, text link, image button, “>>” link", proposed: "Primary, secondary, destructive" },
  { component: "Date entry", found: 4, where: "Free text MM/DD/YYYY, three dropdowns, calendar popup, MMDDYY field", proposed: "One date field accepting common formats" },
  { component: "Tables", found: 3, where: "Bold-row header, gradient header, no header", proposed: "One data table with real headers, sort and card reflow" },
  { component: "Alerts", found: 5, where: "Red box, red text, yellow box, green text, JavaScript alert()", proposed: "Info, success, warning, error, with icon and text" },
  { component: "Form labels", found: 3, where: "Placeholder, left label, none", proposed: "Label above the field, hint below" },
  { component: "Page titles", found: 3, where: "14px bold, 16px bold, image header", proposed: "One H1 style per page" },
];

const TOKENS = [
  { name: "primary", hex: "#0B5CAD", use: "Actions, links, selected" },
  { name: "ink", hex: "#1B2733", use: "Text and headings" },
  { name: "muted", hex: "#4D5B69", use: "Secondary text and hints" },
  { name: "success", hex: "#1F6B3A", use: "Covered, received, paid" },
  { name: "warning", hex: "#8A5A00", use: "Due soon, needs action" },
  { name: "error", hex: "#B42318", use: "Errors, denied" },
];

function LegacyButtons() {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-line bg-white p-4" style={{ fontFamily: "Verdana, sans-serif" }}>
      <span className="border border-[#888] bg-gradient-to-b from-[#f4f4f4] to-[#d4d4d4] px-3 py-0.5 text-[11px] text-black">Login</span>
      <span className="rounded-[3px] bg-gradient-to-b from-[#5b8fc4] to-[#2b5a8a] px-4 py-1 text-[11px] font-bold text-white">Continue &gt;&gt;</span>
      <span className="rounded-xl bg-[#b02a2a] px-4 py-1 text-[11px] font-bold text-white">Submit Inquiry</span>
      <span className="border border-[#2b6a2b] bg-[#2f7a2f] px-3 py-0.5 text-[11px] text-white">Upload Document</span>
      <span className="text-[11px] text-[#1e3f63] underline">Reset</span>
      <span className="rounded bg-[#1e3f63] px-2 py-1 text-[10px] text-white">GO</span>
      <span className="text-[11px] font-bold text-[#1e3f63]">Next &gt;&gt;</span>
    </div>
  );
}

export default function ConsistencyPage() {
  return (
    <div className="space-y-12">
      <SectionHeader n="05" eyebrow="Visual and component consistency" title="Twenty-five variants of six components">
        Every screen solved the same problems again. A small pattern library fixes consistency once, makes the accessibility fixes stick, and is the fastest path for the follow-on build.
      </SectionHeader>

      <section aria-labelledby="buttons-h">
        <h2 id="buttons-h" className="text-xl font-extrabold text-ink">
          The same action, seven ways
        </h2>
        <p className="mt-1 text-muted">Every button style found on four screens. Each one means “do it”.</p>
        <div className="mt-3">
          <LegacyButtons />
        </div>
      </section>

      <Card className="overflow-x-auto p-0">
        <table className="w-full min-w-[720px] text-left text-sm">
          <caption className="sr-only">Component inventory: variants found and the proposed pattern</caption>
          <thead className="bg-mist text-dim">
            <tr>
              <th scope="col" className="px-4 py-3 font-bold">
                Component
              </th>
              <th scope="col" className="px-4 py-3 text-right font-bold">
                Variants
              </th>
              <th scope="col" className="px-4 py-3 font-bold">
                Found
              </th>
              <th scope="col" className="px-4 py-3 font-bold">
                Pattern library
              </th>
            </tr>
          </thead>
          <tbody>
            {INVENTORY.map((r) => (
              <tr key={r.component} className="border-t border-line align-top">
                <th scope="row" className="px-4 py-3 font-bold text-ink">
                  {r.component}
                </th>
                <td className="px-4 py-3 text-right text-lg font-extrabold text-orange-ink tnum">{r.found}</td>
                <td className="px-4 py-3 text-muted">{r.where}</td>
                <td className="px-4 py-3 font-semibold text-good">{r.proposed}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <section aria-labelledby="lib-h" className="medlink rounded-2xl border border-line bg-[var(--ml-surface)] p-6">
        <p className="text-xs font-bold tracking-[0.13em] text-[var(--ml-muted)] uppercase">Proposed · MedLink pattern library v0.1</p>
        <h2 id="lib-h" className="mt-1 text-2xl font-bold text-[var(--ml-ink)]">
          Small on purpose: tokens, six components, one set of rules
        </h2>
        <p className="mt-2 max-w-3xl text-[var(--ml-muted)]">Public Sans, the U.S. Web Design System&apos;s typeface, keeps it familiar to a government contractor&apos;s teams and auditors. Every colour pairing is checked; the focus ring is the same on every control.</p>

        <ul className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3">
          {TOKENS.map((t) => (
            <li key={t.name} className="flex items-center gap-3 rounded-lg bg-white p-3">
              <span aria-hidden="true" className="size-10 shrink-0 rounded-md" style={{ background: t.hex }} />
              <span>
                <span className="block font-bold">{t.name}</span>
                <span className="block font-mono text-xs text-[var(--ml-muted)]">
                  {t.hex} · {contrast(t.hex, "#ffffff").toFixed(1)}:1
                </span>
                <span className="block text-xs text-[var(--ml-muted)]">{t.use}</span>
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="rounded-lg bg-white p-4">
            <p className="text-sm font-bold">Buttons</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-md bg-[var(--ml-primary)] px-4 py-2 font-semibold text-white">Check coverage</span>
              <span className="rounded-md border-2 border-[var(--ml-primary)] px-4 py-2 font-semibold text-[var(--ml-primary)]">Cancel</span>
              <span className="rounded-md bg-[var(--ml-error)] px-4 py-2 font-semibold text-white">Remove</span>
            </div>
          </div>
          <div className="rounded-lg bg-white p-4">
            <p className="text-sm font-bold">Field</p>
            <p className="mt-3 text-sm font-semibold">Date of birth</p>
            <p className="rounded-md border border-[var(--ml-line-strong)] px-3 py-2">03/04/1952</p>
            <p className="mt-1 text-xs text-[var(--ml-muted)]">Read as March 4, 1952</p>
          </div>
          <div className="rounded-lg bg-white p-4">
            <p className="text-sm font-bold">Status</p>
            <div className="mt-3 flex flex-wrap gap-2 text-sm font-semibold">
              <span className="rounded-full bg-[var(--ml-success-soft)] px-3 py-1 text-[var(--ml-success)]">✓ Paid</span>
              <span className="rounded-full bg-[var(--ml-warn-soft)] px-3 py-1 text-[var(--ml-warn)]">! Needs records</span>
              <span className="rounded-full bg-[var(--ml-error-soft)] px-3 py-1 text-[var(--ml-error)]">✕ Denied</span>
            </div>
          </div>
        </div>
      </section>

      <Callout title="Why a library, not a reskin">
        The audit found most accessibility failures in shared patterns: placeholder labels, unlabelled icons, colour-only errors. Fixing them once in components, with automated checks in CI, stops them coming back screen by screen. It also gives Prominent&apos;s developers a head start on the follow-on implementation.
      </Callout>
    </div>
  );
}
