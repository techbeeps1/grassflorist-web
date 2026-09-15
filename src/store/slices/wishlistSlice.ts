import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Product } from '@/types/product';

const WISHLIST_STORAGE_KEY = 'florelle_wishlist_v1';

export interface WishlistState {
  items: Product[];
}

function loadInitialWishlist(): WishlistState {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Fallback
    }
  }
  return { items: [] };
}

function persistWishlist(state: WishlistState) {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage error
    }
  }
}

const initialState: WishlistState = loadInitialWishlist();

export const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    toggleWishlist: (state, action: PayloadAction<Product>) => {
      const index = state.items.findIndex((item) => item.id === action.payload.id);
      if (index >= 0) {
        state.items.splice(index, 1);
      } else {
        state.items.push(action.payload);
      }
      persistWishlist(state);
    },
    removeFromWishlist: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
      persistWishlist(state);
    },
    clearWishlist: (state) => {
      state.items = [];
      persistWishlist(state);
    },
  },
});

export const { toggleWishlist, removeFromWishlist, clearWishlist } = wishlistSlice.actions;

export const selectIsInWishlist = (state: { wishlist: WishlistState }, productId: string) =>
  state.wishlist.items.some((item) => item.id === productId);

export const selectWishlistCount = (state: { wishlist: WishlistState }) =>
  state.wishlist.items.length;

export default wishlistSlice.reducer;
