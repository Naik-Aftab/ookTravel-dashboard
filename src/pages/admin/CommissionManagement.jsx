import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DollarSign, TrendingUp, Clock, CheckCircle, Search } from 'lucide-react';
import { commissionsApi } from '@/api/commissions.api';
import StatCard   from '@/components/common/StatCard';
import DataTable  from '@/components/common/DataTable';
import Badge      from '@/components/common/Badge';
import PageHeader from '@/components/common/PageHeader';
import { formatCurrency, getStatusColor } from '@/utils/helpers';

export default function CommissionManagement() {
  const qc = useQueryClient();
  const [tab, setTab]       = useState('ledgers');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage]     = useState(1);

  const { data: statsRes } = useQuery({
    queryKey: ['commission-stats'],
    queryFn:  () => commissionsApi.getStats(),
  });
  const { data: ledgersRes, isLoading: ledgersLoading } = useQuery({
    queryKey: ['monthly-ledgers', search, statusFilter, page],
    queryFn:  () => commissionsApi.getMonthlyLedgers({ search, status: statusFilter, page, limit: 20 }),
    enabled:  tab === 'ledgers',
  });
  const { data: commRes, isLoading: commLoading } = useQuery({
    queryKey: ['commissions', page],
    queryFn:  () => commissionsApi.getAll({ page, limit: 20 }),
    enabled:  tab === 'commissions',
  });

  const stats    = statsRes?.data?.data || {};
  const ledgers  = ledgersRes?.data?.data || [];
  const ledgerPg = ledgersRes?.data?.pagination;
  const comms    = commRes?.data?.data || [];
  const commPg   = commRes?.data?.pagination;

  const statusMut = useMutation({
    mutationFn: (data) => commissionsApi.updateStatus(data),
    onSuccess:  () => qc.invalidateQueries(['monthly-ledgers', 'commission-stats']),
  });

  const ledgerColumns = [
    { key: 'full_name',         label: 'Agent' },
    { key: 'email',             label: 'Email' },
    { key: 'month_label',       label: 'Month' },
    { key: 'policy_count',      label: 'Policies', render: v => <span className="text-center block">{v}</span> },
    { key: 'total_premium',     label: 'Premium',    render: v => formatCurrency(v) },
    { key: 'commission_amount', label: 'Commission', render: v => <span className="font-semibold">{formatCurrency(v)}</span> },
    {
      key: 'month_status',
      label: 'Status',
      render: (status, row) => (
        <select
          value={status}
          disabled={statusMut.isPending}
          onChange={e => statusMut.mutate({
            agent_id:          row.agent_id,
            month_key:         row.month_key,
            month_label:       row.month_label,
            commission_amount: row.commission_amount,
            status:            e.target.value,
          })}
          className={`text-xs border rounded px-2 py-1 font-medium focus:outline-none focus:ring-1 focus:ring-blue-400 ${
            status === 'paid'
              ? 'bg-green-50 text-green-700 border-green-300'
              : 'bg-yellow-50 text-yellow-700 border-yellow-300'
          }`}
        >
          <option value="paid">Paid</option>
          <option value="unpaid">Unpaid</option>
        </select>
      ),
    },
  ];

  const commColumns = [
    { key: 'policy_number',     label: 'Policy #',   render: v => <span className="font-mono text-xs">{v}</span> },
    { key: 'agent_name',        label: 'Agent' },
    { key: 'premium_amount',    label: 'Premium',    render: v => formatCurrency(v) },
    { key: 'commission_amount', label: 'Commission', render: v => formatCurrency(v) },
    { key: 'paid_amount',       label: 'Paid',       render: v => formatCurrency(v) },
    { key: 'pending_amount',    label: 'Pending',    render: v => formatCurrency(v) },
    { key: 'status',            label: 'Status',     render: v => <Badge status={v} color={getStatusColor(v)} /> },
  ];

  return (
    <div className="space-y-4">
      <PageHeader title="Commission Management" subtitle="Track and manage agent commissions" />

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
                <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                  className="form-input w-36">
                  <option value="">All Status</option>
                  <option value="paid">Paid</option>
                  <option value="unpaid">Unpaid</option>
                </select>
              </div>
              <DataTable
                columns={ledgerColumns}
                data={ledgers}
                loading={ledgersLoading}
                pagination={{ ...ledgerPg, page }}
                onPageChange={setPage}
              />
            </>
          )}
          {tab === 'commissions' && (
            <DataTable
              columns={commColumns}
              data={comms}
              loading={commLoading}
              pagination={{ ...commPg, page }}
              onPageChange={setPage}
            />
          )}
        </div>
      </div>
    </div>
  );
}
