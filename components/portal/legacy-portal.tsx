"use client";

/*
 * The "before" portal: a deliberately dated, believable provider portal for a
 * fictional Medicare contractor. Every problem here is on purpose and is
 * tagged with data-finding="F-xx", so the audit overlay can pin findings to
 * the exact element. It reproduces generic patterns from public provider-
 * portal documentation, not any real portal's screens.
 *
 * This file intentionally breaks accessibility and usability rules. It is
 * excluded from the zero-violation checks; a separate test asserts that axe
 * finds exactly the problems the findings log claims.
 */

/* eslint-disable @next/next/no-img-element, jsx-a11y/alt-text -- unlabelled icon images are finding F-08, on purpose */
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

export type PortalScreen = "login" | "provider" | "home" | "eligibility" | "claims" | "documents" | "timeout" | "unavailable";

const ICON_PRINT = "data:image/svg+xml;utf8," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"><rect x="3" y="1" width="10" height="5" fill="#666"/><rect x="1" y="6" width="14" height="6" fill="#888"/><rect x="4" y="10" width="8" height="5" fill="#fff" stroke="#666"/></svg>');
const ICON_HELP = "data:image/svg+xml;utf8," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"><circle cx="8" cy="8" r="7" fill="#2b5a8a"/><text x="8" y="12" font-size="11" text-anchor="middle" fill="#fff" font-family="Arial">?</text></svg>');
const ICON_MAIL = "data:image/svg+xml;utf8," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"><rect x="1" y="3" width="14" height="10" fill="#e8c74a" stroke="#a88a20"/><path d="M1 3l7 6 7-6" fill="none" stroke="#a88a20"/></svg>');

const MENU: { label: string; screen?: PortalScreen }[] = [
  { label: "Home", screen: "home" },
  { label: "Elig/Benefits", screen: "eligibility" },
  { label: "MBI Lookup" },
  { label: "Claim Inq", screen: "claims" },
  { label: "Claim Submit (DDE)" },
  { label: "ADR Doc Sub", screen: "documents" },
  { label: "Fin Inq" },
  { label: "RA/835" },
  { label: "Reopen" },
  { label: "Redeterm" },
  { label: "PA Req" },
  { label: "CERT/RAC" },
  { label: "Msg Ctr" },
  { label: "Prov Admin" },
];

const CLAIMS = [
  ["21926700412345601", "MARTINEZ, ROSA", "09/12/2026", "$412.00", "A2-20"],
  ["21926700412345602", "NGUYEN, THANH", "09/14/2026", "$96.50", "F1"],
  ["21926700412345611", "OKONKWO, GRACE", "09/15/2026", "$1,280.00", "T1"],
  ["21926700412345619", "BAKER, LOUIS", "09/18/2026", "$220.00", "R2"],
  ["21926700412345624", "IVERSON, DALE", "09/19/2026", "$75.00", "F1"],
  ["21926700412345630", "HALVORSON, JEAN", "09/22/2026", "$640.00", "A2-20"],
  ["21926700412345633", "RED BEAR, MARCUS", "09/23/2026", "$310.00", "S"],
  ["21926700412345641", "LINDQUIST, ERIK", "09/25/2026", "$155.00", "F1"],
  ["21926700412345648", "AHMED, SAMIRA", "09/26/2026", "$980.00", "T1"],
  ["21926700412345652", "PETERSON, AMY", "09/29/2026", "$48.00", "D5"],
];

const IDLE_MS = 120_000;

export function LegacyPortal({ initialScreen = "login", onScreen }: { initialScreen?: PortalScreen; onScreen?: (s: PortalScreen) => void }) {
  const [screen, setScreenState] = useState<PortalScreen>(initialScreen);
  const setScreen = useCallback(
    (s: PortalScreen) => {
      setScreenState(s);
      onScreen?.(s);
    },
    [onScreen],
  );

  // F-03: inactivity silently ends the session. No warning, work is discarded.
  const last = useRef(0);
  useEffect(() => {
    last.current = Date.now();
    const bump = () => (last.current = Date.now());
    const events = ["mousemove", "keydown", "mousedown", "touchstart"] as const;
    events.forEach((e) => window.addEventListener(e, bump));
    const t = setInterval(() => {
      if (screen !== "login" && screen !== "timeout" && Date.now() - last.current > IDLE_MS) setScreen("timeout");
    }, 5000);
    return () => {
      events.forEach((e) => window.removeEventListener(e, bump));
      clearInterval(t);
    };
  }, [screen, setScreen]);

  const signedIn = !["login", "provider", "timeout"].includes(screen);

  return (
    <div className="legacy mx-auto w-[980px] min-w-[980px] bg-white text-[11px] text-[#333]" style={{ fontFamily: "Verdana, Geneva, Tahoma, sans-serif" }} data-finding="F-22">
      {/* F-24: no skip link; the header and menu are 30 tab stops */}
      <div className="flex h-[70px] items-center justify-between bg-gradient-to-b from-[#3d6fa3] to-[#1e3f63] px-4" data-finding="F-24">
        <div className="flex items-baseline gap-2">
          <span className="text-[26px] text-white italic" style={{ fontFamily: "Georgia, serif" }}>
            MedLink
          </span>
          <span className="text-[10px] text-[#c9d6e3]">Provider Portal v7.3 · Northern Plains Medicare Services</span>
        </div>
        <div className="flex items-center gap-2 text-[10px]">
          <a href="#" className="text-white underline" onClick={(e) => e.preventDefault()} title="UserGuide_v7.3.pdf (64 pages)" data-finding="F-23">
            Help
          </a>
          <span className="text-[#c9d6e3]">|</span>
          <a href="#" className="text-white underline" onClick={(e) => e.preventDefault()}>
            Contact Us
          </a>
          {signedIn && (
            <>
              <span className="text-[#c9d6e3]">|</span>
              <a
                href="#"
                className="text-white underline"
                onClick={(e) => {
                  e.preventDefault();
                  setScreen("login");
                }}
              >
                Logout
              </a>
            </>
          )}
        </div>
      </div>

      {screen === "login" && <Login onLogin={() => setScreen("provider")} />}
      {screen === "provider" && <ProviderSelect onContinue={() => setScreen("home")} />}
      {screen === "timeout" && (
        <Box title="Session Expired">
          <p className="text-[#c00]">Your session has expired due to inactivity. Any unsaved information has been lost. Please login again.</p>
          <button type="button" className="mt-3 border border-[#888] bg-gradient-to-b from-[#f4f4f4] to-[#d4d4d4] px-3 py-0.5 text-[11px]" onClick={() => setScreen("login")} data-finding="F-03">
            Return to Login
          </button>
        </Box>
      )}

      {signedIn && (
        <div className="flex">
          <ul className="w-[170px] shrink-0 border-r border-[#ccc] bg-[#eef2f6] py-2" data-finding="F-05">
            {MENU.map((m) => (
              <li key={m.label}>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setScreen(m.screen ?? "unavailable");
                  }}
                  className={`block px-3 py-[3px] text-[11px] ${screen === m.screen ? "bg-[#1e3f63] font-bold text-white" : "text-[#1e3f63] hover:underline"}`}
                >
                  {m.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="min-h-[520px] flex-1 p-3">
            {screen === "home" && <Home />}
            {screen === "eligibility" && <Eligibility />}
            {screen === "claims" && <Claims />}
            {screen === "documents" && <Documents />}
            {screen === "unavailable" && (
              <Box title="Notice">
                <p>This function is not part of the demo. Try Elig/Benefits, Claim Inq or ADR Doc Sub.</p>
              </Box>
            )}
          </div>
        </div>
      )}

      <div className="border-t border-[#ccc] bg-[#f5f5f5] px-3 py-2 text-[10px] text-[#9a9a9a]" data-finding="F-07">
        © 2026 Northern Plains Medicare Services (fictional). For official use by authorized providers only. Unauthorized access is prohibited. Session times out after 30 minutes of inactivity.
      </div>
    </div>
  );
}

function Box({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="m-3 border border-[#9fb3c8]">
      <div className="bg-gradient-to-b from-[#dfe8f1] to-[#c5d4e3] px-2 py-1 font-bold text-[#1e3f63]">{title}</div>
      <div className="p-3">{children}</div>
    </div>
  );
}

function Login({ onLogin }: { onLogin: () => void }) {
  return (
    <div className="flex justify-center py-12">
      <div className="w-[340px] border border-[#9fb3c8]">
        <div className="bg-gradient-to-b from-[#dfe8f1] to-[#c5d4e3] px-2 py-1 font-bold text-[#1e3f63]">Welcome! Please Login</div>
        <form
          className="space-y-2 p-4"
          onSubmit={(e) => {
            e.preventDefault();
            onLogin();
          }}
        >
          <div data-finding="F-02">
            <input className="w-full border border-[#999] px-1 py-0.5 text-[11px]" placeholder="User ID" defaultValue="clinic.frontdesk" />
          </div>
          <input className="w-full border border-[#999] px-1 py-0.5 text-[11px]" placeholder="Password" type="password" defaultValue="demo-password" />
          <p className="text-[10px] text-[#9a9a9a]">Passwords expire every 60 days. Accounts unused for 30 days are deactivated.</p>
          <button type="submit" className="border border-[#888] bg-gradient-to-b from-[#f4f4f4] to-[#d4d4d4] px-3 py-0.5 text-[11px]" data-finding="F-21">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

function ProviderSelect({ onContinue }: { onContinue: () => void }) {
  const [error, setError] = useState(false);
  const [ptan, setPtan] = useState("JF12345");
  return (
    <div className="flex justify-center py-10">
      <div className="w-[420px] border border-[#9fb3c8]" data-finding="F-01">
        <div className="bg-gradient-to-b from-[#dfe8f1] to-[#c5d4e3] px-2 py-1 font-bold text-[#1e3f63]">Provider Selection</div>
        <form
          className="space-y-2 p-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (ptan.trim().length !== 9) setError(true);
            else onContinue();
          }}
        >
          {error && (
            <p className="text-[11px] font-bold text-[#c00]" data-finding="F-04">
              ERR-4021: Invalid request.
            </p>
          )}
          <p className="text-[#9a9a9a]">Enter the TIN, NPI and PTAN for the provider you are acting on behalf of.</p>
          <input className="w-full border border-[#999] px-1 py-0.5" placeholder="TIN" defaultValue="45-1234567" />
          <input className="w-full border border-[#999] px-1 py-0.5" placeholder="NPI" defaultValue="1234567893" />
          <input className="w-full border border-[#999] px-1 py-0.5" placeholder="PTAN" value={ptan} onChange={(e) => setPtan(e.target.value)} />
          <button type="submit" className="rounded-[3px] bg-gradient-to-b from-[#5b8fc4] to-[#2b5a8a] px-4 py-1 text-[11px] font-bold text-white">
            Continue &gt;&gt;
          </button>
        </form>
      </div>
    </div>
  );
}

function Home() {
  return (
    <div>
      <div className="mb-3 border border-[#c00] bg-[#ffe5e5] px-2 py-1.5 font-bold text-[#c00]" data-finding="F-06">
        ATTENTION: The portal will be unavailable Saturday 09/05/2026 from 6:00 PM to 11:59 PM CT for scheduled maintenance. Claim Inq, Reopen and Redeterm will be unavailable.
      </div>
      <div className="flex items-start justify-between">
        <h1 className="text-[16px] font-bold text-[#1e3f63]">Welcome, clinic.frontdesk</h1>
        <div className="flex gap-2" data-finding="F-08">
          <a href="#" onClick={(e) => e.preventDefault()}>
            <img src={ICON_PRINT} width={16} height={16} />
          </a>
          <a href="#" onClick={(e) => e.preventDefault()}>
            <img src={ICON_HELP} width={16} height={16} />
          </a>
          <a href="#" onClick={(e) => e.preventDefault()}>
            <img src={ICON_MAIL} width={16} height={16} />
          </a>
        </div>
      </div>
      <p className="mt-1 text-[#9a9a9a]">Acting on behalf of: TIN 45-1234567 · NPI 1234567893 · PTAN JF1234567</p>
      <table className="mt-4 w-full border-collapse">
        <tbody>
          <tr>
            <td className="w-1/2 border border-[#ccc] p-2 align-top">
              <b className="text-[#1e3f63]">What&apos;s New</b>
              <ul className="mt-1 list-disc pl-4">
                <li>v7.3 released 06/02/2026: new PA Req screens.</li>
                <li>Reminder: annual security awareness training due within 45 days.</li>
                <li>ADR responses must be one PDF file, 5MB max.</li>
              </ul>
            </td>
            <td className="border border-[#ccc] p-2 align-top">
              <b className="text-[#1e3f63]">Quick Links</b>
              <p className="mt-1">
                <a href="#" className="text-[#1e3f63] underline" onClick={(e) => e.preventDefault()}>
                  Click here
                </a>{" "}
                for the User Guide.{" "}
                <a href="#" className="text-[#1e3f63] underline" onClick={(e) => e.preventDefault()}>
                  Click here
                </a>{" "}
                for code lists.
              </p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function Eligibility() {
  const blank = { mbi: "", last: "", first: "", dob: "", from: "", to: "" };
  const demo = { mbi: "1EG4TE5MK73", last: "MARTINEZ", first: "ROSA", dob: "3/4/1952", from: "10/07/2026", to: "10/07/2026" };
  const [f, setF] = useState(demo);
  const [error, setError] = useState(false);
  const [result, setResult] = useState(false);

  const submit = () => {
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(f.dob) || !f.mbi) {
      // F-10: one bad field clears everything. F-09: the format was never shown.
      setError(true);
      setResult(false);
      setF(blank);
    } else {
      setError(false);
      setResult(true);
    }
  };

  return (
    <div>
      <h1 className="text-[14px] font-bold text-[#1e3f63]">Eligibility / Benefits Inquiry</h1>
      {error && (
        <p className="mt-2 border border-[#c00] bg-[#ffe5e5] px-2 py-1 font-bold text-[#c00]" data-finding="F-10">
          ELG-102: The request could not be processed. Verify all fields and resubmit. Date fields must be MM/DD/YYYY.
        </p>
      )}
      <form
        className="mt-3 grid w-[560px] grid-cols-2 gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        {(
          [
            ["mbi", "MBI *"],
            ["last", "Last Name *"],
            ["first", "First Name *"],
            ["dob", "Date of Birth *"],
            ["from", "From DOS *"],
            ["to", "To DOS *"],
          ] as const
        ).map(([k, ph]) => (
          <input
            key={k}
            className="border border-[#999] px-1 py-0.5"
            placeholder={ph}
            value={f[k]}
            onChange={(e) => setF({ ...f, [k]: e.target.value })}
            data-finding={k === "dob" ? "F-09" : undefined}
          />
        ))}
        <div className="col-span-2 flex gap-2">
          <button type="submit" className="bg-[#c33] px-4 py-1 text-[11px] font-bold text-white" style={{ borderRadius: 12 }} data-finding="F-21">
            Submit Inquiry
          </button>
          <button type="button" className="text-[11px] text-[#1e3f63] underline" onClick={() => setF(demo)}>
            Reset
          </button>
        </div>
      </form>
      {result && (
        <div className="mt-4" data-finding="F-11 F-12">
          <p className="font-bold">Response (HETS 270/271): MARTINEZ, ROSA · MBI 1EG4TE5MK73</p>
          <table className="mt-1 border-collapse">
            <tbody>
              {[
                ["PART A", "Y", "EFF 03/01/2017"],
                ["PART B", "Y", "EFF 03/01/2017"],
                ["MSP", "N", ""],
                ["HMO/MA", "N", ""],
                ["HETS", "1", "DED REM B: $0.00"],
              ].map((r) => (
                <tr key={r[0]}>
                  {r.map((c, i) => (
                    <td key={i} className="border border-[#ccc] px-2 py-0.5 font-mono">
                      {c}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Claims() {
  return (
    <div>
      <h1 className="text-[14px] font-bold text-[#1e3f63]">Claim Inquiry</h1>
      <p className="mt-1 text-[#9a9a9a]">Showing 1–10 of 307. Status codes: see User Guide Appendix C.</p>
      <table className="mt-2 w-[760px] border-collapse" data-finding="F-15">
        <tbody>
          <tr className="bg-[#c5d4e3] font-bold">
            <td className="border border-[#9fb3c8] px-2 py-1">ICN</td>
            <td className="border border-[#9fb3c8] px-2 py-1">Beneficiary</td>
            <td className="border border-[#9fb3c8] px-2 py-1">DOS</td>
            <td className="border border-[#9fb3c8] px-2 py-1">Billed</td>
            <td className="border border-[#9fb3c8] px-2 py-1">Status</td>
          </tr>
          {CLAIMS.map((c, i) => (
            <tr key={c[0]} className={i % 2 ? "bg-[#f5f8fb]" : ""}>
              <td className="border border-[#ddd] px-2 py-1 font-mono" data-finding={i === 0 ? "F-16" : undefined}>
                {c[0]}
              </td>
              <td className="border border-[#ddd] px-2 py-1">{c[1]}</td>
              <td className="border border-[#ddd] px-2 py-1">{c[2]}</td>
              <td className="border border-[#ddd] px-2 py-1">{c[3]}</td>
              <td className="border border-[#ddd] px-2 py-1 font-bold" data-finding={i === 0 ? "F-13" : undefined}>
                {c[4]}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-2" data-finding="F-14">
        Page: <b>1</b>{" "}
        {[2, 3, 4, 5].map((n) => (
          <a key={n} href="#" className="mx-0.5 text-[#1e3f63] underline" onClick={(e) => e.preventDefault()}>
            {n}
          </a>
        ))}{" "}
        …{" "}
        <a href="#" className="text-[#1e3f63] underline" onClick={(e) => e.preventDefault()}>
          31
        </a>
      </p>
    </div>
  );
}

function Documents() {
  const [bad, setBad] = useState(false);
  const [done, setDone] = useState(false);
  return (
    <div>
      <h1 className="text-[14px] font-bold text-[#1e3f63]">ADR Documentation Submission</h1>
      {done ? (
        <p className="mt-4 text-[13px] font-bold text-[#060]" data-finding="F-19">
          Submitted.
        </p>
      ) : (
        <form
          className="mt-3 w-[520px] space-y-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (!bad) setDone(true);
          }}
        >
          <input className="w-full border border-[#999] px-1 py-0.5" placeholder="Claim Number (ICN) - 17 digits" data-finding="F-17" />
          <div data-finding="F-20">
            <input
              type="file"
              className={`w-full border px-1 py-0.5 ${bad ? "border-2 border-[#c00]" : "border-[#999]"}`}
              onChange={(e) => {
                const file = e.target.files?.[0];
                setBad(!!file && (!file.name.toLowerCase().endsWith(".pdf") || file.size > 5 * 1024 * 1024));
              }}
            />
          </div>
          <p className="text-[10px] text-[#9a9a9a]" data-finding="F-18">
            Accepted: single PDF only, 5MB maximum. Multiple documents must be combined into one PDF prior to upload.
          </p>
          <button type="submit" className="border border-[#2b6a2b] bg-[#4a9a4a] px-3 py-0.5 text-[11px] text-white" data-finding="F-21">
            Upload Document
          </button>
        </form>
      )}
    </div>
  );
}
