import { eq } from "drizzle-orm";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { siteContentTable } from "@/db/schema/siteContent";
import {
  getAdminSiteContent,
  restoreOriginalSiteContent,
  updateSiteContent,
} from "@/lib/admin/site-content";
import { parseSiteContent } from "@/lib/admin/site-content-form";
import {
  getSiteContentBlock,
  siteContentBlocks,
  toParagraphs,
} from "@/lib/site-content/blocks";
import { getSiteContent } from "@/lib/site-content/queries";
import { createTestDatabase, type TestDatabase } from "@/test/database";
import {
  bosqueVivoAdmin,
  seedAdminProfiles,
  seedCatalog,
  superAdmin,
} from "@/test/fixtures";

const database = vi.hoisted(() => ({ current: undefined as unknown }));

vi.mock("@/db", () => ({
  get db() {
    return (database.current as TestDatabase).db;
  },
}));

const hero = getSiteContentBlock("home_hero")!;
const footer = getSiteContentBlock("footer_about")!;

function testDatabase() {
  return database.current as TestDatabase;
}

async function stored(key: string) {
  const [row] = await testDatabase()
    .db.select()
    .from(siteContentTable)
    .where(eq(siteContentTable.key, key));
  return row;
}

beforeAll(async () => {
  const created = await createTestDatabase();
  database.current = created;
  await seedCatalog(created);
  await seedAdminProfiles(created);
});

beforeEach(async () => {
  await testDatabase().db.delete(siteContentTable);
});

describe("getSiteContent", () => {
  it("falls back to the original text for blocks never saved", async () => {
    const content = await getSiteContent();

    for (const block of siteContentBlocks) {
      expect(content[block.key]).toEqual({
        title: block.fallback.title ?? "",
        content: block.fallback.content,
      });
    }
  });

  it("uses the saved text", async () => {
    await testDatabase().db.insert(siteContentTable).values({
      key: "home_hero",
      title: "Sabores de la Sierra",
      content: "Lo que producen las mujeres de La Macarena.",
    });

    expect((await getSiteContent()).home_hero).toEqual({
      title: "Sabores de la Sierra",
      content: "Lo que producen las mujeres de La Macarena.",
    });
  });

  it("falls back for a blank title or text instead of showing nothing", async () => {
    await testDatabase().db.insert(siteContentTable).values({
      key: "home_hero",
      title: "  ",
      content: "",
    });

    expect((await getSiteContent()).home_hero).toEqual({
      title: hero.fallback.title,
      content: hero.fallback.content,
    });
  });

  it("ignores rows for keys outside the supported set", async () => {
    await testDatabase().db.insert(siteContentTable).values({
      key: "home_intro",
      title: "Texto viejo",
      content: "No se usa.",
    });

    const content = await getSiteContent();
    expect(Object.keys(content).sort()).toEqual(
      siteContentBlocks.map(({ key }) => key).sort(),
    );
  });
});

describe("parseSiteContent", () => {
  it("requires the title and text a block uses", () => {
    expect(parseSiteContent(hero, { title: " ", content: "" })).toEqual({
      success: false,
      fieldErrors: { title: expect.any(String), content: expect.any(String) },
    });
  });

  it("enforces each field's length", () => {
    expect(
      parseSiteContent(hero, {
        title: "a".repeat(hero.title!.maxLength + 1),
        content: "Texto",
      }),
    ).toMatchObject({
      success: false,
      fieldErrors: { title: expect.any(String) },
    });
  });

  it("keeps paragraphs only where the block shows them", () => {
    expect(
      parseSiteContent(hero, { title: "Título", content: "Una\n\nfrase" }),
    ).toEqual({
      success: true,
      data: { title: "Título", content: "Una frase" },
    });

    const parsed = parseSiteContent(footer, {
      content: "Primero.  \r\n\r\n\r\n\r\nCon el apoyo de alguien.",
    });
    expect(parsed).toEqual({
      success: true,
      data: { title: null, content: "Primero.\n\nCon el apoyo de alguien." },
    });
    expect(toParagraphs(parsed.success ? parsed.data.content : "")).toEqual([
      "Primero.",
      "Con el apoyo de alguien.",
    ]);
  });
});

describe("updateSiteContent", () => {
  it("saves the text and records who changed it and when", async () => {
    await expect(
      updateSiteContent(superAdmin, "home_hero", {
        title: "Sabores de la Sierra",
        content: "Lo que producen las mujeres de La Macarena.",
      }),
    ).resolves.toEqual({ ok: true });

    expect(await stored("home_hero")).toMatchObject({
      title: "Sabores de la Sierra",
      updatedBy: superAdmin.id,
      updatedAt: expect.any(Date),
    });
  });

  it("updates an existing block in place", async () => {
    await updateSiteContent(superAdmin, "footer_about", {
      title: null,
      content: "Primero.",
    });
    await updateSiteContent(superAdmin, "footer_about", {
      title: null,
      content: "Segundo.",
    });

    const rows = await testDatabase()
      .db.select()
      .from(siteContentTable)
      .where(eq(siteContentTable.key, "footer_about"));
    expect(rows).toHaveLength(1);
    expect(rows[0].content).toBe("Segundo.");
  });

  it("never stores a title for a block without one", async () => {
    await updateSiteContent(superAdmin, "associations_intro", {
      title: "No debería guardarse",
      content: "Las organizaciones de la alianza.",
    });

    expect((await stored("associations_intro")).title).toBeNull();
  });

  it("rejects keys outside the supported set", async () => {
    await expect(
      updateSiteContent(superAdmin, "pagina_nueva", {
        title: null,
        content: "Texto",
      }),
    ).resolves.toEqual({ ok: false, reason: "NOT_FOUND" });
    expect(await stored("pagina_nueva")).toBeUndefined();
  });

  it("is only for super administrators", async () => {
    await expect(
      updateSiteContent(bosqueVivoAdmin, "home_hero", {
        title: "Otro",
        content: "Otro",
      }),
    ).resolves.toEqual({ ok: false, reason: "FORBIDDEN" });
    await expect(getAdminSiteContent(bosqueVivoAdmin)).resolves.toBeNull();
  });
});

describe("restoreOriginalSiteContent", () => {
  it("saves the original text back as a recorded change", async () => {
    await updateSiteContent(superAdmin, "home_hero", {
      title: "Otro título",
      content: "Otro texto.",
    });

    await expect(
      restoreOriginalSiteContent(superAdmin, "home_hero"),
    ).resolves.toEqual({ ok: true });

    expect(await stored("home_hero")).toMatchObject({
      title: hero.fallback.title,
      content: hero.fallback.content,
      updatedBy: superAdmin.id,
    });
    const blocks = await getAdminSiteContent(superAdmin);
    expect(blocks?.find(({ key }) => key === "home_hero")).toMatchObject({
      isOriginal: true,
      updatedByName: superAdmin.name,
    });
  });
});
