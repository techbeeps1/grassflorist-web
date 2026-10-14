import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Product } from '@/types/product';
import { logout } from './authSlice';

export interface WishlistState {
  items: Product[];
  ids: number[];
  isLoaded: boolean;
}

// Clean up legacy localStorage wishlist keys to strictly enforce live API management
if (typeof window !== 'undefined') {
  try {
    localStorage.removeItem('grass_florist_wishlist_v1');
    localStorage.removeItem('grass_wishlist');
  } catch {}
}

const initialState: WishlistState = {
  items: [],
  ids: [],
  isLoaded: false,
};

export const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    setWishlist: (state, action: PayloadAction<Product[]>) => {
      state.items = action.payload;
      state.ids = action.payload
        .map((p) => Number(p.id))
        .filter((id) => !isNaN(id) && id > 0);
      state.isLoaded = true;
    },
    setWishlistIds: (state, action: PayloadAction<number[]>) => {
      state.ids = action.payload;
      state.isLoaded = true;
    },
    addItemToWishlist: (state, action: PayloadAction<Product>) => {
      const numericId = Number(action.payload.id);
      if (!isNaN(numericId) && !state.ids.includes(numericId)) {
        state.ids.push(numericId);
      }
      if (!state.items.some((item) => String(item.id) === String(action.payload.id))) {
        state.items.push(action.payload);
      }
    },
    removeItemFromWishlist: (state, action: PayloadAction<string | number>) => {
      const numericId = Number(action.payload);
      state.ids = state.ids.filter((id) => id !== numericId);
      state.items = state.items.filter((item) => String(item.id) !== String(action.payload));
    },
    // Backward compatibility with previous toggleWishlist action if needed
    toggleWishlist: (state, action: PayloadAction<Product>) => {
      const numericId = Number(action.payload.id);
      const exists = state.ids.includes(numericId) || state.items.some((item) => String(item.id) === String(action.payload.id));
      if (exists) {
        state.ids = state.ids.filter((id) => id !== numericId);
        state.items = state.items.filter((item) => String(item.id) !== String(action.payload.id));
      } else {
        if (!isNaN(numericId)) state.ids.push(numericId);
        state.items.push(action.payload);
      }
    },
    removeFromWishlist: (state, action: PayloadAction<string | number>) => {
      const numericId = Number(action.payload);
      state.ids = state.ids.filter((id) => id !== numericId);
      state.items = state.items.filter((item) => String(item.id) !== String(action.payload));
    },
    clearWishlist: (state) => {
      state.items = [];
      state.ids = [];
      state.isLoaded = false;
    },
  },
  extraReducers: (builder) => {
    // When user logs out, immediately clear all wishlist data from memory
    builder.addCase(logout, (state) => {
      state.items = [];
      state.ids = [];
      state.isLoaded = false;
    });
  },
});

export const {
  setWishlist,
  setWishlistIds,
  addItemToWishlist,
  removeItemFromWishlist,
  toggleWishlist,
  removeFromWishlist,
  clearWishlist,
} = wishlistSlice.actions;

export const selectIsInWishlist = (state: { wishlist: WishlistState }, productId: string | number) => {
  const numId = Number(productId);
  return (
    state.wishlist.ids.includes(numId) ||
    state.wishlist.items.some((item) => String(item.id) === String(productId))
  );
};

export const selectWishlistCount = (state: { wishlist: WishlistState }) => {
  return state.wishlist.ids.length > 0 ? state.wishlist.ids.length : state.wishlist.items.length;
};

export const selectWishlistItems = (state: { wishlist: WishlistState }) => state.wishlist.items;

export default wishlistSlice.reducer;
