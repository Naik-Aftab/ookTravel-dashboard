import api from '@/utils/axios';
import { buildQueryString } from '@/utils/helpers';

export const commissionsApi = {
  getStats:          ()          => api.get('/commissions/stats'),
  getMonthlyLedgers: (params={}) => api.get(`/commissions/monthly-ledgers?${buildQueryString(params)}`),
  getAgentLedger:    (agentId)   => api.get(`/commissions/ledgers/${agentId}`),
  getAll:            (params={}) => api.get(`/commissions?${buildQueryString(params)}`),
  updateStatus:      (data)      => api.patch('/commissions/status', data),
};
