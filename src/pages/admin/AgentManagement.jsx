import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Eye, UserCheck, Ban, CheckCircle, ArrowRightLeft, Users, FileText, UserRound } from 'lucide-react';
import { agentsApi } from '@/api/agents.api';
import { rmsApi }    from '@/api/rms.api';
import DataTable     from '@/components/common/DataTable';
import Badge         from '@/components/common/Badge';
import Modal         from '@/components/common/Modal';
import ConfirmModal  from '@/components/common/ConfirmModal';
import PageHeader    from '@/components/common/PageHeader';
import { formatDate, getStatusColor } from '@/utils/helpers';

const DOCUMENT_FIELDS = [
  ['bank_document',   'Bank Passbook / Cancelled Cheque'],
  ['aadhar_document',  'Aadhar Card'],
  ['pan_document',     'PAN Card'],
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

export default function AgentManagement() {
  const qc = useQueryClient();
  const [search, setSearch]   = useState('');
  const [status, setStatus]   = useState('');
  const [page, setPage]       = useState(1);
  const [modal, setModal]     = useState(null);
  const [selected, setSelected] = useState(null);
  const [assignRmId, setAssignRmId] = useState('');
  const [bulkAssignRmId, setBulkAssignRmId] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['agents', search, status, page],
    queryFn:  () => agentsApi.getAll({ search, status, page, limit: 20 }),
  });
  const { data: rmsData } = useQuery({
    queryKey: ['rms-list'],
    queryFn:  () => rmsApi.getAll({ status: 'active', limit: 100 }),
  });

  // The list row doesn't carry document columns — fetch the full agent record when the view
  // modal opens so bank/KYC documents (and anything else not on the list SELECT) are available.
  const { data: detailRes, isLoading: detailLoading } = useQuery({
    queryKey: ['agent-detail', selected?.id],
    queryFn:  () => agentsApi.getOne(selected.id),
    enabled:  modal === 'view' && !!selected?.id,
  });

  const rows       = data?.data?.data  || [];
  const pagination = data?.data?.pagination;
  const rmList     = rmsData?.data?.data || [];
  const viewedAgent = modal === 'view' ? (detailRes?.data?.data ?? selected) : selected;

  const mutOpts = { onSuccess: () => { qc.invalidateQueries(['agents']); setModal(null); } };
  const assignMut      = useMutation({ mutationFn: ({ id, rm_id }) => agentsApi.assignRm(id, rm_id), ...mutOpts });
  const transferMut    = useMutation({ mutationFn: ({ id, rm_id }) => agentsApi.transfer(id, rm_id), ...mutOpts });
  const activateMut    = useMutation({ mutationFn: id => agentsApi.activate(id), ...mutOpts });
  const suspendMut     = useMutation({ mutationFn: id => agentsApi.suspend(id),  ...mutOpts });
  const kycMut         = useMutation({ mutationFn: ({ id, s }) => agentsApi.updateKyc(id, s), ...mutOpts });
  const bulkAssignMut  = useMutation({
    mutationFn: (rm_id) => agentsApi.assignAllToRm(rm_id),
    onSuccess: () => { qc.invalidateQueries(['agents']); setModal(null); setBulkAssignRmId(''); },
  });

  const open = (type, row) => {
    setSelected(row);
    setAssignRmId(rmList.length === 1 ? String(rmList[0].id) : '');
    setModal(type);
  };

  const openBulkAssign = () => {
    setBulkAssignRmId(rmList.length === 1 ? String(rmList[0].id) : '');
    setModal('bulkAssign');
  };

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
        {rmList.length > 0 && (
          <button onClick={openBulkAssign} className="btn-primary flex items-center gap-2 whitespace-nowrap">
            <Users size={15} />
            Assign All to RM
          </button>
        )}
      </div>

      <DataTable columns={columns} data={rows} loading={isLoading} pagination={{ ...pagination, page }} onPageChange={setPage} />

      {/* View Agent Modal */}
      <Modal isOpen={modal === 'view'} onClose={() => setModal(null)} title="Agent Profile" size="lg">
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
                ['Bank Name', viewedAgent.bank_name], ['Account No.', viewedAgent.bank_account],
                ['IFSC', viewedAgent.bank_ifsc], ['Aadhar Number', viewedAgent.aadhar_number],
                ['KYC Status', viewedAgent.kyc_status],
                ['Status', viewedAgent.status], ['Assigned RM', viewedAgent.rm_name],
                ['Joined', formatDate(viewedAgent.created_at)],
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

      {/* Assign / Transfer RM Modal */}
      <Modal isOpen={modal === 'assign'} onClose={() => setModal(null)} title={selected?.assigned_rm_id ? 'Transfer Agent' : 'Assign RM'} size="sm"
        footer={
          <>
            <button onClick={() => setModal(null)} className="btn-secondary">Cancel</button>
            <button disabled={!assignRmId || assignMut.isPending || transferMut.isPending}
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
          <select className="form-select" value={assignRmId}
            onChange={e => {
              setAssignRmId(e.target.value);
              if (rmList.length === 1 && e.target.value) {
                const fn = selected?.assigned_rm_id ? transferMut : assignMut;
                fn.mutate({ id: selected?.id, rm_id: +e.target.value });
              }
            }}>
            <option value="">-- Choose an RM --</option>
            {rmList.map(rm => <option key={rm.id} value={rm.id}>{rm.full_name} ({rm.agent_count} agents)</option>)}
          </select>
          {rmList.length === 1 && (
            <p className="text-xs text-indigo-500 mt-1.5">Agent will be assigned automatically on selection.</p>
          )}
        </div>
      </Modal>

      {/* Bulk Assign All Agents to RM Modal */}
      <Modal isOpen={modal === 'bulkAssign'} onClose={() => { setModal(null); setBulkAssignRmId(''); }}
        title="Assign All Agents to RM" size="sm">
        <div>
          <p className="text-sm text-gray-500 mb-3">
            All agents (assigned and unassigned) will be moved to the selected RM.
          </p>
          <label className="form-label">Select RM</label>
          <select className="form-select" value={bulkAssignRmId} disabled={bulkAssignMut.isPending}
            onChange={e => {
              setBulkAssignRmId(e.target.value);
              if (e.target.value) bulkAssignMut.mutate(+e.target.value);
            }}>
            <option value="">-- Choose an RM --</option>
            {rmList.map(rm => <option key={rm.id} value={rm.id}>{rm.full_name} ({rm.agent_count} agents)</option>)}
          </select>
          {bulkAssignMut.isPending && (
            <p className="text-xs text-indigo-500 mt-2">Assigning all agents, please wait...</p>
          )}
        </div>
      </Modal>

      <ConfirmModal isOpen={modal === 'suspend'} onClose={() => setModal(null)} title="Suspend Agent"
        message={`Suspend ${selected?.full_name}?`}
        onConfirm={() => suspendMut.mutate(selected?.id)} confirmLabel="Suspend" danger loading={suspendMut.isPending} />
    </div>
  );
}
