'use client';

import { useState } from 'react';

import { useCart } from '@/context/cart-context';
import { mapProductDetailToCartLineInput } from '@/lib/cart-line';
import type { ProductDetailDTO } from '@/types';

interface ProductDetailActionsProps {
  product: ProductDetailDTO;
}

export function ProductDetailActions({ product }: ProductDetailActionsProps) {
  const { addItem, isInCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  const maxQuantity = product.stock;
  const quantityInCart = isInCart(product.id);
  const isOutOfStock = product.stock <= 0;

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 sm:p-5">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            Compra rápida
          </p>
          <p className="text-sm text-slate-600">
            Elegí la cantidad y agregá el producto al carrito sin salir de esta página.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="w-full sm:max-w-32">
            <label htmlFor="quantity" className="form-label">
              Cantidad
            </label>
            <input
              id="quantity"
              className="input-base min-h-12 text-base"
              type="number"
              min={1}
              max={maxQuantity}
              value={isOutOfStock ? 0 : quantity}
              disabled={isOutOfStock}
              onChange={(event) => {
                const nextValue = Number(event.target.value);
                const normalizedValue = Number.isNaN(nextValue)
                  ? 1
                  : Math.min(Math.max(nextValue, 1), maxQuantity);

                setQuantity(normalizedValue);
              }}
            />
          </div>

          <button
            type="button"
            className="btn-primary min-h-12 flex-1 sm:flex-none sm:px-6"
            disabled={isOutOfStock}
            onClick={() => addItem(mapProductDetailToCartLineInput(product), quantity)}
          >
            {isOutOfStock ? 'Sin stock disponible' : 'Agregar al carrito'}
          </button>
        </div>

        <div className="flex flex-col gap-2 text-sm">
          <p className={isOutOfStock ? 'font-medium text-red-600' : 'text-slate-600'}>
            {isOutOfStock
              ? 'Este producto no tiene unidades disponibles en este momento.'
              : `Podés agregar hasta ${maxQuantity} unidad${maxQuantity === 1 ? '' : 'es'} en esta compra.`}
          </p>

          {quantityInCart ? (
            <p className="font-medium text-emerald-700">Este producto ya está en tu carrito.</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
