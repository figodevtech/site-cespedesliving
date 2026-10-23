import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
const year = new Date().getFullYear() + 1;
const checkin = year + "-01-03";
const checkout = year + "-01-06";
test("search and stay inquiry prepare the official WhatsApp message", async ({
  page,
}) => {
  const posts: string[] = [];
  page.on("request", (r) => {
    if (r.method() === "POST") posts.push(r.url());
  });
  await page.goto("/");
  const form = page.getByRole("form", { name: "Buscar hospedagem" });
  await form.getByLabel("Destino").selectOption("Tambaú");
  await form.getByLabel("Entrada").fill(checkin);
  await form.getByLabel("Saída").fill(checkout);
  await form.getByRole("button", { name: "Buscar flats" }).click();
  await expect(page.getByText("1 flat encontrado")).toBeVisible();
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
  const url = new URL(href!);
  expect(url.origin + url.pathname).toBe("https://wa.me/5583999123337");
  expect(url.searchParams.get("text")).toContain("Flat Tambaú Master");
  expect(url.searchParams.get("text")).toContain(checkin);
  expect(url.searchParams.get("text")).toContain("Hóspedes: 2");
  await expect(page.getByRole("status")).toContainText("para enviá-la");
  expect(posts).toEqual([]);
  expect(
    await page.evaluate(() =>
      Object.keys(localStorage).filter((k) => k.includes("bookings")),
    ),
  ).toEqual([]);
});
test("favorites and accessible gallery remain functional", async ({ page }) => {
  await page.goto("/flats/flat-tambau-master");
  await page.getByRole("button", { name: "Adicionar aos favoritos" }).click();
  await expect(
    page.getByRole("button", { name: "Remover dos favoritos" }),
  ).toHaveAttribute("aria-pressed", "true");
  await page
    .getByRole("button", { name: "Ampliar foto 1 de Flat Tambaú Master" })
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("ArrowRight");
  await expect(page.locator(".lightbox-controls")).toContainText("2 / 4");
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Ampliar foto 1 de Flat Tambaú Master" }),
  ).toBeFocused();
  await page.goto("/favoritos");
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Flat Tambaú Master" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Apagar dados deste navegador" })
    .click();
  await expect(page.getByRole("status")).toContainText("apagados");
  await expect(
    page.getByRole("heading", { name: "Guarde seus próximos momentos." }),
  ).toBeVisible();
});
test("catalog filters work without invented rates or blocked dates", async ({
  page,
}) => {
  await page.goto("/flats");
  await expect(page.getByLabel("Diária máxima")).toHaveCount(0);
  await expect(page.locator(".card-price").first()).toContainText(
    "Tarifa sob consulta",
  );
  await page.getByLabel("Destino").selectOption("Tambaú");
  await page.getByLabel("Facilidade").selectOption("Estacionamento");
  await page.getByRole("button", { name: "Buscar flats" }).click();
  await expect(
    page.getByRole("heading", { name: "Vamos encontrar outro momento?" }),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "Limpar filtros", exact: true })
    .first()
    .click();
  await expect(page.locator(".flat-card")).toHaveCount(6);
  await page.goto(
    "/flats?neighborhood=Tamba%C3%BA&checkin=" +
      year +
      "-01-15&checkout=" +
      year +
      "-01-17",
  );
  await expect(page.locator(".flat-card")).toHaveCount(1);
  await page.goto(
    "/reservar/flat-tambau-master?checkin=" + checkin + "&checkout=" + checkin,
  );
  await page.getByRole("button", { name: "Consultar disponibilidade" }).click();
  await expect(page.locator(".form-error[role=alert]")).toContainText(
    "A saída precisa ser posterior",
  );
});
test("owner and contact forms prepare messages instead of claiming delivery", async ({
  page,
}) => {
  await page.goto("/proprietarios");
  await page.getByLabel("Seu nome").fill("Visitante Teste");
  await page.getByLabel("E-mail", { exact: true }).fill("teste@example.com");
  await page.getByLabel("Telefone com DDD").fill("83999999999");
  await page.getByLabel("Região do imóvel").selectOption("Manaíra");
  await page.getByRole("checkbox").check();
  await page
    .getByRole("button", { name: "Quero ser parceiro", exact: true })
    .click();
  let href = await page
    .getByRole("link", { name: "Continuar no WhatsApp", exact: true })
    .getAttribute("href");
  let url = new URL(href!);
  expect(url.pathname).toBe("/5583999123337");
  expect(url.searchParams.get("text")).toContain("Região: Manaíra");
  await expect(page.getByRole("status")).toContainText("para enviá-la");
  await page.goto("/contato");
  await page.getByLabel("Seu nome").fill("Visitante Teste");
  await page.getByLabel("E-mail", { exact: true }).fill("teste@example.com");
  await page.getByLabel("Telefone com DDD").fill("83999999999");
  await page.getByLabel("Sua mensagem").fill("Quero consultar uma hospedagem.");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Preparar mensagem" }).click();
  href = await page
    .getByRole("link", { name: "Continuar no WhatsApp", exact: true })
    .getAttribute("href");
  url = new URL(href!);
  expect(url.searchParams.get("text")).toContain(
    "Quero consultar uma hospedagem.",
  );
});
test("unconnected account and services do not expose fabricated records", async ({
  page,
  request,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      "cespedes-demo-v1:profile",
      JSON.stringify({
        name: "LEGACY_PRIVATE_NAME",
        email: "legacy@example.com",
        role: "owner",
        demo: true,
      }),
    );
    localStorage.setItem(
      "cespedes-demo-v1:bookings",
      JSON.stringify([{ id: "CL-DEMO-FAKE", flatTitle: "LEGACY_BOOKING" }]),
    );
  });
  for (const route of [
    "/entrar",
    "/cadastro",
    "/minha-conta",
    "/painel-proprietario",
    "/reserva-confirmada?id=CL-DEMO-FAKE",
  ]) {
    await page.goto(route);
    await expect(page.locator("main")).not.toContainText(
      /LEGACY_|CL-DEMO|18.450|15.200/,
    );
    await expect(page.locator("input[type=password]")).toHaveCount(0);
    await expect(page.locator("form")).toHaveCount(0);
  }
  for (const route of [
    "/api/demo-access",
    "/api/booking-requests",
    "/api/quote",
    "/api/owner-leads",
  ]) {
    const response = await request.post(route, {
      data: {
        name: "Visitante",
        email: "teste@example.com",
        role: "owner",
        flatId: "flat-1",
        checkin,
        checkout,
        guests: 2,
      },
    });
    expect(response.status()).toBe(503);
    expect(await response.json()).toHaveProperty("error");
  }
});
test("all pages, images and navigation render without errors or horizontal overflow", async ({
  page,
  request,
}, testInfo) => {
  test.setTimeout(180000);
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  const linkedRoutes = new Set<string>();
  const routes = [
    "/",
    "/flats",
    "/flats/flat-tambau-master",
    "/flats/flat-manaira-premium",
    "/flats/flat-cabo-branco-exclusive",
    "/flats/flat-bessa-confort",
    "/flats/flat-intermares-design",
    "/flats/flat-altiplano-executive",
    "/reservar/flat-tambau-master",
    "/reserva-confirmada",
    "/cadastro",
    "/entrar",
    "/minha-conta",
    "/favoritos",
    "/proprietarios",
    "/painel-proprietario",
    "/servicos",
    "/sobre",
    "/contato",
    "/perguntas-frequentes",
    "/politica-de-privacidade",
    "/termos-de-uso",
  ];
  for (const route of routes) {
    const response = await page.goto(route);
    expect(response?.status(), route).toBe(200);
    await expect(page.locator("main")).toBeVisible();
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("body")).not.toContainText(
      /demonstraç|demonstrativ|fictíci|simulaç|\bdemo\b/i,
    );
    for (const href of await page
      .locator("a[href]")
      .evaluateAll((links) =>
        links.map((link) => link.getAttribute("href") ?? ""),
      )) {
      if (href.startsWith("/") && !href.startsWith("//"))
        linkedRoutes.add(new URL(href, "http://localhost:3000").pathname);
      if (href.startsWith("#"))
        expect(
          await page.locator(`[id="${href.slice(1)}"]`).count(),
          `Anchor ${href} on ${route}`,
        ).toBeGreaterThan(0);
    }
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth + 1,
      ),
      route,
    ).toBe(true);
    await page.evaluate(() => {
      for (const image of document.images) image.loading = "eager";
    });
    await expect
      .poll(
        () =>
          page.evaluate(() =>
            Array.from(document.images)
              .filter((image) => !image.complete || image.naturalWidth === 0)
              .map((image) => image.src),
          ),
        { message: `Images on ${route}` },
      )
      .toEqual([]);
    if (
      [
        "/",
        "/flats",
        "/flats/flat-tambau-master",
        "/proprietarios",
        "/painel-proprietario",
      ].includes(route)
    )
      await page.screenshot({
        path: `docs/screenshots/${testInfo.project.name}-${route === "/" ? "home" : route.slice(1).replaceAll("/", "-")}.png`,
        fullPage: true,
        scale: "css",
      });
    if (["/", "/flats/flat-tambau-master"].includes(route))
      await page.screenshot({
        path: `docs/screenshots/${testInfo.project.name}-${route === "/" ? "home" : "detail"}-viewport.png`,
        scale: "css",
      });
  }
  for (const route of linkedRoutes)
    expect((await request.get(route)).status(), `Linked route ${route}`).toBe(
      200,
    );
  expect(consoleErrors).toEqual([]);
  await page.goto("/caminho-inexistente");
  await expect(
    page.getByRole("heading", { name: "Este caminho não leva ao mar." }),
  ).toBeVisible();
  await page.goto("/flats/imovel-inexistente");
  await expect(
    page.getByRole("heading", { name: "Página não encontrada" }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
test("main pages meet automated accessibility checks", async ({ page }) => {
  test.setTimeout(120000);
  for (const route of [
    "/",
    "/flats",
    "/flats/flat-tambau-master",
    "/reservar/flat-tambau-master",
    "/cadastro",
    "/proprietarios",
    "/painel-proprietario",
  ]) {
    await page.goto(route);
    await page.waitForTimeout(400);
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(
      result.violations.map((v) => ({
        id: v.id,
        description: v.description,
        nodes: v.nodes.map((n) => n.target),
      })),
      route,
    ).toEqual([]);
  }
});
