import type { Metadata } from "next";
import Link from "next/link";
import { Card, SectionHeader } from "@/components/ui";
import { FINDING_BY_ID, TASK_REACH } from "@/lib/audit";
import { CW_QUESTIONS, cwFailures, WALKTHROUGHS, type Step } from "@/lib/tasks";

export const metadata: Metadata = { title: "Top-task walkthroughs", description: "End-to-end cognitive walkthroughs of the five highest-volume provider portal tasks, before and after, with steps, fields and time on task." };

function fmt(sec: number) {
  return sec >= 60 ? `${Math.floor(sec / 60)}m ${sec % 60 ? `${sec % 60}s` : ""}`.trim() : `${sec}s`;
}

export default function TasksPage() {
  return (
    <div className="space-y-12">
      <SectionHeader n="02" eyebrow="Task flow analysis" title="Five tasks carry most of the traffic. Each one stalls.">
        Each step is checked against the four cognitive-walkthrough questions. A “no” marks a likely failure, and dead ends are where people give up or pick up the phone. Times are keystroke-level estimates, to be confirmed in moderated sessions.
      </SectionHeader>

      <Card className="overflow-x-auto p-0">
        <table className="w-full min-w-[720px] text-left text-sm">
          <caption className="sr-only">Scorecard: before and after for each top task</caption>
          <thead className="bg-mist text-dim">
            <tr>
              <th scope="col" className="px-4 py-3 font-bold">
                Task
              </th>
              <th scope="col" className="px-4 py-3 font-bold">
                Share of sessions*
              </th>
              <th scope="col" className="px-4 py-3 text-right font-bold">
                Steps
              </th>
              <th scope="col" className="px-4 py-3 text-right font-bold">
                Fields
              </th>
              <th scope="col" className="px-4 py-3 text-right font-bold">
                Time
              </th>
              <th scope="col" className="px-4 py-3 text-right font-bold">
                Walkthrough “no”s
              </th>
            </tr>
          </thead>
          <tbody className="tnum">
            {WALKTHROUGHS.map((w) => (
              <tr key={w.id} className="border-t border-line">
                <th scope="row" className="px-4 py-3 font-bold text-ink">
                  <a href={`#${w.id}`} className="hover:underline">
                    {w.title}
                  </a>
                </th>
                <td className="px-4 py-3">{Math.round(TASK_REACH[w.id] * 100)}%</td>
                <td className="px-4 py-3 text-right">
                  {w.before.steps.length} → <b className="text-good">{w.after.steps.length}</b>
                </td>
                <td className="px-4 py-3 text-right">
                  {w.before.fields} → <b className="text-good">{w.after.fields}</b>
                </td>
                <td className="px-4 py-3 text-right">
                  {fmt(w.before.seconds)} → <b className="text-good">{fmt(w.after.seconds)}</b>
                </td>
                <td className="px-4 py-3 text-right">
                  {cwFailures(w.before.steps)} → <b className="text-good">{cwFailures(w.after.steps)}</b>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="border-t border-line px-4 py-2 text-xs text-dim">*Assumed for the demo. Week one replaces these with the client&apos;s analytics and help-desk call drivers.</p>
      </Card>

      {WALKTHROUGHS.map((w) => (
        <section key={w.id} id={w.id} aria-labelledby={`${w.id}-h`} className="avoid-break scroll-mt-24">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 id={`${w.id}-h`} className="text-2xl font-extrabold text-ink">
                {w.title}
              </h2>
              <p className="mt-1 text-muted">
                <span className="font-semibold text-body">“{w.goal}”</span> · {w.who}
              </p>
            </div>
            {w.built && (
              <Link href={w.built} className="inline-flex min-h-11 items-center rounded-full border-2 border-gold bg-gold px-5 text-sm font-bold text-ink hover:border-orange hover:bg-orange">
                Try the redesign
              </Link>
            )}
          </div>
          <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
            <Flow label="Before" steps={w.before.steps} meta={`${w.before.steps.length} steps · ${w.before.fields} fields · ~${fmt(w.before.seconds)}`} />
            <Flow label="After (proposed)" steps={w.after.steps} meta={`${w.after.steps.length} steps · ${w.after.fields} fields · ~${fmt(w.after.seconds)}`} after />
          </div>
        </section>
      ))}
    </div>
  );
}

function Flow({ label, steps, meta, after = false }: { label: string; steps: Step[]; meta: string; after?: boolean }) {
  return (
    <div className={`rounded-xl border p-5 ${after ? "border-good/30 bg-good-soft/40" : "border-line bg-raised"}`}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className={`font-extrabold ${after ? "text-good" : "text-ink"}`}>{label}</h3>
        <p className="text-sm text-dim">{meta}</p>
      </div>
      <ol className="mt-4 space-y-3">
        {steps.map((s, i) => (
          <li key={i} className="flex gap-3">
            <span aria-hidden="true" className={`grid size-7 shrink-0 place-items-center rounded-full text-xs font-extrabold ${s.deadEnd ? "bg-[var(--sev-4)] text-white" : after ? "bg-good text-white" : "bg-teal text-white"}`}>
              {s.deadEnd ? "!" : i + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className="leading-snug text-body">
                {s.deadEnd && <span className="mr-1 font-bold text-[var(--sev-4)]">Dead end:</span>}
                {s.action}
              </p>
              {s.cw && !after && (
                <ul className="mt-1.5 flex flex-wrap gap-1" aria-label="Walkthrough questions">
                  {s.cw.map((ok, q) => (
                    <li key={q} className={`rounded px-1.5 py-0.5 text-[11px] font-semibold ${ok ? "bg-mist text-dim" : "bg-[var(--sev-4-soft)] text-[var(--sev-4)]"}`}>
                      <span aria-hidden="true">{ok ? "✓" : "✗"} </span>
                      <span className="sr-only">{ok ? "Yes: " : "No: "}</span>
                      {CW_QUESTIONS[q]}
                    </li>
                  ))}
                </ul>
              )}
              {s.findings && (
                <p className="mt-1 text-xs text-dim">
                  {s.findings.map((id, k) => (
                    <span key={id}>
                      {k > 0 && ", "}
                      <Link href={`/findings#${id}`} className="link" title={FINDING_BY_ID[id].title}>
                        {id}
                      </Link>
                    </span>
                  ))}
                </p>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
