import z from "zod";

const logEventZodSchema = z.object({
  eventType: z.enum(
    ["MEAL", "NAP", "BATHROOM", "INCIDENT", "NOTE", "LEARNING"],
    {
      error: "Invalid event type",
    }
  ),
  description: z
    .string()
    .trim()
    .max(500, "Description cannot exceed 500 characters")
    .optional(),
});

export const TimelineValidation = {
  logEventZodSchema,
};