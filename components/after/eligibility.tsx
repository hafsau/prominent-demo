"use client";

import { useId, useRef, useState } from "react";
import { formatLong, mbiError, normalizeMbi, parseDate } from "@/lib/forms";

/*
 * Check coverage, redesigned (F-01, F-09, F-10, F-11, F-12):
 *  - Search by Medicare number, or by name and date of birth.
 *  - Dates in any common format, read back to the user as they type.
 *  - Errors keep everything typed, name the field and the fix, and an error
 *    summary takes focus.
 *  - The answer leads ("Covered today"), codes are available underneath.
 *  - Recent lookups for re-checks at checkout.
 */

type Patient = { first: string; last: string; mbi: string; dob: string; plan: "original" | "advantage"; since: string; deductible: string; msp: boolean };

const PATIENTS: Patient[] = [
  { first: "Rosa", last: "Martinez", mbi: "1EG4TE5MK73", dob: "1952-03-04", plan: "original", since: "March 1, 2017", deductible: "Met for 2026", msp: false },
  { first: "Thanh", last: "Nguyen", mbi: "2HJ7KM3NP45", dob: "1948-11-20", plan: "advantage", since: "January 1, 2024", deductible: "—", msp: false },
];

type Mode = "mbi" | "name";
type Errors = Partial<Record<"mbi" | "first" | "last" | "dob" | "dos", string>>;

const today = new Date();
const TODAY = `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()}`;

export function EligibilityCheck() {
  const [mode, setMode] = useState<Mode>("mbi");
  const [v, setV] = useState({ mbi: "1EG4-TE5-MK73", first: "", last: "", dob: "", dos: TODAY });
  const [errors, setErrors] = useState<Errors>({});
  const [result, setResult] = useState<Patient | "none" | null>(null);
  const [recent, setRecent] = useState<Patient[]>([]);
  const summary = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLHeadingElement>(null);
  const id = useId();

  const validate = (): Errors => {
    const e: Errors = {};
    if (mode === "mbi") {
      const m = mbiError(v.mbi);
      if (m) e.mbi = m;
    } else {
      if (!v.first.trim()) e.first = "Enter the patient's first name as it appears on the Medicare card.";
      if (!v.last.trim()) e.last = "Enter the patient's last name as it appears on the Medicare card.";
      if (!v.dob.trim()) e.dob = "Enter the date of birth.";
      else if (!parseDate(v.dob)) e.dob = "We couldn't read that date. Try month/day/year, like 3/4/1952.";
    }
    if (!parseDate(v.dos)) e.dos = "Enter the date of service, like 10/7/2026.";
    return e;
  };

  const submit = (ev: React.FormEvent) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) {
      setResult(null);
      requestAnimationFrame(() => summary.current?.focus());
      return;
    }
    let found: Patient | undefined;
    if (mode === "mbi") found = PATIENTS.find((p) => p.mbi === normalizeMbi(v.mbi));
    else {
      const d = parseDate(v.dob)!;
      const iso = `${d.y}-${String(d.m).padStart(2, "0")}-${String(d.d).padStart(2, "0")}`;
      found = PATIENTS.find((p) => p.last.toLowerCase() === v.last.trim().toLowerCase() && p.first.toLowerCase() === v.first.trim().toLowerCase() && p.dob === iso);
    }
    setResult(found ?? "none");
    if (found) setRecent((r) => [found!, ...r.filter((x) => x.mbi !== found!.mbi)].slice(0, 5));
    requestAnimationFrame(() => resultRef.current?.focus());
  };

  const field = (k: keyof Errors, label: string, hint: string, extra?: React.ReactNode, inputProps?: React.InputHTMLAttributes<HTMLInputElement>) => (
    <div>
      <label htmlFor={`${id}-${k}`} className="block font-semibold">
        {label}
      </label>
      <p id={`${id}-${k}-hint`} className="text-sm text-[var(--ml-muted)]">
        {hint}
      </p>
      {errors[k] && (
        <p id={`${id}-${k}-err`} className="mt-1 text-sm font-semibold text-[var(--ml-error)]">
          <span aria-hidden="true">✕ </span>
          {errors[k]}
        </p>
      )}
      <input
        id={`${id}-${k}`}
        value={v[k]}
        onChange={(e) => setV({ ...v, [k]: e.target.value })}
        aria-invalid={errors[k] ? true : undefined}
        aria-describedby={`${id}-${k}-hint${errors[k] ? ` ${id}-${k}-err` : ""}`}
        className={`mt-1 block min-h-11 w-full max-w-sm rounded-md border bg-white px-3 text-base ${errors[k] ? "border-2 border-[var(--ml-error)]" : "border-[var(--ml-line-strong)]"}`}
        {...inputProps}
      />
      {extra}
    </div>
  );

  const dobRead = parseDate(v.dob);
  const errorList = Object.entries(errors) as [keyof Errors, string][];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Check coverage</h1>
        <p className="mt-1 text-[var(--ml-muted)]">See whether a patient is covered by Original Medicare on the date of service.</p>
      </div>

      {errorList.length > 0 && (
        <div ref={summary} tabIndex={-1} role="alert" aria-labelledby={`${id}-sum`} className="rounded-lg border-l-4 border-[var(--ml-error)] bg-[var(--ml-error-soft)] p-4">
          <h2 id={`${id}-sum`} className="font-bold text-[var(--ml-error)]">
            Check {errorList.length === 1 ? "this field" : `these ${errorList.length} fields`}
          </h2>
          <ul className="mt-1 list-disc pl-5">
            {errorList.map(([k, m]) => (
              <li key={k}>
                <a href={`#${id}-${k}`} className="font-semibold text-[var(--ml-error)] underline">
                  {m}
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-1 text-sm">Everything you typed is still here.</p>
        </div>
      )}

      <form onSubmit={submit} noValidate className="space-y-5 rounded-lg bg-white p-5" aria-labelledby={`${id}-form`}>
        <h2 id={`${id}-form`} className="sr-only">
          Patient search
        </h2>
        <fieldset>
          <legend className="font-semibold">Search by</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {(
              [
                ["mbi", "Medicare number (MBI)"],
                ["name", "Name and date of birth"],
              ] as const
            ).map(([m, l]) => (
              <label key={m} className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-md border-2 px-4 font-semibold ${mode === m ? "border-[var(--ml-primary)] bg-[#e7f0fa]" : "border-[var(--ml-line)]"}`}>
                <input type="radio" name={`${id}-mode`} checked={mode === m} onChange={() => (setMode(m), setErrors({}))} className="size-4 accent-[var(--ml-primary)]" />
                {l}
              </label>
            ))}
          </div>
        </fieldset>

        {mode === "mbi" ? (
          field("mbi", "Medicare number (MBI)", "11 characters, on the patient's red, white and blue Medicare card. Dashes optional.", null, { autoComplete: "off", spellCheck: false })
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {field("first", "First name", "As on the Medicare card", null, { autoComplete: "off" })}
            {field("last", "Last name", "As on the Medicare card", null, { autoComplete: "off" })}
            {field(
              "dob",
              "Date of birth",
              "Any format, like 3/4/1952 or March 4, 1952",
              v.dob && dobRead ? (
                <p className="mt-1 text-sm text-[var(--ml-success)]" aria-live="polite">
                  ✓ Read as {formatLong(dobRead)}
                </p>
              ) : null,
              { autoComplete: "off", inputMode: "numeric" },
            )}
          </div>
        )}
        {field("dos", "Date of service", "Today unless you're checking a past or upcoming visit")}

        <div className="flex flex-wrap gap-2">
          <button type="submit" className="min-h-11 rounded-md bg-[var(--ml-primary)] px-6 font-semibold text-white hover:bg-[var(--ml-primary-dark)]">
            Check coverage
          </button>
          <p className="self-center text-sm text-[var(--ml-muted)]">
            Demo: try MBI <code className="font-mono">2HJ7KM3NP45</code>, or Rosa Martinez born 3/4/1952.
          </p>
        </div>
      </form>

      {result && (
        <section aria-labelledby={`${id}-res`} className="rounded-lg bg-white p-5">
          {result === "none" ? (
            <>
              <h2 id={`${id}-res`} ref={resultRef} tabIndex={-1} className="text-xl font-bold">
                No Medicare record matches
              </h2>
              <p className="mt-1 text-[var(--ml-muted)]">Check the number against the patient&apos;s card. If the card was replaced recently, ask for the new one: old numbers stop working.</p>
            </>
          ) : result.plan === "original" ? (
            <>
              <p className="inline-flex items-center gap-2 rounded-full bg-[var(--ml-success-soft)] px-3 py-1 font-bold text-[var(--ml-success)]">
                <span aria-hidden="true">✓</span> Covered on {v.dos}
              </p>
              <h2 id={`${id}-res`} ref={resultRef} tabIndex={-1} className="mt-3 text-2xl font-bold">
                {result.first} {result.last}: Original Medicare, Part A and Part B
              </h2>
              <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {[
                  ["Active since", result.since],
                  ["Part B deductible", result.deductible],
                  ["Other insurance first?", result.msp ? "Yes: bill the other plan first" : "No: Medicare pays first"],
                ].map(([k, val]) => (
                  <div key={k} className="rounded-md bg-[var(--ml-surface)] p-3">
                    <dt className="text-sm text-[var(--ml-muted)]">{k}</dt>
                    <dd className="font-bold">{val}</dd>
                  </div>
                ))}
              </dl>
              <details className="mt-4">
                <summary className="min-h-11 cursor-pointer py-2 font-semibold text-[var(--ml-primary)]">Show eligibility codes (270/271)</summary>
                <p className="font-mono text-sm">PART A: Y EFF 03/01/2017 · PART B: Y EFF 03/01/2017 · MSP: N · HMO/MA: N</p>
              </details>
            </>
          ) : (
            <>
              <p className="inline-flex items-center gap-2 rounded-full bg-[var(--ml-warn-soft)] px-3 py-1 font-bold text-[var(--ml-warn)]">
                <span aria-hidden="true">!</span> Medicare Advantage
              </p>
              <h2 id={`${id}-res`} ref={resultRef} tabIndex={-1} className="mt-3 text-2xl font-bold">
                {result.first} {result.last} is in a Medicare Advantage plan
              </h2>
              <p className="mt-2 text-[var(--ml-muted)]">Since {result.since}. Bill the plan, not Original Medicare. The plan name and phone number are on the patient&apos;s plan card.</p>
            </>
          )}
        </section>
      )}

      {recent.length > 0 && (
        <section aria-labelledby={`${id}-recent`} className="rounded-lg bg-white p-5">
          <h2 id={`${id}-recent`} className="font-bold">
            Recent lookups
          </h2>
          <p className="text-sm text-[var(--ml-muted)]">This session only. Cleared when you sign out.</p>
          <ul className="mt-2 divide-y divide-[var(--ml-line)]">
            {recent.map((p) => (
              <li key={p.mbi} className="flex flex-wrap items-center justify-between gap-2 py-2">
                <span>
                  <b>
                    {p.first} {p.last}
                  </b>{" "}
                  <span className="font-mono text-sm text-[var(--ml-muted)]">{p.mbi}</span>
                </span>
                <button
                  type="button"
                  className="min-h-11 rounded-md px-3 font-semibold text-[var(--ml-primary)] underline"
                  onClick={() => {
                    setMode("mbi");
                    setV({ ...v, mbi: p.mbi });
                    setErrors({});
                    setResult(p);
                    requestAnimationFrame(() => resultRef.current?.focus());
                  }}
                >
                  Check again<span className="sr-only">: {p.first} {p.last}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
