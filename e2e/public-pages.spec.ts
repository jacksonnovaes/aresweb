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

test("keeps public authentication pages light when the tenant uses dark mode", async ({ page }) => {
  await page.route("**/api/backend/branding?slug=dark-workshop", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        tradeName: "Dark Workshop",
        slug: "dark-workshop",
        primaryColor: "#5B8CFF",
        secondaryColor: "#2DD4BF",
        borderRadius: 14,
        darkMode: true,
      }),
    });
  });

  await page.goto("/?tenant=dark-workshop");

  await expect.poll(() => page.evaluate(() => getComputedStyle(document.body).backgroundColor))
    .toBe("rgb(245, 247, 251)");
  await expect.poll(() => page.evaluate(() => getComputedStyle(document.documentElement).colorScheme))
    .toBe("light");

  await page.goto("/cadastro?tenant=dark-workshop");

  await expect.poll(() => page.evaluate(() => getComputedStyle(document.body).backgroundColor))
    .toBe("rgb(245, 247, 251)");
  await expect.poll(() => page.evaluate(() => getComputedStyle(document.documentElement).colorScheme))
    .toBe("light");
});
