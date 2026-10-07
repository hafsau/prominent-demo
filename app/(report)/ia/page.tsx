import type { Metadata } from "next";
import { Callout, Card, SectionHeader } from "@/components/ui";

export const metadata: Metadata = { title: "Information architecture", description: "Menu structure, labels and content organization of the MedLink portal: fourteen jargon items regrouped into five task-based sections." };

const BEFORE = ["Home", "Elig/Benefits", "MBI Lookup", "Claim Inq", "Claim Submit (DDE)", "ADR Doc Sub", "Fin Inq", "RA/835", "Reopen", "Redeterm", "PA Req", "CERT/RAC", "Msg Ctr", "Prov Admin"];

const AFTER: { group: string; items: { label: string; was: string }[] }[] = [
  { group: "Patients", items: [{ label: "Check coverage", was: "Elig/Benefits, MBI Lookup" }] },
  {
    group: "Claims",
    items: [
      { label: "Claim status", was: "Claim Inq" },
      { label: "Submit a claim", was: "Claim Submit (DDE)" },
      { label: "Payments and remittances", was: "Fin Inq, RA/835" },
      { label: "Fix or appeal a claim", was: "Reopen, Redeterm" },
    ],
  },
  {
    group: "Requests",
    items: [
      { label: "Respond to a records request", was: "ADR Doc Sub, CERT/RAC" },
      { label: "Prior authorization", was: "PA Req" },
    ],
  },
  { group: "Messages", items: [{ label: "Messages", was: "Msg Ctr" }] },
  {
    group: "Account",
    items: [
      { label: "Users and roles", was: "Prov Admin" },
      { label: "Provider profiles", was: "TIN/NPI/PTAN entry at sign-in" },
    ],
  },
];

const LABELS = [
  ["Elig/Benefits", "Check coverage", "Front desks say “check coverage” or “verify insurance”; nobody says “elig”."],
  ["Claim Inq", "Claim status", "Names the answer, not the transaction type."],
  ["ADR Doc Sub", "Respond to a records request", "“ADR” is the letter's name for it. The letter's own heading is “Request for Additional Documentation”."],
  ["Reopen / Redeterm", "Fix or appeal a claim", "Users don't know which process applies; the form can decide from the claim's status."],
  ["Fin Inq / RA/835", "Payments and remittances", "One place for money in."],
  ["Prov Admin", "Users and roles", "Matches what admins are trying to do."],
];

const TREE_TASKS = [
  "Your patient's Medicare card was replaced. Where do you check they're still covered?",
  "A claim from September hasn't paid. Where do you find out why?",
  "You received a letter asking for medical records. Where do you send them?",
  "A new billing clerk starts Monday. Where do you give them access?",
  "A payment arrived that doesn't match. Where do you reconcile it?",
];

export default function IAPage() {
  return (
    <div className="space-y-12">
      <SectionHeader n="03" eyebrow="Information architecture" title="Fourteen items in build order become five sections in task order">
        The menu grew one transaction at a time, labelled in the contractor&apos;s language. Regrouping by the jobs providers come to do removes most of the hunting in the walkthroughs.
      </SectionHeader>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="font-extrabold text-ink">Before: one flat list</h2>
          <p className="text-sm text-dim">14 items, internal abbreviations, ordered by release</p>
          <ol className="mt-4 grid grid-cols-2 gap-1.5 font-mono text-sm">
            {BEFORE.map((b, i) => (
              <li key={b} className="rounded border border-line bg-mist px-2 py-1 text-body">
                <span className="text-dim">{String(i + 1).padStart(2, "0")}</span> {b}
              </li>
            ))}
          </ol>
        </Card>
        <Card className="p-5">
          <h2 className="font-extrabold text-good">After: five task groups</h2>
          <p className="text-sm text-dim">Plain labels, at most four items per group</p>
          <ul className="mt-4 space-y-3">
            {AFTER.map((g) => (
              <li key={g.group}>
                <p className="text-sm font-extrabold tracking-wide text-teal uppercase">{g.group}</p>
                <ul className="mt-1 space-y-1">
                  {g.items.map((it) => (
                    <li key={it.label} className="flex flex-wrap items-baseline justify-between gap-2 rounded-lg border border-line px-3 py-1.5">
                      <span className="font-semibold text-ink">{it.label}</span>
                      <span className="text-xs text-dim">was {it.was}</span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <section aria-labelledby="labels-h">
        <h2 id="labels-h" className="text-2xl font-extrabold text-ink">
          Label audit
        </h2>
        <Card className="mt-4 overflow-x-auto p-0">
          <table className="w-full min-w-[640px] text-left text-sm">
            <caption className="sr-only">Current labels, proposed labels and why</caption>
            <thead className="bg-mist text-dim">
              <tr>
                <th scope="col" className="px-4 py-3 font-bold">
                  Today
                </th>
                <th scope="col" className="px-4 py-3 font-bold">
                  Proposed
                </th>
                <th scope="col" className="px-4 py-3 font-bold">
                  Why
                </th>
              </tr>
            </thead>
            <tbody>
              {LABELS.map(([a, b, c]) => (
                <tr key={a} className="border-t border-line align-top">
                  <th scope="row" className="px-4 py-3 font-mono font-normal text-body">
                    {a}
                  </th>
                  <td className="px-4 py-3 font-bold text-ink">{b}</td>
                  <td className="px-4 py-3 text-muted">{c}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </section>

      <section aria-labelledby="tree-h">
        <h2 id="tree-h" className="text-2xl font-extrabold text-ink">
          Validating it: a tree test in week three
        </h2>
        <p className="mt-2 max-w-3xl leading-relaxed text-muted">Proposed structure tested without visuals, with 20–30 provider office staff recruited through the client. Success is the right destination on the first click path. Tasks are written in their words, not the menu&apos;s:</p>
        <ol className="mt-4 space-y-2">
          {TREE_TASKS.map((t, i) => (
            <li key={t} className="flex gap-3 rounded-lg bg-mist px-4 py-3">
              <span className="font-mono text-sm font-bold text-orange-ink">T{i + 1}</span>
              <span className="text-body">{t}</span>
            </li>
          ))}
        </ol>
        <div className="mt-4">
          <Callout title="Target">At least 80% first-path success on every task before the new navigation goes to build. Below that, the label or the grouping changes, not the users.</Callout>
        </div>
      </section>
    </div>
  );
}
