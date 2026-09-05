import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/ui",
  use: {
    baseURL: process.env.EVE_PREVIEW_URL ?? "http://localhost:8082",
    channel: "chrome",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "small-mobile",
      use: {
        viewport: { width: 320, height: 568 },
        isMobile: true,
        hasTouch: true,
      },
    },
    {
      name: "mobile",
      use: {
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
      },
    },
    { name: "desktop", use: { viewport: { width: 1280, height: 900 } } },
  ],
});
