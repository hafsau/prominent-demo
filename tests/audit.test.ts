import { describe, expect, it } from "vitest";
import { backlogCsv, FINDING_BY_ID, FINDINGS, impact, prioritize, quadrant, severityMean, severitySpread, summary } from "@/lib/audit";
import { contrast } from "@/lib/contrast";
import { cwFailures, WALKTHROUGHS } from "@/lib/tasks";

describe("severity", () => {
  it("averages the three evaluators to one decimal", () => {
    expect(severityMean(FINDING_BY_ID["F-01"])).toBe(2.7);
    expect(severityMean(FINDING_BY_ID["F-03"])).toBe(3.7);
  });
  it("reports evaluator spread", () => {
    expect(severitySpread(FINDING_BY_ID["F-01"])).toBe(1);
    expect(severitySpread(FINDING_BY_ID["F-10"])).toBe(1);
  });
  it("ratings stay on the 0–4 scale", () => {
    for (const f of FINDINGS)
      for (const r of f.ratings) {
        expect(r).toBeGreaterThanOrEqual(0);
        expect(r).toBeLessThanOrEqual(4);
      }
  });
});

describe("impact and quadrants", () => {
  it("impact is on 1–5 and weighs reach", () => {
    for (const f of FINDINGS) {
      expect(impact(f)).toBeGreaterThanOrEqual(1);
      expect(impact(f)).toBeLessThanOrEqual(5);
    }
    // A cosmetic issue on every page ranks below a major one on a busy task.
    expect(impact(FINDING_BY_ID["F-21"])).toBeLessThan(impact(FINDING_BY_ID["F-10"]));
  });
  it("classifies the four quadrants", () => {
    expect(quadrant(4, 1)).toBe("quick-win");
    expect(quadrant(4, 4)).toBe("big-bet");
    expect(quadrant(2, 1)).toBe("fill-in");
    expect(quadrant(2, 4)).toBe("later");
  });
  it("prioritizes quick wins first, then by impact per effort", () => {
    const order = prioritize([
      { id: "a", impact: 2, effort: 4 },
      { id: "b", impact: 4, effort: 2 },
      { id: "c", impact: 4, effort: 4 },
      { id: "d", impact: 4.5, effort: 1 },
    ]).map((x) => x.id);
    expect(order).toEqual(["d", "b", "c", "a"]);
  });
  it("the session-timeout finding is a quick win", () => {
    const f = FINDING_BY_ID["F-03"];
    expect(quadrant(impact(f), f.effort)).toBe("quick-win");
  });
});

describe("backlog export", () => {
  it("produces Jira-importable CSV with escaped quotes", () => {
    const csv = backlogCsv(FINDINGS.map((f) => ({ ...f, impact: impact(f) })));
    const lines = csv.split("\n");
    expect(lines[0]).toBe("Summary,Description,Labels,Priority,Story Points");
    expect(lines).toHaveLength(FINDINGS.length + 1);
    expect(lines[1]).toMatch(/Highest/);
    const tricky = backlogCsv([{ id: "X-1", title: 'Say "hi", then go', impact: 4, effort: 1, recommendation: "r", heuristics: [1] }]);
    expect(tricky).toContain('"X-1: Say ""hi"", then go"');
  });
});

describe("walkthroughs", () => {
  it("every finding a walkthrough cites exists", () => {
    for (const w of WALKTHROUGHS) for (const s of w.before.steps) for (const id of s.findings ?? []) expect(FINDING_BY_ID[id], id).toBeDefined();
  });
  it("after flows are shorter and pass every walkthrough question", () => {
    for (const w of WALKTHROUGHS) {
      expect(w.after.steps.length).toBeLessThan(w.before.steps.length);
      expect(w.after.seconds).toBeLessThan(w.before.seconds);
      expect(cwFailures(w.after.steps)).toBe(0);
      expect(cwFailures(w.before.steps)).toBeGreaterThan(0);
    }
  });
});

describe("summary", () => {
  it("counts findings", () => {
    const s = summary();
    expect(s.total).toBe(24);
    expect(s.bySeverity.reduce((a, b) => a + b, 0)).toBe(24);
    expect(s.accessibility).toBeGreaterThan(5);
  });
});

describe("brand contrast", () => {
  it("Prominent gold fails as a background for white text; dark text passes", () => {
    expect(contrast("#ffffff", "#fdba58")).toBeLessThan(3);
    expect(contrast("#231f20", "#fdba58")).toBeGreaterThanOrEqual(4.5);
  });
});

import { mbiError, normalizeMbi, parseDate } from "@/lib/forms";

describe("redesign input helpers", () => {
  it("accepts the date formats people type", () => {
    for (const s of ["3/4/1952", "03/04/1952", "3-4-1952", "3.4.1952", "1952-03-04", "Mar 4 1952", "March 4, 1952"]) expect(parseDate(s), s).toEqual({ y: 1952, m: 3, d: 4 });
  });
  it("rejects impossible dates", () => {
    for (const s of ["2/30/1952", "13/1/1952", "hello", "1/1/1800"]) expect(parseDate(s), s).toBeNull();
    expect(parseDate("2/29/2024")).toEqual({ y: 2024, m: 2, d: 29 });
  });
  it("validates MBIs against CMS's format, with helpful messages", () => {
    expect(mbiError("1EG4-TE5-MK73")).toBeNull();
    expect(normalizeMbi("1eg4 te5 mk73")).toBe("1EG4TE5MK73");
    expect(mbiError("1EG4TE5MK7")).toMatch(/11 characters/);
    expect(mbiError("1EG4TE5MKO3")).toMatch(/S, L, O/);
    expect(mbiError("0EG4TE5MK73")).toMatch(/format/);
  });
});
