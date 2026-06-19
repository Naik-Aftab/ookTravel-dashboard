import api from '@/utils/axios';
import { buildQueryString } from '@/utils/helpers';

export const commissionsApi = {
  getStats:       ()           => api.get('/commissions/stats'),
  getLedgers:     (params={})  => api.get(`/commissions/ledgers?${buildQueryString(params)}`),
  getAgentLedger: (agentId)    => api.get(`/commissions/ledgers/${agentId}`),
  getAll:         (params={})  => api.get(`/commissions?${buildQueryString(params)}`),
  getOne:         (id)         => api.get(`/commissions/${id}`),
  getPayments:    (id)         => api.get(`/commissions/${id}/payments`),
  createPayment:  (formData)   => api.post('/commissions/payments', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
};
