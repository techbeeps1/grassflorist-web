import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CartItem, CartState } from '@/types/cart';
import { siteConfig } from '@/config/site';

const CART_STORAGE_KEY = 'florelle_cart_v1';

function loadInitialState(): CartState {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Fall back to default
    }
  }
  return {
    items: [],
    discountAmount: 0,
    selectedCity: 'riyadh',
  };
}

function persistState(state: CartState) {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage error
    }
  }
}

const initialState: CartState = loadInitialState();

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem: (state, action: PayloadAction<CartItem>) => {
      const existingIndex = state.items.findIndex(
        (item) => item.cartItemId === action.payload.cartItemId
      );

      if (existingIndex >= 0) {
        state.items[existingIndex].quantity += action.payload.quantity;
        state.items[existingIndex].itemTotal =
          state.items[existingIndex].product.price * state.items[existingIndex].quantity +
          (state.items[existingIndex].addons?.vase?.price || 0) +
          (state.items[existingIndex].addons?.chocolates?.price || 0);
      } else {
        state.items.push(action.payload);
      }
      persistState(state);
    },

    removeItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.cartItemId !== action.payload);
      persistState(state);
    },

    updateQuantity: (
      state,
      action: PayloadAction<{ cartItemId: string; quantity: number }>
    ) => {
      const item = state.items.find((i) => i.cartItemId === action.payload.cartItemId);
      if (item) {
        if (action.payload.quantity <= 0) {
          state.items = state.items.filter((i) => i.cartItemId !== action.payload.cartItemId);
        } else {
          item.quantity = action.payload.quantity;
          item.itemTotal =
            item.product.price * item.quantity +
            (item.addons?.vase?.price || 0) +
            (item.addons?.chocolates?.price || 0);
        }
      }
      persistState(state);
    },

    applyCoupon: (state, action: PayloadAction<string>) => {
      const code = action.payload.toUpperCase().trim();
      if (code === 'FLORELLE10' || code === 'WELCOME10') {
        state.couponCode = code;
        const subtotal = state.items.reduce((acc, item) => acc + item.itemTotal, 0);
        state.discountAmount = Math.round(subtotal * 0.1);
      } else {
        state.discountAmount = 0;
        state.couponCode = undefined;
      }
      persistState(state);
    },

    removeCoupon: (state) => {
      state.couponCode = undefined;
      state.discountAmount = 0;
      persistState(state);
    },

    setSelectedCity: (state, action: PayloadAction<string>) => {
      state.selectedCity = action.payload;
      persistState(state);
    },

    setDeliverySlot: (
      state,
      action: PayloadAction<{ date: string; slot: 'morning' | 'afternoon' | 'evening' }>
    ) => {
      state.deliverySlot = action.payload;
      persistState(state);
    },

    clearCart: (state) => {
      state.items = [];
      state.couponCode = undefined;
      state.discountAmount = 0;
      persistState(state);
    },
  },
});

export const {
  addItem,
  removeItem,
  updateQuantity,
  applyCoupon,
  removeCoupon,
  setSelectedCity,
  setDeliverySlot,
  clearCart,
} = cartSlice.actions;

// Helper selectors
export const selectCartSubtotal = (state: { cart: CartState }): number =>
  state.cart.items.reduce((sum, item) => sum + item.itemTotal, 0);

export const selectCartItemsCount = (state: { cart: CartState }): number =>
  state.cart.items.reduce((count, item) => count + item.quantity, 0);

export const selectFreeShippingProgress = (state: { cart: CartState }) => {
  const subtotal = selectCartSubtotal(state);
  const threshold = siteConfig.features.freeShippingThreshold;
  const remaining = Math.max(0, threshold - subtotal);
  const percentage = Math.min(100, Math.round((subtotal / threshold) * 100));
  const isFree = subtotal >= threshold;

  return { remaining, percentage, isFree, threshold };
};

export const selectCartTotals = (state: { cart: CartState }) => {
  const subtotal = selectCartSubtotal(state);
  const { isFree } = selectFreeShippingProgress(state);
  const shippingFee = isFree ? 0 : siteConfig.features.expressDeliveryFee;
  const discount = state.cart.discountAmount;
  const discountedSubtotal = Math.max(0, subtotal - discount);
  const vat = Math.round(discountedSubtotal * siteConfig.features.vatRate);
  const total = discountedSubtotal + shippingFee;

  return { subtotal, discount, vat, shippingFee, total };
};

export default cartSlice.reducer;
