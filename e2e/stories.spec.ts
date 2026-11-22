import { test, expect } from "@playwright/test";

const STORIES = [
  "month-view--default",
  "week-view--default",
  "day-view--default",
  "schedule-view--with-events",
  "custom-day-view--default",
  "customization--color-scheme-dark-month",
  "localization--arabic-rtl",
  "features-interactions--loading-skeleton-month",
];

for (const id of STORIES) {
  test(`story ${id}`, async ({ page }) => {
    await page.clock.setFixedTime(new Date("2026-11-10T10:00:00"));
    await page.goto(`/iframe.html?id=${id}&viewMode=story`);
    await page.locator('[data-testid$="-container"]').first().waitFor();
    await expect(page).toHaveScreenshot(`${id}.png`);
  });
}
