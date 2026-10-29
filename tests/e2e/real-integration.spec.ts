import { expect, test } from "@playwright/test";
test("real integration boundaries: identity, empty catalog and private routes", async ({
  page,
  request,
}) => {
  await page.goto("/cadastro");
  await expect(
    page.getByRole("heading", { name: "Crie sua conta de cliente" }),
  ).toBeVisible();
  await expect(page.getByLabel("CPF", { exact: true })).toBeVisible();
  await expect(page.getByRole("combobox")).toHaveCount(0);
  const invalid = await request.post("/api/auth/signup", {
    data: {
      name: "Cliente Teste",
      email: "no-mail@example.invalid",
      cpf: "11111111111",
      phone: "83999999999",
      password: "NeverSent123",
      acceptedTerms: true,
    },
  });
  expect(invalid.status()).toBe(400);
  expect((await invalid.json()).error).toContain("CPF");
  await page.goto("/painel-proprietario");
  await expect(page).toHaveURL(/\/entrar\?role=owner/);
  await expect(
    page.getByRole("heading", { name: "Acesso do proprietário" }),
  ).toBeVisible();
  await page.goto("/minha-conta");
  await expect(page).toHaveURL(/\/entrar\?role=guest/);
  expect(
    (await request.post("/api/booking-requests", { data: {} })).status(),
  ).toBe(401);
  await page.goto("/flats?modality=VENDA");
  await expect(page.getByLabel("Finalidade", { exact: true })).toHaveValue("VENDA");
  await expect(page.getByLabel("Entrada", { exact: true })).toHaveCount(0);
  await expect(page.locator(".flat-card")).toHaveCount(0);
  await expect(
    page.getByText("Nenhum imóvel atende", { exact: false }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth + 1,
    ),
  ).toBe(true);
});
