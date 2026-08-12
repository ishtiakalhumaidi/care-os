import z from "zod";
const applyForChildZodSchema = z.object({
    firstName: z.string({ error: "First name is required" }).min(2),
    lastName: z.string({ error: "Last name is required" }).min(2),
    dateOfBirth: z
        .string({ error: "Date of birth is required" })
        .refine((val) => !isNaN(Date.parse(val)), "Invalid date"),
    medicalNotes: z.string().optional(),
    allergies: z.string().optional(),
    relationship: z.string({ error: "Relationship is required" }).min(2),
});
const approveChildZodSchema = z.object({
    classroomId: z.string().uuid("Invalid classroom ID").optional(),
});
const rejectChildZodSchema = z.object({
    rejectionReason: z.string({ error: "A rejection reason is required" }).min(5),
});
const linkGuardianZodSchema = z.object({
    userId: z
        .string({ error: "Guardian user ID is required" })
        .min(1, { error: "Invalid user ID" }),
    relationship: z.string({ error: "Relationship is required" }).min(2),
    isPrimary: z.boolean().optional(),
    canPickup: z.boolean().optional(),
});
const suspendChildZodSchema = z.object({
    reason: z.string({ error: "A reason is required" }).min(3),
});
const updatePickupZodSchema = z.object({
    canPickup: z.boolean({ error: "canPickup is required" }),
});
const selfLinkGuardianZodSchema = z.object({
    email: z.string({ error: "Guardian email is required" }).email("Invalid email"),
    relationship: z.string({ error: "Relationship is required" }).min(2),
    canPickup: z.boolean().optional(),
});
const assignClassroomZodSchema = z.object({
    classroomId: z.string({ error: "Classroom ID is required" }).uuid("Invalid classroom ID"),
});
export const ChildValidation = {
    applyForChildZodSchema,
    approveChildZodSchema,
    rejectChildZodSchema,
    linkGuardianZodSchema,
    suspendChildZodSchema,
    updatePickupZodSchema,
    selfLinkGuardianZodSchema,
    assignClassroomZodSchema
};
