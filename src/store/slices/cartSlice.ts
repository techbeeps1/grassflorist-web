import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CartItem, CartState } from '@/types/cart';
import { Product } from '@/types/product';
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
            isAdding: false,
            pendingAddItem: null,
            updatingItemIds: {},
            removingItemIds: {},
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
    isAdding: false,
    pendingAddItem: null,
    updatingItemIds: {},
    removingItemIds: {},
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

      // Clean transient loading flags before saving to storage
      const { isAdding, pendingAddItem, updatingItemIds, removingItemIds, ...persisted } = state;

      // Always save to base storage
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(persisted));

      // Save to isolated key for cross-tab storage-event sync
      const scopedKey = userId ? `grass_cart_user_${userId}` : `grass_cart_guest_${sessionId}`;
      localStorage.setItem(scopedKey, JSON.stringify(persisted));

      // Whenever cart is updated (items added, removed, changed), clear any stale checkout draft order
      try {
        sessionStorage.removeItem('grass_draft_order_number');
      } catch {}

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

      const isSub = Boolean(action.payload.isSubscription);
      const subFreq = action.payload.subscriptionConfig?.frequency;

      const existingIndex = state.items.findIndex(
        (item) =>
          item.cartItemId === action.payload.cartItemId ||
          (String(item.productId) === String(action.payload.productId) &&
            Boolean(item.isSubscription) === isSub &&
            (!isSub || item.subscriptionConfig?.frequency === subFreq))
      );

      const effectiveUnitPrice = action.payload.itemTotal && action.payload.quantity
        ? action.payload.itemTotal / action.payload.quantity
        : action.payload.product.price;

      if (existingIndex >= 0) {
        const currentQty = state.items[existingIndex].quantity;
        const newQty = Math.min(maxStock, currentQty + action.payload.quantity);
        state.items[existingIndex].quantity = newQty;
        const currentUnit = currentQty > 0 ? (state.items[existingIndex].itemTotal / currentQty) : effectiveUnitPrice;
        state.items[existingIndex].itemTotal =
          currentUnit * newQty +
          (state.items[existingIndex].addons?.vase?.price || 0) +
          (state.items[existingIndex].addons?.chocolates?.price || 0);
      } else {
        const safeQty = Math.min(maxStock, action.payload.quantity);
        state.items.push({
          ...action.payload,
          cartItemId: action.payload.cartItemId || (isSub ? `${action.payload.productId}-sub-${subFreq}` : String(action.payload.productId)),
          quantity: safeQty,
          itemTotal: effectiveUnitPrice * safeQty,
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
          cartItemId: it.cartItemId || String(it.productId),
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

    removeItem: (
      state,
      action: PayloadAction<string | { productId?: string | number; cartItemId?: string }>
    ) => {
      const payload = action.payload;
      const targetId = typeof payload === 'string' ? payload : payload.cartItemId;
      const targetPid = typeof payload === 'object' && payload.productId ? String(payload.productId) : null;

      state.items = state.items.filter((item) => {
        if (targetId && item.cartItemId === targetId) return false;
        if (targetPid && String(item.productId) === targetPid) return false;
        if (typeof payload === 'string' && String(item.productId) === payload) return false;
        return true;
      });
      persistState(state);
    },

    updateQuantity: (
      state,
      action: PayloadAction<{ productId?: string | number; cartItemId?: string; quantity: number }>
    ) => {
      const { productId, cartItemId, quantity } = action.payload;
      const item = state.items.find(
        (i) =>
          (cartItemId && i.cartItemId === cartItemId) ||
          (productId && String(i.productId) === String(productId))
      );
      if (item) {
        if (quantity <= 0) {
          state.items = state.items.filter(
            (i) =>
              (!cartItemId || i.cartItemId !== cartItemId) &&
              (!productId || String(i.productId) !== String(productId))
          );
        } else {
          const maxStock = item.product.stock ?? 99;
          const safeQty = Math.min(maxStock, quantity);
          item.quantity = safeQty;
          item.itemTotal =
            item.product.price * item.quantity +
            (item.addons?.vase?.price || 0) +
            (item.addons?.chocolates?.price || 0);
        }
      }
      persistState(state);
    },

    setAppliedCoupon: (
      state,
      action: PayloadAction<{
        code: string;
        type?: 'percent' | 'fixed' | string;
        value: number;
        maxDiscountAmount?: number;
      }>
    ) => {
      const { code, type, value, maxDiscountAmount } = action.payload;
      state.couponCode = code.toUpperCase().trim();
      const subtotal = state.items.reduce((acc, item) => acc + item.itemTotal, 0);
      let disc = 0;
      if (type === 'percent') {
        disc = (subtotal * value) / 100;
        if (maxDiscountAmount && maxDiscountAmount > 0) {
          disc = Math.min(disc, maxDiscountAmount);
        }
      } else {
        disc = value;
      }
      state.discountAmount = Math.min(Math.round(disc * 100) / 100, subtotal);
      persistState(state);
    },

    applyCoupon: (state, action: PayloadAction<string>) => {
      const code = action.payload.toUpperCase().trim();
      if (code === 'GRASS10' || code === 'WELCOME10') {
        state.couponCode = code;
        const subtotal = state.items.reduce((acc, item) => acc + item.itemTotal, 0);
        state.discountAmount = Math.round(subtotal * 0.1);
      } else {
        state.couponCode = code;
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
      state.isAdding = false;
      state.pendingAddItem = null;
      state.updatingItemIds = {};
      state.removingItemIds = {};
      persistState(state);
    },

    setPendingAdd: (
      state,
      action: PayloadAction<{ productId: string; product: Product; quantity: number } | null>
    ) => {
      state.isAdding = Boolean(action.payload);
      state.pendingAddItem = action.payload;
    },

    setItemLoading: (
      state,
      action: PayloadAction<{ id: string; type: 'updating' | 'removing'; isLoading: boolean }>
    ) => {
      if (!state.updatingItemIds) state.updatingItemIds = {};
      if (!state.removingItemIds) state.removingItemIds = {};

      const { id, type, isLoading } = action.payload;
      if (type === 'updating') {
        if (isLoading) {
          state.updatingItemIds[id] = true;
        } else {
          delete state.updatingItemIds[id];
        }
      } else if (type === 'removing') {
        if (isLoading) {
          state.removingItemIds[id] = true;
        } else {
          delete state.removingItemIds[id];
        }
      }
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
  setAppliedCoupon,
  removeCoupon,
  setSelectedCity,
  setDeliverySlot,
  clearCart,
  setPendingAdd,
  setItemLoading,
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
  const vat = Number((discountedSubtotal * siteConfig.features.vatRate).toFixed(2));
  const total = Number((discountedSubtotal + vat + shippingFee).toFixed(2));

  return { subtotal, discount, vat, shippingFee, total };
};

export default cartSlice.reducer;
