import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User, AuthResponse } from '@/types/user';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const getStoredAuth = (): { user: User | null; token: string | null } => {
  if (typeof window === 'undefined') {
    return { user: null, token: null };
  }
  try {
    const token = localStorage.getItem('grass_auth_token');
    const storedUser = localStorage.getItem('grass_auth_user');
    const user = storedUser ? JSON.parse(storedUser) : null;
    return { user, token };
  } catch {
    return { user: null, token: null };
  }
};

const initialStored = getStoredAuth();

const initialState: AuthState = {
  user: initialStored.user,
  token: initialStored.token,
  isAuthenticated: Boolean(initialStored.token && initialStored.user),
  isLoading: false,
  error: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string; rememberMe?: boolean }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.error = null;
      state.isLoading = false;

      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('grass_auth_token', action.payload.token);
          localStorage.setItem('grass_auth_user', JSON.stringify(action.payload.user));
        } catch {
          // Ignore localStorage errors
        }
      }
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('grass_auth_user', JSON.stringify(state.user));
          } catch {
            // Ignore
          }
        }
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      state.isLoading = false;

      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem('grass_auth_token');
          localStorage.removeItem('grass_auth_user');
        } catch {
          // Ignore
        }
      }
    },
    setAuthLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setAuthError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
  },
});

export const { setCredentials, updateUser, logout, setAuthLoading, setAuthError } =
  authSlice.actions;

export default authSlice.reducer;
