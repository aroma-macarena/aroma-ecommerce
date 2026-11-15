import type { SiteContentBlock } from "@/lib/site-content/blocks";
import {
  INVALID_WHATSAPP_MESSAGE,
  normalizeWhatsAppNumber,
} from "@/lib/whatsapp";

/** Client-safe parsing for the content editor. */

export type SiteContentFieldErrors = Partial<
  Record<"title" | "content", string>
>;
export type SiteContentInput = { title: string | null; content: string };
export type SiteContentFormValues = { title: string; content: string };

export type SiteContentFormState = {
  status: "idle" | "error";
  /** Increases on every failed submission so the form can restore values. */
  attempt: number;
  message?: string;
  fieldErrors?: SiteContentFieldErrors;
  values?: SiteContentFormValues;
};

function normalize(value: string, multiline: boolean) {
  const text = value.replace(/\r\n?/g, "\n");

  return multiline
    ? // At most one blank line between paragraphs.
      text
        .split("\n")
        .map((line) => line.trimEnd())
        .join("\n")
        .replace(/\n{3,}/g, "\n\n")
        .trim()
    : text.replace(/\s+/g, " ").trim();
}

export function parseSiteContent(
  block: SiteContentBlock,
  values: Partial<SiteContentFormValues>,
) {
  if (block.kind === "whatsapp") {
    return parseWhatsApp(block, values.content ?? "");
  }

  const fieldErrors: SiteContentFieldErrors = {};
  const title = block.title ? normalize(values.title ?? "", false) : null;
  const content = normalize(values.content ?? "", block.content.multiline);

  if (block.title && title !== null) {
    if (!title) {
      fieldErrors.title = "Escribe el título.";
    } else if (title.length > block.title.maxLength) {
      fieldErrors.title = `El título puede tener hasta ${block.title.maxLength} caracteres.`;
    }
  }

  if (!content) {
    fieldErrors.content = "Escribe el texto.";
  } else if (content.length > block.content.maxLength) {
    fieldErrors.content = `El texto puede tener hasta ${block.content.maxLength} caracteres.`;
  }

  return Object.keys(fieldErrors).length > 0
    ? { success: false as const, fieldErrors }
    : { success: true as const, data: { title, content } };
}

/** A WhatsApp number, stored normalized; empty is allowed and hides it. */
function parseWhatsApp(block: SiteContentBlock, value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return { success: true as const, data: { title: null, content: "" } };
  }

  const normalized =
    trimmed.length <= block.content.maxLength
      ? normalizeWhatsAppNumber(trimmed)
      : null;

  return normalized
    ? { success: true as const, data: { title: null, content: normalized } }
    : {
        success: false as const,
        fieldErrors: { content: INVALID_WHATSAPP_MESSAGE },
      };
}
