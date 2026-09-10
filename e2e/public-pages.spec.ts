import { expect, test } from "@playwright/test";

test("login page exposes the main authentication paths", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByText("Bem-vindo de volta")).toBeVisible();
  await expect(page.getByLabel("E-mail")).toBeVisible();
  await expect(page.locator('input[type="password"]')).toBeVisible();
  await expect(page.getByRole("button", { name: "Entrar" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Criar empresa" })).toHaveAttribute("href", "/cadastro");
  await expect(page.getByRole("link", { name: "Acompanhar minhas ordens" })).toHaveAttribute("href", "/portal");
});

test("legal documents are publicly accessible", async ({ page }) => {
  await page.goto("/termos-de-uso");
  await expect(page.getByRole("heading", { name: "Termos de Uso", level: 1 })).toBeVisible();

  await page.goto("/politica-de-privacidade");
  await expect(page.getByRole("heading", { name: "Política de Privacidade", level: 1 })).toBeVisible();
});
