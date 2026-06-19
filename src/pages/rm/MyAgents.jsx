import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Eye } from 'lucide-react';
import { agentsApi } from '@/api/agents.api';
import DataTable  from '@/components/common/DataTable';
import Badge      from '@/components/common/Badge';
import Modal      from '@/components/common/Modal';
import PageHeader from '@/components/common/PageHeader';
import { formatDate, getStatusColor } from '@/utils/helpers';

export default function MyAgents() {
  const [search, setSearch] = useState('');
  const [page, setPage]     = useState(1);
  const [selected, setSelected] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['rm-agents', search, page],
    queryFn:  () => agentsApi.getAll({ search, page, limit: 20 }),
  });

  const rows       = data?.data?.data || [];
  const pagination = data?.data?.pagination;

  const columns = [
    {
      key: 'full_name', label: 'Agent',
      render: (v, r) => <div><p className="font-medium text-gray-900">{v}</p><p className="text-xs text-gray-400">{r.email}</p></div>,
    },
    { key: 'mobile',      label: 'Mobile' },
    { key: 'agency_name', label: 'Agency' },
    { key: 'kyc_status',  label: 'KYC',    render: v => <Badge status={v} color={getStatusColor(v)} /> },
    { key: 'status',      label: 'Status', render: v => <Badge status={v} color={getStatusColor(v)} /> },
    { key: 'created_at',  label: 'Joined', render: v => formatDate(v) },
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
      <PageHeader title="My Agents" subtitle="Agents assigned to you" />
      <div className="card p-4 flex gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="form-input pl-9" placeholder="Search agents..." />
        </div>
      </div>

      <DataTable columns={columns} data={rows} loading={isLoading} pagination={{ ...pagination, page }} onPageChange={setPage} />

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Agent Profile" size="lg">
        {selected && (
          <div className="grid grid-cols-2 gap-4 text-sm">
            {[
              ['Full Name', selected.full_name], ['Email', selected.email],
              ['Mobile', selected.mobile], ['Agency', selected.agency_name],
              ['PAN', selected.pan], ['GST', selected.gst],
              ['Bank', selected.bank_name], ['Account', selected.bank_account],
              ['IFSC', selected.bank_ifsc], ['KYC', selected.kyc_status],
              ['Status', selected.status], ['Joined', formatDate(selected.created_at)],
            ].map(([label, val]) => (
              <div key={label}>
                <p className="text-gray-400 text-xs">{label}</p>
                <p className="font-medium text-gray-800">{val || '—'}</p>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}
