import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AuthUserSummary } from '@/types/auth.types';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

export interface AuthState {
  status: AuthStatus;
  user: AuthUserSummary | null;
  permissions: string[];
  roles: string[];
  isSuperAdmin: boolean;
  error: string | null;
}

const initialState: AuthState = {
  status: 'loading',
  user: null,
  permissions: [],
  roles: [],
  isSuperAdmin: false,
  error: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthLoading: (state) => {
      state.status = 'loading';
      state.error = null;
    },
    setSession: (
      state,
      action: PayloadAction<{
        user: AuthUserSummary;
        permissions?: string[];
        isSuperAdmin?: boolean;
      }>
    ) => {
      const { user, permissions, isSuperAdmin } = action.payload;
      state.status = 'authenticated';
      state.user = user;
      state.roles = user.roles || [];
      state.permissions = permissions || user.permissions || [];
      state.isSuperAdmin =
        typeof isSuperAdmin === 'boolean'
          ? isSuperAdmin
          : Boolean(user.isSuperAdmin || state.roles.includes('super-admin') || state.roles.includes('SUPER_ADMIN'));
      state.error = null;
    },
    clearSession: (state) => {
      state.status = 'unauthenticated';
      state.user = null;
      state.permissions = [];
      state.roles = [];
      state.isSuperAdmin = false;
      state.error = null;
    },
    setAuthError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.status = 'unauthenticated';
    },
  },
});

export const { setAuthLoading, setSession, clearSession, setAuthError } = authSlice.actions;
export const authReducer = authSlice.reducer;
