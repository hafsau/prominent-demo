"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ProminentMark } from "@/components/brand";

/*
 * The redesigned MedLink portal (proposed). Built on the MedLink pattern
 * library tokens (.medlink), not Prominent's brand. Includes the timeout
 * warning the audit asks for (F-03): warn, offer one action, keep the work.
 */

const NAV = [
  { group: "Patients", items: [{ label: "Check coverage", href: "/after/eligibility" }] },
  { group: "Claims", items: [{ label: "Claim status" }, { label: "Payments" }] },
  { group: "Requests", items: [{ label: "Records requests", href: "/after/documents" }, { label: "Prior authorization" }] },
  { group: "Account", items: [{ label: "Users and roles" }] },
];

const WARN_AFTER_MS = 90_000; // demo: real portal warns at 28 of 30 minutes
const COUNTDOWN_S = 120;

export function AfterShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const embed = useSearchParams().get("embed") === "1";
  const dialog = useRef<HTMLDialogElement>(null);
  const [left, setLeft] = useState(COUNTDOWN_S);
  const [signedOut, setSignedOut] = useState(false);
  const last = useRef(0);

  useEffect(() => {
    if (embed) return;
    last.current = Date.now();
    const bump = () => {
      if (!dialog.current?.open) last.current = Date.now();
    };
    const evs = ["mousemove", "keydown", "mousedown", "touchstart"] as const;
    evs.forEach((e) => window.addEventListener(e, bump));
    const t = setInterval(() => {
      const d = dialog.current;
      if (!d) return;
      if (!d.open && Date.now() - last.current > WARN_AFTER_MS) {
        setLeft(COUNTDOWN_S);
        d.showModal();
      } else if (d.open) {
        setLeft((s) => {
          if (s <= 1) {
            d.close();
            setSignedOut(true);
            return 0;
          }
          return s - 1;
        });
      }
    }, 1000);
    return () => {
      evs.forEach((e) => window.removeEventListener(e, bump));
      clearInterval(t);
    };
  }, [embed]);

  const stay = () => {
    dialog.current?.close();
    last.current = Date.now();
  };

  return (
    <div className="flex min-h-dvh flex-col bg-[#eef1f4]">
      {!embed && (
        <div className="no-print bg-teal text-white">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-2 text-sm">
            <Link href="/" className="inline-flex min-h-11 items-center gap-2 rounded-full pr-3 font-bold hover:bg-white/10">
              <ProminentMark className="size-7" />
              ← Audit report
            </Link>
            <p>
              <span className="font-extrabold">MedLink, redesigned</span> <span className="text-white/80">· proposed, built on the pattern library</span>
            </p>
            <Link href={pathname.includes("documents") ? "/portal?screen=documents" : "/portal?screen=eligibility"} className="ml-auto inline-flex min-h-11 items-center rounded-full border-2 border-white/70 px-4 font-bold hover:bg-white/10">
              Compare with before
            </Link>
          </div>
        </div>
      )}

      <div className="medlink flex flex-1 flex-col">
        <a href="#ml-main" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:m-2 focus:rounded-md focus:bg-[var(--ml-ink)] focus:px-4 focus:py-2 focus:text-white">
          Skip to main content
        </a>
        <header className="border-b border-[var(--ml-line)] bg-white">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-4 py-3">
            <p className="flex items-center gap-2 text-lg font-bold">
              <span aria-hidden="true" className="grid size-8 place-items-center rounded-md bg-[var(--ml-primary)] text-sm text-white">
                ML
              </span>
              MedLink <span className="text-sm font-normal text-[var(--ml-muted)]">Provider Portal</span>
            </p>
            <div className="ml-auto flex flex-wrap items-center gap-3 text-sm">
              <label htmlFor="ml-profile" className="text-[var(--ml-muted)]">
                Working as
              </label>
              <select id="ml-profile" className="min-h-11 rounded-md border border-[var(--ml-line-strong)] bg-white px-3 font-semibold">
                <option>Northern Plains Family Clinic · NPI …7893</option>
                <option>Riverbend Physical Therapy · NPI …4410</option>
              </select>
              <a href="#help" className="inline-flex min-h-11 items-center rounded-md px-2 font-semibold text-[var(--ml-primary)] underline underline-offset-4">
                Help
              </a>
            </div>
          </div>
        </header>
        <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-6 md:flex-row">
          <nav aria-label="Portal" className="md:w-56 md:shrink-0">
            <ul className="grid grid-cols-2 gap-x-4 gap-y-3 md:block md:space-y-4">
              {NAV.map((g) => (
                <li key={g.group}>
                  <p className="text-xs font-bold tracking-wider text-[var(--ml-muted)] uppercase">{g.group}</p>
                  <ul className="mt-1 space-y-0.5">
                    {g.items.map((i) =>
                      i.href ? (
                        <li key={i.label}>
                          <Link
                            href={i.href}
                            aria-current={pathname === i.href ? "page" : undefined}
                            className={`flex min-h-11 items-center rounded-md px-3 font-semibold ${pathname === i.href ? "bg-[var(--ml-primary)] text-white" : "text-[var(--ml-ink)] hover:bg-white"}`}
                          >
                            {i.label}
                          </Link>
                        </li>
                      ) : (
                        <li key={i.label} className="flex min-h-11 items-center px-3 text-[var(--ml-muted)]">
                          {i.label}
                        </li>
                      ),
                    )}
                  </ul>
                </li>
              ))}
            </ul>
          </nav>
          <main id="ml-main" tabIndex={-1} className="min-w-0 flex-1 focus:outline-none">
            {signedOut ? (
              <div className="rounded-lg bg-white p-6">
                <h1 className="text-2xl font-bold">You were signed out</h1>
                <p className="mt-2 text-[var(--ml-muted)]">Your draft was saved and will be here when you sign back in.</p>
                <button type="button" className="mt-4 min-h-11 rounded-md bg-[var(--ml-primary)] px-5 font-semibold text-white" onClick={() => setSignedOut(false)}>
                  Sign back in
                </button>
              </div>
            ) : (
              children
            )}
          </main>
        </div>
      </div>

      <dialog ref={dialog} aria-labelledby="timeout-h" aria-describedby="timeout-d" className="medlink m-auto max-w-md rounded-lg p-6 backdrop:bg-black/50">
        <h2 id="timeout-h" className="text-xl font-bold">
          Still there?
        </h2>
        <p id="timeout-d" className="mt-2 text-[var(--ml-muted)]">
          To protect patient information, you&apos;ll be signed out in{" "}
          <b className="text-[var(--ml-ink)] tabular-nums">
            {Math.floor(left / 60)}:{String(left % 60).padStart(2, "0")}
          </b>
          . Anything you&apos;ve typed is saved as a draft.
        </p>
        <div className="mt-5 flex gap-2">
          <button type="button" autoFocus onClick={stay} className="min-h-11 rounded-md bg-[var(--ml-primary)] px-5 font-semibold text-white hover:bg-[var(--ml-primary-dark)]">
            Stay signed in
          </button>
          <button
            type="button"
            onClick={() => {
              dialog.current?.close();
              setSignedOut(true);
            }}
            className="min-h-11 rounded-md border-2 border-[var(--ml-primary)] px-5 font-semibold text-[var(--ml-primary)]"
          >
            Sign out now
          </button>
        </div>
      </dialog>
    </div>
  );
}
