import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  LayoutDashboard, Users, UserCheck, FileText, Shield,
  DollarSign, ClipboardList, Menu, X, Bell, LogOut, ChevronDown
} from 'lucide-react';
import logo from '@/assets/logo.png';
import { logout } from '@/store/authSlice';
import { authApi } from '@/api/auth.api';

const navItems = [
  { to: '/admin',             icon: LayoutDashboard, label: 'Dashboard',    end: true },
  { to: '/admin/rms',         icon: UserCheck,       label: 'RM Management' },
  { to: '/admin/agents',      icon: Users,           label: 'Agents' },
  { to: '/admin/policy-requests', icon: FileText,    label: 'Policy Requests' },
  { to: '/admin/policies',    icon: Shield,          label: 'Policies' },
  { to: '/admin/commissions', icon: DollarSign,      label: 'Commissions' },
  { to: '/admin/audit-logs',  icon: ClipboardList,   label: 'Audit Logs' },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { user }  = useSelector(s => s.auth);

  const handleLogout = async () => {
    try { await authApi.logout(); } catch {}
    dispatch(logout());
    navigate('/login');
  };

  const Sidebar = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex flex-col items-center px-4 py-4 border-b border-blue-700/30">
        <div className="rounded-xl px-3 py-2 w-full flex items-center justify-center">
          <img src={logo} alt="OOK Travel" className="h-16 w-auto object-contain" />
        </div>
        <p className="text-blue-200 text-xs mt-2 font-medium">Admin Panel</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label, end }) => (
          <NavLink key={to} to={to} end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive ? 'bg-white/20 text-white' : 'text-blue-100 hover:bg-white/10 hover:text-white'
              }`
            }
            onClick={() => setSidebarOpen(false)}>
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-blue-700/30">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center text-white text-xs font-semibold">
            {user?.full_name?.[0] || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-medium truncate">{user?.full_name || 'Admin'}</p>
            <p className="text-blue-200 text-xs truncate">{user?.email}</p>
          </div>
        </div>
        <button onClick={handleLogout}
          className="mt-1 flex items-center gap-2 px-3 py-2 w-full text-blue-200 hover:text-white hover:bg-white/10 rounded-lg text-sm transition-colors">
          <LogOut size={15} />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-60 bg-blue-600 flex-shrink-0">
        <Sidebar />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="fixed inset-y-0 left-0 w-64 bg-blue-600 z-50 flex flex-col">
            <div className="absolute top-3 right-3">
              <button onClick={() => setSidebarOpen(false)} className="p-1.5 text-white/70 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <Sidebar />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 flex items-center justify-between px-4 py-3 flex-shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-1.5 text-gray-500 hover:text-gray-700">
            <Menu size={20} />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <button className="relative p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
              <Bell size={18} />
            </button>
            <div className="relative">
              <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xs font-semibold">
                  {user?.full_name?.[0] || 'A'}
                </div>
                <span className="font-medium">{user?.full_name || 'Admin'}</span>
                <ChevronDown size={14} />
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 mt-1 w-44 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <button onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                    <LogOut size={14} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
