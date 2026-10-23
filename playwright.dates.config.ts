import { defineConfig, devices } from "@playwright/test";
import base from "./playwright.config";

export default defineConfig({
  ...base,
  testMatch: "mobile-dates.spec.ts",
  testIgnore: [],
  projects: [
    {
      name: "chromium-mobile",
      use: { ...devices["Pixel 7"], locale: "pt-BR" },
    },
    {
      name: "webkit-mobile",
      use: { ...devices["iPhone 13"], locale: "pt-BR" },
    },
  ],
});
