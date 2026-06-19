import api from '@/utils/axios';

export const notificationsApi = {
  getAll:       (params={})  => api.get('/notifications', { params }),
  unreadCount:  ()           => api.get('/notifications/unread-count'),
  markRead:     (id)         => api.patch(`/notifications/${id}/read`),
  markAllRead:  ()           => api.patch('/notifications/mark-all-read'),
};
