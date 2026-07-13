import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, CheckCheck, Circle } from 'lucide-react';
import { notificationsApi } from '@/api/notifications.api';
import PageHeader from '@/components/common/PageHeader';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { timeAgo } from '@/utils/helpers';

export default function Notifications() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['notifications', page],
    queryFn:  () => notificationsApi.getAll({ page, limit: 30 }),
  });

  const notifications = data?.data?.data || [];
  const pagination    = data?.data?.pagination;

  const markReadMut = useMutation({
    mutationFn: id => notificationsApi.markRead(id),
    onSuccess:  () => {
      qc.invalidateQueries(['notifications']);
      qc.invalidateQueries(['notifications-unread-count']);
    },
  });

  const markAllMut = useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess:  () => {
      qc.invalidateQueries(['notifications']);
      qc.invalidateQueries(['notifications-unread-count']);
    },
  });

  const typeIcons = {
    new_request:     '📋',
    policy_issued:   '✅',
    assignment:      '👤',
    approval:        '🎉',
    status_update:   '🔄',
    commission_paid: '💰',
    registration:    '🆕',
  };

  return (
    <div className="space-y-4">
      <PageHeader title="Notifications" subtitle="Stay up to date with platform activity"
        action={
          <button onClick={() => markAllMut.mutate()} disabled={markAllMut.isPending}
            className="btn-secondary text-xs flex items-center gap-1.5">
            <CheckCheck size={14} /> Mark All Read
          </button>
        }
      />

      {isLoading ? (
        <LoadingSpinner />
      ) : notifications.length === 0 ? (
        <div className="card p-12 text-center">
          <Bell size={40} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400">No notifications yet</p>
        </div>
      ) : (
        <div className="card divide-y divide-gray-50">
          {notifications.map(n => (
            <div key={n.id} onClick={() => !n.is_read && markReadMut.mutate(n.id)}
              className={`flex items-start gap-4 p-4 cursor-pointer hover:bg-gray-50 transition-colors ${!n.is_read ? 'bg-blue-50/50' : ''}`}>
              <div className="text-2xl flex-shrink-0 mt-0.5">
                {typeIcons[n.type] || '🔔'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm font-medium ${!n.is_read ? 'text-gray-900' : 'text-gray-700'}`}>
                    {n.title}
                  </p>
                  <span className="text-xs text-gray-400 flex-shrink-0">{timeAgo(n.created_at)}</span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
              </div>
              {!n.is_read && <Circle size={8} className="text-blue-500 flex-shrink-0 mt-2 fill-current" />}
            </div>
          ))}
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="btn-secondary text-xs">Previous</button>
          <span className="text-sm text-gray-500 self-center">Page {page} of {pagination.totalPages}</span>
          <button disabled={page >= pagination.totalPages} onClick={() => setPage(p => p + 1)} className="btn-secondary text-xs">Next</button>
        </div>
      )}
    </div>
  );
}
