import { expect, test } from "@playwright/test";

test("the portal reproduces the eligibility dead end, and pins open findings", async ({ page }) => {
  await page.goto("/portal?screen=eligibility");
  await page.getByRole("button", { name: "Submit Inquiry" }).click();
  await expect(page.getByText(/ELG-102/)).toBeVisible();
  await expect(page.getByPlaceholder("MBI *")).toHaveValue("");
  await page.getByRole("button", { name: /Finding F-10/ }).click();
  await expect(page.getByRole("heading", { name: "A failed search clears every field" })).toBeVisible();
});

test("sign-in flow shows the unexplained provider error", async ({ page }) => {
  await page.goto("/portal");
  await page.getByRole("button", { name: "Login" }).click();
  await page.getByRole("button", { name: /Continue/ }).click();
  await expect(page.getByText("ERR-4021: Invalid request.")).toBeVisible();
  await page.getByPlaceholder("PTAN").fill("JF1234567");
  await page.getByRole("button", { name: /Continue/ }).click();
  await expect(page.getByText(/Welcome, clinic.frontdesk/)).toBeVisible();
});

test("the readout is keyboard driven", async ({ page }) => {
  await page.goto("/readout");
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("button", { name: /Slide 3:/ })).toHaveAttribute("aria-current", "step");
  await page.keyboard.press("End");
  await expect(page.getByRole("button", { name: /Slide 10:/ })).toHaveAttribute("aria-current", "step");
  await page.keyboard.press("n");
  await expect(page.getByRole("complementary", { name: "Speaker notes" })).toBeVisible();
});

test("backlog dots move with the keyboard and re-sort, and CSV exports", async ({ page }) => {
  await page.goto("/backlog");
  const dot = page.getByRole("button", { name: /^F-18 / });
  await dot.focus();
  await expect(dot).toHaveAccessibleName(/Reconsider later/);
  for (let i = 0; i < 3; i++) await page.keyboard.press("ArrowLeft");
  await page.keyboard.press("ArrowUp");
  await expect(dot).toHaveAccessibleName(/Quick wins/);
  const [download] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Export CSV for Jira" }).click()]);
  expect(download.suggestedFilename()).toBe("medlink-audit-backlog.csv");
  await page.getByRole("button", { name: "Reset to audit scores" }).click();
  await expect(dot).toHaveAccessibleName(/Reconsider later/);
});

test("the live axe scanner finds problems before and none after", async ({ page }) => {
  test.setTimeout(60_000);
  await page.goto("/accessibility");
  await page.getByRole("button", { name: "Scan before and after" }).click();
  await expect(page.getByText("Scanned 5 pages.")).toBeVisible({ timeout: 45_000 });
  await expect(page.getByText(/Before: portal home/).locator("..")).toContainText(/rules? failed/);
  await expect(page.getByText(/After: check coverage/).locator("..")).toContainText("0 violations");
  await expect(page.getByText(/After: respond to a request/).locator("..")).toContainText("0 violations");
});

test("records request: multiple files, a rejected one, then a confirmation", async ({ page }) => {
  await page.goto("/after/documents");
  await page.getByRole("button", { name: /Jean Halvorson/ }).click();
  await page.getByLabel("Add files").setInputFiles([
    { name: "op-report.pdf", mimeType: "application/pdf", buffer: Buffer.from("%PDF-1.4") },
    { name: "anesthesia.tiff", mimeType: "image/tiff", buffer: Buffer.from("II*") },
    { name: "notes.docx", mimeType: "application/octet-stream", buffer: Buffer.from("x") },
  ]);
  await expect(page.locator("[role=alert][id$=file-err]")).toContainText("notes.docx isn't a PDF");
  await page.getByRole("button", { name: "Send 2 files" }).click();
  await expect(page.getByRole("heading", { name: /Received: 2 files for Jean Halvorson/ })).toBeVisible();
  await expect(page.getByText(/^DOC-/)).toBeVisible();
});
