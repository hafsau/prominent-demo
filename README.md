# MedLink portal audit

**▶ Live: [prominent-demo.vercel.app](https://prominent-demo.vercel.app)** · [![CI](https://github.com/hafsau/prominent-demo/actions/workflows/ci.yml/badge.svg)](https://github.com/hafsau/prominent-demo/actions/workflows/ci.yml) · [Portal with findings](https://prominent-demo.vercel.app/portal) · [Backlog](https://prominent-demo.vercel.app/backlog) · [Readout](https://prominent-demo.vercel.app/readout)

**The audit, delivered before day one.** An unofficial concept by [Hafsa Usmani](https://hafsausmani.com), built for [Prominent](https://goprominent.com)'s contract **UX/UI Designer, Healthcare Portal Audit** role (Oct 27 – Dec 8, 2026).

> **Not affiliated with Prominent.** MedLink, its Medicare contractor and its users are fictional. The friction patterns come from public provider-portal documentation; no real portal's screens or names are reproduced.

---

## The idea

The posting describes a six-week audit of a healthcare provider portal: heuristic evaluation, top-task walkthroughs, IA, forms, consistency, cross-browser and 508/WCAG review, then a prioritized backlog with a solutions architect, a final report and roadmap, and a stakeholder readout. This is that engagement, run end to end on a realistic fictional portal and shaped like Prominent's own Solution Roadmap.

## What's in it

| | |
|---|---|
| **Engagement** (`/`) | Executive summary, three themes, the six-week plan mapped to the contract dates, and the method. |
| **The portal, before** (`/portal`) | A deliberately dated provider portal you can use. It has a TIN/NPI/PTAN sign-in with an unexplained error, an eligibility search that clears every field on one bad date, claim statuses in code, a single-PDF records upload, and a silent session timeout. Toggle **Findings** to pin all 24 findings onto the live elements. |
| **Findings** (`/findings`) | 24 findings, filterable by screen, heuristic and WCAG. Each has a severity from three evaluators, evidence, a recommendation, an impact score and the architect's effort estimate. |
| **Top tasks** (`/tasks`) | Five walkthroughs, each step checked against the four cognitive-walkthrough questions, with dead ends marked. Scorecard of steps, fields and time, before and after. |
| **IA** (`/ia`) | 14 jargon menu items regrouped into 5 task sections, a label audit, and a tree-test plan. |
| **Forms** (`/forms`) | Original errors next to rewrites, plus six rules for every form. |
| **Consistency** (`/consistency`) | Component inventory (25 variants of 6 components) and a proposed MedLink pattern library in Public Sans. |
| **Accessibility** (`/accessibility`) | A **live axe-core scan** of the portal before and after, run in your browser. Also: findings mapped to WCAG 2.1 and Section 508, manual checks, and a browser × viewport matrix. |
| **Backlog** (`/backlog`) | An interactive impact × effort matrix: drag or use the arrow keys, watch the backlog re-sort, and see the MVP cut line. Exports a CSV that imports into Jira. |
| **Roadmap** (`/roadmap`) | Three horizons sized in story points, plotted against the May 11, 2027 HHS WCAG 2.1 date. |
| **Readout** (`/readout`) | A 10-slide stakeholder deck: keyboard driven, speaker notes, prints one slide per page. |
| **The redesign** (`/after/eligibility`, `/after/documents`) | The two highest-impact flows rebuilt on the pattern library: any date format, errors that keep your work, plain answers, multi-file uploads, real confirmations, and a timeout warning. |

## How the numbers work

`lib/audit.ts` is the single source of truth:

- **Severity** is the mean of three 0–4 ratings.
- **Impact** is `1 + 4 × severity/4 × (0.55 + 0.45 × reach)`. Severity is scaled by the share of sessions that hit the problem, so cosmetic issues on busy pages don't outrank serious ones.
- **Effort** is 1–5 from the architect.
- **Quadrants** split at impact 3 and effort 2.5.

The report, backlog, roadmap and readout are all derived from this one list.

## Quality gates

- **Vitest:** severity, impact and quadrants, prioritization, Jira CSV escaping, walkthrough integrity, date parsing in common formats, CMS MBI format validation, and brand contrast.
- **Playwright + axe:**
  - Zero violations on every report page, the readout and the redesign, including error and result states.
  - **The "before" portal must fail exactly the WCAG rules the findings log claims** (no more, no fewer).
  - The sign-in and eligibility dead ends reproduce.
  - The deck is keyboard driven.
  - Backlog dots move by keyboard, and the CSV downloads.
  - The live scanner finds problems before and none after.
  - The multi-file upload works.
  - No horizontal page scroll on desktop, tablet or phone.
- **Lighthouse CI:** 100 accessibility on the report, readout and redesign pages.

## Run it

```bash
npm install
npm run dev
npm test
npm run e2e
```

**Stack:** Next.js 16, React 19, TypeScript, Tailwind 4, Vitest, Playwright, axe-core, and Lighthouse CI.

**Brand:** Prominent's logo and palette come from goprominent.com. Urbanist stands in for Urbane (Adobe Fonts). Gold buttons use dark text: white on gold is 1.70:1.
