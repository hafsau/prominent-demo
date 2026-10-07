import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { HEURISTICS, impact, quadrant, QUADRANT_LABEL, SCREEN_LABEL, SEVERITY_LABEL, severityMean, severitySpread, type Finding, type Heuristic } from "@/lib/audit";

/* ---------- Buttons: Prominent pills ---------- */

type Variant = "gold" | "teal" | "outline" | "ghost";
const VARIANT: Record<Variant, string> = {
  // Gold with dark text (9.58:1). Prominent's white-on-gold is 1.70:1.
  gold: "bg-gold text-ink border-2 border-gold hover:bg-orange hover:border-orange",
  teal: "bg-teal text-white border-2 border-teal hover:bg-teal-2 hover:border-teal-2",
  outline: "border-2 border-teal-2 text-teal-2 hover:bg-teal-2 hover:text-white",
  ghost: "text-teal-2 hover:bg-mist",
};
const BASE = "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-6 text-[15px] font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50";

export function Button({ variant = "gold", className = "", ...props }: ComponentProps<"button"> & { variant?: Variant }) {
  return <button type="button" className={`${BASE} ${VARIANT[variant]} ${className}`} {...props} />;
}
export function LinkButton({ variant = "gold", className = "", ...props }: ComponentProps<typeof Link> & { variant?: Variant }) {
  return <Link className={`${BASE} ${VARIANT[variant]} ${className}`} {...props} />;
}

/* ---------- Severity ---------- */

const SEV_STYLE = [
  "bg-[var(--sev-1-soft)] text-[var(--sev-1)] border-[var(--sev-1)]",
  "bg-[var(--sev-1-soft)] text-[var(--sev-1)] border-[var(--sev-1)]",
  "bg-[var(--sev-2-soft)] text-[var(--sev-2)] border-[var(--sev-2)]",
  "bg-[var(--sev-3-soft)] text-[var(--sev-3)] border-[var(--sev-3)]",
  "bg-[var(--sev-4-soft)] text-[var(--sev-4)] border-[var(--sev-4)]",
];

export function sevBucket(mean: number): number {
  return Math.min(4, Math.max(0, Math.round(mean)));
}

/** Severity badge: number + word + bars, never colour alone. */
export function SeverityBadge({ finding, compact = false }: { finding: Finding; compact?: boolean }) {
  const mean = severityMean(finding);
  const b = sevBucket(mean);
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-bold whitespace-nowrap ${SEV_STYLE[b]}`}>
      <span aria-hidden="true" className="inline-flex items-end gap-px">
        {[1, 2, 3, 4].map((n) => (
          <span key={n} className={`w-1 rounded-sm ${n <= b ? "bg-current" : "bg-current opacity-25"}`} style={{ height: 3 + n * 2 }} />
        ))}
      </span>
      <span className="tnum">{mean.toFixed(1)}</span>
      {!compact && <span>{SEVERITY_LABEL[b]}</span>}
      <span className="sr-only"> severity out of 4</span>
    </span>
  );
}

export function HeuristicChip({ h }: { h: Heuristic }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-seafoam-soft px-2 py-0.5 text-xs font-semibold whitespace-nowrap text-teal" title={HEURISTICS[h]}>
      <span className="font-bold">H{h}</span> {HEURISTICS[h]}
    </span>
  );
}

export function WcagChip({ sc }: { sc: string }) {
  return <span className="inline-flex items-center rounded-full border border-teal-2/40 px-2 py-0.5 text-xs font-bold whitespace-nowrap text-teal-2">WCAG {sc}</span>;
}

const Q_STYLE = {
  "quick-win": "bg-good-soft text-good",
  "big-bet": "bg-cream text-orange-ink",
  "fill-in": "bg-mist text-teal-2",
  later: "bg-mist text-muted",
} as const;

export function QuadrantChip({ finding }: { finding: Finding }) {
  const q = quadrant(impact(finding), finding.effort);
  return <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-bold whitespace-nowrap ${Q_STYLE[q]}`}>{QUADRANT_LABEL[q]}</span>;
}

/* ---------- Finding card ---------- */

export function FindingCard({ finding, headingLevel = 3, id }: { finding: Finding; headingLevel?: 2 | 3 | 4; id?: string }) {
  const H = `h${headingLevel}` as "h2";
  const spread = severitySpread(finding);
  return (
    <article id={id ?? finding.id} className="avoid-break scroll-mt-24 rounded-xl border border-line bg-raised p-5 shadow-card">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-md bg-teal px-2 py-0.5 font-mono text-xs font-bold text-white">{finding.id}</span>
        <SeverityBadge finding={finding} />
        <QuadrantChip finding={finding} />
        <span className="text-xs font-semibold text-dim">{SCREEN_LABEL[finding.screen]}</span>
      </div>
      <H className="mt-3 text-lg leading-snug font-extrabold text-ink">{finding.title}</H>
      <p className="mt-2 leading-relaxed text-muted">{finding.evidence}</p>
      <p className="mt-3 rounded-lg bg-mist px-3 py-2 leading-relaxed text-body">
        <span className="font-bold text-teal">Recommendation: </span>
        {finding.recommendation}
      </p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {finding.heuristics.map((h) => (
          <HeuristicChip key={h} h={h} />
        ))}
        {finding.wcag?.map((sc) => (
          <WcagChip key={sc} sc={sc} />
        ))}
      </div>
      <dl className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-dim">
        <div>
          <dt className="inline font-bold">Evaluators: </dt>
          <dd className="inline tnum">
            {finding.ratings.join(" · ")}
            {spread >= 2 ? " (discuss before readout)" : ""}
          </dd>
        </div>
        <div>
          <dt className="inline font-bold">Impact: </dt>
          <dd className="inline tnum">{impact(finding)}/5</dd>
        </div>
        <div>
          <dt className="inline font-bold">Effort: </dt>
          <dd className="inline tnum">{finding.effort}/5 (with architect)</dd>
        </div>
      </dl>
    </article>
  );
}

/* ---------- Layout ---------- */

export function SectionHeader({ n, eyebrow, title, children }: { n?: string; eyebrow: string; title: ReactNode; children?: ReactNode }) {
  return (
    <header className="max-w-3xl">
      <p className="eyebrow">
        {n ? `${n} · ` : ""}
        {eyebrow}
      </p>
      <h1 className="display mt-2 text-4xl sm:text-5xl">{title}</h1>
      {children && <div className="mt-4 text-lg leading-relaxed text-muted">{children}</div>}
    </header>
  );
}

export function Card({ children, className = "", ...rest }: ComponentProps<"div">) {
  return (
    <div className={`rounded-xl border border-line bg-raised shadow-card ${className}`} {...rest}>
      {children}
    </div>
  );
}

export function Stat({ value, label, tone = "light" }: { value: ReactNode; label: string; tone?: "light" | "dark" }) {
  return (
    <div>
      <p className={`text-4xl font-extrabold tnum ${tone === "dark" ? "text-gold" : "text-ink"}`}>{value}</p>
      <p className={`mt-1 text-sm leading-snug ${tone === "dark" ? "text-white/85" : "text-muted"}`}>{label}</p>
    </div>
  );
}

export function Callout({ title, children, tone = "teal" }: { title?: string; children: ReactNode; tone?: "teal" | "orange" }) {
  return (
    <div className={`rounded-xl border-l-4 px-5 py-4 ${tone === "teal" ? "border-teal-2 bg-mist" : "border-orange bg-cream"}`}>
      {title && <p className="font-extrabold text-ink">{title}</p>}
      <div className="leading-relaxed text-body">{children}</div>
    </div>
  );
}
