import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CartItem, CartState } from '@/types/cart';
import { siteConfig } from '@/config/site';

const CART_STORAGE_KEY = 'grass_florist_cart_v1';

function loadInitialState(): CartState {
  if (typeof window !== 'undefined') {
    try {
      const authUser = localStorage.getItem('grass_auth_user');
      let userId: number | string | null = null;
      if (authUser) {
        try {
          userId = JSON.parse(authUser)?.id ?? null;
        } catch {}
      }
      const sessionId = localStorage.getItem('grass_session_id');

      let stored: string | null = null;
      if (userId) {
        stored = localStorage.getItem(`grass_cart_user_${userId}`);
      } else if (sessionId) {
        stored = localStorage.getItem(`grass_cart_guest_${sessionId}`);
      }

      if (!stored) {
        stored = localStorage.getItem(CART_STORAGE_KEY);
      }

      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && Array.isArray(parsed.items)) {
          return {
            items: parsed.items,
            discountAmount: parsed.discountAmount || 0,
            couponCode: parsed.couponCode,
            selectedCity: parsed.selectedCity || 'riyadh',
          };
        }
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
      const authUser = localStorage.getItem('grass_auth_user');
      let userId: number | string | null = null;
      if (authUser) {
        try {
          userId = JSON.parse(authUser)?.id ?? null;
        } catch {}
      }
      const sessionId = localStorage.getItem('grass_session_id') || 'guest';

      // Always save to base storage
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state));

      // Save to isolated key for cross-tab storage-event sync
      const scopedKey = userId ? `grass_cart_user_${userId}` : `grass_cart_guest_${sessionId}`;
      localStorage.setItem(scopedKey, JSON.stringify(state));

      // Broadcast instantly to all other open tabs / windows in this browser with strict identity tags
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('grass_cart_channel');
        bc.postMessage({
          type: 'CART_UPDATED',
          state,
          userId,
          sessionId,
        });
        bc.close();
      }
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
      const maxStock = action.payload.product.stock ?? 99;
      if (maxStock <= 0) return; // Out of stock

      const existingIndex = state.items.findIndex(
        (item) => item.cartItemId === action.payload.cartItemId
      );

      if (existingIndex >= 0) {
        const currentQty = state.items[existingIndex].quantity;
        const newQty = Math.min(maxStock, currentQty + action.payload.quantity);
        state.items[existingIndex].quantity = newQty;
        state.items[existingIndex].itemTotal =
          state.items[existingIndex].product.price * newQty +
          (state.items[existingIndex].addons?.vase?.price || 0) +
          (state.items[existingIndex].addons?.chocolates?.price || 0);
      } else {
        const safeQty = Math.min(maxStock, action.payload.quantity);
        state.items.push({
          ...action.payload,
          quantity: safeQty,
          itemTotal: action.payload.product.price * safeQty,
        });
      }
      persistState(state);
    },

    syncWithServerCart: (state, action: PayloadAction<CartItem[]>) => {
      const serverItems = action.payload;
      if (!serverItems || serverItems.length === 0) return;

      const existingMap = new Map<string, CartItem>();
      state.items.forEach((it) => existingMap.set(String(it.productId), it));

      const mergedList: CartItem[] = [];
      const seenIds = new Set<string>();

      serverItems.forEach((sItem) => {
        const pid = String(sItem.productId);
        seenIds.add(pid);
        const local = existingMap.get(pid);
        if (local) {
          const mergedQty = Math.max(local.quantity, sItem.quantity);
          mergedList.push({
            ...sItem,
            product: local.product || sItem.product,
            addons: local.addons || sItem.addons,
            quantity: mergedQty,
            itemTotal: (local.product?.price || sItem.product.price) * mergedQty,
          });
        } else {
          mergedList.push(sItem);
        }
      });

      state.items.forEach((local) => {
        if (!seenIds.has(String(local.productId))) {
          mergedList.push(local);
        }
      });

      state.items = mergedList;
      persistState(state);
    },

    setCartFromServer: (state, action: PayloadAction<CartItem[]>) => {
      state.items = action.payload.map((it) => {
        const maxStock = it.product.stock ?? 99;
        const safeQty = maxStock > 0 ? Math.min(maxStock, it.quantity) : it.quantity;
        return {
          ...it,
          quantity: safeQty,
          itemTotal: it.product.price * safeQty,
        };
      });
      persistState(state);
    },

    replaceCartState: (state, action: PayloadAction<CartState>) => {
      state.items = action.payload.items || [];
      state.discountAmount = action.payload.discountAmount || 0;
      state.couponCode = action.payload.couponCode;
      state.selectedCity = action.payload.selectedCity || 'riyadh';
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
          const maxStock = item.product.stock ?? 99;
          const safeQty = Math.min(maxStock, action.payload.quantity);
          item.quantity = safeQty;
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
      if (code === 'GRASS10' || code === 'WELCOME10') {
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
  syncWithServerCart,
  setCartFromServer,
  replaceCartState,
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
