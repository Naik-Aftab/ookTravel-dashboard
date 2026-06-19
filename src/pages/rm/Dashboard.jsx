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
        <h1 className="text-xl font-bold text-gray-900">My Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Here's an overview of your performance.</p>
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
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { label: 'View Pending Requests', href: '/rm/policy-requests', color: 'blue' },
            { label: 'View My Agents',         href: '/rm/agents',          color: 'green' },
            { label: 'Notifications',          href: '/rm/notifications',   color: 'indigo' },
          ].map(({ label, href, color }) => (
            <a key={href} href={href}
              className={`block p-4 rounded-xl border-2 border-${color}-100 bg-${color}-50 hover:bg-${color}-100 transition-colors text-center`}>
              <span className={`text-sm font-semibold text-${color}-700`}>{label}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
