"use client";

import { CarForm } from "@/components/garage/car-form";
import { updateCar } from "@/app/actions/cars";
import { carSchema } from "@/lib/validations";
import { useRouter } from "next/navigation";
import { z } from "zod";

type CarData = z.infer<typeof carSchema>;

// We use partial here because the car object from server has extra fields (id, userId, createdAt)
// but it contains all the fields needed for CarData
export function EditCarForm({ car }: { car: any }) {
  const router = useRouter();

  async function onSubmit(data: CarData) {
    await updateCar(car.id, data);
    router.push("/garage");
  }

  return (
      <CarForm initialData={car} onSubmit={onSubmit} submitLabel="Update Car" />
  );
}
