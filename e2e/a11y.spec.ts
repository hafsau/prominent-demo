import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { FINDINGS } from "../lib/audit";

const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

async function violations(page: Page) {
  await page.waitForTimeout(400);
  const r = await new AxeBuilder({ page }).withTags(TAGS).analyze();
  return r.violations.map((v) => `${v.impact} ${v.id}: ${v.help} (${v.nodes.length}) ${v.nodes[0]?.target}`);
}

const CLEAN = ["/", "/findings", "/tasks", "/ia", "/forms", "/consistency", "/accessibility", "/backlog", "/roadmap", "/readout", "/after/eligibility", "/after/documents"];

for (const route of CLEAN) {
  test(`${route} has no axe violations`, async ({ page }) => {
    await page.goto(route);
    expect(await violations(page)).toEqual([]);
  });
}

test("the redesign's error and result states have no violations", async ({ page }) => {
  await page.goto("/after/eligibility");
  await page.getByRole("textbox", { name: "Medicare number (MBI)" }).fill("1EG4TE5MKO3");
  await page.getByRole("button", { name: "Check coverage" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Check" })).toContainText("S, L, O");
  expect(await violations(page)).toEqual([]);
  await page.getByRole("textbox", { name: "Medicare number (MBI)" }).fill("1EG4TE5MK73");
  await page.getByRole("button", { name: "Check coverage" }).click();
  await expect(page.getByRole("heading", { name: /Rosa Martinez: Original Medicare/ })).toBeVisible();
  expect(await violations(page)).toEqual([]);
});

test("the portal overlay (toolbar, pins, panel) has no violations outside the portal itself", async ({ page }) => {
  await page.goto("/portal?screen=eligibility");
  await page.getByRole("button", { name: /Finding F-09/ }).click();
  const r = await new AxeBuilder({ page }).withTags(TAGS).exclude(".legacy").analyze();
  expect(r.violations.map((v) => `${v.id} ${v.nodes[0]?.target}`)).toEqual([]);
});

test("the 'before' portal fails exactly the rules the findings log claims", async ({ page }) => {
  const claimed = new Set(FINDINGS.flatMap((f) => f.axe ?? []));
  const found = new Set<string>();
  for (const screen of ["home", "eligibility", "documents"]) {
    await page.goto(`/portal?screen=${screen}&embed=1`);
    // The audit is scoped to WCAG 2.1 AA (508 + HHS 504), so 2.2-only rules are out of scope here.
    const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
    r.violations.forEach((v) => found.add(v.id));
  }
  expect([...found].sort()).toEqual([...claimed].sort());
});
