import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Product } from '@/types/product';

export type SupportedCurrency = 'SAR' | 'USD';

export interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

export interface UIState {
  isCartDrawerOpen: boolean;
  isMobileMenuOpen: boolean;
  isSearchModalOpen: boolean;
  isCityModalOpen: boolean;
  activeCity: string;
  activeCurrency: SupportedCurrency;
  quickViewProduct: Product | null;
  toasts: ToastNotification[];
}

const initialState: UIState = {
  isCartDrawerOpen: false,
  isMobileMenuOpen: false,
  isSearchModalOpen: false,
  isCityModalOpen: false,
  activeCity: 'jeddah',
  activeCurrency: 'SAR',
  quickViewProduct: null,
  toasts: [],
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setCartDrawerOpen: (state, action: PayloadAction<boolean>) => {
      state.isCartDrawerOpen = action.payload;
    },
    setMobileMenuOpen: (state, action: PayloadAction<boolean>) => {
      state.isMobileMenuOpen = action.payload;
    },
    setSearchModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isSearchModalOpen = action.payload;
    },
    setCityModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isCityModalOpen = action.payload;
    },
    setActiveCity: (state, action: PayloadAction<string>) => {
      state.activeCity = action.payload;
    },
    setActiveCurrency: (state, action: PayloadAction<SupportedCurrency>) => {
      state.activeCurrency = action.payload;
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('grass_active_currency', action.payload);
        } catch { }
      }
    },
    setQuickViewProduct: (state, action: PayloadAction<Product | null>) => {
      state.quickViewProduct = action.payload;
    },
    addToast: (state, action: PayloadAction<Omit<ToastNotification, 'id'>>) => {
      const id = Date.now().toString();
      state.toasts.push({ ...action.payload, id });
    },
    removeToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },
  },
});

export const {
  setCartDrawerOpen,
  setMobileMenuOpen,
  setSearchModalOpen,
  setCityModalOpen,
  setActiveCity,
  setActiveCurrency,
  setQuickViewProduct,
  addToast,
  removeToast,
} = uiSlice.actions;

export default uiSlice.reducer;
