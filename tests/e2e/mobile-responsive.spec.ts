import { expect, test, type Locator, type Page } from "@playwright/test";
import { pickRange } from "./date-picker";

const routes = [
  "/",
  "/flats",
  "/favoritos",
  "/proprietarios",
  "/contato",
  "/servicos",
  "/sobre",
  "/perguntas-frequentes",
  "/politica-de-privacidade",
  "/termos-de-uso",
  "/entrar",
  "/cadastro",
  "/recuperar-senha",
  "/definir-senha",
  "/cadastro-pendente",
  "/auth/complete",
  "/minha-conta",
  "/painel-proprietario",
  "/painel-proprietario/imoveis",
  "/painel-proprietario/reservas",
  "/painel-proprietario/extrato",
  "/reserva-confirmada",
  "/pagina-inexistente",
];

async function publishedProperties(page: Page) {
  await page.goto("/flats");
  return page
    .locator('.flat-card a[href^="/flats/"]')
    .evaluateAll((links) => [
      ...new Set(links.map((link) => link.getAttribute("href")!)),
    ]);
}

async function expectWithinViewport(element: Locator, page: Page) {
  await expect(element).toBeVisible();
  await expect
    .poll(async () => {
      const box = await element.boundingBox();
      const viewport = page.viewportSize()!;
      return (
        !!box &&
        box.x >= -1 &&
        box.y >= -1 &&
        box.x + box.width <= viewport.width + 1 &&
        box.y + box.height <= viewport.height + 1
      );
    })
    .toBe(true);
}

test("all public pages and access redirects fit mobile, landscape, tablet and desktop", async ({
  page,
  browserName,
  baseURL,
}) => {
  const properties = await publishedProperties(page);
  const allRoutes = [
    ...routes,
    ...properties,
    ...properties.map((route) => route.replace("/flats/", "/reservar/")),
  ];
  const errors: string[] = [];
  let replacingDocument = false;
  page.on("pageerror", (error) => {
    // WebKit em Windows emite este diagnóstico para fetches descartados pelo goto.
    // https://github.com/microsoft/playwright/issues/42823
    const cancelledDuringNavigation =
      browserName === "webkit" &&
      replacingDocument &&
      error.message.includes(`${new URL(baseURL!).host}/`) &&
      error.message.endsWith("due to access control checks.") &&
      (error.message.includes("/api/auth/session ") ||
        error.message.includes("_rsc="));
    if (!cancelledDuringNavigation) errors.push(error.message);
  });
  for (const width of [320, 375, 390, 430, 768, 844, 1440]) {
    await page.setViewportSize({ width, height: width === 844 ? 390 : 900 });
    for (const route of allRoutes) {
      replacingDocument = true;
      const response = await page.goto(route);
      expect(
        route === "/pagina-inexistente" ? [404, 304] : [200, 304],
        route,
      ).toContain(response?.status());
      await expect(page.locator("main")).toBeVisible();
      // Aguarda os prefetches antes de desmontar a página: no WebKit, abortá-los
      // com goto pode produzir diagnósticos de acesso para requisições canceladas.
      await page.waitForLoadState("networkidle");
      replacingDocument = false;
      if (route === "/pagina-inexistente")
        await expect(
          page.getByRole("heading", {
            name: "Página não encontrada",
            exact: true,
          }),
        ).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      const dimensions = await page.evaluate(() => ({
        viewport: document.documentElement.clientWidth,
        content: document.documentElement.scrollWidth,
      }));
      expect(dimensions.viewport, `${route}, ${width}px`).toBe(width);
      expect(dimensions.content, `${route}, ${width}px`).toBeLessThanOrEqual(
        width + 1,
      );
    }
  }
  expect(errors).toEqual([]);
});

test("editable fields stay legible on touch devices and focus preserves the viewport", async ({
  page,
}) => {
  for (const width of [320, 390, 844]) {
    await page.setViewportSize({ width, height: width === 844 ? 390 : 844 });
    for (const route of [
      "/flats",
      "/contato",
      "/proprietarios",
      "/entrar",
      "/cadastro",
      "/recuperar-senha",
    ]) {
      await page.goto(route);
      if (route === "/flats" && width <= 700) {
        const destination = await page
          .locator(".destination-field")
          .boundingBox();
        const filter = await page.locator(".catalog-filter").boundingBox();
        expect(destination!.width).toBeGreaterThan(filter!.width * 0.8);
      }
      const controls = page.locator(
        'input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"]):not([aria-hidden]), textarea, select',
      );
      for (const control of await controls.all()) {
        if (!(await control.isVisible())) continue;
        const font = await control.evaluate((element) =>
          parseFloat(getComputedStyle(element).fontSize),
        );
        expect(font, `${route}, ${width}px`).toBeGreaterThanOrEqual(16);
      }
      const field = page.locator('input[type="email"]').first();
      if (await field.count()) {
        await field.tap();
        await expect(field).toBeFocused();
        expect(await page.evaluate(() => visualViewport?.scale ?? 1)).toBe(1);
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth),
        ).toBeLessThanOrEqual(width + 1);
      }
    }
  }
});

test("mobile navigation remains scrollable and every link is reachable in landscape", async ({
  page,
}) => {
  await page.setViewportSize({ width: 844, height: 390 });
  await page.goto("/");
  await page.getByRole("button", { name: "Abrir menu", exact: true }).tap();
  const nav = page.locator("#mobile-nav");
  await expectWithinViewport(nav, page);
  const links = await nav
    .locator("a")
    .evaluateAll((items) => items.map((item) => item.getAttribute("href")!));
  for (const href of links) {
    const opener = page.getByRole("button", {
      name: "Abrir menu",
      exact: true,
    });
    if (await opener.isVisible()) await opener.tap();
    const link = nav.locator(`a[href="${href}"]`);
    await link.scrollIntoViewIfNeeded();
    await expectWithinViewport(link, page);
    await link.tap();
    await expect(nav).toBeHidden();
    await expect(page.locator("main")).toBeVisible();
  }
  await page.getByRole("button", { name: "Abrir menu", exact: true }).tap();
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(nav).toBeHidden();
});

test("calendar, full date labels and gallery fit small screens and short landscape viewports", async ({
  page,
}) => {
  const properties = await publishedProperties(page);
  const year = new Date().getFullYear() + 1;
  for (const viewport of [
    { width: 320, height: 568 },
    { width: 390, height: 500 },
    { width: 568, height: 320 },
    { width: 844, height: 390 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("/");
    for (const id of ["search-destination", "search-guests"]) {
      const select = page.locator(`#${id}`);
      await select.tap();
      const list = page.getByRole("listbox");
      await expectWithinViewport(list, page);
      const option = list.getByRole("option").last();
      await option.scrollIntoViewIfNeeded();
      await expectWithinViewport(option, page);
      await option.tap();
      await expect(list).toBeHidden();
    }
    const trigger = page.locator(".date-trigger");
    expect(
      await trigger.evaluate(
        (element) => element.getBoundingClientRect().height,
      ),
    ).toBeGreaterThanOrEqual(44);
    await trigger.tap();
    const calendar = page.getByRole("dialog", { name: "Escolher período" });
    await expectWithinViewport(calendar, page);
    await expectWithinViewport(
      calendar.getByRole("button", { name: "Concluir" }),
      page,
    );
    await calendar.getByRole("button", { name: "Concluir" }).tap();
    await expect(calendar).toBeHidden();
    await pickRange(page, trigger, `${year}-01-03`, `${year}-01-06`);
    const clippedDates = await trigger
      .locator(".date-range-text > span, .date-range-count")
      .evaluateAll((labels) =>
        labels
          .filter((label) => {
            const bounds = label.closest("button")!.getBoundingClientRect();
            const text = label.getBoundingClientRect();
            return (
              text.left < bounds.left ||
              text.right > bounds.right ||
              text.bottom > bounds.bottom
            );
          })
          .map((label) => label.textContent),
      );
    expect(clippedDates).toEqual([]);

    if (properties.length) {
      await page.goto(
        `${properties[0]}?checkin=${year}-01-03&checkout=${year}-01-06`,
      );
      const detailTrigger = page.locator(".date-trigger");
      expect(
        await detailTrigger
          .locator(".date-range-text")
          .evaluate(
            (element) => element.scrollWidth <= element.clientWidth + 1,
          ),
      ).toBe(true);
      await detailTrigger.tap();
      await expectWithinViewport(calendar, page);
      await calendar.getByRole("button", { name: "Concluir" }).tap();
      await page.locator(".gallery-cell").first().tap();
      const gallery = page.locator("dialog.lightbox");
      await expectWithinViewport(gallery, page);
      await gallery.getByRole("button", { name: "Fechar galeria" }).tap();
      await expect(gallery).toBeHidden();
    }
  }
});
