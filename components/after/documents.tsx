"use client";

import { useId, useRef, useState } from "react";

/*
 * Respond to a records request, redesigned (F-16 to F-20):
 *  - Open requests listed with due dates; the claim is already attached.
 *  - Several files, common formats, merged on the server.
 *  - Errors in text, tied to the field; good files are kept.
 *  - A confirmation with a reference number, what arrived, and the due date met.
 */

type Req = { id: string; patient: string; icn: string; dos: string; due: string; daysLeft: number; asks: string[]; status: "open" | "received" };

const INITIAL: Req[] = [
  { id: "r1", patient: "Rosa Martinez", icn: "21926700412345601", dos: "Sep 12, 2026", due: "Nov 14, 2026", daysLeft: 38, asks: ["Progress notes for the date of service", "Signed physician order"], status: "open" },
  { id: "r2", patient: "Jean Halvorson", icn: "21926700412345630", dos: "Sep 22, 2026", due: "Oct 21, 2026", daysLeft: 14, asks: ["Operative report", "Anesthesia record"], status: "open" },
  { id: "r3", patient: "Grace Okonkwo", icn: "21926700412345611", dos: "Sep 15, 2026", due: "Nov 28, 2026", daysLeft: 52, asks: ["Plan of care"], status: "open" },
];

const ACCEPT = [".pdf", ".tif", ".tiff", ".jpg", ".jpeg", ".png"];
const MAX = 25 * 1024 * 1024;

type F = { name: string; size: number };

function size(n: number) {
  return n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`;
}

export function RecordsRequests() {
  const [reqs, setReqs] = useState(INITIAL);
  const [sel, setSel] = useState<string | null>(null);
  const [files, setFiles] = useState<F[]>([]);
  const [rejected, setRejected] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [done, setDone] = useState<{ ref: string; req: Req; files: F[] } | null>(null);
  const id = useId();
  const head = useRef<HTMLHeadingElement>(null);
  const confirm = useRef<HTMLHeadingElement>(null);
  const seq = useRef(40731);
  const r = reqs.find((x) => x.id === sel);

  const pick = (rid: string) => {
    setSel(rid);
    setFiles([]);
    setRejected([]);
    setError("");
    setDone(null);
    requestAnimationFrame(() => head.current?.focus());
  };

  const add = (list: FileList | null) => {
    if (!list) return;
    const ok: F[] = [];
    const bad: string[] = [];
    for (const f of Array.from(list)) {
      const ext = f.name.toLowerCase().slice(f.name.lastIndexOf("."));
      if (!ACCEPT.includes(ext)) bad.push(`${f.name} isn't a PDF, TIFF, JPG or PNG. Save it as PDF and add it again.`);
      else if (f.size > MAX) bad.push(`${f.name} is ${size(f.size)}. Files can be up to 25 MB each.`);
      else ok.push({ name: f.name, size: f.size });
    }
    setFiles((cur) => [...cur, ...ok.filter((n) => !cur.some((c) => c.name === n.name))]);
    setRejected(bad);
    setError("");
  };

  const send = () => {
    if (!r) return;
    if (!files.length) {
      setError("Add at least one file before sending.");
      return;
    }
    seq.current += 7919;
    const ref = `DOC-${seq.current.toString(36).toUpperCase().padStart(4, "0")}-${r.icn.slice(-2)}`;
    setDone({ ref, req: r, files });
    setReqs((all) => all.map((x) => (x.id === r.id ? { ...x, status: "received" } : x)));
    requestAnimationFrame(() => confirm.current?.focus());
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Records requests</h1>
        <p className="mt-1 text-[var(--ml-muted)]">Requests for additional documentation on your claims. Send records before the due date to avoid a denial.</p>
      </div>

      <section aria-labelledby={`${id}-open`} className="rounded-lg bg-white p-5">
        <h2 id={`${id}-open`} className="font-bold">
          Open requests
        </h2>
        <ul className="mt-3 space-y-2">
          {reqs.map((q) => (
            <li key={q.id}>
              <button
                type="button"
                onClick={() => pick(q.id)}
                aria-pressed={sel === q.id}
                className={`flex w-full flex-wrap items-center justify-between gap-3 rounded-md border-2 p-3 text-left ${sel === q.id ? "border-[var(--ml-primary)] bg-[#e7f0fa]" : "border-[var(--ml-line)] hover:border-[var(--ml-primary)]"}`}
              >
                <span>
                  <span className="block font-bold">{q.patient}</span>
                  <span className="text-sm text-[var(--ml-muted)]">
                    Claim …{q.icn.slice(-4)} · service {q.dos}
                  </span>
                </span>
                {q.status === "received" ? (
                  <span className="rounded-full bg-[var(--ml-success-soft)] px-3 py-1 text-sm font-bold text-[var(--ml-success)]">✓ Received</span>
                ) : (
                  <span className={`rounded-full px-3 py-1 text-sm font-bold ${q.daysLeft <= 14 ? "bg-[var(--ml-warn-soft)] text-[var(--ml-warn)]" : "bg-[var(--ml-surface)] text-[var(--ml-ink)]"}`}>
                    Due {q.due} · {q.daysLeft} days
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </section>

      {done ? (
        <section aria-labelledby={`${id}-done`} className="rounded-lg border-l-4 border-[var(--ml-success)] bg-white p-5">
          <h2 id={`${id}-done`} ref={confirm} tabIndex={-1} className="text-2xl font-bold">
            Received: {done.files.length} {done.files.length === 1 ? "file" : "files"} for {done.req.patient}
          </h2>
          <dl className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              ["Reference", done.ref],
              ["Due date", `${done.req.due}: met`],
              ["Claim", `…${done.req.icn.slice(-4)}`],
            ].map(([k, v]) => (
              <div key={k} className="rounded-md bg-[var(--ml-surface)] p-3">
                <dt className="text-sm text-[var(--ml-muted)]">{k}</dt>
                <dd className="font-mono font-bold">{v}</dd>
              </div>
            ))}
          </dl>
          <ul className="mt-3 list-disc pl-5 text-sm">
            {done.files.map((f) => (
              <li key={f.name}>
                {f.name} ({size(f.size)})
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[var(--ml-muted)]">We&apos;ll merge the files into one record. Review usually takes up to 45 days; you&apos;ll get a message when there&apos;s a decision. A copy of this confirmation is in Messages.</p>
        </section>
      ) : (
        r && (
          <section aria-labelledby={`${id}-send`} className="space-y-4 rounded-lg bg-white p-5">
            <h2 id={`${id}-send`} ref={head} tabIndex={-1} className="text-xl font-bold">
              Send records for {r.patient}
            </h2>
            <p className="text-sm text-[var(--ml-muted)]">
              Claim {r.icn} is attached. Due {r.due}.
            </p>
            <div>
              <p className="font-semibold">Requested</p>
              <ul className="mt-1 list-disc pl-5">
                {r.asks.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            </div>
            <div>
              <label htmlFor={`${id}-file`} className="block font-semibold">
                Add files
              </label>
              <p id={`${id}-file-hint`} className="text-sm text-[var(--ml-muted)]">
                PDF, TIFF, JPG or PNG, up to 25 MB each. Add as many as you need; we merge them.
              </p>
              <input
                id={`${id}-file`}
                type="file"
                multiple
                accept={ACCEPT.join(",")}
                aria-describedby={`${id}-file-hint${rejected.length || error ? ` ${id}-file-err` : ""}`}
                aria-invalid={rejected.length || error ? true : undefined}
                onChange={(e) => {
                  add(e.target.files);
                  e.target.value = "";
                }}
                className="mt-2 block w-full max-w-md rounded-md border border-dashed border-[var(--ml-line-strong)] bg-[var(--ml-surface)] p-3 text-sm file:mr-3 file:min-h-11 file:rounded-md file:border-0 file:bg-[var(--ml-primary)] file:px-4 file:font-semibold file:text-white"
              />
              {(rejected.length > 0 || error) && (
                <div id={`${id}-file-err`} role="alert" className="mt-2 text-sm font-semibold text-[var(--ml-error)]">
                  {error && <p>✕ {error}</p>}
                  {rejected.map((m) => (
                    <p key={m}>✕ {m}</p>
                  ))}
                  {rejected.length > 0 && files.length > 0 && <p className="font-normal text-[var(--ml-ink)]">Your other files are still added.</p>}
                </div>
              )}
            </div>
            {files.length > 0 && (
              <ul aria-label="Files to send" className="divide-y divide-[var(--ml-line)] rounded-md border border-[var(--ml-line)]">
                {files.map((f) => (
                  <li key={f.name} className="flex items-center justify-between gap-2 px-3 py-1">
                    <span>
                      {f.name} <span className="text-sm text-[var(--ml-muted)]">{size(f.size)}</span>
                    </span>
                    <button type="button" className="min-h-11 rounded-md px-3 font-semibold text-[var(--ml-error)] underline" onClick={() => setFiles((all) => all.filter((x) => x.name !== f.name))}>
                      Remove<span className="sr-only"> {f.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <button type="button" onClick={send} className="min-h-11 rounded-md bg-[var(--ml-primary)] px-6 font-semibold text-white hover:bg-[var(--ml-primary-dark)]">
              Send {files.length ? `${files.length} ${files.length === 1 ? "file" : "files"}` : "records"}
            </button>
          </section>
        )
      )}
    </div>
  );
}
