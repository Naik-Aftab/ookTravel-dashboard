import axios from 'axios';
import { store }         from '@/store';
import { updateTokens, logout } from '@/store/authSlice';

const api = axios.create({
  baseURL: '/api',
  timeout: 30_000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(config => {
  const token = store.getState().auth.token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let isRefreshing = false;
let failedQueue  = [];

function processQueue(error, token) {
  failedQueue.forEach(({ resolve, reject }) => error ? reject(error) : resolve(token));
  failedQueue = [];
}

api.interceptors.response.use(
  res => res,
  async err => {
    const original = err.config;
    const isAuthEndpoint = original.url?.includes('/login') || original.url?.includes('/auth/refresh');
    if (err.response?.status === 401 && !original._retry && !isAuthEndpoint) {
      original._retry = true;
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: token => { original.headers.Authorization = `Bearer ${token}`; resolve(api(original)); },
            reject,
          });
        });
      }
      isRefreshing = true;
      try {
        const refreshToken = store.getState().auth.refreshToken;
        const { data } = await axios.post('/api/auth/refresh', { refreshToken });
        store.dispatch(updateTokens(data.data));
        processQueue(null, data.data.accessToken);
        original.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return api(original);
      } catch (e) {
        processQueue(e, null);
        store.dispatch(logout());
        window.location.href = '/login';
        return Promise.reject(e);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(err);
  }
);

export default api;
