import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { UsernameForm } from "@/components/onboarding/username-form";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export default async function UsernamePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  // Check if user already has a username
  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
  });

  if (user?.username) {
    redirect("/");
  }

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center p-4">
      <UsernameForm />
    </div>
  );

}
