import z from "zod";

const dashboardQuerySchema = z.object({
  query: z.object({
    period: z.enum(["7d", "30d", "90d"]).optional().default("7d"),
  }),
});

export const DashboardValidation = {
  dashboardQuerySchema,
};