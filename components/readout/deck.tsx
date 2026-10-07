"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { ProminentLogo } from "@/components/brand";
import { FINDINGS, impact, quadrant, summary } from "@/lib/audit";
import { WALKTHROUGHS } from "@/lib/tasks";

/*
 * The findings presentation for client stakeholders, including non-technical
 * leaders. Keyboard: ← → (or PageUp/PageDown, Space), Home, End, N for notes.
 * Prints one slide per page.
 */

type Slide = { title: string; notes: string; body: ReactNode; tone?: "teal" | "cream" | "white" };

function Big({ children }: { children: ReactNode }) {
  return <p className="text-[clamp(1.75rem,3.6vw,3.25rem)] leading-[1.08] font-extrabold tracking-tight text-balance">{children}</p>;
}

function useSlides(): Slide[] {
  const s = summary();
  const secB = WALKTHROUGHS.reduce((n, w) => n + w.before.seconds, 0);
  const secA = WALKTHROUGHS.reduce((n, w) => n + w.after.seconds, 0);
  const q = (k: string) => FINDINGS.filter((f) => quadrant(impact(f), f.effort) === k).length;

  return [
    {
      title: "MedLink provider portal: audit findings and roadmap",
      tone: "teal",
      notes: "Thank everyone. Purpose: what we found, what it costs providers and your help desk, and what we recommend doing first. 30 minutes, decisions at the end.",
      body: (
        <div className="flex h-full flex-col justify-between">
          <ProminentLogo className="h-9 w-auto text-white" />
          <div>
            <p className="text-sm font-bold tracking-[0.13em] text-gold uppercase">Findings presentation · December 8, 2026</p>
            <p className="mt-3 text-[clamp(2rem,4.6vw,4rem)] leading-[1.02] font-extrabold tracking-tight text-balance text-white">MedLink provider portal: audit findings and roadmap</p>
          </div>
          <p className="text-white/80">Fictional client · concept by Hafsa Usmani for Prominent</p>
        </div>
      ),
    },
    {
      title: "What we did",
      notes: "Six weeks. Keep this short: the method matters because it's repeatable and because three people rated every issue independently.",
      body: (
        <div className="grid h-full grid-cols-2 content-center gap-8 md:grid-cols-4">
          {[
            ["6", "weeks, Oct 27 – Dec 8"],
            ["3", "independent evaluators"],
            ["5", "top tasks walked end to end"],
            [String(s.total), "findings, rated 0–4"],
          ].map(([v, l]) => (
            <div key={l}>
              <p className="text-6xl font-extrabold text-teal tnum">{v}</p>
              <p className="mt-2 text-lg text-muted">{l}</p>
            </div>
          ))}
        </div>
      ),
    },
    {
      title: "The headline",
      tone: "cream",
      notes: "If they remember one sentence, it's this one. The portal does its job; the cost lands on provider staff and on your phones.",
      body: (
        <div className="flex h-full flex-col justify-center">
          <Big>The portal works. It makes people work for it.</Big>
          <p className="mt-6 max-w-3xl text-xl text-muted">
            Across five everyday tasks, the redesign takes {Math.round((1 - secA / secB) * 100)}% less time, and removes every dead end where staff give up or pick up the phone.
          </p>
        </div>
      ),
    },
    {
      title: "Mistakes cost all your work",
      notes: "Demo the eligibility clear if time allows. One wrong date wipes five fields. This is the busiest task in the portal.",
      body: (
        <div className="grid h-full grid-cols-1 content-center gap-8 md:grid-cols-2">
          <div>
            <p className="text-sm font-bold tracking-[0.13em] text-orange-ink uppercase">Theme 1</p>
            <Big>Mistakes cost all your work</Big>
            <p className="mt-4 text-lg text-muted">One bad date clears the eligibility form. Inactivity signs people out without warning. Errors are codes.</p>
          </div>
          <div className="space-y-3 text-lg">
            <p className="rounded-lg bg-[#f7f7f7] p-4 font-mono text-base text-[#b00]">ELG-102: The request could not be processed.</p>
            <p className="text-center text-2xl text-dim" aria-hidden="true">↓</p>
            <p className="rounded-lg bg-good-soft p-4 text-good">
              <b>Accepted as March 4, 1952.</b> Everything you typed is still here.
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "Codes where people need answers",
      notes: "“PART A: Y” and “A2-20” mean something to you. To a front desk they mean a phone call or a PDF.",
      body: (
        <div className="grid h-full grid-cols-1 content-center gap-8 md:grid-cols-2">
          <div>
            <p className="text-sm font-bold tracking-[0.13em] text-orange-ink uppercase">Theme 2</p>
            <Big>Codes where people need answers</Big>
            <p className="mt-4 text-lg text-muted">Statuses, results and menu labels are in internal language. The translation is a 64-page PDF.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-lg">
            {[
              ["A2-20", "Needs records: due Nov 14"],
              ["PART A: Y", "Covered today: Part A and B"],
              ["Elig/Benefits", "Check coverage"],
              ["ADR Doc Sub", "Respond to a records request"],
            ].map(([a, b]) => (
              <div key={a} className="contents">
                <p className="rounded-lg bg-[#f7f7f7] p-3 font-mono text-base">{a}</p>
                <p className="rounded-lg bg-good-soft p-3 font-bold text-good">{b}</p>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: "Records requests end in a phone call",
      notes: "Money is at stake here. If staff can't confirm a submission, they call. Every one of those calls is avoidable.",
      body: (
        <div className="flex h-full flex-col justify-center">
          <p className="text-sm font-bold tracking-[0.13em] text-orange-ink uppercase">Theme 3</p>
          <Big>Records requests end in a phone call</Big>
          <ol className="mt-6 grid grid-cols-1 gap-3 text-lg md:grid-cols-3">
            {["Retype a 17-digit claim number", "Merge scans into one PDF, offline", "“Submitted.” No reference, no due date"].map((t, i) => (
              <li key={t} className="rounded-lg border border-line p-4">
                <span className="font-extrabold text-orange-ink">{i + 1}.</span> {t}
              </li>
            ))}
          </ol>
          <p className="mt-4 text-lg text-good">
            <b>Redesign:</b> pick the request, add every file, get a reference number and “received before the due date”.
          </p>
        </div>
      ),
    },
    {
      title: "Accessibility: a compliance clock",
      tone: "teal",
      notes: "Section 508 applies today as a CMS contractor. HHS's rule raises the bar to WCAG 2.1 AA; the date for organizations your size is May 11, 2027. The roadmap meets it.",
      body: (
        <div className="flex h-full flex-col justify-center text-white">
          <p className="text-sm font-bold tracking-[0.13em] text-gold uppercase">Accessibility</p>
          <p className="mt-2 text-[clamp(1.75rem,3.6vw,3.25rem)] leading-tight font-extrabold">{s.accessibility} findings against WCAG 2.1 AA</p>
          <div className="mt-6 grid grid-cols-1 gap-4 text-lg md:grid-cols-2">
            <p className="rounded-lg bg-white/10 p-4">
              <b className="text-gold">Today:</b> Section 508 (WCAG 2.0 AA) as a CMS contractor.
            </p>
            <p className="rounded-lg bg-white/10 p-4">
              <b className="text-gold">May 11, 2027:</b> WCAG 2.1 AA under HHS&apos;s Section 504 rule (15+ employees).
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "Where to start",
      notes: "Quick wins are cheap and visible: error messages, timeout warning, labels, contrast. They ship in the first two sprints.",
      body: (
        <div className="grid h-full grid-cols-2 content-center gap-4 md:grid-cols-4">
          {[
            ["Quick wins", q("quick-win"), "bg-good-soft text-good", "Sprints 1–2"],
            ["Big bets", q("big-bet"), "bg-cream text-orange-ink", "Sprints 3–6"],
            ["Fill-ins", q("fill-in"), "bg-mist text-teal-2", "As capacity allows"],
            ["Later", q("later"), "bg-mist text-muted", "Sprints 7–10"],
          ].map(([l, n, c, w]) => (
            <div key={l as string} className={`rounded-xl p-5 ${c}`}>
              <p className="text-6xl font-extrabold tnum">{n}</p>
              <p className="mt-2 text-xl font-bold">{l}</p>
              <p className="text-sm opacity-90">{w}</p>
            </div>
          ))}
        </div>
      ),
    },
    {
      title: "The roadmap",
      tone: "cream",
      notes: "Three horizons. Each one stands on its own, so you can stop after any of them and still have made things better.",
      body: (
        <div className="flex h-full flex-col justify-center">
          <Big>Three horizons, each worth doing alone</Big>
          <ol className="mt-6 grid grid-cols-1 gap-4 text-lg md:grid-cols-3">
            {[
              ["January", "Stop losing people's work"],
              ["February – March", "Redesign the top tasks"],
              ["April – June", "Pattern library and responsive rebuild"],
            ].map(([w, t], i) => (
              <li key={t} className="rounded-xl bg-white p-5">
                <p className="text-sm font-bold text-orange-ink">
                  Horizon {i + 1} · {w}
                </p>
                <p className="mt-1 text-xl font-extrabold">{t}</p>
              </li>
            ))}
          </ol>
        </div>
      ),
    },
    {
      title: "Decisions for today",
      tone: "teal",
      notes: "Close on decisions, not applause. Get an owner and a date for each.",
      body: (
        <div className="flex h-full flex-col justify-center text-white">
          <p className="text-sm font-bold tracking-[0.13em] text-gold uppercase">Next steps</p>
          <ol className="mt-4 space-y-3 text-[clamp(1.1rem,2vw,1.6rem)]">
            {["Approve Horizon 1 scope and a January start", "Confirm top tasks against your analytics and call data", "Recruit 6–8 provider staff for usability sessions", "Name an accessibility owner and target date"].map((t, i) => (
              <li key={t} className="flex gap-4">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-gold font-extrabold text-ink">{i + 1}</span>
                <span className="self-center font-bold">{t}</span>
              </li>
            ))}
          </ol>
        </div>
      ),
    },
  ];
}

const TONE = { teal: "bg-gradient-to-br from-teal to-teal-2 text-white", cream: "bg-cream text-ink", white: "bg-white text-ink" };

export function Deck() {
  const slides = useSlides();
  const [i, setI] = useState(0);
  const [notes, setNotes] = useState(false);
  const go = useCallback((n: number) => setI(Math.max(0, Math.min(slides.length - 1, n))), [slides.length]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement && ["INPUT", "SELECT", "TEXTAREA"].includes(e.target.tagName)) return;
      if (["ArrowRight", "PageDown", " "].includes(e.key)) {
        e.preventDefault();
        go(i + 1);
      } else if (["ArrowLeft", "PageUp"].includes(e.key)) {
        e.preventDefault();
        go(i - 1);
      }
      else if (e.key === "Home") go(0);
      else if (e.key === "End") go(slides.length - 1);
      else if (e.key.toLowerCase() === "n") setNotes((n) => !n);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [i, go, slides.length]);

  const s = slides[i];
  return (
    <div className="flex min-h-dvh flex-col bg-[#0b2a35]">
      <header className="no-print flex flex-wrap items-center gap-3 px-4 py-2 text-white">
        <Link href="/" className="inline-flex min-h-11 items-center rounded-full px-3 text-sm font-bold hover:bg-white/10">
          ← Audit report
        </Link>
        <p className="text-sm text-white/80">Readout · ← → to move · N for speaker notes</p>
        <div className="ml-auto flex items-center gap-2">
          <button type="button" aria-pressed={notes} onClick={() => setNotes((n) => !n)} className="min-h-11 rounded-full border-2 border-white/60 px-4 text-sm font-bold hover:bg-white/10">
            Speaker notes
          </button>
          <button type="button" onClick={() => window.print()} className="min-h-11 rounded-full border-2 border-gold bg-gold px-4 text-sm font-bold text-ink hover:border-orange hover:bg-orange">
            Print / PDF
          </button>
        </div>
      </header>

      <main id="main" className="no-print flex flex-1 flex-col items-center justify-center gap-4 px-4 pb-4">
        <h1 className="sr-only">Stakeholder readout</h1>
        <section aria-roledescription="slide" aria-label={`Slide ${i + 1} of ${slides.length}: ${s.title}`} className={`aspect-video w-full max-w-[1200px] overflow-hidden rounded-xl p-[clamp(1.25rem,4vw,3.5rem)] shadow-2xl ${TONE[s.tone ?? "white"]}`}>
          <h2 className="sr-only">{s.title}</h2>
          {s.body}
        </section>
        <p aria-live="polite" className="sr-only">
          Slide {i + 1} of {slides.length}: {s.title}
        </p>
        <nav aria-label="Slides" className="flex w-full max-w-[1200px] flex-wrap items-center gap-3 text-white">
          <button type="button" onClick={() => go(i - 1)} disabled={i === 0} className="min-h-11 rounded-full border-2 border-white/60 px-5 font-bold disabled:opacity-40">
            ← Previous
          </button>
          <ol className="flex flex-1 flex-wrap justify-center gap-1.5">
            {slides.map((sl, n) => (
              <li key={sl.title}>
                <button type="button" onClick={() => go(n)} aria-current={n === i ? "step" : undefined} aria-label={`Slide ${n + 1}: ${sl.title}`} className="grid size-11 place-items-center">
                  <span className={`block h-2.5 rounded-full transition-all ${n === i ? "w-8 bg-gold" : "w-2.5 bg-white/40"}`} />
                </button>
              </li>
            ))}
          </ol>
          <span className="text-sm tnum">
            {i + 1} / {slides.length}
          </span>
          <button type="button" onClick={() => go(i + 1)} disabled={i === slides.length - 1} className="min-h-11 rounded-full border-2 border-gold bg-gold px-5 font-bold text-ink disabled:opacity-40">
            Next →
          </button>
        </nav>
        {notes && (
          <aside aria-label="Speaker notes" className="w-full max-w-[1200px] rounded-lg bg-white/10 p-4 text-white">
            <p className="text-xs font-bold tracking-[0.13em] text-gold uppercase">Speaker notes</p>
            <p className="mt-1 text-lg">{s.notes}</p>
          </aside>
        )}
      </main>

      {/* Print: every slide, one per page */}
      <div className="hidden print:block">
        {slides.map((sl, n) => (
          <section key={sl.title} className={`print-break aspect-video w-full overflow-hidden rounded-xl p-10 ${TONE[sl.tone ?? "white"]}`} style={{ printColorAdjust: "exact", WebkitPrintColorAdjust: "exact" }}>
            {sl.body}
            <p className="mt-4 text-xs opacity-70">
              {n + 1} / {slides.length}
            </p>
          </section>
        ))}
      </div>
    </div>
  );
}
