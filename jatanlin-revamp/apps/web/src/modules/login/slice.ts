import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { LicenseCheck, User } from './types';

export interface LoginState {
  user: User | null;
  token: string | null;
  licenseChecked: LicenseCheck | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: LoginState = {
  user: null,
  token: null,
  licenseChecked: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

const loginSlice = createSlice({
  name: 'login',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.error = null;
    },
    setToken: (state, action: PayloadAction<string | null>) => {
      state.token = action.payload;
    },
    setLicenseChecked: (state, action: PayloadAction<LicenseCheck | null>) => {
      state.licenseChecked = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.licenseChecked = null;
      state.isAuthenticated = false;
      state.error = null;
    },
  },
});

export const { setLoading, setError, clearError, setUser, setToken, setLicenseChecked, logout } = loginSlice.actions;
export default loginSlice.reducer;
