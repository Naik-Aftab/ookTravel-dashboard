import api from '@/utils/axios';

export const authApi = {
  adminLogin:      (data)  => api.post('/auth/admin/login', data),
  rmLogin:         (data)  => api.post('/auth/rm/login', data),
  rmSignup:        (data)  => api.post('/auth/rm/signup', data),
  logout:          ()      => api.post('/auth/logout'),
  forgotPassword:  (email) => api.post('/auth/forgot-password', { email }),
  resetPassword:   (data)  => api.post('/auth/reset-password', data),
  changePassword:  (data)  => api.post('/auth/change-password', data),
  refresh:         (token) => api.post('/auth/refresh', { refreshToken: token }),
};
