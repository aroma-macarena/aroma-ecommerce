"use server";

import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";

import { getActionProfile } from "@/lib/admin/action-profile";
import {
  restoreOriginalSiteContent,
  updateSiteContent,
} from "@/lib/admin/site-content";
import {
  parseSiteContent,
  type SiteContentFormState,
} from "@/lib/admin/site-content-form";
import { getSiteContentBlock } from "@/lib/site-content/blocks";

/** Institutional copy appears across the public site, footer included. */
function revalidateContent() {
  revalidatePath("/", "layout");
  revalidatePath("/admin/content");
}

export async function updateSiteContentAction(
  key: string,
  previousState: SiteContentFormState,
  formData: FormData,
): Promise<SiteContentFormState> {
  const values = {
    title: String(formData.get("title") ?? ""),
    content: String(formData.get("content") ?? ""),
  };
  const failed = (state: Omit<SiteContentFormState, "status" | "attempt">) => ({
    status: "error" as const,
    attempt: previousState.attempt + 1,
    values,
    ...state,
  });

  const profile = await getActionProfile();

  if (!profile) {
    return failed({
      message:
        "Tu acceso al panel cambió. Recarga la página para ver tu situación.",
    });
  }

  const block = getSiteContentBlock(key);

  if (!block) {
    notFound();
  }

  const parsed = parseSiteContent(block, values);

  if (!parsed.success) {
    return failed({
      message: "Revisa los campos marcados para continuar.",
      fieldErrors: parsed.fieldErrors,
    });
  }

  const result = await updateSiteContent(profile, key, parsed.data);

  if (!result.ok) {
    notFound();
  }

  revalidateContent();
  redirect("/admin/content?estado=guardado");
}

export async function restoreOriginalSiteContentAction(key: string) {
  const profile = await getActionProfile();

  if (!profile) {
    redirect("/admin");
  }

  const result = await restoreOriginalSiteContent(profile, key);

  if (!result.ok) {
    notFound();
  }

  revalidateContent();
  redirect("/admin/content?estado=restaurado");
}
