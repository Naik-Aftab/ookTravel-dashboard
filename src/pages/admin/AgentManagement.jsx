import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Eye, UserCheck, Ban, CheckCircle, ArrowRightLeft } from 'lucide-react';
import { agentsApi } from '@/api/agents.api';
import { rmsApi }    from '@/api/rms.api';
import DataTable     from '@/components/common/DataTable';
import Badge         from '@/components/common/Badge';
import Modal         from '@/components/common/Modal';
import ConfirmModal  from '@/components/common/ConfirmModal';
import PageHeader    from '@/components/common/PageHeader';
import { formatDate, getStatusColor } from '@/utils/helpers';

export default function AgentManagement() {
  const qc = useQueryClient();
  const [search, setSearch]   = useState('');
  const [status, setStatus]   = useState('');
  const [page, setPage]       = useState(1);
  const [modal, setModal]     = useState(null);
  const [selected, setSelected] = useState(null);
  const [assignRmId, setAssignRmId] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['agents', search, status, page],
    queryFn:  () => agentsApi.getAll({ search, status, page, limit: 20 }),
  });
  const { data: rmsData } = useQuery({
    queryKey: ['rms-list'],
    queryFn:  () => rmsApi.getAll({ status: 'active', limit: 100 }),
  });

  const rows       = data?.data?.data  || [];
  const pagination = data?.data?.pagination;
  const rmList     = rmsData?.data?.data || [];

  const mutOpts = { onSuccess: () => { qc.invalidateQueries(['agents']); setModal(null); } };
  const assignMut   = useMutation({ mutationFn: ({ id, rm_id }) => agentsApi.assignRm(id, rm_id), ...mutOpts });
  const transferMut = useMutation({ mutationFn: ({ id, rm_id }) => agentsApi.transfer(id, rm_id), ...mutOpts });
  const activateMut = useMutation({ mutationFn: id => agentsApi.activate(id), ...mutOpts });
  const suspendMut  = useMutation({ mutationFn: id => agentsApi.suspend(id),  ...mutOpts });
  const kycMut      = useMutation({ mutationFn: ({ id, s }) => agentsApi.updateKyc(id, s), ...mutOpts });

  const open = (type, row) => { setSelected(row); setAssignRmId(''); setModal(type); };

  const columns = [
    {
      key: 'full_name', label: 'Agent',
      render: (v, r) => (
        <div>
          <p className="font-medium text-gray-900">{v}</p>
          <p className="text-xs text-gray-400">{r.agency_name || r.email}</p>
        </div>
      ),
    },
    { key: 'mobile',     label: 'Mobile' },
    { key: 'rm_name',    label: 'Assigned RM',   render: v => v || <span className="text-gray-300 italic text-xs">Unassigned</span> },
    { key: 'kyc_status', label: 'KYC',    render: v => <Badge status={v} color={getStatusColor(v)} /> },
    { key: 'status',     label: 'Status', render: v => <Badge status={v} color={getStatusColor(v)} /> },
    { key: 'created_at', label: 'Joined', render: v => formatDate(v) },
    {
      label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <button onClick={() => open('view', row)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="View">
            <Eye size={15} />
          </button>
          <button onClick={() => open('assign', row)} className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded" title="Assign / Transfer RM">
            {row.assigned_rm_id ? <ArrowRightLeft size={15} /> : <UserCheck size={15} />}
          </button>
          {row.status !== 'active' && (
            <button onClick={() => activateMut.mutate(row.id)} className="p-1.5 text-green-600 hover:bg-green-50 rounded" title="Activate">
              <CheckCircle size={15} />
            </button>
          )}
          {row.status === 'active' && (
            <button onClick={() => open('suspend', row)} className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded" title="Suspend">
              <Ban size={15} />
            </button>
          )}
          {row.kyc_status === 'pending' && (
            <button onClick={() => kycMut.mutate({ id: row.id, s: 'verified' })} className="p-1.5 text-green-600 hover:bg-green-50 rounded text-xs font-medium" title="Verify KYC">
              KYC ✓
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader title="Agent Management" subtitle="View and manage all agents" />

      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="form-input pl-9" placeholder="Search by name, email, agency..." />
        </div>
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }} className="form-select w-auto">
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      <DataTable columns={columns} data={rows} loading={isLoading} pagination={{ ...pagination, page }} onPageChange={setPage} />

      {/* View Agent Modal */}
      <Modal isOpen={modal === 'view'} onClose={() => setModal(null)} title="Agent Profile" size="lg">
        {selected && (
          <div className="grid grid-cols-2 gap-4 text-sm">
            {[
              ['Full Name', selected.full_name], ['Email', selected.email],
              ['Mobile', selected.mobile], ['Agency', selected.agency_name],
              ['PAN', selected.pan], ['GST', selected.gst],
              ['Bank Name', selected.bank_name], ['Account No.', selected.bank_account],
              ['IFSC', selected.bank_ifsc], ['KYC Status', selected.kyc_status],
              ['Status', selected.status], ['Assigned RM', selected.rm_name],
              ['Joined', formatDate(selected.created_at)],
            ].map(([label, val]) => (
              <div key={label}>
                <p className="text-gray-400 text-xs">{label}</p>
                <p className="font-medium text-gray-800">{val || '—'}</p>
              </div>
            ))}
          </div>
        )}
      </Modal>

      {/* Assign / Transfer RM Modal */}
      <Modal isOpen={modal === 'assign'} onClose={() => setModal(null)} title={selected?.assigned_rm_id ? 'Transfer Agent' : 'Assign RM'} size="sm"
        footer={
          <>
            <button onClick={() => setModal(null)} className="btn-secondary">Cancel</button>
            <button disabled={!assignRmId || assignMut.isPending}
              onClick={() => {
                const fn = selected?.assigned_rm_id ? transferMut : assignMut;
                fn.mutate({ id: selected?.id, rm_id: +assignRmId });
              }}
              className="btn-primary">
              {selected?.assigned_rm_id ? 'Transfer' : 'Assign'}
            </button>
          </>
        }>
        <div>
          <label className="form-label">Select RM</label>
          <select className="form-select" value={assignRmId} onChange={e => setAssignRmId(e.target.value)}>
            <option value="">-- Choose an RM --</option>
            {rmList.map(rm => <option key={rm.id} value={rm.id}>{rm.full_name} ({rm.agent_count} agents)</option>)}
          </select>
        </div>
      </Modal>

      <ConfirmModal isOpen={modal === 'suspend'} onClose={() => setModal(null)} title="Suspend Agent"
        message={`Suspend ${selected?.full_name}?`}
        onConfirm={() => suspendMut.mutate(selected?.id)} confirmLabel="Suspend" danger loading={suspendMut.isPending} />
    </div>
  );
}
