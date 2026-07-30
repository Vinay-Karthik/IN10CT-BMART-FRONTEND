import { createSlice } from '@reduxjs/toolkit';

const initialToken = localStorage.getItem('bmart_token') || null;
const initialUser = localStorage.getItem('bmart_user') ? JSON.parse(localStorage.getItem('bmart_user')) : null;

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: initialToken,
    user: initialUser,
    isAuthenticated: !!initialToken,
  },
  reducers: {
    setCredentials: (state, action) => {
      const { token, refreshToken, ...user } = action.payload;
      state.token = token;
      state.user = user;
      state.isAuthenticated = true;
      localStorage.setItem('bmart_token', token);
      if (refreshToken) localStorage.setItem('bmart_refresh_token', refreshToken);
      localStorage.setItem('bmart_user', JSON.stringify(user));
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem('bmart_token');
      localStorage.removeItem('bmart_refresh_token');
      localStorage.removeItem('bmart_user');
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem('bmart_user', JSON.stringify(state.user));
    }
  },
});

export const { setCredentials, logout, updateUser } = authSlice.actions;
export default authSlice.reducer;
