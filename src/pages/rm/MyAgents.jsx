import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Eye, FileText, UserRound } from 'lucide-react';
import { agentsApi } from '@/api/agents.api';
import DataTable  from '@/components/common/DataTable';
import Badge      from '@/components/common/Badge';
import Modal      from '@/components/common/Modal';
import PageHeader from '@/components/common/PageHeader';
import { formatDate, getStatusColor } from '@/utils/helpers';

const DOCUMENT_FIELDS = [
  ['bank_document',  'Bank Passbook / Cancelled Cheque'],
  ['aadhar_document', 'Aadhar Card'],
  ['pan_document',    'PAN Card'],
];

function AgentAvatar({ src, size = 36 }) {
  const style = { width: size, height: size };
  if (src) {
    return (
      <a href={src} target="_blank" rel="noreferrer" title="View full photo">
        <img
          src={src}
          alt=""
          style={style}
          className="rounded-full object-cover border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity"
        />
      </a>
    );
  }
  return (
    <div
      style={style}
      className="flex items-center justify-center rounded-full bg-gray-100 border border-gray-200 text-gray-400"
    >
      <UserRound size={size * 0.55} />
    </div>
  );
}

export default function MyAgents() {
  const [search, setSearch] = useState('');
  const [page, setPage]     = useState(1);
  const [selected, setSelected] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['rm-agents', search, page],
    queryFn:  () => agentsApi.getAll({ search, page, limit: 20 }),
  });

  // The list row doesn't carry document columns — fetch the full agent record when the view
  // modal opens so bank/KYC documents are available.
  const { data: detailRes, isLoading: detailLoading } = useQuery({
    queryKey: ['rm-agent-detail', selected?.id],
    queryFn:  () => agentsApi.getOne(selected.id),
    enabled:  !!selected?.id,
  });

  const rows        = data?.data?.data || [];
  const pagination  = data?.data?.pagination;
  const viewedAgent = detailRes?.data?.data ?? selected;

  const columns = [
    {
      key: 'full_name', label: 'Agent',
      render: (v, r) => (
        <div className="flex items-center gap-3">
          <AgentAvatar src={r.profile_photo} />
          <div>
            <p className="font-medium text-gray-900">{v}</p>
            <p className="text-xs text-gray-400">{r.email}</p>
          </div>
        </div>
      ),
    },
    { key: 'mobile',      label: 'Mobile' },
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
        {detailLoading ? (
          <div className="py-10 text-center text-gray-400 text-sm">Loading…</div>
        ) : viewedAgent ? (
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <AgentAvatar src={viewedAgent.profile_photo} size={64} />
              <div>
                <p className="text-base font-semibold text-gray-900">{viewedAgent.full_name}</p>
                <p className="text-sm text-gray-400">{viewedAgent.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              {[
                ['Full Name', viewedAgent.full_name], ['Email', viewedAgent.email],
                ['Mobile', viewedAgent.mobile],
                ['PAN', viewedAgent.pan],
                ['Bank', viewedAgent.bank_name], ['Account', viewedAgent.bank_account],
                ['IFSC', viewedAgent.bank_ifsc], ['Aadhar Number', viewedAgent.aadhar_number],
                ['KYC', viewedAgent.kyc_status],
                ['Status', viewedAgent.status], ['Joined', formatDate(viewedAgent.created_at)],
              ].map(([label, val]) => (
                <div key={label}>
                  <p className="text-gray-400 text-xs">{label}</p>
                  <p className="font-medium text-gray-800">{val || '—'}</p>
                </div>
              ))}
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                Bank / KYC Documents
              </p>
              <div className="grid grid-cols-3 gap-3 bg-gray-50 rounded-lg p-3">
                {DOCUMENT_FIELDS.map(([field, label]) => (
                  <div key={field}>
                    <p className="text-gray-400 text-xs mb-1">{label}</p>
                    {viewedAgent[field] ? (
                      <a
                        href={viewedAgent[field]}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-blue-600 hover:underline text-sm font-medium"
                      >
                        <FileText size={13} /> View
                      </a>
                    ) : (
                      <span className="text-gray-300 text-xs italic">Not uploaded</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
