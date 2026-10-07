"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui";
import { backlogCsv, EFFORT_THRESHOLD, FINDINGS, IMPACT_THRESHOLD, impact, prioritize, quadrant, QUADRANT_LABEL, type Quadrant } from "@/lib/audit";

/*
 * Impact × effort matrix. The audit proposes positions; the architect moves
 * them. Dots are buttons: arrow keys change effort (←/→) and impact (↑/↓),
 * pointer drag does the same. Every move is announced and re-sorts the backlog.
 */

type Pos = { impact: number; effort: number };
const KEY = "prominent-backlog-v1";
const Q_FILL: Record<Quadrant, string> = { "quick-win": "#1f6b3a", "big-bet": "#c13800", "fill-in": "#06526a", later: "#4a5258" };

const initial = (): Record<string, Pos> => Object.fromEntries(FINDINGS.map((f) => [f.id, { impact: impact(f), effort: f.effort }]));
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const round = (v: number, step: number) => Math.round(v / step) * step;

export function BacklogMatrix() {
  const [pos, setPos] = useState<Record<string, Pos>>(initial);
  const [sel, setSel] = useState<string | null>(null);
  const [said, setSaid] = useState("");
  const [mvpBigBets, setMvpBigBets] = useState(false);
  const plot = useRef<HTMLDivElement>(null);
  const drag = useRef<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration
      if (raw) setPos({ ...initial(), ...JSON.parse(raw) });
    } catch {
      /* storage unavailable */
    }
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(pos));
    } catch {
      /* ignore */
    }
  }, [pos]);

  const items = useMemo(() => FINDINGS.map((f) => ({ ...f, ...pos[f.id] })), [pos]);
  const ordered = prioritize(items);
  const mvp = ordered.filter((i) => {
    const q = quadrant(i.impact, i.effort);
    return q === "quick-win" || (mvpBigBets && q === "big-bet");
  });

  // Dots snap to half-point impact rows and spread within their cell (≤3 per
  // row, two rows when crowded) so every target keeps its full 28px.
  const layout = useMemo(() => {
    const cells: Record<string, string[]> = {};
    for (const i of items) (cells[`${i.effort}|${Math.round(i.impact * 2) / 2}`] ??= []).push(i.id);
    const out: Record<string, { y: number; dx: number; dy: number }> = {};
    for (const [k, ids] of Object.entries(cells)) {
      const y = Number(k.split("|")[1]);
      const rows = ids.length > 3 ? 2 : 1;
      const perRow = Math.ceil(ids.length / rows);
      ids.forEach((id, n) => {
        const row = Math.floor(n / perRow);
        const inRow = row === rows - 1 ? ids.length - perRow * row : perRow;
        const col = n % perRow;
        out[id] = { y, dx: (col - (inRow - 1) / 2) * 31, dy: rows === 2 ? (row === 0 ? -15 : 15) : 0 };
      });
    }
    return out;
  }, [items]);

  const move = (id: string, next: Pos) => {
    const p = { impact: clamp(round(next.impact, 0.1), 1, 5), effort: clamp(Math.round(next.effort), 1, 5) };
    setPos((s) => ({ ...s, [id]: p }));
    setSaid(`${id}: impact ${p.impact.toFixed(1)}, effort ${p.effort}. ${QUADRANT_LABEL[quadrant(p.impact, p.effort)]}.`);
  };

  const onKey = (e: React.KeyboardEvent, f: { id: string } & Pos) => {
    const d = { ArrowUp: [0.5, 0], ArrowDown: [-0.5, 0], ArrowRight: [0, 1], ArrowLeft: [0, -1] }[e.key];
    if (!d) return;
    e.preventDefault();
    move(f.id, { impact: f.impact + d[0], effort: f.effort + d[1] });
  };

  const toPos = (clientX: number, clientY: number): Pos | null => {
    const r = plot.current?.getBoundingClientRect();
    if (!r) return null;
    return { effort: 1 + (((clientX - r.left) / r.width) * 100 - 8) / 21, impact: 5 - (((clientY - r.top) / r.height) * 100 - 8) / 21 };
  };

  const download = () => {
    const blob = new Blob([backlogCsv(items)], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "medlink-audit-backlog.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  // Inset 8% on each side so edge values stay fully visible.
  const left = (e: number) => 8 + ((e - 1) / 4) * 84;
  const top = (i: number) => 8 + ((5 - i) / 4) * 84;

  return (
    <div className="space-y-6">
      <div className="no-print flex flex-wrap items-center gap-2">
        <Button onClick={download}>Export CSV for Jira</Button>
        <Button
          variant="outline"
          onClick={() => {
            setPos(initial());
            setSaid("Reset to the audit's scores.");
          }}
        >
          Reset to audit scores
        </Button>
        <p className="text-sm text-dim">Select a dot, then use the arrow keys, or drag it. Changes stay in this browser.</p>
      </div>
      <p role="status" aria-live="polite" className="sr-only">
        {said}
      </p>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <figure>
          <figcaption className="sr-only">Impact versus effort for all {items.length} findings. Each dot is a button.</figcaption>
          <div className="flex">
            <div className="flex w-7 items-center justify-center" aria-hidden="true">
              <span className="rotate-180 text-xs font-bold tracking-wide whitespace-nowrap text-dim uppercase [writing-mode:vertical-rl]">Impact (severity × reach) →</span>
            </div>
            <div className="flex-1">
              <div
                ref={plot}
                className="relative h-[620px] w-full touch-none rounded-xl border border-line sm:aspect-square sm:h-auto sm:max-h-[560px]"
                onPointerMove={(e) => {
                  if (!drag.current) return;
                  const p = toPos(e.clientX, e.clientY);
                  if (p) move(drag.current, p);
                }}
                onPointerUp={() => (drag.current = null)}
                onPointerLeave={() => (drag.current = null)}
              >
                {/* quadrants */}
                <div className="absolute inset-0 grid grid-cols-[39.5%_60.5%] grid-rows-[50%_50%] overflow-hidden rounded-xl" aria-hidden="true">
                  <div className="bg-good-soft p-3 text-sm font-extrabold text-good">Quick wins</div>
                  <div className="bg-cream p-3 text-right text-sm font-extrabold text-orange-ink">Big bets</div>
                  <div className="flex items-end bg-mist p-3 text-sm font-extrabold text-teal-2">Fill-ins</div>
                  <div className="flex items-end justify-end bg-[#f7f8f8] p-3 text-sm font-extrabold text-muted">Reconsider later</div>
                </div>
                <div aria-hidden="true" className="absolute inset-x-0 border-t-2 border-dashed border-line-strong" style={{ top: `${top(IMPACT_THRESHOLD)}%` }} />
                <div aria-hidden="true" className="absolute inset-y-0 border-l-2 border-dashed border-line-strong" style={{ left: `${left(EFFORT_THRESHOLD)}%` }} />
                <div role="group" aria-label="Findings">
                  {items.map((f) => {
                    const q = quadrant(f.impact, f.effort);
                    const { y, dx, dy } = layout[f.id];
                    return (
                      <button
                        key={f.id}
                        type="button"
                        aria-label={`${f.id} ${f.title}. Impact ${f.impact.toFixed(1)}, effort ${f.effort}. ${QUADRANT_LABEL[q]}.`}
                        aria-pressed={sel === f.id}
                        onFocus={() => setSel(f.id)}
                        onClick={() => setSel(f.id)}
                        onKeyDown={(e) => onKey(e, f)}
                        onPointerDown={(e) => {
                          drag.current = f.id;
                          setSel(f.id);
                          (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
                        }}
                        className={`absolute grid h-7 min-w-7 -translate-x-1/2 -translate-y-1/2 cursor-grab place-items-center rounded-full px-1 text-[11px] font-extrabold text-white shadow ring-2 ring-white active:cursor-grabbing ${sel === f.id ? "z-20 scale-125 outline-3 outline-gold" : "z-10"}`}
                        style={{ left: `calc(${left(f.effort)}% + ${dx}px)`, top: `calc(${top(y)}% + ${dy}px)`, background: Q_FILL[q] }}
                      >
                        {f.id.slice(2)}
                      </button>
                    );
                  })}
                </div>
              </div>
              <p className="mt-2 text-center text-xs font-bold tracking-wide text-dim uppercase" aria-hidden="true">
                Effort → (architect estimate, 1–5)
              </p>
            </div>
          </div>
          {sel && (
            <div className="mt-4 rounded-lg border border-line p-4">
              <p className="text-sm font-bold text-ink">
                {sel}: {items.find((i) => i.id === sel)!.title}
              </p>
              <p className="mt-1 text-sm text-muted">{items.find((i) => i.id === sel)!.recommendation}</p>
            </div>
          )}
        </figure>

        <div>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-xl font-extrabold text-ink">Backlog, in priority order</h2>
            <label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm font-semibold">
              <input type="checkbox" className="size-5 accent-teal" checked={mvpBigBets} onChange={(e) => setMvpBigBets(e.target.checked)} />
              Include big bets in the MVP
            </label>
          </div>
          <ol className="mt-3 space-y-1.5">
            {ordered.map((i, n) => {
              const q = quadrant(i.impact, i.effort);
              const lastMvp = n === mvp.length - 1;
              return (
                <li key={i.id}>
                  <div className={`flex items-center gap-3 rounded-lg border px-3 py-2 ${sel === i.id ? "border-teal-2 bg-mist" : "border-line"}`}>
                    <span className="w-5 text-right text-xs font-bold text-dim tnum">{n + 1}</span>
                    <span aria-hidden="true" className="size-3 shrink-0 rounded-full" style={{ background: Q_FILL[q] }} />
                    <span className="min-w-0 flex-1 text-sm">
                      <span className="font-mono font-bold text-ink">{i.id}</span> <span className="text-body">{i.title}</span>
                    </span>
                    <span className="text-xs whitespace-nowrap text-dim tnum">
                      {i.impact.toFixed(1)} / {i.effort}
                    </span>
                  </div>
                  {lastMvp && (
                    <p className="my-2 flex items-center gap-2 text-xs font-extrabold tracking-wide text-orange-ink uppercase">
                      <span aria-hidden="true" className="h-0.5 flex-1 bg-orange" />
                      MVP cut line · {mvp.length} items above
                      <span aria-hidden="true" className="h-0.5 flex-1 bg-orange" />
                    </p>
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </div>
  );
}
