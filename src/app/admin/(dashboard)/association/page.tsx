import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { getAssociationProfile } from "@/lib/admin/association-profile";
import getCurrentProfile from "@/lib/auth/get-current-profile";

import { AssociationProfileEditor } from "../associations/association-profile-editor";

export const metadata: Metadata = {
  title: "Mi asociación",
};

export default async function OwnAssociationPage({
  searchParams,
}: PageProps<"/admin/association">) {
  const result = await getCurrentProfile();

  if (result.status !== "ACTIVE") {
    return null;
  }

  const profile = result.currentProfile;

  // Super administrators edit any association from the alliance list.
  if (profile.role === "SUPER_ADMIN") {
    redirect("/admin/associations");
  }

  const association = await getAssociationProfile(
    profile,
    profile.associationId,
  );

  if (!association) {
    notFound();
  }

  const { estado, aviso } = await searchParams;

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow={association.name}
        title="Mi asociación"
        description="La información, el contacto y las imágenes que el público ve en el perfil de tu asociación."
      />

      <AssociationProfileEditor
        association={association}
        canEditName={false}
        cancelHref="/admin"
        estado={estado}
        aviso={aviso}
      />
    </div>
  );
}
