import { auth } from "@clerk/nextjs/server";

export default async function AdminPage() {
  await auth.protect();

  return <h1>Dashboard administración</h1>;
}
