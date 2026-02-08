import { z } from "zod";

import { END_YEAR, START_YEAR } from "./constants";

export const carSchema = z.object({
  year: z.number().int().min(START_YEAR).max(END_YEAR),
  make: z.string().min(1),
  model: z.string().min(1),
  trim: z.string().optional(),
  color: z.string().optional(),
  drivetrain: z.string().optional(),
  transmission: z.string().optional(),
});
