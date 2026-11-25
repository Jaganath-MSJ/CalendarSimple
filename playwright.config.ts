import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "e2e",
  snapshotPathTemplate: "e2e/__screenshots__/{arg}{ext}",
  reporter: process.env.CI ? [["html", { open: "never" }], ["list"]] : "list",
  expect: { toHaveScreenshot: { maxDiffPixelRatio: 0.01 } },
  use: {
    timezoneId: "UTC",
    baseURL: "http://localhost:6007",
    viewport: { width: 1200, height: 800 },
  },
  projects: [{ name: "chromium", use: { browserName: "chromium" } }],
  webServer: {
    command: "npx http-server storybook-static -p 6007 -s",
    url: "http://localhost:6007",
    reuseExistingServer: !process.env.CI,
  },
});
