import { clerk } from "@clerk/testing/playwright";
import type { Page } from "@playwright/test";

/**
 * Signs in as one of the Clerk test users with a sign-in ticket from
 * Clerk's backend: no password and no email involved. Clerk must load on
 * the page first, so it starts from the public home page.
 */
export async function signInAs(page: Page, admin: { email: string }) {
  await page.goto("/");
  await clerk.signIn({ page, emailAddress: admin.email });
}

/** The admin navigation, opening the mobile menu when it is collapsed. */
export async function openAdminNavigation(page: Page) {
  const menu = page.getByRole("button", { name: "Abrir menú" });

  if (await menu.isVisible()) {
    await menu.click();
  }

  return page.getByRole("navigation", { name: "Navegación administrativa" });
}

/** A suffix that keeps names unique across projects and repeated runs. */
export function uniqueSuffix() {
  return Date.now().toString(36);
}
