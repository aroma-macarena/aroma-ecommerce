import { UserButton } from "@clerk/nextjs";

export function AdminHeader() {
  return (
    <header>
      <UserButton />
    </header>
  );
}
