import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search, Eye, FileText, Copy, Check, Download, Users, User,
} from 'lucide-react';
import { policiesApi } from '@/api/policies.api';
import DataTable  from '@/components/common/DataTable';
import Badge      from '@/components/common/Badge';
import Modal      from '@/components/common/Modal';
import PageHeader from '@/components/common/PageHeader';
import { formatDate, formatCurrency, getStatusColor } from '@/utils/helpers';

// ── Constants ─────────────────────────────────────────────────────────────────

const EXCLUDED_KEYS = new Set([
  'travellers', 'proposalResponse', 'destination', 'destinationQuery',
  'bulk_file', 'bulk_file_path',
]);

const KEY_LABELS = {
  panNo: 'PAN No.', dob: 'Date of Birth', phone: 'Phone', name: 'Name',
  email: 'Email', mobileNo: 'Mobile No.', sumInsured: 'Sum Insured',
  travelPurpose: 'Travel Purpose', tripType: 'Trip Type',
  coverType: 'Cover Type', planCode: 'Plan Code',
  pTrvPartnerDtls_inout: 'Partner Details',
  firstname: 'First Name', middlename: 'Middle Name', lastname: 'Last Name',
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatKey(key) {
  if (KEY_LABELS[key]) return KEY_LABELS[key];
  return key
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, c => c.toUpperCase());
}

function parseTravDetails(details) {
  if (!details) return null;
  if (typeof details === 'string') {
    try { return JSON.parse(details); } catch { return null; }
  }
  return details;
}

function getBulkFileUrl(details) {
  const d = parseTravDetails(details);
  return d?.bulk_file ? `/uploads/bulk/${d.bulk_file}` : null;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function FieldRow({ label, value }) {
  const [copied, setCopied] = useState(false);
  const text = (value === null || value === undefined) ? '' : String(value);

  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <div className="flex items-start justify-between gap-2 py-2 border-b border-gray-100 last:border-0">
      <div className="min-w-0 flex-1">
        <span className="text-xs text-gray-400">{label}</span>
        <p className="text-sm font-medium text-gray-800 break-words">{text || '—'}</p>
      </div>
      <button onClick={copy} title="Copy" className="mt-3 p-1 rounded text-gray-400 hover:text-blue-600 shrink-0">
        {copied ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
      </button>
    </div>
  );
}

function TravDetailsSection({ details }) {
  const d = parseTravDetails(details);
  if (!d || typeof d !== 'object') return null;

  const primitives = Object.entries(d).filter(
    ([k, v]) => !EXCLUDED_KEYS.has(k) && (typeof v !== 'object' || v === null),
  );
  const objects = Object.entries(d).filter(
    ([k, v]) => !EXCLUDED_KEYS.has(k) && v && typeof v === 'object' && !Array.isArray(v),
  );

  if (!primitives.length && !objects.length) return null;

  return (
    <div className="space-y-3">
      {primitives.length > 0 && (
        <div className="bg-gray-50 rounded-lg px-3 py-1">
          {primitives.map(([k, v]) => (
            <FieldRow key={k} label={formatKey(k)} value={v} />
          ))}
        </div>
      )}
      {objects.map(([k, obj]) => (
        <div key={k}>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1.5">{formatKey(k)}</p>
          <div className="bg-gray-50 rounded-lg px-3 py-1">
            {Object.entries(obj)
              .filter(([, v]) => typeof v !== 'object' || v === null)
              .map(([sk, sv]) => (
                <FieldRow key={sk} label={formatKey(sk)} value={sv} />
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function RMPolicyRequests() {
  const qc = useQueryClient();

  const [search, setSearch]   = useState('');
  const [status, setStatus]   = useState('');
  const [page, setPage]       = useState(1);
  const [modal, setModal]     = useState(null);       // 'view' | 'status'
  const [viewId, setViewId]   = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [allCopied, setAllCopied]     = useState(false);
  const [statusForm, setStatusForm]   = useState({ status: '', remarks: '' });

  // List query
  const { data, isLoading } = useQuery({
    queryKey: ['rm-requests', search, status, page],
    queryFn:  () => policiesApi.getRequests({ search, status, page, limit: 20 }),
  });

  // Full detail query for view modal
  const { data: detailRes, isLoading: detailLoading } = useQuery({
    queryKey: ['rm-request-detail', viewId],
    queryFn:  () => policiesApi.getRequest(viewId),
    enabled:  !!viewId,
  });

  const rows       = data?.data?.data || [];
  const pagination = data?.data?.pagination;
  const req        = detailRes?.data?.data;
  const isBulk     = req && (req.plan_type === 'bulk' || Number(req.num_travelers) > 1);
  const bulkFileUrl = req ? getBulkFileUrl(req.traveller_details) : null;

  const statusMut = useMutation({
    mutationFn: ({ id, data }) => policiesApi.updateStatus(id, data),
    onSuccess:  () => { qc.invalidateQueries(['rm-requests']); setModal(null); },
  });

  const openView = row => {
    setViewId(row.id);
    setAllCopied(false);
    setModal('view');
  };

  const openStatus = (row, defaultStatus) => {
    setSelectedRow(row);
    setStatusForm({ status: defaultStatus || row.status, remarks: row.remarks || '' });
    setModal('status');
  };

  const copyAll = () => {
    if (!req) return;
    const lines = [
      `Request #: ${req.request_number}`,
      `Type: ${req.plan_type}`,
      `Destination: ${req.destination || '—'}`,
      `Travel Date: ${formatDate(req.travel_date)}`,
      `Return Date: ${formatDate(req.return_date)}`,
      `No. of Days: ${req.no_of_days || '—'}`,
      `Travelers: ${req.num_travelers}`,
      `Premium: ${req.payment_amount || '—'}`,
      `Payment Ref: ${req.payment_reference || '—'}`,
    ];
    const d = parseTravDetails(req.traveller_details);
    if (d) {
      Object.entries(d)
        .filter(([k, v]) => !EXCLUDED_KEYS.has(k) && typeof v !== 'object')
        .forEach(([k, v]) => lines.push(`${formatKey(k)}: ${v}`));
    }
    navigator.clipboard.writeText(lines.join('\n')).then(() => {
      setAllCopied(true);
      setTimeout(() => setAllCopied(false), 2000);
    });
  };

  const columns = [
    {
      key: 'request_number', label: 'Request #',
      render: v => <span className="font-mono text-xs font-semibold">{v}</span>,
    },
    { key: 'traveler_name', label: 'Traveler' },
    { key: 'destination',   label: 'Destination', render: v => v || <span className="text-gray-300 text-xs italic">—</span> },
    {
      key: 'plan_type', label: 'Type',
      render: v => {
        const bulk = v === 'bulk';
        return (
          <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${bulk ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
            {bulk ? <Users size={11} /> : <User size={11} />}
            {bulk ? 'Bulk' : 'Individual'}
          </span>
        );
      },
    },
    { key: 'num_travelers',  label: 'Travelers', render: v => <span className="tabular-nums">{v}</span> },
    { key: 'travel_date',   label: 'Travel Date', render: v => formatDate(v) },
    { key: 'agent_name',    label: 'Agent' },
    { key: 'payment_amount', label: 'Premium', render: v => formatCurrency(v) },
    { key: 'status',        label: 'Status', render: v => <Badge status={v} color={getStatusColor(v)} /> },
    {
      label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <button onClick={() => openView(row)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="View">
            <Eye size={15} />
          </button>
          {['submitted', 'assigned', 'under_review'].includes(row.status) && (
            <button
              onClick={() => openStatus(row, row.status === 'submitted' ? 'under_review' : row.status)}
              className="p-1.5 text-purple-600 hover:bg-purple-50 rounded"
              title="Update Status"
            >
              <FileText size={15} />
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
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="form-input pl-9"
            placeholder="Search requests…"
          />
        </div>
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }} className="form-select w-auto">
          <option value="">All Statuses</option>
          {['submitted','assigned','under_review','issued','rejected'].map(s => (
            <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
          ))}
        </select>
      </div>

      <DataTable
        columns={columns} data={rows} loading={isLoading}
        pagination={{ ...pagination, page }} onPageChange={setPage}
      />

      {/* ── View Modal ──────────────────────────────────────────── */}
      <Modal
        isOpen={modal === 'view'}
        onClose={() => setModal(null)}
        title="Request Details"
        size="lg"
      >
        {detailLoading ? (
          <div className="py-10 text-center text-gray-400 text-sm">Loading…</div>
        ) : req ? (
          <div className="space-y-5">

            {/* Top bar */}
            <div className="flex items-center justify-between gap-3">
              <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full ${isBulk ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                {isBulk ? <Users size={12} /> : <User size={12} />}
                {isBulk ? `Bulk — ${req.num_travelers} travelers` : 'Individual'}
              </span>

              <div className="flex items-center gap-2">
                {!isBulk && (
                  <button onClick={copyAll} className="btn-secondary flex items-center gap-1.5 text-xs">
                    {allCopied
                      ? <><Check size={13} className="text-green-500" /> Copied!</>
                      : <><Copy size={13} /> Copy All</>
                    }
                  </button>
                )}
                {isBulk && bulkFileUrl && (
                  <a href={bulkFileUrl} download className="btn-secondary flex items-center gap-1.5 text-xs">
                    <Download size={13} />
                    Download Excel
                  </a>
                )}
              </div>
            </div>

            {/* Request summary grid */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Request Info</p>
              <div className="grid grid-cols-2 gap-3 bg-gray-50 rounded-lg p-3">
                {[
                  ['Request #',   req.request_number],
                  ['Destination', req.destination],
                  ['Status',      req.status],
                  ['No. of Days', req.no_of_days],
                  ['Premium',     formatCurrency(req.payment_amount)],
                ].map(([label, val]) => (
                  <div key={label}>
                    <p className="text-xs text-gray-400">{label}</p>
                    <p className="text-sm font-medium text-gray-800">{val || '—'}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Traveller Details */}
            {req.traveller_details && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Traveller Details</p>
                <TravDetailsSection details={req.traveller_details} />
              </div>
            )}

            {/* Agent Basic Details */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Agent Details</p>
              <div className="grid grid-cols-3 gap-3 bg-amber-50 rounded-lg p-3">
                {[
                  ['Name',   req.agent_name],
                  ['Email',  req.agent_email],
                  ['Mobile', req.agent_mobile],
                ].filter(([, v]) => v).map(([label, val]) => (
                  <div key={label}>
                    <p className="text-xs text-gray-400">{label}</p>
                    <p className="text-sm font-medium text-gray-800 break-all">{val}</p>
                  </div>
                ))}
              </div>
            </div>

            {req.payment_screenshot && (
              <div>
                <p className="text-xs text-gray-400 mb-1">Payment Screenshot</p>
                <a href={req.payment_screenshot} target="_blank" rel="noreferrer"
                  className="text-blue-600 hover:underline text-sm">View Screenshot ↗</a>
              </div>
            )}
          </div>
        ) : null}
      </Modal>

      {/* ── Update Status Modal ─────────────────────────────────── */}
      <Modal
        isOpen={modal === 'status'}
        onClose={() => setModal(null)}
        title="Update Request Status"
        size="sm"
        footer={
          <>
            <button onClick={() => setModal(null)} className="btn-secondary">Cancel</button>
            <button
              onClick={() => statusMut.mutate({ id: selectedRow?.id, data: statusForm })}
              disabled={statusMut.isPending}
              className="btn-primary"
            >
              {statusMut.isPending ? 'Updating…' : 'Update Status'}
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <div>
            <label className="form-label">Status</label>
            <select
              className="form-select"
              value={statusForm.status}
              onChange={e => setStatusForm(p => ({ ...p, status: e.target.value }))}
            >
              {['under_review', 'issued', 'rejected'].map(s => (
                <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="form-label">Remarks</label>
            <textarea
              className="form-input" rows={3}
              value={statusForm.remarks}
              onChange={e => setStatusForm(p => ({ ...p, remarks: e.target.value }))}
              placeholder="Add remarks…"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
