import axiosInstance from './axiosInstance';

export const adminApi = {
  // Product Management
  addProduct: (data) => axiosInstance.post('/admin/products', data),
  deleteProduct: (id) => axiosInstance.delete(`/admin/products/${id}?confirm=true`),
  getPendingProducts: () => axiosInstance.get('/admin/products/pending'),
  approveProduct: (id) => axiosInstance.put(`/admin/products/${id}/approve`),
  banProduct: (id, reason) => axiosInstance.put(`/admin/products/${id}/ban`, { reason }),
  updateStock: (id, stock) => axiosInstance.put(`/admin/products/${id}/stock`, { stock }),
  createCategory: (data) => axiosInstance.post('/admin/categories', data),

  // User Management
  getUsers: (page = 0, size = 50) => axiosInstance.get('/admin/users', { params: { page, size } }),
  updateUser: (id, data) => axiosInstance.put(`/admin/users/${id}`, data),
  suspendUser: (id, reason) => axiosInstance.put(`/admin/users/${id}/suspend`, { reason }),
  banUser: (id, reason) => axiosInstance.put(`/admin/users/${id}/ban`, { reason }),
  activateUser: (id) => axiosInstance.put(`/admin/users/${id}/activate`),
  changeRole: (id, role) => axiosInstance.put(`/admin/users/${id}/role`, { role }),

  // Business Analytics
  getDailyAnalytics: (date) => axiosInstance.get('/admin/analytics/daily', { params: { date } }),
  getMonthlyAnalytics: (month, year) => axiosInstance.get('/admin/analytics/monthly', { params: { month, year } }),
  getYearlyAnalytics: (year) => axiosInstance.get('/admin/analytics/yearly', { params: { year } }),
  getOverallAnalytics: () => axiosInstance.get('/admin/analytics/overall'),
  getSiteAnalytics: () => axiosInstance.get('/admin/analytics/site'),

  // Sellers & Financials
  getPendingSellers: () => axiosInstance.get('/admin/sellers/pending'),
  approveSeller: (id) => axiosInstance.put(`/admin/sellers/${id}/approve`),
  rejectSeller: (id, reason) => axiosInstance.put(`/admin/sellers/${id}/reject`, { reason }),
  setSellerCommission: (id, commissionRate) => axiosInstance.put(`/admin/sellers/${id}/commission`, { commissionRate }),
  getPendingPayouts: () => axiosInstance.get('/admin/payouts/pending'),
  approvePayout: (id, note) => axiosInstance.put(`/admin/payouts/${id}/approve`, { note }),

  // Orders
  getAllOrders: (page = 0, size = 50) => axiosInstance.get('/admin/orders', { params: { page, size } }),
  processRefund: (id, reason) => axiosInstance.put(`/admin/orders/${id}/refund`, { reason }),
};
