import { setupClerkTestingToken } from "@clerk/testing/playwright";
import { expect, test } from "@playwright/test";

import { clerkTestInstance } from "./environment";

// With the inert keys (see `environment.ts`), Clerk's browser script does
// not load, so the page's own content is what is checked. With a Clerk
// development instance, a testing token lets the browser past its bot
// protection.
test.beforeEach(async ({ page }) => {
  if (clerkTestInstance) {
    await setupClerkTestingToken({ page });
  } else {
    await page.route(/aroma-e2e\.invalid/, (route) => route.abort());
  }
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
