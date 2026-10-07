"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ProminentMark } from "@/components/brand";
import { LegacyPortal, type PortalScreen } from "@/components/portal/legacy-portal";
import { FindingCard, sevBucket } from "@/components/ui";
import { FINDING_BY_ID, severityMean, type Finding } from "@/lib/audit";

/*
 * The audit overlay. Pins are placed on whatever elements in the live portal
 * carry data-finding, so they follow the real UI rather than a screenshot.
 * Pins are real buttons, in DOM order after the portal, each named with its
 * finding; the panel is a non-modal complementary region.
 */

type Pin = { id: string; x: number; y: number };

const PIN_STYLE = ["bg-[#4a5258]", "bg-[#4a5258]", "bg-[#8a5a00]", "bg-[#c13800]", "bg-[#b42318]"];

const JUMPS: { screen: PortalScreen; label: string }[] = [
  { screen: "login", label: "Sign in" },
  { screen: "home", label: "Home" },
  { screen: "eligibility", label: "Eligibility" },
  { screen: "claims", label: "Claims" },
  { screen: "documents", label: "Documents" },
];

const HINTS: Partial<Record<PortalScreen, string>> = {
  login: "Demo values are filled in. Press Login.",
  provider: "Press Continue. The PTAN is one digit short, and the error won't tell you which field (F-04). Add a digit to get through.",
  home: "Try the menu: Elig/Benefits, Claim Inq or ADR Doc Sub.",
  eligibility: "Submit as-is. The date of birth isn't MM/DD/YYYY, so watch what happens to everything else you typed (F-10).",
  claims: "What does A2-20 mean? The answer is in Appendix C of a PDF (F-13).",
  documents: "Pick any file. Then imagine you have three scans to send (F-18).",
  timeout: "Two minutes idle, no warning, and the work is gone (F-03). The real portal waits 30 minutes; the demo doesn't.",
};

export function AuditView({ initialScreen, embed }: { initialScreen: PortalScreen; embed: boolean }) {
  const [screen, setScreen] = useState<PortalScreen>(initialScreen);
  const [jump, setJump] = useState<{ screen: PortalScreen; n: number }>({ screen: initialScreen, n: 0 });
  const [show, setShow] = useState(!embed);
  const [pins, setPins] = useState<Pin[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const panelHeading = useRef<HTMLHeadingElement>(null);

  const compute = useCallback(() => {
    const root = wrap.current;
    if (!root) return;
    const base = root.getBoundingClientRect();
    const out: Pin[] = [];
    root.querySelectorAll<HTMLElement>("[data-finding]").forEach((el) => {
      const r = el.getBoundingClientRect();
      if (!r.width && !r.height) return;
      (el.dataset.finding ?? "").split(/\s+/).forEach((id, i) => {
        if (!FINDING_BY_ID[id]) return;
        // Whole-page findings sit at the top-right of their element; others at the top-left.
        const big = r.width > 600;
        out.push({ id, x: (big ? r.right - base.left - 18 - i * 30 : r.left - base.left + 4 + i * 30) + root.scrollLeft, y: r.top - base.top + 4 + root.scrollTop });
      });
    });
    setPins(out);
  }, []);

  useEffect(() => {
    if (!show) return;
    compute();
    const root = wrap.current!;
    const mo = new MutationObserver(() => requestAnimationFrame(compute));
    mo.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
    window.addEventListener("resize", compute);
    return () => {
      mo.disconnect();
      window.removeEventListener("resize", compute);
    };
  }, [show, compute, screen]);

  const open = (id: string) => {
    setSelected(id);
    requestAnimationFrame(() => panelHeading.current?.focus());
  };

  const onScreen = [...new Set(pins.map((p) => p.id))].map((id) => FINDING_BY_ID[id]).sort((a, b) => severityMean(b) - severityMean(a));

  if (embed) return <LegacyPortal initialScreen={initialScreen} />;

  return (
    <div className="flex min-h-dvh flex-col bg-[#dfe3e6]">
      <div className="sticky top-0 z-40 bg-teal text-white shadow-float">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2">
          <Link href="/" className="inline-flex min-h-11 items-center gap-2 rounded-full pr-3 text-sm font-bold hover:bg-white/10">
            <ProminentMark className="size-7" />
            <span>← Audit report</span>
          </Link>
          <p className="text-sm">
            <span className="font-extrabold">MedLink Provider Portal</span> <span className="text-white/80">· the “before”, live (fictional)</span>
          </p>
          <nav aria-label="Jump to screen" className="flex flex-wrap gap-1">
            {JUMPS.map((j) => (
              <button
                key={j.screen}
                type="button"
                onClick={() => {
                  setJump({ screen: j.screen, n: jump.n + 1 });
                  setScreen(j.screen);
                  setSelected(null);
                }}
                aria-current={screen === j.screen ? "true" : undefined}
                className={`min-h-9 rounded-full px-3 text-sm font-semibold ${screen === j.screen ? "bg-white text-teal" : "text-white hover:bg-white/10"}`}
              >
                {j.label}
              </button>
            ))}
          </nav>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <button
              type="button"
              aria-pressed={show}
              onClick={() => setShow((s) => !s)}
              className={`inline-flex min-h-11 items-center gap-2 rounded-full border-2 px-4 text-sm font-bold ${show ? "border-gold bg-gold text-ink" : "border-white/70 text-white hover:bg-white/10"}`}
            >
              {show ? `Findings on (${onScreen.length})` : "Show findings"}
            </button>
            <Link href="/after/eligibility" className="inline-flex min-h-11 items-center rounded-full px-3 text-sm font-bold text-gold hover:bg-white/10">
              See the redesign →
            </Link>
          </div>
        </div>
        {HINTS[screen] && (
          <p className="border-t border-white/15 bg-teal-2 px-4 py-1.5 text-sm text-white" aria-live="polite">
            <span className="font-bold text-gold">Try it: </span>
            {HINTS[screen]}
          </p>
        )}
      </div>

      <div className="flex flex-1 flex-col xl:flex-row">
        <main id="main" className="min-w-0 flex-1 p-4">
          <h1 className="sr-only">The MedLink portal before the redesign, with audit findings</h1>
          <div ref={wrap} className="relative overflow-x-auto pb-6 shadow-float">
            <LegacyPortal key={`${jump.screen}-${jump.n}`} initialScreen={jump.screen} onScreen={(s) => (setScreen(s), setSelected(null))} />
            {show && (
              <div role="group" aria-label="Finding pins">
                {pins.map((p) => {
                  const f = FINDING_BY_ID[p.id];
                  const b = sevBucket(severityMean(f));
                  return (
                    <button
                      key={`${p.id}-${p.x}-${p.y}`}
                      type="button"
                      onClick={() => open(p.id)}
                      aria-label={`Finding ${f.id}, severity ${severityMean(f)}: ${f.title}`}
                      aria-expanded={selected === p.id}
                      className={`pin absolute z-10 grid h-7 min-w-7 place-items-center rounded-full px-1.5 text-[11px] font-extrabold text-white shadow-lg ring-2 ring-white ${PIN_STYLE[b]} ${selected === p.id ? "outline-3 outline-gold" : ""}`}
                      style={{ left: Math.max(16, p.x - 4), top: Math.max(16, p.y - 6) }}
                    >
                      {p.id.slice(2)}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </main>

        {show && (
          <aside aria-labelledby="findings-panel-h" className="w-full shrink-0 border-t border-line bg-white p-4 xl:sticky xl:top-[106px] xl:h-[calc(100dvh-106px)] xl:w-[400px] xl:overflow-y-auto xl:border-t-0 xl:border-l">
            {selected ? (
              <div>
                <button type="button" className="mb-3 inline-flex min-h-11 items-center rounded-full px-3 text-sm font-bold text-teal-2 hover:bg-mist" onClick={() => setSelected(null)}>
                  ← All findings on this screen
                </button>
                <h2 id="findings-panel-h" ref={panelHeading} tabIndex={-1} className="sr-only">
                  Finding {selected}
                </h2>
                <FindingCard finding={FINDING_BY_ID[selected]} headingLevel={3} id={`panel-${selected}`} />
              </div>
            ) : (
              <div>
                <h2 id="findings-panel-h" ref={panelHeading} tabIndex={-1} className="text-lg font-extrabold text-ink">
                  {onScreen.length} findings on this screen
                </h2>
                <p className="mt-1 text-sm text-muted">Select a pin, or a finding below. Worst first.</p>
                <ul className="mt-3 space-y-2">
                  {onScreen.map((f: Finding) => (
                    <li key={f.id}>
                      <button type="button" onClick={() => open(f.id)} className="flex w-full items-start gap-3 rounded-lg border border-line p-3 text-left hover:border-teal-2 hover:bg-mist">
                        <span className={`grid h-7 min-w-7 shrink-0 place-items-center rounded-full px-1.5 text-[11px] font-extrabold text-white ${PIN_STYLE[sevBucket(severityMean(f))]}`} aria-hidden="true">
                          {f.id.slice(2)}
                        </span>
                        <span>
                          <span className="block text-sm leading-snug font-bold text-ink">{f.title}</span>
                          <span className="text-xs text-dim">
                            {f.id} · severity {severityMean(f).toFixed(1)}
                          </span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
                <Link href="/findings" className="link mt-4 inline-block text-sm">
                  All 24 findings in the report
                </Link>
              </div>
            )}
          </aside>
        )}
      </div>
    </div>
  );
}
