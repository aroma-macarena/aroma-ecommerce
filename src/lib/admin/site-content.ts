import { eq, sql } from "drizzle-orm";

import { db } from "@/db";
import { profilesTable as profiles } from "@/db/schema/profiles";
import { siteContentTable as siteContent } from "@/db/schema/siteContent";
import type {
  SiteContentFieldErrors,
  SiteContentInput,
} from "@/lib/admin/site-content-form";
import { isSuperAdmin } from "@/lib/auth/authorization";
import type { AdminProfile } from "@/lib/auth/get-current-profile";
import {
  getSiteContentBlock,
  siteContentBlocks,
} from "@/lib/site-content/blocks";
import { resolveSiteText } from "@/lib/site-content/queries";

export type SiteContentResult =
  | { ok: true }
  | { ok: false; reason: "INVALID"; fieldErrors: SiteContentFieldErrors }
  | { ok: false; reason: "FORBIDDEN" | "NOT_FOUND" };

async function getStoredContent() {
  const rows = await db
    .select({
      key: siteContent.key,
      title: siteContent.title,
      content: siteContent.content,
      updatedAt: siteContent.updatedAt,
      createdAt: siteContent.createdAt,
      updatedByName: profiles.name,
    })
    .from(siteContent)
    .leftJoin(profiles, eq(siteContent.updatedBy, profiles.id));

  return new Map(rows.map((row) => [row.key, row]));
}

type StoredRow =
  Awaited<ReturnType<typeof getStoredContent>> extends Map<string, infer Row>
    ? Row
    : never;

function describeBlock(
  block: (typeof siteContentBlocks)[number],
  stored: StoredRow | undefined,
) {
  const text = resolveSiteText(block, stored);

  return {
    ...block,
    text,
    /**
     * The public site shows the original text, saved or not. For the
     * alliance's WhatsApp, "original" means never saved: the deployment's
     * variable still applies.
     */
    isOriginal:
      block.kind === "whatsapp"
        ? !stored
        : text.title === (block.fallback.title ?? "") &&
          text.content === block.fallback.content,
    updatedAt: stored ? (stored.updatedAt ?? stored.createdAt) : null,
    updatedByName: stored?.updatedByName ?? null,
  };
}

/**
 * Every editable block with its current text and last change. Null for
 * anyone but a super administrator.
 */
export async function getAdminSiteContent(profile: AdminProfile) {
  if (!isSuperAdmin(profile)) {
    return null;
  }

  const stored = await getStoredContent();

  return siteContentBlocks.map((block) =>
    describeBlock(block, stored.get(block.key)),
  );
}

export type AdminSiteContent = NonNullable<
  Awaited<ReturnType<typeof getAdminSiteContent>>
>[number];

/** One block a super administrator may edit; otherwise null. */
export async function getEditableSiteContent(
  profile: AdminProfile,
  key: string,
) {
  const block = getSiteContentBlock(key);

  if (!isSuperAdmin(profile) || !block) {
    return null;
  }

  const stored = await getStoredContent();

  return describeBlock(block, stored.get(block.key));
}

/**
 * Saves a block's text and who changed it. The block must be one of the
 * fixed set; its first save creates the row.
 */
export async function updateSiteContent(
  profile: AdminProfile,
  key: string,
  input: SiteContentInput,
): Promise<SiteContentResult> {
  if (!isSuperAdmin(profile)) {
    return { ok: false, reason: "FORBIDDEN" };
  }

  const block = getSiteContentBlock(key);

  if (!block) {
    return { ok: false, reason: "NOT_FOUND" };
  }

  const values = {
    title: block.title ? input.title : null,
    content: input.content,
    updatedBy: profile.id,
    updatedAt: sql`now()`,
  };

  await db
    .insert(siteContent)
    .values({ key: block.key, ...values })
    .onConflictDoUpdate({ target: siteContent.key, set: values });

  return { ok: true };
}

/** Puts the original text back, recorded as a change like any other. */
export async function restoreOriginalSiteContent(
  profile: AdminProfile,
  key: string,
): Promise<SiteContentResult> {
  const block = getSiteContentBlock(key);

  // The alliance's WhatsApp has no original text: it is cleared instead.
  if (!block || block.kind === "whatsapp") {
    return isSuperAdmin(profile)
      ? { ok: false, reason: "NOT_FOUND" }
      : { ok: false, reason: "FORBIDDEN" };
  }

  return updateSiteContent(profile, key, block.fallback);
}
