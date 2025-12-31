"use client";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function UserButton() {
  const { data: session } = authClient.useSession();
  const router = useRouter();

  if (!session)
    return (
      <Button variant="outline" onClick={() => router.push("/sign-in")}>
        Sign In
      </Button>
    );

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium">{session.user.name}</span>
      <Button
        variant="ghost"
        onClick={async () => {
          await authClient.signOut();
          router.refresh();
        }}
      >
        Sign Out
      </Button>
    </div>
  );
}
