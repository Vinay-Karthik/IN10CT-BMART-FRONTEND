import axiosInstance from './axiosInstance';

export const adminApi = {
  // Users (Phase 8)
  getUsers: (page = 0, size = 20) => axiosInstance.get('/admin/users', { params: { page, size } }),
  suspendUser: (id, reason) => axiosInstance.put(`/admin/users/${id}/suspend`, { reason }),
  banUser: (id, reason) => axiosInstance.put(`/admin/users/${id}/ban`, { reason }),
  changeRole: (id, role) => axiosInstance.put(`/admin/users/${id}/role`, { role }),

  // Products & Categories (Phase 9)
  getPendingProducts: () => axiosInstance.get('/admin/products/pending'),
  approveProduct: (id) => axiosInstance.put(`/admin/products/${id}/approve`),
  banProduct: (id, reason) => axiosInstance.put(`/admin/products/${id}/ban`, { reason }),
  createCategory: (data) => axiosInstance.post('/admin/categories', data),

  // Sellers (Phase 8 & 11)
  getPendingSellers: () => axiosInstance.get('/admin/sellers/pending'),
  approveSeller: (id) => axiosInstance.put(`/admin/sellers/${id}/approve`),
  rejectSeller: (id, reason) => axiosInstance.put(`/admin/sellers/${id}/reject`, { reason }),
  setSellerCommission: (id, commissionRate) => axiosInstance.put(`/admin/sellers/${id}/commission`, { commissionRate }),

  // Financials & Payouts (Phase 11)
  getPendingPayouts: () => axiosInstance.get('/admin/payouts/pending'),
  approvePayout: (id, note) => axiosInstance.put(`/admin/payouts/${id}/approve`, { note }),

  // Orders & Refunds (Phase 10)
  getAllOrders: (page = 0, size = 20) => axiosInstance.get('/admin/orders', { params: { page, size } }),
  processRefund: (id, reason) => axiosInstance.put(`/admin/orders/${id}/refund`, { reason }),

  // Platform Analytics (Phase 13)
  getSiteAnalytics: () => axiosInstance.get('/admin/analytics/site')
};
