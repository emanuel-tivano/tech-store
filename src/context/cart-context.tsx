'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type PropsWithChildren,
} from 'react';

import type { CartItem, CartState, Product } from '@/types';

type CartAction =
  | { type: 'HYDRATE'; payload: CartState }
  | { type: 'ADD_ITEM'; payload: { product: Product; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: { productId: string } }
  | { type: 'CLEAR_CART' };

interface CartContextValue {
  cart: CartState;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  isInCart: (productId: string) => boolean;
}

const STORAGE_KEY = 'perifericos-cart';
const initialState: CartState = { items: [] };

export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'HYDRATE':
      return action.payload;
    case 'ADD_ITEM': {
      const existingItem = state.items.find(
        (item) => item.id === action.payload.product.id,
      );

      if (existingItem) {
        return {
          items: state.items.map((item) =>
            item.id === action.payload.product.id
              ? { ...item, quantity: item.quantity + action.payload.quantity }
              : item,
          ),
        };
      }

      return {
        items: [
          ...state.items,
          { ...action.payload.product, quantity: action.payload.quantity },
        ],
      };
    }
    case 'REMOVE_ITEM':
      return {
        items: state.items.filter((item) => item.id !== action.payload.productId),
      };
    case 'CLEAR_CART':
      return initialState;
    default:
      return state;
  }
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

function parseCart(value: string | null): CartState {
  if (!value) {
    return initialState;
  }

  try {
    const parsed = JSON.parse(value) as CartState;
    const items = Array.isArray(parsed.items) ? parsed.items : [];

    return { items };
  } catch {
    return initialState;
  }
}

export function CartProvider({ children }: PropsWithChildren) {
  const [cart, dispatch] = useReducer(cartReducer, initialState);

  useEffect(() => {
    const storedCart = parseCart(window.localStorage.getItem(STORAGE_KEY));
    dispatch({ type: 'HYDRATE', payload: storedCart });
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  const value = useMemo<CartContextValue>(
    () => ({
      cart,
      addItem: (product: Product, quantity = 1) => {
        if (quantity <= 0) {
          return;
        }

        dispatch({ type: 'ADD_ITEM', payload: { product, quantity } });
      },
      removeItem: (productId: string) => {
        dispatch({ type: 'REMOVE_ITEM', payload: { productId } });
      },
      clearCart: () => {
        dispatch({ type: 'CLEAR_CART' });
      },
      getTotalItems: () =>
        cart.items.reduce((total, item) => total + item.quantity, 0),
      getTotalPrice: () =>
        cart.items.reduce(
          (total, item) => total + item.price * item.quantity,
          0,
        ),
      isInCart: (productId: string) =>
        cart.items.some((item) => item.id === productId),
    }),
    [cart],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error('useCart debe usarse dentro de CartProvider');
  }

  return context;
}

export function getCartLineTotal(item: CartItem) {
  return item.price * item.quantity;
}
