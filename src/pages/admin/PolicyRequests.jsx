import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Eye } from 'lucide-react';
import { policiesApi } from '@/api/policies.api';
import DataTable   from '@/components/common/DataTable';
import Badge       from '@/components/common/Badge';
import Modal       from '@/components/common/Modal';
import PageHeader  from '@/components/common/PageHeader';
import { formatDate, formatCurrency, getStatusColor } from '@/utils/helpers';

export default function AdminPolicyRequests() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage]     = useState(1);
  const [selected, setSelected] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-requests', search, status, page],
    queryFn:  () => policiesApi.getRequests({ search, status, page, limit: 20 }),
  });

  const rows       = data?.data?.data || [];
  const pagination = data?.data?.pagination;

  const columns = [
    { key: 'request_number', label: 'Request #', render: v => <span className="font-mono text-xs font-semibold">{v}</span> },
    { key: 'traveler_name',  label: 'Traveler' },
    { key: 'destination',    label: 'Destination' },
    { key: 'travel_date',    label: 'Travel Date', render: v => formatDate(v) },
    { key: 'agent_name',     label: 'Agent' },
    { key: 'rm_name',        label: 'RM', render: v => v || <span className="text-gray-300 text-xs italic">—</span> },
    { key: 'payment_amount', label: 'Premium',    render: v => formatCurrency(v) },
    { key: 'status',         label: 'Status',     render: v => <Badge status={v} color={getStatusColor(v)} /> },
    {
      label: 'View',
      render: (_, row) => (
        <button onClick={() => setSelected(row)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded">
          <Eye size={15} />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader title="Policy Requests" subtitle="All policy requests from agents" />
      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="form-input pl-9" placeholder="Search by request#, traveler, agent..." />
        </div>
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }} className="form-select w-auto">
          <option value="">All Statuses</option>
          {['submitted','assigned','under_review','issued','expired','claimed','rejected'].map(s => (
            <option key={s} value={s}>{s.replace('_', ' ')}</option>
          ))}
        </select>
      </div>

      <DataTable columns={columns} data={rows} loading={isLoading} pagination={{ ...pagination, page }} onPageChange={setPage} />

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Request Details" size="lg">
        {selected && (
          <div className="grid grid-cols-2 gap-4 text-sm">
            {[
              ['Request #', selected.request_number], ['Traveler', selected.traveler_name],
              ['Mobile', selected.traveler_mobile], ['Email', selected.traveler_email],
              ['Destination', selected.destination], ['Travel Date', formatDate(selected.travel_date)],
              ['Return Date', formatDate(selected.return_date)], ['Travelers', selected.num_travelers],
              ['Plan Type', selected.plan_type], ['Premium', formatCurrency(selected.payment_amount)],
              ['Payment Ref.', selected.payment_reference], ['Agent', selected.agent_name],
              ['RM', selected.rm_name], ['Status', selected.status],
              ['Remarks', selected.remarks],
            ].map(([label, val]) => (
              <div key={label}>
                <p className="text-gray-400 text-xs">{label}</p>
                <p className="font-medium text-gray-800">{val || '—'}</p>
              </div>
            ))}
            {selected.payment_screenshot && (
              <div className="col-span-2">
                <p className="text-gray-400 text-xs mb-1">Payment Screenshot</p>
                <a href={selected.payment_screenshot} target="_blank" rel="noreferrer"
                  className="text-blue-600 hover:underline text-xs">View Screenshot</a>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
