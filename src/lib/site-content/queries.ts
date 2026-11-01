import { inArray } from "drizzle-orm";
import { cache } from "react";

import { db } from "@/db";
import { siteContentTable as siteContent } from "@/db/schema/siteContent";
import {
  type SiteContentBlock,
  siteContentBlocks,
  type SiteContentKey,
} from "@/lib/site-content/blocks";

export type SiteText = { title: string; content: string };

type StoredContent = { title: string | null; content: string };

/**
 * A block's text: what was saved, or the block's fallback for anything
 * missing or blank, so the public site never shows an empty block.
 */
export function resolveSiteText(
  block: SiteContentBlock,
  stored: StoredContent | undefined,
): SiteText {
  const title = block.title
    ? stored?.title?.trim() || block.fallback.title
    : "";

  return {
    title: title ?? "",
    content: stored?.content.trim() || block.fallback.content,
  };
}

/** Every institutional block, read once per request. */
export const getSiteContent = cache(
  async (): Promise<Record<SiteContentKey, SiteText>> => {
    const rows = await db
      .select({
        key: siteContent.key,
        title: siteContent.title,
        content: siteContent.content,
      })
      .from(siteContent)
      .where(
        inArray(
          siteContent.key,
          siteContentBlocks.map(({ key }) => key),
        ),
      );
    const stored = new Map(rows.map((row) => [row.key, row]));

    return Object.fromEntries(
      siteContentBlocks.map((block) => [
        block.key,
        resolveSiteText(block, stored.get(block.key)),
      ]),
    ) as Record<SiteContentKey, SiteText>;
  },
);
