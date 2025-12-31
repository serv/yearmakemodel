import SignIn from "@/components/auth/sign-in";

export const dynamic = "force-dynamic";

export default function SignInPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/50">
      <SignIn />
    </div>
  );
}
