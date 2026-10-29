import { readFile, mkdir } from "node:fs/promises";
import assert from "node:assert/strict";
import { chromium } from "playwright";

// Credentials are supplied by the ERP verification owner in an ignored local JSON file.
// This script sends no email, provisions no account, and prints no credentials/tokens.
const fixtureFile = process.argv[2];
if (!fixtureFile) throw new Error("Usage: node scripts/verify-erp-ui.mjs <ignored-fixture.json>");
const fixture = JSON.parse(await readFile(fixtureFile, "utf8"));
const baseURL = fixture.siteUrl ?? "http://127.0.0.1:3001";
await mkdir("tmp", { recursive: true });
const browser = await chromium.launch({ headless: true });
const checks = [];
let reservationId;
async function login(page, credentials, role) {
  await page.goto(`${baseURL}/entrar?role=${role}`);
  await page.getByLabel("E-mail", { exact: true }).fill(credentials.email);
  await page.getByLabel("Senha", { exact: true }).fill(credentials.password);
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await page.waitForURL(role === "owner" ? "**/painel-proprietario" : "**/minha-conta", { timeout: 30000 });
}
try {
  const guestContext = await browser.newContext();
  const guest = await guestContext.newPage();
  await login(guest, fixture.guest, "guest");
  assert.equal((await (await guestContext.request.get(`${baseURL}/api/account/profile`)).json()).role, "guest");
  checks.push("guest login verified by ERP profile");
  const period = new URLSearchParams({ checkin: fixture.checkin, checkout: fixture.checkout, guests: String(fixture.guests ?? 1) });
  await guest.goto(`${baseURL}/reservar/${fixture.slug}?${period}`);
  await guest.getByRole("button", { name: "Confirmar reserva", exact: true }).waitFor();
  await guest.locator('input[name="terms"]').check();
  await guest.getByRole("button", { name: "Confirmar reserva", exact: true }).click();
  await guest.waitForURL("**/reserva-confirmada?id=*", { timeout: 30000 });
  reservationId = new URL(guest.url()).searchParams.get("id");
  assert.ok(reservationId);
  const guestReservations = await (await guestContext.request.get(`${baseURL}/api/account/reservations`)).json();
  const booking = guestReservations.items.find(item => String(item.id) === reservationId);
  assert.equal(booking.status, "CONFIRMED");
  assert.equal(booking.paymentStatus, "PENDING");
  assert.equal(booking.checkin, fixture.checkin);
  checks.push("UI reservation confirmed, payment pending, linked to guest");
  await guest.goto(`${baseURL}/painel-proprietario`);
  await guest.waitForURL("**/minha-conta");
  await guest.waitForTimeout(500);
  await guest.screenshot({ path: "tmp/erp-integration-customer.png", fullPage: true });
  checks.push("guest excluded from owner portal");
  const ownerContext = await browser.newContext();
  const owner = await ownerContext.newPage();
  await login(owner, fixture.owner, "owner");
  assert.equal((await (await ownerContext.request.get(`${baseURL}/api/account/profile`)).json()).role, "owner");
  assert.equal((await ownerContext.request.get(`${baseURL}/api/account/reservations`)).status(), 403);
  assert.equal((await ownerContext.request.post(`${baseURL}/api/booking-requests`, { data: {} })).status(), 403);
  if (fixture.foreignTitle) assert.equal(await owner.getByText(fixture.foreignTitle, { exact: true }).count(), 0);
  await owner.goto(`${baseURL}/minha-conta`);
  await owner.waitForURL("**/painel-proprietario");
  await owner.waitForTimeout(500);
  await owner.screenshot({ path: "tmp/erp-integration-owner.png", fullPage: true });
  checks.push("owner isolated from client reservations and foreign properties");
  console.log(JSON.stringify({ success: true, checks, reservationId }));
} catch (error) {
  let message = error instanceof Error ? error.message : "UI verification failed";
  for (const secret of [fixture.guest?.email, fixture.guest?.password, fixture.owner?.email, fixture.owner?.password].filter(Boolean)) message = message.split(secret).join("[redacted]");
  console.error(JSON.stringify({ success: false, checks, reservationId, error: message }));
  process.exitCode = 1;
} finally { await browser.close(); }
