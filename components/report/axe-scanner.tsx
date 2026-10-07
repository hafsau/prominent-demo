"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import { FINDINGS } from "@/lib/audit";

/*
 * Runs axe-core in the browser against the "before" portal and the redesign,
 * loaded in hidden same-origin frames. Nothing here is canned: the counts are
 * whatever axe finds right now.
 */

type Violation = { id: string; impact: string | null; help: string; nodes: number };
type Result = { label: string; url: string; violations: Violation[]; passes: number };

const TARGETS = [
  { label: "Before: portal home", url: "/portal?screen=home&embed=1" },
  { label: "Before: eligibility", url: "/portal?screen=eligibility&embed=1" },
  { label: "Before: document submission", url: "/portal?screen=documents&embed=1" },
  { label: "After: check coverage", url: "/after/eligibility?embed=1" },
  { label: "After: respond to a request", url: "/after/documents?embed=1" },
];

const RULE_TO_FINDINGS = FINDINGS.reduce<Record<string, string[]>>((m, f) => {
  for (const r of f.axe ?? []) (m[r] ??= []).push(f.id);
  return m;
}, {});

type AxeWindow = Window & { axe?: { run: (ctx: Document, opts: unknown) => Promise<{ violations: { id: string; impact: string | null; help: string; nodes: unknown[] }[]; passes: unknown[] }> } };

async function scan(url: string): Promise<{ violations: Violation[]; passes: number }> {
  const frame = document.createElement("iframe");
  frame.setAttribute("aria-hidden", "true");
  frame.tabIndex = -1;
  frame.style.cssText = "position:absolute;left:-10000px;top:0;width:1280px;height:900px;border:0";
  document.body.appendChild(frame);
  try {
    await new Promise<void>((resolve, reject) => {
      frame.onload = () => resolve();
      frame.onerror = () => reject(new Error("load failed"));
      frame.src = url;
    });
    await new Promise((r) => setTimeout(r, 700));
    const w = frame.contentWindow as AxeWindow;
    const doc = frame.contentDocument!;
    // The official axe-core build (MPL-2.0), served from /axe.min.js.
    await new Promise<void>((resolve, reject) => {
      const s = doc.createElement("script");
      s.src = "/axe.min.js";
      s.onload = () => resolve();
      s.onerror = () => reject(new Error("axe failed to load"));
      doc.head.appendChild(s);
    });
    const res = await w.axe!.run(doc, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] } });
    return { violations: res.violations.map((v) => ({ id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.length })), passes: res.passes.length };
  } finally {
    frame.remove();
  }
}

export function AxeScanner() {
  const [state, setState] = useState<"idle" | "running" | "done" | "error">("idle");
  const [results, setResults] = useState<Result[]>([]);
  const [progress, setProgress] = useState("");

  const run = async () => {
    setState("running");
    setResults([]);
    try {
      const out: Result[] = [];
      for (const t of TARGETS) {
        setProgress(`Scanning ${t.label}…`);
        const r = await scan(t.url);
        out.push({ ...t, ...r });
        setResults([...out]);
      }
      setProgress("");
      setState("done");
    } catch {
      setState("error");
    }
  };

  return (
    <div className="rounded-xl border border-line p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold text-ink">Run axe-core now</h2>
          <p className="text-sm text-muted">WCAG 2.0 and 2.1 A/AA rules, run in your browser against the live pages.</p>
        </div>
        <Button onClick={run} disabled={state === "running"}>
          {state === "running" ? "Scanning…" : state === "done" ? "Scan again" : "Scan before and after"}
        </Button>
      </div>
      <p role="status" className="mt-2 min-h-5 text-sm text-dim">
        {state === "running" ? progress : state === "done" ? `Scanned ${results.length} pages.` : state === "error" ? "The scan couldn't run in this browser." : ""}
      </p>
      {results.length > 0 && (
        <ul className="mt-3 space-y-3">
          {results.map((r) => {
            const total = r.violations.reduce((n, v) => n + v.nodes, 0);
            const after = r.label.startsWith("After");
            return (
              <li key={r.url} className={`rounded-lg border p-4 ${r.violations.length ? "border-[var(--sev-3)]/40 bg-[var(--sev-3-soft)]" : "border-good/30 bg-good-soft"}`}>
                <p className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="font-bold text-ink">{r.label}</span>
                  <span className={`font-extrabold tnum ${r.violations.length ? "text-[var(--sev-3)]" : "text-good"}`}>
                    {r.violations.length ? `${r.violations.length} ${r.violations.length === 1 ? "rule" : "rules"} failed · ${total} ${total === 1 ? "element" : "elements"}` : `0 violations · ${r.passes} rules passed`}
                  </span>
                </p>
                {r.violations.length > 0 && (
                  <ul className="mt-2 space-y-1 text-sm">
                    {r.violations.map((v) => (
                      <li key={v.id} className="flex flex-wrap gap-x-2">
                        <code className="font-mono font-bold text-ink">{v.id}</code>
                        <span className="text-muted">{v.help}</span>
                        <span className="text-dim">({v.impact}, {v.nodes})</span>
                        {RULE_TO_FINDINGS[v.id] && <span className="font-bold text-teal-2">→ {RULE_TO_FINDINGS[v.id].join(", ")}</span>}
                      </li>
                    ))}
                  </ul>
                )}
                {after && !r.violations.length && <p className="mt-1 text-sm text-good">The redesign passes every automated check. Manual checks are still required.</p>}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
