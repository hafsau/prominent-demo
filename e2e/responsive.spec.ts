import { expect, test } from "@playwright/test";

const ROUTES = ["/", "/findings", "/tasks", "/ia", "/forms", "/consistency", "/accessibility", "/backlog", "/roadmap", "/after/eligibility", "/after/documents", "/readout"];

for (const route of ROUTES) {
  test(`${route} has no page-level horizontal scroll`, async ({ page }) => {
    await page.goto(route);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });
}
