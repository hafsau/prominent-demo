"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { FindingCard, sevBucket } from "@/components/ui";
import { FINDINGS, HEURISTICS, SCREEN_LABEL, SEVERITY_LABEL, severityMean, type Heuristic, type Screen } from "@/lib/audit";

const SCREENS = Object.keys(SCREEN_LABEL) as Screen[];
const PORTAL_SCREEN: Partial<Record<Screen, string>> = { login: "login", home: "home", eligibility: "eligibility", claims: "claims", documents: "documents", global: "home" };
const BAR = ["#4a5258", "#4a5258", "#8a5a00", "#c13800", "#b42318"];

export function FindingsLog() {
  const [screen, setScreen] = useState<Screen | "all">("all");
  const [h, setH] = useState<Heuristic | 0>(0);
  const [a11y, setA11y] = useState(false);

  const list = useMemo(
    () =>
      FINDINGS.filter((f) => (screen === "all" || f.screen === screen) && (!h || f.heuristics.includes(h)) && (!a11y || f.wcag?.length)).sort((x, y) => severityMean(y) - severityMean(x)),
    [screen, h, a11y],
  );

  const bySev = [4, 3, 2, 1].map((s) => ({ s, n: FINDINGS.filter((f) => sevBucket(severityMean(f)) === s).length }));
  const byH = (Object.keys(HEURISTICS).map(Number) as Heuristic[]).map((k) => ({ k, n: FINDINGS.filter((f) => f.heuristics.includes(k)).length }));
  const maxH = Math.max(...byH.map((x) => x.n));

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <figure className="rounded-xl border border-line p-5">
          <figcaption className="font-extrabold text-ink">By severity</figcaption>
          <table className="mt-3 w-full text-sm">
            <caption className="sr-only">Number of findings by severity</caption>
            <tbody>
              {bySev.map(({ s, n }) => (
                <tr key={s}>
                  <th scope="row" className="w-28 py-1 pr-3 text-left font-semibold text-body">
                    {s} · {SEVERITY_LABEL[s]}
                  </th>
                  <td className="py-1">
                    <span className="flex items-center gap-2">
                      <span aria-hidden="true" className="h-4 rounded-sm" style={{ width: `${(n / FINDINGS.length) * 100 * 2.2}%`, background: BAR[s] }} />
                      <span className="font-bold tnum">{n}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </figure>
        <figure className="rounded-xl border border-line p-5">
          <figcaption className="font-extrabold text-ink">By heuristic</figcaption>
          <table className="mt-3 w-full text-sm">
            <caption className="sr-only">Number of findings per heuristic. A finding can break more than one.</caption>
            <tbody>
              {byH.map(({ k, n }) => (
                <tr key={k}>
                  <th scope="row" className="py-0.5 pr-3 text-left font-normal text-body">
                    <span className="font-bold">H{k}</span> {HEURISTICS[k]}
                  </th>
                  <td className="w-[40%] py-0.5">
                    <span className="flex items-center gap-2">
                      <span aria-hidden="true" className="h-3 rounded-sm bg-teal-2" style={{ width: `${(n / maxH) * 80}%` }} />
                      <span className="font-bold tnum">{n}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </figure>
      </div>

      <div className="no-print flex flex-wrap items-end gap-4 rounded-xl bg-mist p-4">
        <div>
          <label htmlFor="f-screen" className="block text-xs font-bold tracking-wide text-dim uppercase">
            Screen
          </label>
          <select id="f-screen" value={screen} onChange={(e) => setScreen(e.target.value as Screen | "all")} className="mt-1 min-h-11 rounded-lg border border-line-strong bg-white px-3">
            <option value="all">All screens</option>
            {SCREENS.map((s) => (
              <option key={s} value={s}>
                {SCREEN_LABEL[s]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="f-h" className="block text-xs font-bold tracking-wide text-dim uppercase">
            Heuristic
          </label>
          <select id="f-h" value={h} onChange={(e) => setH(Number(e.target.value) as Heuristic | 0)} className="mt-1 min-h-11 max-w-[320px] rounded-lg border border-line-strong bg-white px-3">
            <option value={0}>All heuristics</option>
            {(Object.keys(HEURISTICS).map(Number) as Heuristic[]).map((k) => (
              <option key={k} value={k}>
                H{k} {HEURISTICS[k]}
              </option>
            ))}
          </select>
        </div>
        <label className="flex min-h-11 cursor-pointer items-center gap-2 font-semibold text-body">
          <input type="checkbox" checked={a11y} onChange={(e) => setA11y(e.target.checked)} className="size-5 accent-teal" />
          Accessibility (WCAG) only
        </label>
        <p role="status" className="ml-auto text-sm text-dim">
          Showing {list.length} of {FINDINGS.length}
        </p>
      </div>

      <ol className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {list.map((f) => (
          <li key={f.id} className="flex flex-col">
            <FindingCard finding={f} headingLevel={2} />
            <Link href={`/portal?screen=${PORTAL_SCREEN[f.screen]}`} className="link no-print mt-2 self-start text-sm">
              See {f.id} in the portal
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
