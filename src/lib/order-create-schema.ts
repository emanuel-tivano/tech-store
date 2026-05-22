import { z } from 'zod';

export const createOrderInputSchema = z.object({
  buyer: z.object({
    name: z.string().trim().min(1),
    lastName: z.string().trim().min(1).optional(),
    phone: z.string().trim().min(1),
    email: z.email().trim(),
  }),
  shippingAddress: z.string().trim().min(1),
  shippingCity: z.string().trim().min(1),
  shippingProvince: z.string().trim().min(1),
  shippingPostalCode: z.string().trim().min(1),
  deliveryMethod: z.enum(['home-delivery', 'pickup-point', 'store-pickup']),
  paymentMethod: z.enum(['credit-card', 'bank-transfer', 'cash-on-pickup']),
  items: z.array(
    z.object({
      id: z.string().min(1),
      quantity: z.number().int().positive(),
    }),
  ).min(1),
});

export type CreateOrderInput = z.infer<typeof createOrderInputSchema>;
