import z from "zod";

const createGuardianRequestZodSchema = z.object({
  email: z.string({ error: "Guardian email is required" }).email("Invalid email"),
  relationship: z.string({ error: "Relationship is required" }).min(2),
  canPickup: z.boolean().optional(),
});

const denyGuardianRequestZodSchema = z.object({
  reason: z.string().optional(),
});

export const GuardianRequestValidation = {
  createGuardianRequestZodSchema,
  denyGuardianRequestZodSchema,
};