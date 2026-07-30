import { createSlice } from '@reduxjs/toolkit';

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    totalCount: 0,
    totalAmount: 0,
  },
  reducers: {
    setCart: (state, action) => {
      const cart = action.payload;
      state.items = cart.cartItems || [];
      state.totalCount = state.items.reduce((acc, item) => acc + item.quantity, 0);
      state.totalAmount = state.items.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
    },
    clearCartState: (state) => {
      state.items = [];
      state.totalCount = 0;
      state.totalAmount = 0;
    }
  },
});

export const { setCart, clearCartState } = cartSlice.actions;
export default cartSlice.reducer;
