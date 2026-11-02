import { expect, type Locator, type Page } from "@playwright/test";

/**
 * Escolhe uma opção no select do site (components/select.tsx), que substitui o nativo:
 * abre a lista e clica na opção pelo texto. Equivale ao antigo `selectOption(label)`.
 */
export async function chooseOption(page: Page, trigger: Locator, label: string) {
  await trigger.click();
  const option = page.getByRole("listbox").getByRole("option", { name: label, exact: true });
  await option.click();
  await expect(page.getByRole("listbox")).toBeHidden();
  await expect(trigger).toContainText(label);
}
