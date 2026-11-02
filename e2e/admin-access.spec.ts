import { expect, test } from "@playwright/test";

// Clerk's keys point to no instance (see `environment.ts`): its browser
// script is not loaded, so the page's own content is what is checked.
test.beforeEach(async ({ page }) => {
  await page.route(/aroma-e2e\.invalid/, (route) => route.abort());
});

for (const path of ["/admin", "/admin/products", "/admin/users"]) {
  test(`a visitor without a session is sent to sign in from ${path}`, async ({
    page,
  }) => {
    await page.goto(path);

    await expect(page).toHaveURL(/\/admin\/sign-in/);
    await expect(
      page.getByRole("link", { name: "Volver al sitio público" }),
    ).toBeVisible();
  });
}

test("sign-up is closed without an invitation", async ({ page }) => {
  await page.goto("/admin/sign-up");

  await expect(
    page.getByRole("heading", { name: "El acceso es solo por invitación" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Iniciar sesión" }),
  ).toHaveAttribute("href", "/admin/sign-in");
});
