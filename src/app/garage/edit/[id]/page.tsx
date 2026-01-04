import { getCar } from "@/app/actions/cars";
import { EditCarForm } from "./edit-car-form";
import { redirect } from "next/navigation";

export default async function EditCarPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // We handle the potential error from getCar or if it returns null/undefined
  // But getCar in my impl throws if unauthorized, or returns null if not found.
  let car;
  try {
    car = await getCar(id);
  } catch (e) {
    // If unauthorized, getCar throws.
    // Might be better to let it throw or redirect to sign-in, but top level layout handles auth usually?
    // garage page handled it.
  }

  if (!car) {
    redirect("/garage");
  }

  return (
    <div className="container mx-auto py-8 max-w-md">
      <h1 className="text-2xl font-bold mb-6">Edit Car</h1>
      <EditCarForm car={car} />
    </div>
  );
}
