import { expect, test } from "@playwright/test";

import { openAdminNavigation, signInAs, uniqueSuffix } from "./admin-session";
import { e2eAdmins } from "./clerk-users";
import { clerkTestInstance } from "./environment";
import { e2eData } from "./seed";

test.skip(
  !clerkTestInstance,
  "Needs a Clerk development instance: set E2E_CLERK_PUBLISHABLE_KEY and E2E_CLERK_SECRET_KEY.",
);

test("an association admin publishes a product that reaches the storefront", async ({
  page,
}) => {
  const productName = `Miel de prueba ${uniqueSuffix()}`;

  await signInAs(page, e2eAdmins.associationAdmin);
  await page.goto("/admin/products/new");

  await page.getByLabel("Nombre").fill(productName);
  await page
    .getByLabel("Categoría")
    .selectOption({ label: e2eData.category.name });
  await page.getByRole("button", { name: "Crear borrador" }).click();

  await expect(
    page.getByRole("heading", { level: 1, name: productName }),
  ).toBeVisible();

  await page
    .getByRole("link", { name: "Agregar presentación" })
    .first()
    .click();
  await page.getByLabel("Nombre").fill("Frasco 250 g");
  await page.getByRole("button", { name: "Agregar presentación" }).click();

  await page.getByRole("button", { name: "Publicar" }).click();
  await expect(page.getByRole("button", { name: "Pausar" })).toBeVisible();

  await page.goto("/");
  await expect(page.getByRole("link", { name: productName })).toBeVisible();
});

test("an association admin sees only their own sections", async ({ page }) => {
  await signInAs(page, e2eAdmins.associationAdmin);
  await page.goto("/admin");

  const navigation = await openAdminNavigation(page);
  await expect(
    navigation.getByRole("link", { name: "Productos" }),
  ).toBeVisible();
  await expect(
    navigation.getByRole("link", { name: "Mi asociación" }),
  ).toBeVisible();

  for (const section of [
    "Asociaciones",
    "Categorías",
    "Contenido",
    "Usuarios",
  ]) {
    await expect(navigation.getByRole("link", { name: section })).toHaveCount(
      0,
    );
  }

  const response = await page.goto("/admin/users");
  expect(response?.status()).toBe(404);
});

test("a super admin edits an institutional text and sees it on the site", async ({
  page,
}) => {
  const footerText = `Texto de prueba ${uniqueSuffix()}.`;

  await signInAs(page, e2eAdmins.superAdmin);
  await page.goto("/admin/content/footer_about/edit");

  // Exact: a changed block also has a "Texto original" section.
  await page
    .getByRole("textbox", { name: "Texto", exact: true })
    .fill(footerText);
  await page.getByRole("button", { name: "Guardar texto" }).click();
  await expect(page.getByText("Cambios guardados")).toBeVisible();

  await page.goto("/");
  await expect(
    page.getByRole("contentinfo").getByText(footerText),
  ).toBeVisible();

  // Put the original text back for the other journeys.
  await page.goto("/admin/content/footer_about/edit");
  await page.getByRole("button", { name: "Restaurar texto original" }).click();
  await page.getByRole("button", { name: "Restaurar", exact: true }).click();
  await expect(page.getByText("Se restauró el texto original")).toBeVisible();
});
