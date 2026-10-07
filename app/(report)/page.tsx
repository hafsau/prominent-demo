import Link from "next/link";
import { Card, Stat } from "@/components/ui";
import { FINDING_BY_ID, SEVERITY_LABEL, summary } from "@/lib/audit";
import { WALKTHROUGHS } from "@/lib/tasks";

const WEEKS = [
  { dates: "Oct 27 – 31", title: "Kickoff and artifact review", body: "Stakeholder interviews; review the public website, training material, help-desk call drivers and analytics. Agree on top tasks and success measures.", link: "/tasks", out: "Top-task list, review plan" },
  { dates: "Nov 3 – 7", title: "Heuristic evaluation", body: "Three independent passes against Nielsen's heuristics, severity rated 0–4, merged and discussed where raters disagree.", link: "/findings", out: "Findings log" },
  { dates: "Nov 10 – 14", title: "Task walkthroughs and IA", body: "End-to-end walkthroughs of the highest-volume tasks; menu, labels and content structure; tree test if users are available.", link: "/ia", out: "Walkthroughs, IA proposal" },
  { dates: "Nov 17 – 21", title: "Forms, consistency, accessibility", body: "Validation and error messages, component inventory, Section 508 / WCAG 2.1 review, browser and screen-size matrix.", link: "/accessibility", out: "Pattern gaps, 508 report" },
  { dates: "Nov 24 – Dec 2", title: "Backlog with the solutions architect", body: "Effort and feasibility for every finding, impact × effort prioritization, MVP cut and roadmap options. (Thanksgiving week planned light.)", link: "/backlog", out: "Prioritized backlog" },
  { dates: "Dec 3 – 8", title: "Report and readout", body: "Final report, roadmap and a findings presentation for clinical, operations and IT leaders; agree on next steps for implementation.", link: "/readout", out: "Report, roadmap, readout" },
];

export default function Overview() {
  const s = summary();
  const stepsBefore = WALKTHROUGHS.reduce((n, w) => n + w.before.steps.length, 0);
  const stepsAfter = WALKTHROUGHS.reduce((n, w) => n + w.after.steps.length, 0);
  const secBefore = WALKTHROUGHS.reduce((n, w) => n + w.before.seconds, 0);
  const secAfter = WALKTHROUGHS.reduce((n, w) => n + w.after.seconds, 0);

  return (
    <div className="space-y-16">
      <section aria-labelledby="hero-h" className="on-dark relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal to-teal-2 px-6 py-12 text-white sm:px-10 lg:py-16">
        <div aria-hidden="true" className="pointer-events-none absolute -top-24 -right-24 size-80 rounded-full bg-gold/15" />
        <div aria-hidden="true" className="pointer-events-none absolute -right-10 -bottom-32 size-72 rounded-full border-[24px] border-seafoam/15" />
        <p className="eyebrow">UX/UI Designer · Healthcare Portal Audit · Oct 27 – Dec 8</p>
        <h1 id="hero-h" className="mt-3 max-w-3xl text-4xl leading-[1.05] font-extrabold tracking-tight text-balance sm:text-6xl">The audit, delivered before day one.</h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/90">
          Prominent&apos;s posting describes a six-week audit of a healthcare provider portal. This is that audit, run end to end on a fictional Medicare contractor&apos;s portal: findings pinned to the live screens, walkthroughs of the top tasks, a backlog your architect can import, and the readout for the client.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/portal" className="inline-flex min-h-12 items-center rounded-full border-2 border-gold bg-gold px-7 font-bold text-ink hover:border-orange hover:bg-orange">
            Open the portal with findings
          </Link>
          <Link href="/readout" className="inline-flex min-h-12 items-center rounded-full border-2 border-white px-7 font-bold text-white hover:bg-white/10">
            Present the readout
          </Link>
        </div>
        <p className="mt-6 text-sm text-white/80">By Hafsa Usmani. MedLink, its contractor and its users are fictional; the friction patterns come from public provider-portal documentation.</p>
      </section>

      <section aria-labelledby="summary-h">
        <p className="eyebrow">Executive summary</p>
        <h2 id="summary-h" className="display mt-2 text-3xl sm:text-4xl">
          The portal works. It makes people work for it.
        </h2>
        <dl className="mt-8 grid grid-cols-2 gap-6 md:grid-cols-4">
          <div>
            <dt className="sr-only">Findings</dt>
            <dd>
              <Stat value={s.total} label={`findings, ${s.critical} rated major or worse`} />
            </dd>
          </div>
          <div>
            <dt className="sr-only">Quick wins</dt>
            <dd>
              <Stat value={s.quick} label="quick wins: high impact, low effort" />
            </dd>
          </div>
          <div>
            <dt className="sr-only">Accessibility</dt>
            <dd>
              <Stat value={s.accessibility} label="Section 508 / WCAG 2.1 issues" />
            </dd>
          </div>
          <div>
            <dt className="sr-only">Steps saved</dt>
            <dd>
              <Stat value={`${Math.round((1 - secAfter / secBefore) * 100)}%`} label={`less time across five top tasks (${stepsBefore} steps → ${stepsAfter})`} />
            </dd>
          </div>
        </dl>

        <div className="mt-10 grid grid-cols-1 gap-5 lg:grid-cols-3">
          <Theme n="1" title="Mistakes cost all your work" ids={["F-10", "F-03", "F-04"]}>
            One bad date clears the eligibility form. Inactivity ends the session without warning. Errors are codes. On the busiest task, every slip means starting again.
          </Theme>
          <Theme n="2" title="Codes where people need answers" ids={["F-11", "F-13", "F-05"]}>
            “PART A: Y”, “A2-20”, “Elig/Benefits”. The portal speaks in the contractor&apos;s internal language, and the translation is a 64-page PDF.
          </Theme>
          <Theme n="3" title="Records requests end in a phone call" ids={["F-17", "F-18", "F-19"]}>
            Retype a 17-digit number, merge scans offline, then get “Submitted” with no reference number. Offices call the help desk to be sure, which is the cost the portal exists to remove.
          </Theme>
        </div>
      </section>

      <section aria-labelledby="plan-h">
        <p className="eyebrow">The engagement</p>
        <h2 id="plan-h" className="display mt-2 text-3xl sm:text-4xl">
          Six weeks, mapped to the contract dates
        </h2>
        <p className="mt-3 max-w-3xl text-lg leading-relaxed text-muted">
          Shaped like Prominent&apos;s Solution Roadmap: discovery, prioritized backlog, findings presentation and agreed next steps. Each week links to what it produces in this demo.
        </p>
        <ol className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {WEEKS.map((w, i) => (
            <li key={w.title}>
              <Link href={w.link} className="group flex h-full flex-col rounded-xl border border-line bg-raised p-5 shadow-card transition-shadow hover:shadow-float">
                <span className="flex items-center justify-between">
                  <span className="text-sm font-bold text-orange-ink">Week {i + 1}</span>
                  <span className="text-sm text-dim">{w.dates}</span>
                </span>
                <span className="mt-2 text-lg font-extrabold text-ink group-hover:underline">{w.title}</span>
                <span className="mt-2 flex-1 leading-relaxed text-muted">{w.body}</span>
                <span className="mt-3 inline-flex self-start rounded-full bg-cream px-3 py-1 text-xs font-bold text-orange-ink">Output: {w.out}</span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="method-h" className="rounded-2xl bg-mist p-6 sm:p-8">
        <h2 id="method-h" className="text-2xl font-extrabold text-ink">
          Method, in brief
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div>
            <h3 className="font-bold text-ink">Severity, 0–4</h3>
            <ul className="mt-2 space-y-1 text-sm text-muted">
              {SEVERITY_LABEL.map((l, i) => (
                <li key={l}>
                  <span className="font-bold text-ink tnum">{i}</span> {l}
                </li>
              ))}
            </ul>
            <p className="mt-2 text-sm text-muted">Three independent passes, averaged. Ratings two or more apart are discussed before the readout.</p>
          </div>
          <div>
            <h3 className="font-bold text-ink">Impact × effort</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">Impact is severity scaled by how many sessions hit the problem. Effort is the solutions architect&apos;s estimate. Together they sort every finding into quick wins, big bets, fill-ins and later.</p>
          </div>
          <div>
            <h3 className="font-bold text-ink">What&apos;s real</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              The method, the report format, the accessibility checks and the redesigned flows are real. The portal, client and traffic shares are invented for the demo; week one replaces them with the client&apos;s analytics and support data.
            </p>
          </div>
        </div>
      </section>

      <Card className="flex flex-wrap items-center justify-between gap-4 border-l-4 border-l-gold p-6">
        <div>
          <p className="text-lg font-extrabold text-ink">See it both ways</p>
          <p className="text-muted">The portal as it is today, then the two highest-impact flows redesigned.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/portal?screen=eligibility" className="inline-flex min-h-11 items-center rounded-full border-2 border-teal-2 px-5 font-bold text-teal-2 hover:bg-teal-2 hover:text-white">
            Before
          </Link>
          <Link href="/after/eligibility" className="inline-flex min-h-11 items-center rounded-full border-2 border-gold bg-gold px-5 font-bold text-ink hover:border-orange hover:bg-orange">
            After
          </Link>
        </div>
      </Card>
    </div>
  );
}

function Theme({ n, title, ids, children }: { n: string; title: string; ids: string[]; children: React.ReactNode }) {
  return (
    <Card className="flex flex-col p-6">
      <span aria-hidden="true" className="grid size-10 place-items-center rounded-full bg-gold font-extrabold text-ink">
        {n}
      </span>
      <h3 className="mt-4 text-xl font-extrabold text-ink">{title}</h3>
      <p className="mt-2 flex-1 leading-relaxed text-muted">{children}</p>
      <p className="mt-4 flex flex-wrap gap-2 text-sm">
        {ids.map((id) => (
          <Link key={id} href={`/findings#${id}`} className="link" title={FINDING_BY_ID[id].title}>
            {id}
          </Link>
        ))}
      </p>
    </Card>
  );
}
