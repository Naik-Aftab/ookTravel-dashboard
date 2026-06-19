import api from '@/utils/axios';
import { buildQueryString } from '@/utils/helpers';

export const policiesApi = {
  getRequests:   (params = {}) => api.get(`/policies/requests?${buildQueryString(params)}`),
  getRequest:    (id)          => api.get(`/policies/requests/${id}`),
  updateStatus:  (id, data)    => api.patch(`/policies/requests/${id}/status`, data),
  issuePolicy:   (id, formData)=> api.post(`/policies/requests/${id}/issue`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getAll:        (params = {}) => api.get(`/policies?${buildQueryString(params)}`),
  getOne:        (id)          => api.get(`/policies/${id}`),
};
