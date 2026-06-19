import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Eye, Download } from 'lucide-react';
import { policiesApi } from '@/api/policies.api';
import DataTable   from '@/components/common/DataTable';
import Badge       from '@/components/common/Badge';
import Modal       from '@/components/common/Modal';
import PageHeader  from '@/components/common/PageHeader';
import { formatDate, formatCurrency, getStatusColor } from '@/utils/helpers';

export default function AdminPolicies() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage]     = useState(1);
  const [selected, setSelected] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-policies', search, status, page],
    queryFn:  () => policiesApi.getAll({ search, status, page, limit: 20 }),
  });

  const rows       = data?.data?.data || [];
  const pagination = data?.data?.pagination;

  const columns = [
    { key: 'policy_number', label: 'Policy #',    render: v => <span className="font-mono text-xs font-semibold">{v}</span> },
    { key: 'provider_name', label: 'Provider' },
    { key: 'plan_name',     label: 'Plan' },
    { key: 'agent_name',    label: 'Agent' },
    { key: 'rm_name',       label: 'RM' },
    { key: 'premium_amount',label: 'Premium', render: v => formatCurrency(v) },
    { key: 'issue_date',    label: 'Issued',  render: v => formatDate(v) },
    { key: 'expiry_date',   label: 'Expires', render: v => formatDate(v) },
    { key: 'status',        label: 'Status',  render: v => <Badge status={v} color={getStatusColor(v)} /> },
    {
      label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <button onClick={() => setSelected(row)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="View">
            <Eye size={15} />
          </button>
          {row.policy_pdf && (
            <a href={row.policy_pdf} target="_blank" rel="noreferrer"
              className="p-1.5 text-green-600 hover:bg-green-50 rounded" title="Download PDF">
              <Download size={15} />
            </a>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader title="Policies" subtitle="All issued insurance policies" />
      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="form-input pl-9" placeholder="Search by policy#, provider, agent..." />
        </div>
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }} className="form-select w-auto">
          <option value="">All Statuses</option>
          {['active','expired','claimed','cancelled'].map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <DataTable columns={columns} data={rows} loading={isLoading} pagination={{ ...pagination, page }} onPageChange={setPage} />

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Policy Details" size="lg">
        {selected && (
          <div className="grid grid-cols-2 gap-4 text-sm">
            {[
              ['Policy #', selected.policy_number], ['Provider', selected.provider_name],
              ['Plan', selected.plan_name], ['Premium', formatCurrency(selected.premium_amount)],
              ['Coverage', formatCurrency(selected.coverage_amount)], ['Issue Date', formatDate(selected.issue_date)],
              ['Expiry Date', formatDate(selected.expiry_date)], ['Status', selected.status],
              ['Agent', selected.agent_name], ['RM', selected.rm_name],
              ['Traveler', selected.traveler_name], ['Destination', selected.destination],
            ].map(([label, val]) => (
              <div key={label}>
                <p className="text-gray-400 text-xs">{label}</p>
                <p className="font-medium text-gray-800">{val || '—'}</p>
              </div>
            ))}
            {selected.policy_pdf && (
              <div className="col-span-2">
                <a href={selected.policy_pdf} target="_blank" rel="noreferrer"
                  className="btn-primary inline-flex items-center gap-2">
                  <Download size={14} /> Download Policy PDF
                </a>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
