'use client';

import React from 'react';
import { useEffect, useState } from 'react';

import { useCart } from '@/context/cart-context';
import { mapProductDetailToCartLineInput } from '@/lib/cart-line';
import { getRemainingProductStock } from '@/lib/cart-stock';
import type { ProductDetailDTO } from '@/types';

interface ProductDetailActionsProps {
  product: ProductDetailDTO;
}

export function ProductDetailActions({ product }: ProductDetailActionsProps) {
  const { addItem, getItemQuantity } = useCart();
  const [quantity, setQuantity] = useState(1);

  const quantityInCart = getItemQuantity(product.id);
  const maxQuantity = getRemainingProductStock(product.stock, quantityInCart);
  const isOutOfStock = maxQuantity <= 0;
  const hasCartReservedStock = quantityInCart > 0;

  useEffect(() => {
    if (maxQuantity <= 0) {
      return;
    }

    setQuantity((currentQuantity) =>
      Math.min(Math.max(currentQuantity, 1), maxQuantity),
    );
  }, [maxQuantity]);

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
          <div className="w-full sm:max-w-36">
            <label htmlFor="quantity" className="form-label">
              Cantidad
            </label>
            <input
              id="quantity"
              className="input-base min-h-12 text-base"
              type="number"
              min={isOutOfStock ? 0 : 1}
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
            data-testid="pdp-add-to-cart"
            disabled={isOutOfStock}
            onClick={() => addItem(mapProductDetailToCartLineInput(product), quantity)}
          >
            {isOutOfStock ? 'No disponible por ahora' : 'Agregar al carrito'}
          </button>
        </div>

        <div className="flex flex-col gap-2 text-sm">
          <p className={isOutOfStock ? 'font-medium text-slate-700' : 'text-slate-600'}>
            {product.stock <= 0
              ? 'Este producto no tiene unidades disponibles en este momento.'
              : isOutOfStock
                ? 'Ya tenés en tu carrito todas las unidades disponibles de este producto.'
                : `Podés agregar hasta ${maxQuantity} unidad${maxQuantity === 1 ? '' : 'es'} más desde esta página.`}
          </p>

          {hasCartReservedStock ? (
            <p className="font-medium text-emerald-700">
              Ya tenés {quantityInCart} unidad{quantityInCart === 1 ? '' : 'es'} en tu carrito.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
