import getCurrentProfile from "@/lib/auth/get-current-profile";

export default async function AdminPage() {
  const result = await getCurrentProfile();

  if (result.status !== "ACTIVE") {
    return null;
  }

  const { name, associationName } = result.currentProfile;

  return (
    <div className="max-w-2xl space-y-2">
      <h1 className="font-heading text-2xl font-semibold tracking-tight md:text-3xl">
        Hola, {name}
      </h1>
      <p className="text-muted-foreground leading-7">
        {associationName
          ? `Desde este panel podrás gestionar la información y los productos de ${associationName}.`
          : "Desde este panel podrás gestionar las asociaciones, categorías, productos y contenidos de AROMA."}
      </p>
    </div>
  );
}
