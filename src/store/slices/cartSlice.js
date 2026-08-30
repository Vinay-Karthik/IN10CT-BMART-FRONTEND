import { createSlice } from '@reduxjs/toolkit';

const getInitialGuestCart = () => {
  try {
    const saved = localStorage.getItem('bmart_guest_cart');
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    return [];
  }
};

const initialItems = getInitialGuestCart();
const initialCount = initialItems.reduce((acc, i) => acc + (i.quantity || 1), 0);
const initialAmount = initialItems.reduce((acc, i) => acc + ((i.product?.price || 0) * (i.quantity || 1)), 0);

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: initialItems,
    totalCount: initialCount,
    totalAmount: initialAmount,
  },
  reducers: {
    setCart: (state, action) => {
      const cart = action.payload || {};
      const cartItems = cart.cartItems || (Array.isArray(cart) ? cart : []);
      state.items = cartItems;
      state.totalCount = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);
      state.totalAmount = cartItems.reduce((acc, item) => {
        const price = item.product?.price || 0;
        return acc + (price * (item.quantity || 1));
      }, 0);
    },
    addToCartLocal: (state, action) => {
      const { product, quantity = 1 } = action.payload;
      if (!product || !product.productId) return;

      const existingIndex = state.items.findIndex(
        (i) => (i.product?.productId || i.productId) === product.productId
      );

      if (existingIndex > -1) {
        state.items[existingIndex].quantity += quantity;
      } else {
        state.items.push({
          id: 'guest_' + product.productId + '_' + Date.now(),
          product: product,
          quantity: quantity,
        });
      }

      state.totalCount = state.items.reduce((acc, item) => acc + item.quantity, 0);
      state.totalAmount = state.items.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);

      try {
        localStorage.setItem('bmart_guest_cart', JSON.stringify(state.items));
      } catch (e) {}
    },
    updateQuantityLocal: (state, action) => {
      const { itemId, quantity } = action.payload;
      if (quantity <= 0) {
        state.items = state.items.filter((i) => (i.id || i.cartItemId) !== itemId);
      } else {
        const item = state.items.find((i) => (i.id || i.cartItemId) === itemId);
        if (item) item.quantity = quantity;
      }

      state.totalCount = state.items.reduce((acc, item) => acc + item.quantity, 0);
      state.totalAmount = state.items.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);

      try {
        localStorage.setItem('bmart_guest_cart', JSON.stringify(state.items));
      } catch (e) {}
    },
    removeFromCartLocal: (state, action) => {
      const itemId = action.payload;
      state.items = state.items.filter((i) => (i.id || i.cartItemId) !== itemId);
      state.totalCount = state.items.reduce((acc, item) => acc + item.quantity, 0);
      state.totalAmount = state.items.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);

      try {
        localStorage.setItem('bmart_guest_cart', JSON.stringify(state.items));
      } catch (e) {}
    },
    clearCartState: (state) => {
      state.items = [];
      state.totalCount = 0;
      state.totalAmount = 0;
      try {
        localStorage.removeItem('bmart_guest_cart');
      } catch (e) {}
    },
  },
});

export const { setCart, addToCartLocal, updateQuantityLocal, removeFromCartLocal, clearCartState } = cartSlice.actions;
export default cartSlice.reducer;
