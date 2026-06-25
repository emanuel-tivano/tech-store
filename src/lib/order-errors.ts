export const CREATE_ORDER_ERROR_MESSAGES = {
  INVALID_INPUT: 'Revisá los datos de contacto y entrega ingresados.',
  EMPTY_CART: 'No podés generar una orden con el carrito vacío.',
  INVALID_QUANTITY:
    'La cantidad de cada producto debe ser un número entero mayor a cero.',
  DUPLICATE_PRODUCT: 'La orden contiene productos duplicados.',
  PRODUCT_NOT_FOUND:
    'Uno o más productos ya no existen. Actualizá el carrito e intentá nuevamente.',
  PRODUCT_INACTIVE:
    'Uno o más productos ya no están disponibles para la venta. Quitalos del carrito e intentá nuevamente.',
  INSUFFICIENT_STOCK:
    'No hay stock suficiente para uno o más productos. Revisá las cantidades del carrito.',
  UNEXPECTED_ERROR:
    'No pudimos crear la orden por un problema temporal. Intentá nuevamente en unos instantes.',
} as const;

export type CreateOrderErrorCode = keyof typeof CREATE_ORDER_ERROR_MESSAGES;
