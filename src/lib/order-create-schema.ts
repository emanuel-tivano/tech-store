import { z } from 'zod';

export const createOrderInputSchema = z.object({
  buyer: z.object({
    name: z.string().trim().min(1),
    lastName: z.string().trim().min(1).optional(),
    phone: z.string().trim().min(1),
    email: z.email().trim(),
  }),
  items: z.array(
    z.object({
      id: z.string().min(1),
      quantity: z.number().int().positive(),
    }),
  ).min(1),
});

export type CreateOrderInput = z.infer<typeof createOrderInputSchema>;
