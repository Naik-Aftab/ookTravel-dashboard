import api from '@/utils/axios';
import { buildQueryString } from '@/utils/helpers';

export const rmsApi = {
  getAll:        (params = {}) => api.get(`/rms?${buildQueryString(params)}`),
  getOne:        (id)          => api.get(`/rms/${id}`),
  approve:       (id)          => api.post(`/rms/${id}/approve`),
  suspend:       (id)          => api.post(`/rms/${id}/suspend`),
  activate:      (id)          => api.post(`/rms/${id}/activate`),
  update:        (id, data)    => api.put(`/rms/${id}`, data),
  resetPassword: (id, data)    => api.post(`/rms/${id}/reset-password`, data),
  delete:        (id)          => api.delete(`/rms/${id}`),
};
