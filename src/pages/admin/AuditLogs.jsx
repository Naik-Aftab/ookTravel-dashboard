import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/api/dashboard.api';
import DataTable  from '@/components/common/DataTable';
import PageHeader from '@/components/common/PageHeader';
import { formatDateTime } from '@/utils/helpers';

export default function AuditLogs() {
  const [filters, setFilters] = useState({ user_type: '', action: '', entity_type: '' });
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['audit-logs', filters, page],
    queryFn:  () => dashboardApi.adminAudit({ ...filters, page, limit: 50 }),
  });

  const rows       = data?.data?.data || [];
  const pagination = data?.data?.pagination;

  const columns = [
    { key: 'created_at',  label: 'Time',        render: v => <span className="text-xs">{formatDateTime(v)}</span> },
    { key: 'user_type',   label: 'User Type',   render: v => <span className="capitalize text-xs font-medium">{v}</span> },
    { key: 'user_name',   label: 'User' },
    { key: 'action',      label: 'Action',      render: v => <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">{v}</span> },
    { key: 'entity_type', label: 'Entity',      render: v => v || '—' },
    { key: 'entity_id',   label: 'Entity ID',   render: v => v || '—' },
    { key: 'ip_address',  label: 'IP',          render: v => <span className="text-xs text-gray-500">{v || '—'}</span> },
  ];

  return (
    <div className="space-y-4">
      <PageHeader title="Audit Logs" subtitle="Track all system activities" />

      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <select value={filters.user_type} onChange={e => { setFilters(f => ({ ...f, user_type: e.target.value })); setPage(1); }}
          className="form-select w-auto">
          <option value="">All Users</option>
          <option value="admin">Admin</option>
          <option value="rm">RM</option>
          <option value="agent">Agent</option>
        </select>
        <input value={filters.action} onChange={e => { setFilters(f => ({ ...f, action: e.target.value })); setPage(1); }}
          className="form-input flex-1" placeholder="Filter by action (e.g. LOGIN, RM_APPROVED...)" />
        <select value={filters.entity_type} onChange={e => { setFilters(f => ({ ...f, entity_type: e.target.value })); setPage(1); }}
          className="form-select w-auto">
          <option value="">All Entities</option>
          {['rm','agent','policy','policy_request','commission'].map(e => (
            <option key={e} value={e}>{e.replace('_', ' ')}</option>
          ))}
        </select>
      </div>

      <DataTable columns={columns} data={rows} loading={isLoading} pagination={{ ...pagination, page }} onPageChange={setPage} />
    </div>
  );
}
