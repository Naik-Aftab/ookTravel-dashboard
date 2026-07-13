import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Users, UserCheck, FileText, Shield, DollarSign,
  TrendingUp, AlertCircle, CheckCircle, Clock, XCircle
} from 'lucide-react';
import { dashboardApi } from '@/api/dashboard.api';
import StatCard       from '@/components/common/StatCard';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import RevenueChart   from '@/components/charts/RevenueChart';
import CommissionTrendChart from '@/components/charts/CommissionTrendChart';
import AgentGrowthChart     from '@/components/charts/AgentGrowthChart';
import RMPerformanceChart   from '@/components/charts/RMPerformanceChart';
import { formatCurrency }   from '@/utils/helpers';

export default function AdminDashboard() {
  const { data: statsRes, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn:  () => dashboardApi.adminStats(),
  });
  const { data: chartsRes, isLoading: chartsLoading } = useQuery({
    queryKey: ['admin-charts'],
    queryFn:  () => dashboardApi.adminCharts(),
  });

  const stats  = statsRes?.data?.data || {};
  const charts = chartsRes?.data?.data || {};

  if (statsLoading) return <LoadingSpinner fullPage />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Welcome back — here's what's happening.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        <StatCard title="Total Agents"    value={stats.total_agents}    icon={Users}       color="blue"   subtitle={`${stats.active_agents} active`} />
        <StatCard title="Total RMs"       value={stats.total_rms}       icon={UserCheck}   color="indigo" subtitle={`${stats.active_rms} active`} />
        <StatCard title="Total Policies"  value={stats.total_policies}  icon={Shield}      color="green"  />
        <StatCard title="Total Revenue"   value={formatCurrency(stats.total_revenue)} icon={TrendingUp} color="green" />
        <StatCard title="Total Requests"  value={stats.total_requests}  icon={FileText}    color="blue"   />
        <StatCard title="Pending Requests"value={stats.pending_requests}icon={Clock}       color="yellow" />
        {/* <StatCard title="Claims Raised"   value={stats.claimed_policies}icon={AlertCircle} color="orange" /> */}
        {/* <StatCard title="Rejected"        value={stats.rejected_requests}icon={XCircle}    color="red"    /> */}
        <StatCard title="Commission Payable" value={formatCurrency(stats.commission_payable)} icon={DollarSign} color="purple" />
        <StatCard title="Commission Paid"    value={formatCurrency(stats.commission_paid)}    icon={CheckCircle} color="green" />
        {/* <StatCard title="Pending Commission" value={formatCurrency(stats.commission_pending)} icon={Clock}       color="yellow" /> */}
        {/* <StatCard title="Pending Agents"     value={stats.pending_agents}  icon={Users}   color="yellow" subtitle="awaiting approval" /> */}
      </div>

      {/* Charts */}
      {!chartsLoading && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <RevenueChart data={charts.revenue || []} />
          <CommissionTrendChart data={charts.commission || []} />
          <AgentGrowthChart data={charts.agents || []} />
          <RMPerformanceChart data={charts.rm_performance || []} />
        </div>
      )}
    </div>
  );
}
