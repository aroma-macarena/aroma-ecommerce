import { expect, test } from "@playwright/test";

import { E2E_BASE_URL, E2E_WHATSAPP_NUMBER } from "./environment";
import { e2eData } from "./seed";

const { association, product } = e2eData;

test("a visitor finds a published product and opens its page", async ({
  page,
}) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { level: 1, name: "Productos de La Macarena" }),
  ).toBeVisible();

  await page.getByRole("link", { name: product.name }).click();

  await expect(page).toHaveURL(
    `/productos/${association.slug}/${product.slug}`,
  );
  await expect(
    page.getByRole("heading", { level: 1, name: product.name }),
  ).toBeVisible();
  await expect(page.getByText("Bolsa 500 g")).toBeVisible();
});

test("the product page hands the visitor to the association's WhatsApp", async ({
  page,
}) => {
  await page.goto(`/productos/${association.slug}/${product.slug}`);

  const whatsapp = page.getByRole("link", { name: /Consultar por WhatsApp/ });
  await expect(whatsapp).toBeVisible();
  await expect(whatsapp).toHaveAttribute("target", "_blank");

  // Checked without following the link: no message is sent.
  const href = new URL((await whatsapp.getAttribute("href")) ?? "");
  expect(href.origin).toBe("https://wa.me");
  expect(href.pathname).toBe(`/${E2E_WHATSAPP_NUMBER}`);

  const message = href.searchParams.get("text") ?? "";
  expect(message).toContain(`«${product.name}» de ${association.name}`);
  expect(message).toContain(
    `${E2E_BASE_URL}/productos/${association.slug}/${product.slug}`,
  );
});
