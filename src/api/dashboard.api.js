import api from '@/utils/axios';
import { buildQueryString } from '@/utils/helpers';

export const dashboardApi = {
  adminStats:   ()           => api.get('/dashboard/admin/stats'),
  adminCharts:  ()           => api.get('/dashboard/admin/charts'),
  adminAudit:   (params={})  => api.get(`/dashboard/admin/audit?${buildQueryString(params)}`),
  rmStats:      ()           => api.get('/dashboard/rm/stats'),
};
