import { test, expect } from "@playwright/test";

const year = new Date().getFullYear() + 1;
const checkin = `${year}-01-03`;
const checkout = `${year}-01-06`;
const routes = [
  "/",
  "/flats",
  "/flats/flat-tambau-master",
  "/reservar/flat-tambau-master",
];

test("date fields fit mobile screens with full and empty values", async ({
  page,
}, testInfo) => {
  test.setTimeout(90000);
  for (const width of [320, 390, 430]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of routes) {
      await page.goto(route);
      const fields = page.locator("input[type=date]");
      await expect(fields).toHaveCount(2);
      for (const [index, value] of [checkin, checkout].entries())
        await fields.nth(index).fill(value);
      const snapshot = async () =>
        page.locator(".date-control").evaluateAll((controls) =>
          controls.map((control) => {
            const input = control.querySelector("input")!;
            const bounds = input.getBoundingClientRect();
            const wrapper = control.getBoundingClientRect();
            return {
              left: bounds.left,
              right: bounds.right,
              width: bounds.width,
              height: bounds.height,
              font: parseFloat(getComputedStyle(input).fontSize),
              containerLeft: wrapper.left,
              containerRight: wrapper.right,
              containerHeight: wrapper.height,
            };
          }),
        );
      const filled = await snapshot();
      for (const input of filled) {
        expect(input.width, `${route}, ${width}px`).toBeGreaterThan(180);
        expect(input.height).toBeGreaterThanOrEqual(44);
        expect(input.font).toBeGreaterThanOrEqual(16);
        expect(input.left).toBeGreaterThanOrEqual(input.containerLeft);
        expect(input.right).toBeLessThanOrEqual(input.containerRight + 1);
      }
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
        route,
      ).toBe(true);
      const boxes = await Promise.all([
        fields.nth(0).boundingBox(),
        fields.nth(1).boundingBox(),
      ]);
      expect(boxes[1]!.y).toBeGreaterThanOrEqual(
        boxes[0]!.y + boxes[0]!.height,
      );
      if (route === "/") {
        const copy = await page.locator(".hero-copy").boundingBox();
        const search = await page.locator(".search-shell").boundingBox();
        const hero = await page.locator(".hero").boundingBox();
        expect(search!.y).toBeGreaterThanOrEqual(copy!.y + copy!.height - 1);
        expect(search!.y + search!.height).toBeLessThanOrEqual(
          hero!.y + hero!.height + 1,
        );
      }
      const area =
        route === "/"
          ? page.locator(".hero")
          : route === "/flats"
            ? page.locator(".catalog-filter")
            : page.locator(".booking-widget");
      if (width === 390) {
        // Leave room for the entire hero below the sticky header in captures.
        await page.setViewportSize({ width, height: 1400 });
        await fields.nth(1).blur();
        await page.evaluate(() => window.scrollTo(0, 0));
        await area.screenshot({
          path: `docs/date-fields/${testInfo.project.name}-${route === "/" ? "home" : route === "/flats" ? "catalog" : route.startsWith("/reservar") ? "inquiry" : "detail"}.png`,
          scale: "css",
        });
        await page.setViewportSize({ width, height: 900 });
      }
      for (const input of await fields.all()) await input.fill("");
      const empty = await snapshot();
      empty.forEach((input, index) =>
        expect(input.containerHeight).toBe(filled[index].containerHeight),
      );
      if (width === 390 && route.startsWith("/reservar"))
        await area.screenshot({
          path: `docs/date-fields/${testInfo.project.name}-empty.png`,
          scale: "css",
        });
    }
  }
});

test("mobile date edits still reach search and the WhatsApp inquiry", async ({
  page,
}) => {
  await page.goto("/");
  const search = page.getByRole("form", { name: "Buscar hospedagem" });
  await search.getByLabel("Destino").selectOption("Tambaú");
  await search.getByLabel("Entrada").fill(checkin);
  await search.getByLabel("Saída").fill(checkout);
  await search.getByRole("button", { name: "Buscar flats" }).click();
  await expect(page).toHaveURL(new RegExp(`checkin=${checkin}`));
  await page
    .getByRole("heading", { name: "Flat Tambaú Master" })
    .getByRole("link")
    .click();
  await expect(page.getByLabel("Entrada", { exact: true })).toHaveValue(
    checkin,
  );
  await page.getByRole("button", { name: "Consultar disponibilidade" }).click();
  const href = await page
    .getByRole("link", { name: "Continuar no WhatsApp", exact: true })
    .getAttribute("href");
  const text = new URL(href!).searchParams.get("text");
  expect(text).toContain(`Entrada: ${checkin}`);
  expect(text).toContain(`Saída: ${checkout}`);
});
