import { test, expect } from "@playwright/test";
import { clearRange, pickRange } from "./date-picker";
import { chooseOption } from "./select";

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
      // Campo de período do site (entrada e saída num campo só), não mais os dois nativos.
      const fields = page.locator(".date-trigger");
      await expect(fields).toHaveCount(1);
      await pickRange(page, fields.first(), checkin, checkout);
      const snapshot = async () =>
        fields.evaluateAll((controls) =>
          controls.map((control) => {
            const text = control.querySelector("span")!.getBoundingClientRect();
            const wrapper = control.getBoundingClientRect();
            return {
              left: text.left,
              right: text.right,
              width: wrapper.width,
              height: wrapper.height,
              font: parseFloat(getComputedStyle(control).fontSize),
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
        await fields.first().blur();
        await page.evaluate(() => window.scrollTo(0, 0));
        await area.screenshot({
          path: `docs/date-fields/${testInfo.project.name}-${route === "/" ? "home" : route === "/flats" ? "catalog" : route.startsWith("/reservar") ? "inquiry" : "detail"}.png`,
          scale: "css",
        });
        await page.setViewportSize({ width, height: 900 });
      }
      // Sem datas: na busca da home, "Limpar"; nos demais, a página aberta com as datas vazias.
      if (route === "/") {
        await clearRange(page, fields.first());
      } else {
        await page.goto(`${route}?checkin=&checkout=`);
        await expect(fields.first()).toHaveAttribute("data-start", "");
      }
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
  await chooseOption(page, search.getByLabel("Destino"), "João Pessoa - PB");
  await pickRange(page, search.getByLabel("Entrada e saída"), checkin, checkout);
  await search.getByRole("button", { name: "Buscar flats" }).click();
  await expect(page).toHaveURL(new RegExp(`checkin=${checkin}`));
  await page
    .getByRole("heading", { name: "Flat Tambaú Master" })
    .getByRole("link")
    .click();
  await expect(page.getByLabel("Entrada e saída", { exact: true })).toHaveAttribute(
    "data-start",
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
