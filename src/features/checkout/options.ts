import type { DeliveryMethod, PaymentMethod } from './validation';

export const deliveryOptions: Array<{
  value: DeliveryMethod;
  title: string;
  description: string;
}> = [
  {
    value: 'home-delivery',
    title: 'Envío a domicilio',
    description: 'Entrega estándar con costo calculado en el resumen.',
  },
  {
    value: 'pickup-point',
    title: 'Retiro en punto de entrega',
    description: 'Alternativa más económica para compras que no requieren envío puerta a puerta.',
  },
  {
    value: 'store-pickup',
    title: 'Retiro acordado',
    description: 'Sin costo de envío. Ideal para una demo de portfolio con coordinación manual.',
  },
];

export const paymentOptions: Array<{
  value: PaymentMethod;
  title: string;
  description: string;
}> = [
  {
    value: 'credit-card',
    title: 'Tarjeta de crédito o débito',
    description: 'Pago simulado para portfolio. No se procesan cargos reales.',
  },
  {
    value: 'bank-transfer',
    title: 'Transferencia bancaria',
    description: 'Opción simulada para representar un flujo alternativo de confirmación.',
  },
  {
    value: 'cash-on-pickup',
    title: 'Pago al retirar',
    description: 'Disponible sólo como referencia del flujo. No integra cobro real.',
  },
];
