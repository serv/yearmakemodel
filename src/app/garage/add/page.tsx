"use client";

import { CarForm } from "@/components/garage/car-form";
import { addCar } from "@/app/actions/cars";
import { carSchema } from "@/lib/validations";
import { useRouter } from "next/navigation";
import { z } from "zod";

export default function AddCarPage() {
  const router = useRouter();

  async function onSubmit(data: z.infer<typeof carSchema>) {
    await addCar(data);
    router.push("/garage");
  }

  return (
    <div className="container mx-auto py-8 max-w-md">
      <h1 className="text-2xl font-bold mb-6">Add a Car</h1>
      <CarForm onSubmit={onSubmit} submitLabel="Add Car" />
    </div>
  );
}
