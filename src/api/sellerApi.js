import axiosInstance from './axiosInstance';

export const sellerApi = {
  // Seller Application & Profile (Phase 1 & 4)
  applySeller: (data) => axiosInstance.post('/seller/apply', data),
  getSellerProfile: () => axiosInstance.get('/seller/profile'),
  updateStore: (data) => axiosInstance.put('/seller/store', data),
  getPublicStore: (slug) => axiosInstance.get(`/store/${slug}`),

  // Product Management (Phase 2)
  getSellerProducts: (status) => axiosInstance.get('/seller/products', { params: { status } }),
  createProduct: (data) => axiosInstance.post('/seller/products', data),
  updateProduct: (id, data) => axiosInstance.put(`/seller/products/${id}`, data),
  deleteProduct: (id) => axiosInstance.delete(`/seller/products/${id}`),
  updateStock: (id, stock) => axiosInstance.put(`/seller/products/${id}/stock`, { stock }),
  updatePrice: (id, priceData) => axiosInstance.put(`/seller/products/${id}/price`, priceData),
  uploadImage: (id, imageUrl) => axiosInstance.post(`/seller/products/${id}/images`, { imageUrl }),

  // Order Management (Phase 3)
  getSellerOrders: () => axiosInstance.get('/seller/orders'),
  updateOrderStatus: (id, status) => axiosInstance.put(`/seller/orders/${id}/status`, { status }),
  initiateReturn: (id, reason) => axiosInstance.post(`/seller/orders/${id}/return`, { reason }),
  getInvoice: (id) => axiosInstance.get(`/seller/orders/${id}/invoice`),

  // Financials & Payouts (Phase 5)
  getEarnings: () => axiosInstance.get('/seller/earnings'),
  requestPayout: (amount, bankDetails) => axiosInstance.post('/seller/payouts/request', { amount: String(amount), bankDetails }),
  getPayouts: () => axiosInstance.get('/seller/payouts'),

  // Customer Interactions & Reviews (Phase 6)
  getReviews: () => axiosInstance.get('/seller/reviews'),
  replyReview: (id, replyComment) => axiosInstance.post(`/seller/reviews/${id}/reply`, { replyComment }),

  // Analytics (Phase 7)
  getAnalyticsOverview: () => axiosInstance.get('/seller/analytics/overview'),
  getTopProducts: () => axiosInstance.get('/seller/analytics/top-products'),

  // Admin Operations (Phase 8 - 14)
  getPendingSellers: () => axiosInstance.get('/admin/sellers/pending'),
  approveSeller: (id) => axiosInstance.put(`/admin/sellers/${id}/approve`),
  rejectSeller: (id, reason) => axiosInstance.put(`/admin/sellers/${id}/reject`, { reason })
};
