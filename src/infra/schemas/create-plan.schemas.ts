import z from 'zod';

export const createPlanBodySchema = z.object({
  name: z.string().min(2).max(30),
  type: z.enum(['MONTHLY', 'YEARLY']),
  price: z.number(),
  servicesLimit: z.number().min(0),
  serviceExecutionsLimit: z.number().min(0),
  clientCompanysLimit: z.number().min(0),
  invoicesLimit: z.number().min(0),
});

export type CreatePlanBodyDTO = z.infer<typeof createPlanBodySchema>;
