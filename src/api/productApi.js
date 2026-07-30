import axiosInstance from './axiosInstance';

export const productApi = {
  getCategories: () => axiosInstance.get('/categories'),
  getProducts: (params) => axiosInstance.get('/products', { params }),
  getProductById: (id) => axiosInstance.get(`/products/${id}`),
};
