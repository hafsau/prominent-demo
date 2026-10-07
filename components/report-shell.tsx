"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { ProminentLogo } from "@/components/brand";

export const SECTIONS = [
  { href: "/", n: "00", label: "Engagement" },
  { href: "/findings", n: "01", label: "Heuristic findings" },
  { href: "/tasks", n: "02", label: "Top-task walkthroughs" },
  { href: "/ia", n: "03", label: "Information architecture" },
  { href: "/forms", n: "04", label: "Forms and errors" },
  { href: "/consistency", n: "05", label: "Consistency" },
  { href: "/accessibility", n: "06", label: "508, WCAG and browsers" },
  { href: "/backlog", n: "07", label: "Prioritized backlog" },
  { href: "/roadmap", n: "08", label: "Roadmap" },
];

export function ReportShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- close the mobile menu on navigation
  useEffect(() => setOpen(false), [pathname]);

  const nav = (
    <ol className="space-y-0.5">
      {SECTIONS.map((s) => {
        const current = s.href === "/" ? pathname === "/" : pathname.startsWith(s.href);
        return (
          <li key={s.href}>
            <Link
              href={s.href}
              aria-current={current ? "page" : undefined}
              className={`flex min-h-11 items-center gap-3 rounded-lg px-3 text-[15px] font-semibold ${current ? "bg-teal text-white" : "text-body hover:bg-mist"}`}
            >
              <span className={`font-mono text-xs ${current ? "text-gold" : "text-dim"}`}>{s.n}</span>
              {s.label}
            </Link>
          </li>
        );
      })}
    </ol>
  );

  return (
    <div className="flex min-h-dvh flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[80] focus:rounded-full focus:bg-teal focus:px-4 focus:py-3 focus:font-bold focus:text-white">
        Skip to content
      </a>
      <header className="no-print sticky top-0 z-50 border-b border-line bg-raised/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] items-center gap-4 px-4 py-2.5 sm:px-6">
          <Link href="/" className="flex min-h-11 items-center gap-3 rounded-md" aria-label="Prominent, MedLink portal audit, home">
            <ProminentLogo className="h-7 w-auto text-ink" title="Prominent" />
            <span className="hidden border-l border-line pl-3 text-sm leading-tight font-semibold text-muted md:block">
              MedLink portal audit
              <span className="block text-xs font-normal text-dim">Concept · fictional client</span>
            </span>
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <Link href="/portal" className="hidden min-h-11 items-center rounded-full border-2 border-teal-2 px-5 text-[15px] font-bold text-teal-2 hover:bg-teal-2 hover:text-white sm:inline-flex">
              Open the portal
            </Link>
            <Link href="/readout" className="inline-flex min-h-11 items-center rounded-full border-2 border-gold bg-gold px-5 text-[15px] font-bold whitespace-nowrap text-ink hover:border-orange hover:bg-orange">
              <span className="sm:hidden">Readout</span>
              <span className="hidden sm:inline">Present readout</span>
            </Link>
            <button
              type="button"
              aria-expanded={open}
              aria-controls="report-nav-mobile"
              onClick={() => setOpen((o) => !o)}
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-teal hover:bg-mist lg:hidden"
            >
              <span className="sr-only">Report sections</span>
              <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                {open ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
              </svg>
            </button>
          </div>
        </div>
        {open && (
          <nav id="report-nav-mobile" aria-label="Report sections" className="border-t border-line px-4 py-3 lg:hidden">
            {nav}
            <Link href="/portal" className="mt-2 flex min-h-11 items-center rounded-lg px-3 font-semibold text-teal-2 hover:bg-mist">
              Open the portal →
            </Link>
          </nav>
        )}
      </header>

      <div className="mx-auto flex w-full max-w-[1400px] flex-1 gap-8 px-4 sm:px-6">
        <aside className="no-print hidden w-64 shrink-0 lg:block">
          <nav aria-label="Report sections" className="sticky top-20 py-8">
            <p className="mb-2 px-3 text-xs font-bold tracking-[0.13em] text-dim uppercase">Audit report</p>
            {nav}
            <div className="mt-6 space-y-1 border-t border-line pt-4">
              <Link href="/portal" className="flex min-h-11 items-center rounded-lg px-3 text-[15px] font-semibold text-teal-2 hover:bg-mist">
                The portal, before →
              </Link>
              <Link href="/after/eligibility" className="flex min-h-11 items-center rounded-lg px-3 text-[15px] font-semibold text-teal-2 hover:bg-mist">
                The redesign, after →
              </Link>
            </div>
          </nav>
        </aside>
        <main id="main" tabIndex={-1} className="min-w-0 flex-1 py-8 focus:outline-none lg:py-10">
          {children}
        </main>
      </div>

      <footer className="no-print bg-teal text-white">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-4 px-4 py-6 text-sm sm:px-6">
          <p className="max-w-3xl text-white/85">
            An unofficial concept by{" "}
            <a href="https://hafsausmani.com" className="font-bold text-white underline underline-offset-4">
              Hafsa Usmani
            </a>{" "}
            for Prominent&apos;s UX/UI Designer (Healthcare Portal Audit) role. MedLink and its contractor are fictional; the friction patterns are drawn from public provider-portal documentation. Not affiliated with Prominent.
          </p>
          <ProminentLogo className="h-6 w-auto text-white" title="Prominent" />
        </div>
      </footer>
    </div>
  );
}
