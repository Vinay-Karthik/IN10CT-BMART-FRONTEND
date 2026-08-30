import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    let token = localStorage.getItem('bmart_token');
    if (config.url && config.url.includes('/admin')) {
      token = localStorage.getItem('admin_token') || localStorage.getItem('bmart_token');
    }
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('bmart_token');
      localStorage.removeItem('bmart_user');
      window.dispatchEvent(new Event('bmart_unauthorized'));
    }
    const errData = error.response ? error.response.data : error;
    return Promise.reject(errData || { message: 'An unexpected error occurred' });
  }
);

export default axiosInstance;
