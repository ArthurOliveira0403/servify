import z from 'zod';

export const createSubscriptionParamSchema = z.string();

export type CreateSubscriptionParamDTO = z.infer<
  typeof createSubscriptionParamSchema
>;
