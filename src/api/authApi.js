import axiosInstance from './axiosInstance';

export const authApi = {
  register: (data) => axiosInstance.post('/auth/register', data),
  verifyOtp: (data) => axiosInstance.post('/auth/verify-otp', data),
  resendOtp: (target, type) => axiosInstance.post(`/auth/resend-otp?target=${target}&type=${type || ''}`),
  login: (data) => axiosInstance.post('/auth/login', data),
  requestOtpLogin: (target) => axiosInstance.post(`/auth/otp-login/request?target=${target}`),
  verifyOtpLogin: (data) => axiosInstance.post('/auth/otp-login/verify', data),
  forgotPassword: (data) => axiosInstance.post('/auth/forgot-password', data),
  resetPassword: (data) => axiosInstance.post('/auth/reset-password', data),
  logout: () => axiosInstance.post('/auth/logout'),
};
