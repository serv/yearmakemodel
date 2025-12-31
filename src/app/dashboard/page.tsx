import UserButton from "@/components/auth/user-button";

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <p className="mb-4">This is a protected page.</p>
      <UserButton />
    </div>
  );
}
