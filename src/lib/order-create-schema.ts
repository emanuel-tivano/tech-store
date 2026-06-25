import { z } from 'zod';

const argentinaPhonePattern = /^(?:54)?\d{10,13}$/;
const argentinaPostalCodePattern = /^(?:\d{4}|[A-Z]\d{4}[A-Z]{3})$/;

export function normalizePhone(phone: string) {
  return phone.replace(/\D/g, '');
}

export function normalizePostalCode(postalCode: string) {
  return postalCode.trim().toUpperCase();
}

export const customerFullNameSchema = z
  .string()
  .trim()
  .min(3, { error: 'Ingresá un nombre completo válido.' })
  .max(120, { error: 'El nombre completo es demasiado largo.' });

export const customerEmailSchema = z
  .string()
  .trim()
  .min(1, { error: 'El email es obligatorio.' })
  .pipe(z.email({ error: 'Ingresá un email válido.' }))
  .transform((email) => email.toLowerCase());

export const customerPhoneSchema = z
  .string()
  .transform(normalizePhone)
  .pipe(
    z
      .string()
      .min(1, { error: 'El teléfono es obligatorio.' })
      .regex(argentinaPhonePattern, {
        error: 'Ingresá un teléfono válido de Argentina.',
      }),
  );

export const shippingAddressSchema = z
  .string()
  .trim()
  .min(5, { error: 'Ingresá una dirección válida.' })
  .max(160, { error: 'La dirección es demasiado larga.' });

export const shippingCitySchema = z
  .string()
  .trim()
  .min(2, { error: 'Ingresá una ciudad válida.' })
  .max(80, { error: 'La ciudad es demasiado larga.' });

export const shippingProvinceSchema = z
  .string()
  .trim()
  .min(2, { error: 'Ingresá una provincia válida.' })
  .max(80, { error: 'La provincia es demasiado larga.' });

export const shippingPostalCodeSchema = z
  .string()
  .transform(normalizePostalCode)
  .pipe(
    z
      .string()
      .min(1, { error: 'El código postal es obligatorio.' })
      .regex(argentinaPostalCodePattern, {
        error: 'Ingresá un código postal argentino válido.',
      }),
  );

export const deliveryMethodSchema = z.enum(
  ['home-delivery', 'pickup-point', 'store-pickup'],
  { error: 'Seleccioná un método de entrega.' },
);

export const paymentMethodSchema = z.enum(
  ['credit-card', 'bank-transfer', 'cash-on-pickup'],
  { error: 'Seleccioná un método de pago.' },
);

const buyerSchema = z
  .object({
    name: z.string().trim().min(1).max(80),
    lastName: z.string().trim().min(1).max(80).optional(),
    phone: customerPhoneSchema,
    email: customerEmailSchema,
  })
  .superRefine((buyer, context) => {
    const fullName = [buyer.name, buyer.lastName].filter(Boolean).join(' ');
    const result = customerFullNameSchema.safeParse(fullName);

    if (!result.success) {
      context.addIssue({
        code: 'custom',
        path: ['name'],
        message: result.error.issues[0]?.message ?? 'Ingresá un nombre completo válido.',
      });
    }
  });

export const createOrderInputSchema = z.object({
  buyer: buyerSchema,
  shippingAddress: shippingAddressSchema,
  shippingCity: shippingCitySchema,
  shippingProvince: shippingProvinceSchema,
  shippingPostalCode: shippingPostalCodeSchema,
  deliveryMethod: deliveryMethodSchema,
  paymentMethod: paymentMethodSchema,
  items: z.array(
    z.object({
      id: z.string().trim().min(1).max(64),
      quantity: z.number().int().positive(),
    }),
  ).min(1).max(50),
});

export type CreateOrderInput = z.infer<typeof createOrderInputSchema>;
