import { createSlice } from '@reduxjs/toolkit';

const stored = (() => {
  try { return JSON.parse(localStorage.getItem('ooktravel_auth') || 'null'); } catch { return null; }
})();

const initialState = {
  user:         stored?.user         || null,
  token:        stored?.token        || null,
  refreshToken: stored?.refreshToken || null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action) {
      const { user, accessToken, refreshToken } = action.payload;
      state.user         = user;
      state.token        = accessToken;
      state.refreshToken = refreshToken;
      localStorage.setItem('ooktravel_auth', JSON.stringify({ user, token: accessToken, refreshToken }));
    },
    updateTokens(state, action) {
      state.token        = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      const stored = JSON.parse(localStorage.getItem('ooktravel_auth') || '{}');
      localStorage.setItem('ooktravel_auth', JSON.stringify({ ...stored, token: action.payload.accessToken, refreshToken: action.payload.refreshToken }));
    },
    logout(state) {
      state.user         = null;
      state.token        = null;
      state.refreshToken = null;
      localStorage.removeItem('ooktravel_auth');
    },
  },
});

export const { setCredentials, updateTokens, logout } = authSlice.actions;
export default authSlice.reducer;
