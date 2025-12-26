
import { z } from "zod";

export const tagSchema = z.object({
  year: z.string().optional(),
  make: z.string().optional(),
  model: z.string().optional(),
  trim: z.string().optional(),
  drivetrain: z.string().optional(),
  transmission: z.string().optional(),
}).refine((data) => {
  // Rule: If a post has both Year AND Model, the Make is required.
  if (data.year && data.model && !data.make) {
    return false;
  }
  return true;
}, {
  message: "Make is required if both Year and Model are specified.",
  path: ["make"],
});

export function validateTags(tags: { year?: string; make?: string; model?: string }) {
    const result = tagSchema.safeParse(tags);
    if (!result.success) {
        throw new Error(result.error.issues[0].message);
    }
    return true;
}
