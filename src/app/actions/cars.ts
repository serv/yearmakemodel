"use server";

import { db } from "@/lib/db";
import { cars } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

import { carSchema } from "@/lib/validations";

export async function addCar(data: z.infer<typeof carSchema>) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  const validData = carSchema.parse(data);

  await db.insert(cars).values({
    userId: session.user.id,
    ...validData,
  });

  revalidatePath("/garage");
}

export async function getUserCars(userId: string) {
  // If no userId provided, we could optionally return empty or throw.
  // But for now, we trust the caller to pass a valid ID (or we can update this to fetch *my* cars if no ID).
  return await db.select().from(cars).where(eq(cars.userId, userId));
}

export async function deleteCar(carId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  // Ensure the car belongs to the user
  const car = await db.query.cars.findFirst({
    where: and(eq(cars.id, carId), eq(cars.userId, session.user.id)),
  });

  if (!car) {
    throw new Error("Car not found or unauthorized");
  }

  await db.delete(cars).where(eq(cars.id, carId));
  revalidatePath("/garage");
}

export async function getCar(carId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  const car = await db.query.cars.findFirst({
    where: and(eq(cars.id, carId), eq(cars.userId, session.user.id)),
  });

  return car;
}

export async function updateCar(
  carId: string,
  data: z.infer<typeof carSchema>,
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  const validData = carSchema.parse(data);

  // Ensure the car belongs to the user
  const car = await db.query.cars.findFirst({
    where: and(eq(cars.id, carId), eq(cars.userId, session.user.id)),
  });

  if (!car) {
    throw new Error("Car not found or unauthorized");
  }

  await db.update(cars).set(validData).where(eq(cars.id, carId));

  revalidatePath("/garage");
}
