import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { LayoutDashboard, Users, FileText, Bell, Menu, X, LogOut } from 'lucide-react';
import logo from '@/assets/logo.png';
import { logout } from '@/store/authSlice';
import { authApi } from '@/api/auth.api';

const navItems = [
  { to: '/rm',                 icon: LayoutDashboard, label: 'Dashboard',       end: true },
  { to: '/rm/agents',          icon: Users,           label: 'My Agents' },
  { to: '/rm/policy-requests', icon: FileText,        label: 'Policy Requests' },
  { to: '/rm/notifications',   icon: Bell,            label: 'Notifications' },
];

export default function RMLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(s => s.auth);

  const handleLogout = async () => {
    try { await authApi.logout(); } catch {}
    dispatch(logout());
    navigate('/login');
  };

  const initials = user?.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'RM';

  const Sidebar = () => (
    <div className="flex flex-col h-full bg-slate-900">
      <div className="flex flex-col items-center px-5 pt-6 pb-5">
        <div className="bg-white rounded-2xl px-4 py-3 w-full flex items-center justify-center">
          <img src={logo} alt="OOK Travel" className="h-14 w-auto object-contain" />
        </div>
        <div className="mt-3 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <p className="text-emerald-300 text-xs font-semibold tracking-widest uppercase">RM Dashboard</p>
        </div>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent mx-4 mb-2" />

      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label, end }) => (
          <NavLink key={to} to={to} end={end}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
              }`
            }>
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent mx-4 mt-2" />

      <div className="px-3 py-4">
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/5">
          <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white text-xs font-bold shadow-md shadow-emerald-900/40 flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-semibold truncate">{user?.full_name || 'RM'}</p>
            <p className="text-slate-400 text-xs truncate">{user?.email}</p>
          </div>
        </div>
        <button onClick={handleLogout}
          className="mt-2 flex items-center gap-2 px-3 py-2 w-full text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl text-xs font-medium transition-all">
          <LogOut size={14} />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <aside className="hidden lg:flex flex-col w-64 flex-shrink-0 shadow-xl shadow-black/20">
        <Sidebar />
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <aside className="fixed inset-y-0 left-0 w-64 z-50 flex flex-col shadow-2xl">
            <div className="absolute top-4 right-4 z-10">
              <button onClick={() => setSidebarOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white bg-white/10 rounded-lg">
                <X size={18} />
              </button>
            </div>
            <Sidebar />
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white border-b border-gray-100 flex items-center gap-3 px-5 py-3 flex-shrink-0 shadow-sm">
          <button onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl">
            <Menu size={20} />
          </button>
          <div className="hidden lg:block">
            <p className="text-xs text-gray-400 font-medium">OOK Travel</p>
            <p className="text-sm font-bold text-gray-800 leading-none mt-0.5">RM Portal</p>
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white text-xs font-bold shadow-sm">
              {initials}
            </div>
            <span className="text-sm font-semibold text-gray-700 hidden sm:block">{user?.full_name}</span>
            <button onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-xl font-medium transition-colors">
              <LogOut size={15} /> Logout
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-5 lg:p-7">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
