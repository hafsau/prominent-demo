import type { Metadata } from "next";
import Link from "next/link";
import { Callout, Card, SectionHeader } from "@/components/ui";
import { FINDINGS, impact, prioritize, quadrant, type Finding } from "@/lib/audit";

export const metadata: Metadata = { title: "Roadmap", description: "A three-horizon roadmap from the MedLink audit: quick wins in the first sprints, top-task redesigns, then the pattern library and responsive rebuild, sized for follow-on implementation." };

const POINTS = [1, 2, 3, 5, 8];

export default function RoadmapPage() {
  const scored = prioritize(FINDINGS.map((f) => ({ ...f, impact: impact(f) })));
  const by = (q: string) => scored.filter((f) => quadrant(f.impact, f.effort) === q);
  const quick = by("quick-win");
  const big = by("big-bet");
  const rest = [...by("fill-in"), ...by("later")];
  const pts = (fs: Finding[]) => fs.reduce((n, f) => n + POINTS[f.effort - 1], 0);

  const horizons = [
    { name: "Horizon 1", when: "Sprints 1–2 · January 2027", title: "Stop losing people's work", items: quick, note: "Error messages, timeout warning, labels, contrast, skip link. Mostly front-end; ships in weeks and shows up immediately in help-desk calls." },
    { name: "Horizon 2", when: "Sprints 3–6 · February – March", title: "Redesign the top tasks", items: big, note: "Check coverage, claim status and records requests rebuilt on the new navigation and saved provider profiles. Validated with providers before and after." },
    { name: "Horizon 3", when: "Sprints 7–10 · April – June", title: "Pattern library and responsive rebuild", items: rest, note: "Shared components, card layouts for tablets and phones, multi-file uploads through the document management integration, contextual help." },
  ];

  return (
    <div className="space-y-12">
      <SectionHeader n="08" eyebrow="Roadmap and next steps" title="Three horizons, sized for the follow-on build">
        Quick wins first, because they&apos;re cheap and visible. Then the top tasks, then the foundations that keep the portal consistent and accessible as it grows. Story points use the architect&apos;s effort scale (1, 2, 3, 5, 8).
      </SectionHeader>

      <figure aria-labelledby="timeline-cap" className="overflow-x-auto rounded-xl border border-line p-5">
        <figcaption id="timeline-cap" className="font-extrabold text-ink">
          Timeline
        </figcaption>
        <ol className="relative mt-6 grid min-w-[720px] grid-cols-4 gap-0">
          {[
            { d: "Dec 8, 2026", t: "Audit readout", c: "bg-gold" },
            { d: "Jan 2027", t: "Horizon 1 begins", c: "bg-[var(--good)]" },
            { d: "Feb – Mar 2027", t: "Top-task redesigns", c: "bg-orange" },
            { d: "May 11, 2027", t: "HHS WCAG 2.1 AA date (15+ employees)", c: "bg-teal" },
          ].map((m) => (
            <li key={m.t} className="relative border-t-4 border-line pt-4 pr-4">
              <span aria-hidden="true" className={`absolute -top-[10px] left-0 size-4 rounded-full ring-4 ring-white ${m.c}`} />
              <p className="text-sm font-bold text-orange-ink">{m.d}</p>
              <p className="text-sm font-semibold text-ink">{m.t}</p>
            </li>
          ))}
        </ol>
      </figure>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        {horizons.map((h) => (
          <Card key={h.name} className="flex flex-col p-5">
            <p className="eyebrow">{h.name}</p>
            <h2 className="mt-1 text-xl font-extrabold text-ink">{h.title}</h2>
            <p className="text-sm font-semibold text-dim">{h.when}</p>
            <p className="mt-3 leading-relaxed text-muted">{h.note}</p>
            <p className="mt-4 text-sm font-bold text-ink">
              {h.items.length} items · {pts(h.items)} points
            </p>
            <ul className="mt-2 flex-1 space-y-1 text-sm">
              {h.items.map((f) => (
                <li key={f.id} className="flex gap-2">
                  <Link href={`/findings#${f.id}`} className="link font-mono text-xs">
                    {f.id}
                  </Link>
                  <span className="text-body">{f.title}</span>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>

      <section aria-labelledby="next-h">
        <h2 id="next-h" className="text-2xl font-extrabold text-ink">
          Next steps to agree at the readout
        </h2>
        <ol className="mt-4 space-y-2">
          {[
            "Confirm the top-task list against the client's analytics and help-desk call drivers.",
            "Agree the Horizon 1 scope and a start date for implementation.",
            "Recruit 6–8 provider office staff for usability sessions on the Horizon 2 redesigns.",
            "Name an accessibility owner and a target conformance date ahead of May 11, 2027.",
            "Decide whether the pattern library is built first or alongside Horizon 2.",
          ].map((s, i) => (
            <li key={s} className="flex gap-3 rounded-lg bg-mist px-4 py-3">
              <span className="font-mono text-sm font-bold text-orange-ink">{i + 1}</span>
              <span className="text-body">{s}</span>
            </li>
          ))}
        </ol>
        <div className="mt-4">
          <Callout title="How we'll know it worked" tone="orange">
            Help-desk calls per 1,000 sessions, task completion and time on the top tasks, error rates on eligibility and records submission, and a SUS score for provider staff (baseline in Horizon 1, target above 68, the benchmark average).
          </Callout>
        </div>
      </section>
    </div>
  );
}
