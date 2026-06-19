import api from '@/utils/axios';
import { buildQueryString } from '@/utils/helpers';

export const agentsApi = {
  getAll:        (params = {}) => api.get(`/agents?${buildQueryString(params)}`),
  getOne:        (id)          => api.get(`/agents/${id}`),
  assignRm:      (id, rm_id)   => api.post(`/agents/${id}/assign-rm`, { rm_id }),
  transfer:      (id, rm_id)   => api.post(`/agents/${id}/transfer`, { rm_id }),
  activate:      (id)          => api.post(`/agents/${id}/activate`),
  suspend:       (id)          => api.post(`/agents/${id}/suspend`),
  updateKyc:     (id, status)  => api.patch(`/agents/${id}/kyc`, { kyc_status: status }),
};
