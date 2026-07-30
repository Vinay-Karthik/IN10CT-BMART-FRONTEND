import axiosInstance from './axiosInstance';

export const cartApi = {
  getCart: () => axiosInstance.get('/cart'),
  addToCart: (productId, quantity = 1) => axiosInstance.post('/cart/add', { productId, quantity }),
  updateQuantity: (itemId, quantity) => axiosInstance.put(`/cart/items/${itemId}?quantity=${quantity}`),
  removeItem: (itemId) => axiosInstance.delete(`/cart/items/${itemId}`),
  clearCart: () => axiosInstance.delete('/cart/clear'),
};

export const orderApi = {
  createOrder: (shippingAddress) => axiosInstance.post('/orders', { shippingAddress }),
  getUserOrders: () => axiosInstance.get('/orders'),
  getOrderById: (id) => axiosInstance.get(`/orders/${id}`),
  verifyPayment: (data) => axiosInstance.post('/payments/verify', data),
};

export const userApi = {
  getProfile: () => axiosInstance.get('/users/profile'),
  updateProfile: (data) => axiosInstance.put('/users/profile', data),
  changePassword: (data) => axiosInstance.post('/users/change-password', data),
};

export const wishlistApi = {
  getWishlist: () => axiosInstance.get('/wishlist'),
  toggleWishlist: (productId) => axiosInstance.post(`/wishlist/toggle/${productId}`),
  checkWishlist: (productId) => axiosInstance.get(`/wishlist/check/${productId}`),
};

export const reviewApi = {
  addReview: (data) => axiosInstance.post('/reviews', data),
  getProductReviews: (productId) => axiosInstance.get(`/reviews/product/${productId}`),
};

export const notificationApi = {
  getNotifications: () => axiosInstance.get('/notifications'),
  markAsRead: (id) => axiosInstance.put(`/notifications/${id}/read`),
  getUnreadCount: () => axiosInstance.get('/notifications/unread-count'),
};

export const categoryApi = {
  getAllCategories: () => axiosInstance.get('/categories'),
  getCategoryById: (id) => axiosInstance.get(`/categories/${id}`),
};

export const productApi = {
  getProducts: (params) => axiosInstance.get('/products', { params }),
  getProductById: (id) => axiosInstance.get(`/products/${id}`),
};
