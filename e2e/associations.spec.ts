import { expect, test } from "@playwright/test";

import { e2eData } from "./seed";

const { association, product } = e2eData;

test("a visitor goes from the directory to an association and its product", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("navigation", { name: /principal/i })
    .getByRole("link", { name: "Asociaciones" })
    .click();

  await expect(page).toHaveURL("/asociaciones");
  await expect(
    page.getByRole("heading", { level: 1, name: "Asociaciones" }),
  ).toBeVisible();

  await page.getByRole("link", { name: association.name }).click();

  await expect(page).toHaveURL(`/asociaciones/${association.slug}`);
  await expect(
    page.getByRole("heading", { level: 1, name: association.name }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Escribir por WhatsApp/ }),
  ).toBeVisible();

  await page.getByRole("link", { name: product.name }).click();

  await expect(page).toHaveURL(
    `/productos/${association.slug}/${product.slug}`,
  );
  await expect(
    page.getByRole("heading", { level: 1, name: product.name }),
  ).toBeVisible();
});
