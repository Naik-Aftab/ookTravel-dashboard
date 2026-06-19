import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Eye, Upload, CheckCircle, FileText } from 'lucide-react';
import { policiesApi } from '@/api/policies.api';
import DataTable  from '@/components/common/DataTable';
import Badge      from '@/components/common/Badge';
import Modal      from '@/components/common/Modal';
import PageHeader from '@/components/common/PageHeader';
import { formatDate, formatCurrency, getStatusColor } from '@/utils/helpers';

export default function RMPolicyRequests() {
  const qc = useQueryClient();
  const [search, setSearch]    = useState('');
  const [status, setStatus]    = useState('');
  const [page, setPage]        = useState(1);
  const [modal, setModal]      = useState(null);
  const [selected, setSelected]= useState(null);
  const [statusForm, setStatusForm] = useState({ status: '', remarks: '' });
  const [policyForm, setPolicyForm] = useState({
    policy_number: '', provider_name: '', plan_name: '',
    premium_amount: '', issue_date: '', expiry_date: '', coverage_amount: '',
  });
  const [policyFile, setPolicyFile] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['rm-requests', search, status, page],
    queryFn:  () => policiesApi.getRequests({ search, status, page, limit: 20 }),
  });

  const rows       = data?.data?.data || [];
  const pagination = data?.data?.pagination;

  const statusMut = useMutation({
    mutationFn: ({ id, data }) => policiesApi.updateStatus(id, data),
    onSuccess:  () => { qc.invalidateQueries(['rm-requests']); setModal(null); },
  });

  const issueMut = useMutation({
    mutationFn: ({ id, fd }) => policiesApi.issuePolicy(id, fd),
    onSuccess:  () => { qc.invalidateQueries(['rm-requests']); setModal(null); },
  });

  const openStatus = (req, defaultStatus) => {
    setSelected(req);
    setStatusForm({ status: defaultStatus || req.status, remarks: req.remarks || '' });
    setModal('status');
  };

  const openIssue = req => {
    setSelected(req);
    setPolicyForm({ policy_number: '', provider_name: '', plan_name: '', premium_amount: req.payment_amount || '', issue_date: '', expiry_date: '', coverage_amount: '' });
    setPolicyFile(null);
    setModal('issue');
  };

  const submitIssue = () => {
    const fd = new FormData();
    Object.entries(policyForm).forEach(([k, v]) => v && fd.append(k, v));
    if (policyFile) fd.append('policy_pdf', policyFile);
    issueMut.mutate({ id: selected?.id, fd });
  };

  const columns = [
    { key: 'request_number', label: 'Request #', render: v => <span className="font-mono text-xs font-semibold">{v}</span> },
    { key: 'traveler_name',  label: 'Traveler' },
    { key: 'destination',    label: 'Destination' },
    { key: 'travel_date',    label: 'Travel Date', render: v => formatDate(v) },
    { key: 'agent_name',     label: 'Agent' },
    { key: 'payment_amount', label: 'Premium',     render: v => formatCurrency(v) },
    { key: 'status',         label: 'Status',      render: v => <Badge status={v} color={getStatusColor(v)} /> },
    {
      label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <button onClick={() => { setSelected(row); setModal('view'); }} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="View">
            <Eye size={15} />
          </button>
          {['submitted', 'assigned'].includes(row.status) && (
            <button onClick={() => openStatus(row, 'under_review')} className="p-1.5 text-purple-600 hover:bg-purple-50 rounded" title="Mark Under Review">
              <FileText size={15} />
            </button>
          )}
          {['assigned', 'under_review'].includes(row.status) && (
            <button onClick={() => openIssue(row)} className="p-1.5 text-green-600 hover:bg-green-50 rounded" title="Issue Policy">
              <CheckCircle size={15} />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader title="Policy Requests" subtitle="Manage and process policy requests assigned to you" />
      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="form-input pl-9" placeholder="Search requests..." />
        </div>
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }} className="form-select w-auto">
          <option value="">All Statuses</option>
          {['submitted','assigned','under_review','issued','rejected'].map(s => (
            <option key={s} value={s}>{s.replace('_', ' ')}</option>
          ))}
        </select>
      </div>

      <DataTable columns={columns} data={rows} loading={isLoading} pagination={{ ...pagination, page }} onPageChange={setPage} />

      {/* View Request Modal */}
      <Modal isOpen={modal === 'view'} onClose={() => setModal(null)} title="Request Details" size="lg">
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                ['Request #', selected.request_number], ['Traveler', selected.traveler_name],
                ['Destination', selected.destination], ['Travel Date', formatDate(selected.travel_date)],
                ['Return Date', formatDate(selected.return_date)], ['Travelers', selected.num_travelers],
                ['Plan Type', selected.plan_type], ['Premium', formatCurrency(selected.payment_amount)],
                ['Payment Ref.', selected.payment_reference], ['Agent', selected.agent_name],
                ['Status', selected.status], ['Remarks', selected.remarks],
              ].map(([label, val]) => (
                <div key={label}>
                  <p className="text-gray-400 text-xs">{label}</p>
                  <p className="font-medium text-gray-800">{val || '—'}</p>
                </div>
              ))}
            </div>
            {selected.payment_screenshot && (
              <a href={selected.payment_screenshot} target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline">
                <Eye size={14} /> View Payment Screenshot
              </a>
            )}
          </div>
        )}
      </Modal>

      {/* Update Status Modal */}
      <Modal isOpen={modal === 'status'} onClose={() => setModal(null)} title="Update Request Status" size="sm"
        footer={
          <>
            <button onClick={() => setModal(null)} className="btn-secondary">Cancel</button>
            <button onClick={() => statusMut.mutate({ id: selected?.id, data: statusForm })}
              disabled={statusMut.isPending} className="btn-primary">
              {statusMut.isPending ? 'Updating...' : 'Update Status'}
            </button>
          </>
        }>
        <div className="space-y-3">
          <div>
            <label className="form-label">Status</label>
            <select className="form-select" value={statusForm.status} onChange={e => setStatusForm(p => ({ ...p, status: e.target.value }))}>
              {['under_review', 'rejected'].map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Remarks</label>
            <textarea className="form-input" rows={3} value={statusForm.remarks}
              onChange={e => setStatusForm(p => ({ ...p, remarks: e.target.value }))} placeholder="Add remarks..." />
          </div>
        </div>
      </Modal>

      {/* Issue Policy Modal */}
      <Modal isOpen={modal === 'issue'} onClose={() => setModal(null)} title="Issue Policy" size="md"
        footer={
          <>
            <button onClick={() => setModal(null)} className="btn-secondary">Cancel</button>
            <button onClick={submitIssue} disabled={issueMut.isPending} className="btn-primary">
              {issueMut.isPending ? 'Issuing...' : 'Issue Policy'}
            </button>
          </>
        }>
        <div className="grid grid-cols-2 gap-3 text-sm">
          {[
            ['policy_number', 'Policy Number', 'text'],
            ['provider_name', 'Provider Name', 'text'],
            ['plan_name',     'Plan Name',     'text'],
            ['premium_amount','Premium (₹)',   'number'],
            ['coverage_amount','Coverage (₹)', 'number'],
            ['issue_date',    'Issue Date',    'date'],
            ['expiry_date',   'Expiry Date',   'date'],
          ].map(([key, label, type]) => (
            <div key={key} className={key === 'policy_number' ? 'col-span-2' : ''}>
              <label className="form-label">{label}</label>
              <input type={type} className="form-input" value={policyForm[key]}
                onChange={e => setPolicyForm(p => ({ ...p, [key]: e.target.value }))} />
            </div>
          ))}
          <div className="col-span-2">
            <label className="form-label">Policy PDF</label>
            <input type="file" className="form-input" accept="application/pdf,image/*"
              onChange={e => setPolicyFile(e.target.files[0])} />
          </div>
        </div>
      </Modal>
    </div>
  );
}
