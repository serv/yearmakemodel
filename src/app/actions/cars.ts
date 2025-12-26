'use server';

import { db } from "@/lib/db";
import { cars } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const carSchema = z.object({
    year: z.number().int().min(1900).max(2026),
    make: z.string().min(1),
    model: z.string().min(1),
    trim: z.string().optional(),
    color: z.string().optional(),
    drivetrain: z.string().optional(),
    transmission: z.string().optional(),
});

export async function addCar(userId: string, data: z.infer<typeof carSchema>) {
    const validData = carSchema.parse(data);
    
    await db.insert(cars).values({
        userId,
        ...validData
    });

    revalidatePath('/garage');
}

export async function getUserCars(userId: string) {
    return await db.select().from(cars).where(eq(cars.userId, userId));
}
