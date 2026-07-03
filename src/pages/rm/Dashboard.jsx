import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, FileText, Clock, CheckCircle, TrendingUp, AlertCircle } from 'lucide-react';
import { dashboardApi } from '@/api/dashboard.api';
import StatCard       from '@/components/common/StatCard';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { formatCurrency } from '@/utils/helpers';

export default function RMDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['rm-stats'],
    queryFn:  () => dashboardApi.rmStats(),
  });

  const stats = data?.data?.data || {};

  if (isLoading) return <LoadingSpinner fullPage />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">My Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Here's an overview of your performance.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard title="Assigned Agents"    value={stats.assigned_agents}  icon={Users}       color="blue"   />
        <StatCard title="Total Requests"     value={stats.new_requests}     icon={FileText}    color="indigo" />
        <StatCard title="Pending Requests"   value={stats.pending_requests} icon={Clock}       color="yellow" />
        <StatCard title="Policies Today"     value={stats.policies_today}   icon={CheckCircle} color="green"  />
        <StatCard title="Monthly Revenue"    value={formatCurrency(stats.monthly_revenue)} icon={TrendingUp} color="green" />
        <StatCard title="Claims Raised"      value={stats.claims_raised}    icon={AlertCircle} color="orange" />
      </div>

      <div className="card p-5">
        <h3 className="text-sm font-bold text-gray-700 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <a href="/rm/policy-requests"
            className="block p-4 rounded-xl border-2 border-blue-100 bg-blue-50 hover:bg-blue-100 transition-colors text-center">
            <span className="text-sm font-semibold text-blue-700">View Pending Requests</span>
          </a>
          <a href="/rm/agents"
            className="block p-4 rounded-xl border-2 border-emerald-100 bg-emerald-50 hover:bg-emerald-100 transition-colors text-center">
            <span className="text-sm font-semibold text-emerald-700">View My Agents</span>
          </a>
          <a href="/rm/notifications"
            className="block p-4 rounded-xl border-2 border-indigo-100 bg-indigo-50 hover:bg-indigo-100 transition-colors text-center">
            <span className="text-sm font-semibold text-indigo-700">Notifications</span>
          </a>
        </div>
      </div>
    </div>
  );
}
