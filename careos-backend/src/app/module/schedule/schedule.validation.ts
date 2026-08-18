import z from "zod";

const createShiftZodSchema = z.object({
  userId: z
      .string({ error: "User ID is required" })
      .min(1, { error: "Invalid user ID" }),
  classroomId: z.string({ error: "Classroom ID is required" }).uuid("Invalid Classroom ID"),
  startTime: z.string().datetime({ message: "Invalid start time format (ISO 8601 expected)" }),
  endTime: z.string().datetime({ message: "Invalid end time format (ISO 8601 expected)" }),
  isSubstitute: z.boolean().optional().default(false),
}).refine((data) => new Date(data.endTime) > new Date(data.startTime), {
  message: "End time must be after start time",
  path: ["endTime"],
});

export const ScheduleValidation = {
  createShiftZodSchema,
};