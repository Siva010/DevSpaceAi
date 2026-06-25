import { configureStore, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

// ── Auth Slice ──────────────────────────────────────────────────────────────
interface AuthUser {
  id: string;
  email: string;
  fullName: string | null;
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
}

const savedUser = localStorage.getItem('auth_user');

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: null, // Keep for type compat but no longer used
    user: savedUser ? JSON.parse(savedUser) : null,
  } as AuthState,
  reducers: {
    setAuth: (state, action: PayloadAction<{ token?: string; user: AuthUser }>) => {
      state.token = action.payload.token || null;
      state.user = action.payload.user;
      localStorage.setItem('auth_user', JSON.stringify(action.payload.user));
    },
    clearAuth: (state) => {
      state.token = null;
      state.user = null;
      localStorage.removeItem('auth_user');
    },
    setUser: (state, action: PayloadAction<AuthUser>) => {
      state.user = action.payload;
    },
  },
});

export const { setAuth, clearAuth, setUser } = authSlice.actions;

// ── UI Slice ─────────────────────────────────────────────────────────────────
const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    sidebarCollapsed: false,
    theme: 'dark' as 'dark' | 'light',
  },
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
  },
});

export const { toggleSidebar, setTheme } = uiSlice.actions;

// ── Store ────────────────────────────────────────────────────────────────────
export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    ui: uiSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
