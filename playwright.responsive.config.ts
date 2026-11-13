import { defineConfig, devices } from "@playwright/test";
import base from "./playwright.config";

const port = Number(process.env.PLAYWRIGHT_PORT ?? 3003);
if (!Number.isInteger(port) || port < 1 || port > 65535)
  throw new Error("Invalid PLAYWRIGHT_PORT");
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  ...base,
  testMatch: "mobile-responsive.spec.ts",
  testIgnore: [],
  timeout: 300000,
  use: { ...base.use, baseURL, locale: "pt-BR" },
  projects: [
    {
      name: "chromium-responsive",
      use: { ...devices["iPhone 13"], defaultBrowserType: "chromium" },
    },
    {
      name: "webkit-responsive",
      use: { ...devices["iPhone 13"] },
    },
  ],
  webServer: {
    command: `npm.cmd run start -- --hostname 127.0.0.1 --port ${port}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
