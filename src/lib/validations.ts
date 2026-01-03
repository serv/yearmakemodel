import { z } from "zod";

export const carSchema = z.object({
  year: z.number().int().min(1900).max(2026),
  make: z.string().min(1),
  model: z.string().min(1),
  trim: z.string().optional(),
  color: z.string().optional(),
  drivetrain: z.string().optional(),
  transmission: z.string().optional(),
});
