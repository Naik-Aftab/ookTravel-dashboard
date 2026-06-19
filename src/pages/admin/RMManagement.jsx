import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, MoreVertical, CheckCircle, Ban, Trash2, KeyRound, Edit } from 'lucide-react';
import { rmsApi }       from '@/api/rms.api';
import DataTable        from '@/components/common/DataTable';
import Badge            from '@/components/common/Badge';
import Modal            from '@/components/common/Modal';
import ConfirmModal     from '@/components/common/ConfirmModal';
import PageHeader       from '@/components/common/PageHeader';
import { formatDate, getStatusColor } from '@/utils/helpers';

export default function RMManagement() {
  const qc = useQueryClient();
  const [search, setSearch]   = useState('');
  const [status, setStatus]   = useState('');
  const [page, setPage]       = useState(1);
  const [modal, setModal]     = useState(null);
  const [selectedRM, setSelectedRM] = useState(null);
  const [resetPwd, setResetPwd]     = useState('');
  const [editForm, setEditForm]     = useState({});

  const { data, isLoading } = useQuery({
    queryKey: ['rms', search, status, page],
    queryFn:  () => rmsApi.getAll({ search, status, page, limit: 20 }),
  });

  const rows       = data?.data?.data  || [];
  const pagination = data?.data?.pagination;

  const mutOpts = action => ({
    onSuccess: () => { qc.invalidateQueries(['rms']); setModal(null); },
  });

  const approveMut = useMutation({ mutationFn: id => rmsApi.approve(id), ...mutOpts('approve') });
  const suspendMut = useMutation({ mutationFn: id => rmsApi.suspend(id), ...mutOpts('suspend') });
  const activateMut= useMutation({ mutationFn: id => rmsApi.activate(id), ...mutOpts('activate') });
  const deleteMut  = useMutation({ mutationFn: id => rmsApi.delete(id),  ...mutOpts('delete') });
  const resetMut   = useMutation({ mutationFn: ({ id, pwd }) => rmsApi.resetPassword(id, { new_password: pwd }), ...mutOpts('reset') });
  const updateMut  = useMutation({ mutationFn: ({ id, data }) => rmsApi.update(id, data), ...mutOpts('update') });

  const openModal = (type, rm) => { setSelectedRM(rm); setModal(type); };

  const columns = [
    { key: 'full_name', label: 'Name',   render: (v, r) => <div><p className="font-medium text-gray-900">{v}</p><p className="text-xs text-gray-400">{r.email}</p></div> },
    { key: 'mobile',    label: 'Mobile' },
    { key: 'status',    label: 'Status', render: v => <Badge status={v} color={getStatusColor(v)} /> },
    { key: 'agent_count', label: 'Agents', render: v => <span className="font-semibold text-blue-600">{v}</span> },
    { key: 'created_at',  label: 'Joined',  render: v => formatDate(v) },
    {
      label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-1">
          {row.status === 'pending' && (
            <button onClick={() => approveMut.mutate(row.id)} className="p-1.5 text-green-600 hover:bg-green-50 rounded" title="Approve">
              <CheckCircle size={15} />
            </button>
          )}
          {row.status === 'active' && (
            <button onClick={() => openModal('suspend', row)} className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded" title="Suspend">
              <Ban size={15} />
            </button>
          )}
          {row.status === 'suspended' && (
            <button onClick={() => activateMut.mutate(row.id)} className="p-1.5 text-green-600 hover:bg-green-50 rounded" title="Activate">
              <CheckCircle size={15} />
            </button>
          )}
          <button onClick={() => { setEditForm({ full_name: row.full_name, email: row.email, mobile: row.mobile }); openModal('edit', row); }}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="Edit">
            <Edit size={15} />
          </button>
          <button onClick={() => openModal('resetPwd', row)} className="p-1.5 text-gray-500 hover:bg-gray-100 rounded" title="Reset Password">
            <KeyRound size={15} />
          </button>
          <button onClick={() => openModal('delete', row)} className="p-1.5 text-red-500 hover:bg-red-50 rounded" title="Delete">
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader title="RM Management" subtitle="Manage Relationship Managers" />

      {/* Filters */}
      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="form-input pl-9" placeholder="Search by name, email, mobile..." />
        </div>
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }} className="form-select w-auto">
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      <DataTable columns={columns} data={rows} loading={isLoading} pagination={{ ...pagination, page }} onPageChange={setPage} />

      {/* Edit Modal */}
      <Modal isOpen={modal === 'edit'} onClose={() => setModal(null)} title="Edit RM Details" size="sm"
        footer={
          <>
            <button onClick={() => setModal(null)} className="btn-secondary">Cancel</button>
            <button onClick={() => updateMut.mutate({ id: selectedRM?.id, data: editForm })} className="btn-primary" disabled={updateMut.isPending}>
              {updateMut.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </>
        }>
        <div className="space-y-3">
          {['full_name', 'email', 'mobile'].map(f => (
            <div key={f}>
              <label className="form-label capitalize">{f.replace('_', ' ')}</label>
              <input className="form-input" value={editForm[f] || ''} onChange={e => setEditForm(p => ({ ...p, [f]: e.target.value }))} />
            </div>
          ))}
        </div>
      </Modal>

      {/* Reset Password Modal */}
      <Modal isOpen={modal === 'resetPwd'} onClose={() => setModal(null)} title="Reset RM Password" size="sm"
        footer={
          <>
            <button onClick={() => setModal(null)} className="btn-secondary">Cancel</button>
            <button onClick={() => resetMut.mutate({ id: selectedRM?.id, pwd: resetPwd })} className="btn-primary" disabled={resetMut.isPending}>
              Reset Password
            </button>
          </>
        }>
        <div>
          <label className="form-label">New Password</label>
          <input type="password" className="form-input" value={resetPwd}
            onChange={e => setResetPwd(e.target.value)} placeholder="Min. 8 chars, upper+lower+number" />
        </div>
      </Modal>

      <ConfirmModal isOpen={modal === 'suspend'} onClose={() => setModal(null)} title="Suspend RM"
        message={`Are you sure you want to suspend ${selectedRM?.full_name}?`}
        onConfirm={() => suspendMut.mutate(selectedRM?.id)} confirmLabel="Suspend" danger loading={suspendMut.isPending} />

      <ConfirmModal isOpen={modal === 'delete'} onClose={() => setModal(null)} title="Delete RM"
        message={`Permanently delete ${selectedRM?.full_name}? This cannot be undone.`}
        onConfirm={() => deleteMut.mutate(selectedRM?.id)} confirmLabel="Delete" danger loading={deleteMut.isPending} />
    </div>
  );
}
