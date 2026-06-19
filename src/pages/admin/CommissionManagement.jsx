import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DollarSign, TrendingUp, Clock, CheckCircle, Search, Plus, Eye } from 'lucide-react';
import { commissionsApi } from '@/api/commissions.api';
import StatCard    from '@/components/common/StatCard';
import DataTable   from '@/components/common/DataTable';
import Badge       from '@/components/common/Badge';
import Modal       from '@/components/common/Modal';
import PageHeader  from '@/components/common/PageHeader';
import { formatDate, formatCurrency, getStatusColor } from '@/utils/helpers';

export default function CommissionManagement() {
  const qc = useQueryClient();
  const [tab, setTab]       = useState('ledgers');
  const [search, setSearch] = useState('');
  const [page, setPage]     = useState(1);
  const [modal, setModal]   = useState(null);
  const [selected, setSelected] = useState(null);
  const [payForm, setPayForm]   = useState({ commission_id: '', payment_amount: '', payment_date: '', utr_number: '', remarks: '' });
  const [payFile, setPayFile]   = useState(null);

  const { data: statsRes } = useQuery({ queryKey: ['commission-stats'], queryFn: () => commissionsApi.getStats() });
  const { data: ledgersRes, isLoading: ledgersLoading } = useQuery({
    queryKey: ['ledgers', search, page],
    queryFn:  () => commissionsApi.getLedgers({ search, page, limit: 20 }),
    enabled: tab === 'ledgers',
  });
  const { data: commRes, isLoading: commLoading } = useQuery({
    queryKey: ['commissions', page],
    queryFn:  () => commissionsApi.getAll({ page, limit: 20 }),
    enabled: tab === 'commissions',
  });
  const { data: paymentsRes } = useQuery({
    queryKey: ['payments', selected?.id],
    queryFn:  () => commissionsApi.getPayments(selected?.id),
    enabled: !!selected && modal === 'payments',
  });

  const stats    = statsRes?.data?.data || {};
  const ledgers  = ledgersRes?.data?.data || [];
  const ledgerPg = ledgersRes?.data?.pagination;
  const comms    = commRes?.data?.data || [];
  const commPg   = commRes?.data?.pagination;
  const payments = paymentsRes?.data?.data || [];

  const payMut = useMutation({
    mutationFn: () => {
      const fd = new FormData();
      Object.entries(payForm).forEach(([k, v]) => v && fd.append(k, v));
      if (payFile) fd.append('payment_proof', payFile);
      return commissionsApi.createPayment(fd);
    },
    onSuccess: () => { qc.invalidateQueries(['ledgers', 'commissions', 'commission-stats']); setModal(null); setPayForm({ commission_id: '', payment_amount: '', payment_date: '', utr_number: '', remarks: '' }); setPayFile(null); },
  });

  const ledgerColumns = [
    { key: 'full_name',       label: 'Agent' },
    { key: 'email',           label: 'Email' },
    { key: 'total_premium',   label: 'Total Premium',     render: v => formatCurrency(v) },
    { key: 'commission_earned', label: 'Commission',      render: v => formatCurrency(v) },
    { key: 'paid_amount',     label: 'Paid',              render: v => <span className="text-green-600 font-semibold">{formatCurrency(v)}</span> },
    { key: 'pending_amount',  label: 'Pending',           render: v => <span className="text-yellow-600 font-semibold">{formatCurrency(v)}</span> },
    {
      label: 'Pay',
      render: (_, row) => (
        row.pending_amount > 0
          ? <button onClick={() => { setPayForm(p => ({ ...p, commission_id: '' })); setSelected(row); setModal('pay'); }}
              className="btn-primary text-xs py-1 px-2">
              Pay
            </button>
          : <span className="text-xs text-gray-400">—</span>
      ),
    },
  ];

  const commColumns = [
    { key: 'policy_number',    label: 'Policy #',      render: v => <span className="font-mono text-xs">{v}</span> },
    { key: 'agent_name',       label: 'Agent' },
    { key: 'premium_amount',   label: 'Premium',       render: v => formatCurrency(v) },
    { key: 'commission_amount',label: 'Commission',    render: v => formatCurrency(v) },
    { key: 'paid_amount',      label: 'Paid',          render: v => formatCurrency(v) },
    { key: 'pending_amount',   label: 'Pending',       render: v => formatCurrency(v) },
    { key: 'status',           label: 'Status',        render: v => <Badge status={v} color={getStatusColor(v)} /> },
    {
      label: 'History',
      render: (_, row) => (
        <button onClick={() => { setSelected(row); setModal('payments'); }} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded">
          <Eye size={15} />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader title="Commission Management" subtitle="Track and process agent commissions" />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total Payable" value={formatCurrency(stats.total_payable)}  icon={TrendingUp}  color="purple" />
        <StatCard title="Total Paid"    value={formatCurrency(stats.total_paid)}     icon={CheckCircle} color="green" />
        <StatCard title="Pending"       value={formatCurrency(stats.total_pending)}  icon={Clock}       color="yellow" />
        <StatCard title="This Month"    value={formatCurrency(stats.current_month)}  icon={DollarSign}  color="blue" />
      </div>

      {/* Tabs */}
      <div className="card overflow-hidden">
        <div className="flex border-b border-gray-100">
          {[['ledgers', 'Agent Ledgers'], ['commissions', 'Commission Records']].map(([key, label]) => (
            <button key={key} onClick={() => { setTab(key); setPage(1); }}
              className={`px-5 py-3 text-sm font-medium transition-colors ${tab === key ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
              {label}
            </button>
          ))}
        </div>
        <div className="p-4">
          {tab === 'ledgers' && (
            <>
              <div className="flex gap-3 mb-4">
                <div className="relative flex-1">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                    className="form-input pl-9" placeholder="Search agents..." />
                </div>
              </div>
              <DataTable columns={ledgerColumns} data={ledgers} loading={ledgersLoading} pagination={{ ...ledgerPg, page }} onPageChange={setPage} />
            </>
          )}
          {tab === 'commissions' && (
            <DataTable columns={commColumns} data={comms} loading={commLoading} pagination={{ ...commPg, page }} onPageChange={setPage} />
          )}
        </div>
      </div>

      {/* Pay Modal */}
      <Modal isOpen={modal === 'pay'} onClose={() => setModal(null)} title={`Pay Commission — ${selected?.full_name}`} size="sm"
        footer={
          <>
            <button onClick={() => setModal(null)} className="btn-secondary">Cancel</button>
            <button onClick={() => payMut.mutate()} disabled={payMut.isPending || !payForm.payment_amount || !payForm.payment_date} className="btn-primary">
              {payMut.isPending ? 'Processing...' : 'Record Payment'}
            </button>
          </>
        }>
        <div className="space-y-3 text-sm">
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-gray-500">Pending Amount</p>
            <p className="text-lg font-bold text-blue-700">{formatCurrency(selected?.pending_amount)}</p>
          </div>
          <div>
            <label className="form-label">Payment Amount (₹)</label>
            <input type="number" className="form-input" value={payForm.payment_amount}
              max={selected?.pending_amount}
              onChange={e => setPayForm(p => ({ ...p, payment_amount: e.target.value }))} placeholder="Enter amount" />
          </div>
          <div>
            <label className="form-label">Payment Date</label>
            <input type="date" className="form-input" value={payForm.payment_date}
              onChange={e => setPayForm(p => ({ ...p, payment_date: e.target.value }))} />
          </div>
          <div>
            <label className="form-label">UTR Number</label>
            <input type="text" className="form-input" value={payForm.utr_number}
              onChange={e => setPayForm(p => ({ ...p, utr_number: e.target.value }))} placeholder="Bank UTR / Transaction ID" />
          </div>
          <div>
            <label className="form-label">Payment Proof</label>
            <input type="file" className="form-input" accept="image/*,application/pdf" onChange={e => setPayFile(e.target.files[0])} />
          </div>
          <div>
            <label className="form-label">Remarks</label>
            <textarea className="form-input" rows={2} value={payForm.remarks}
              onChange={e => setPayForm(p => ({ ...p, remarks: e.target.value }))} />
          </div>
        </div>
      </Modal>

      {/* Payment History Modal */}
      <Modal isOpen={modal === 'payments'} onClose={() => setModal(null)} title={`Payment History — ${selected?.policy_number || selected?.agent_name}`} size="lg">
        {payments.length === 0
          ? <p className="text-sm text-gray-400 text-center py-8">No payments recorded yet.</p>
          : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm divide-y divide-gray-100">
                <thead className="bg-gray-50">
                  <tr>{['Date', 'Amount', 'UTR', 'Created By', 'Remarks'].map(h => (
                    <th key={h} className="px-3 py-2 text-left text-xs font-semibold text-gray-500">{h}</th>
                  ))}</tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {payments.map(p => (
                    <tr key={p.id}>
                      <td className="px-3 py-2">{formatDate(p.payment_date)}</td>
                      <td className="px-3 py-2 font-semibold text-green-700">{formatCurrency(p.payment_amount)}</td>
                      <td className="px-3 py-2 font-mono text-xs">{p.utr_number || '—'}</td>
                      <td className="px-3 py-2">{p.created_by_name}</td>
                      <td className="px-3 py-2 text-gray-500">{p.remarks || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        }
      </Modal>
    </div>
  );
}
