import { expect, type Locator, type Page } from "@playwright/test";

const rangeDialog = (page: Page) =>
  page.getByRole("dialog", { name: "Escolher período" });

/** Navega o calendário aberto até o mês do dia e clica nele. */
async function clickDay(dialog: Locator, iso: string) {
  const month = iso.slice(0, 7);
  for (let step = 0; step < 36; step++) {
    if (await dialog.locator(`[data-month="${month}"]`).count()) break;
    const first = await dialog.locator("[data-month]").first().getAttribute("data-month");
    await dialog
      .getByRole("button", { name: first! < month ? "Próximo mês" : "Mês anterior" })
      .click();
  }
  await dialog.locator(`[data-day="${iso}"]`).click();
}

/** Fecha o calendário pelo botão "Concluir" (escolher as datas não fecha sozinho). */
async function finish(dialog: Locator) {
  await dialog.getByRole("button", { name: "Concluir" }).click();
  await expect(dialog).toBeHidden();
}

/**
 * Escolhe entrada e saída no campo de período do site (components/date-picker.tsx):
 * abre o calendário, clica no primeiro dia, depois no último, e conclui.
 */
export async function pickRange(page: Page, trigger: Locator, start: string, end: string) {
  await trigger.click();
  const dialog = rangeDialog(page);
  await expect(dialog).toBeVisible();
  await clickDay(dialog, start);
  await expect(dialog.getByRole("button", { name: "Concluir" })).toBeDisabled();
  await clickDay(dialog, end);
  // O período já vale com o calendário aberto, para a pessoa conferir antes de concluir.
  await expect(dialog).toBeVisible();
  await expect(trigger).toHaveAttribute("data-start", start);
  await expect(trigger).toHaveAttribute("data-end", end);
  await finish(dialog);
}

/** Apaga o período (só nos campos opcionais, que têm "Limpar" no calendário). */
export async function clearRange(page: Page, trigger: Locator) {
  await trigger.click();
  const dialog = rangeDialog(page);
  await dialog.getByRole("button", { name: "Limpar" }).click();
  await expect(trigger).toHaveAttribute("data-start", "");
  await finish(dialog);
}
