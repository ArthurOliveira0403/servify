import z from 'zod';

export const signUpBodySchema = z.object({
  name: z.string().min(2).max(100),
  cnpj: z.string(),
  email: z.email(),
  password: z.string().min(4).max(20),
});

export type SignUpBodyDTO = z.infer<typeof signUpBodySchema>;
