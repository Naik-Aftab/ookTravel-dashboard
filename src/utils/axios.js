import axios from 'axios';
import { store }         from '@/store';
import { updateTokens, logout } from '@/store/authSlice';

// Backend origin, e.g. http://localhost:5000 in dev or https://api.ooktravel.in in prod —
// set per-environment in .env / .env.production as VITE_API_TARGET.
export const apiOrigin = import.meta.env.VITE_API_TARGET || '';

// Uploaded file links (KYC docs, profile photos, invoices, etc.) come back from the API as
// paths relative to the backend's own root (e.g. /uploads/kyc/xxx.pdf), not under /api — so
// they need to be resolved against apiOrigin the same way the API calls are.
export function assetUrl(path) {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  return `${apiOrigin}${path}`;
}

const api = axios.create({
  baseURL: `${apiOrigin}/api`,
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
        const { data } = await axios.post(`${apiOrigin}/api/auth/refresh`, { refreshToken });
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
