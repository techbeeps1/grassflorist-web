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
    let user = storedUser ? JSON.parse(storedUser) : null;
    if (user && (user.phone === '9876543210' || user.phone === '0500000000')) {
      user.phone = '';
      try {
        localStorage.setItem('grass_auth_user', JSON.stringify(user));
      } catch {}
    }
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
      const u = { ...action.payload.user };
      if (u.phone === '9876543210' || u.phone === '0500000000') {
        u.phone = '';
      }
      state.user = u;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.error = null;
      state.isLoading = false;

      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('grass_auth_token', action.payload.token);
          localStorage.setItem('grass_auth_user', JSON.stringify(u));
        } catch {
          // Ignore localStorage errors
        }
      }
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      state.isAuthenticated = Boolean(action.payload && state.user);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('grass_auth_token', action.payload);
        } catch {
          // Ignore
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
          localStorage.removeItem('grass_florist_cart_v1');
          const newSid = 'sess_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
          localStorage.setItem('grass_session_id', newSid);
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

export const { setCredentials, setToken, updateUser, logout, setAuthLoading, setAuthError } =
  authSlice.actions;

export default authSlice.reducer;
