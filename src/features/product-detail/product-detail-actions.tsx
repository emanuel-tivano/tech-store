'use client';

import React from 'react';
import { useState } from 'react';

import { useCart } from '@/context/cart-context';
import { mapProductDetailToCartLineInput } from '@/lib/cart-line';
import { getRemainingProductStock } from '@/lib/cart-stock';
import type { ProductDetailDTO } from '@/types';

interface ProductDetailActionsProps {
  product: ProductDetailDTO;
}

export function ProductDetailActions({ product }: ProductDetailActionsProps) {
  const { addItem, getItemQuantity, isHydrated } = useCart();
  const [quantity, setQuantity] = useState(1);

  const quantityInCart = getItemQuantity(product.id);
  const maxQuantity = getRemainingProductStock(product.stock, quantityInCart);
  const isOutOfStock = maxQuantity <= 0;
  const isPendingAvailability = !isHydrated;
  const hasCartReservedStock = quantityInCart > 0;
  const isActionDisabled = isPendingAvailability || isOutOfStock;
  const normalizedQuantity = isOutOfStock
    ? 0
    : Math.min(Math.max(quantity, 1), maxQuantity);

  return (
    <div className="rounded-[1.6rem] border border-slate-200/90 bg-white p-5 shadow-[0_16px_40px_-30px_rgba(15,23,42,0.28)] sm:px-6">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
            Compra rápida
          </p>
          <p className="text-sm leading-6 text-slate-600">
            Elegí la cantidad y agregá el producto al carrito sin salir de esta página.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-slate-50/90 p-4 sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="w-full sm:max-w-36">
              <label htmlFor="quantity" className="form-label">
                Cantidad
              </label>
              <input
                id="quantity"
                className="input-base min-h-[3.25rem] rounded-xl border-slate-300/90 bg-white text-base shadow-none"
                type="number"
                min={isOutOfStock ? 0 : 1}
                max={maxQuantity}
                value={normalizedQuantity}
                disabled={isActionDisabled}
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
              className="btn-primary min-h-[3.25rem] w-full flex-1 rounded-xl px-5 text-base font-semibold shadow-[0_18px_35px_-20px_rgba(0,102,255,0.55)] sm:w-auto sm:min-w-[220px]"
              data-testid="pdp-add-to-cart"
              disabled={isActionDisabled}
              onClick={() => addItem(mapProductDetailToCartLineInput(product), normalizedQuantity)}
            >
              {isPendingAvailability
                ? 'Actualizando disponibilidad'
                : isOutOfStock
                  ? 'No disponible por ahora'
                  : 'Agregar al carrito'}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2 text-sm">
          <p className={isActionDisabled ? 'font-medium text-slate-700' : 'leading-6 text-slate-600'}>
            {isPendingAvailability
              ? 'Estamos validando la disponibilidad actual para que puedas agregar la cantidad correcta.'
              : product.stock <= 0
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
