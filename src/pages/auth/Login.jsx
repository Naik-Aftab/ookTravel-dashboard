import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import logo from '@/assets/logo.png';
import { setCredentials } from '@/store/authSlice';
import { authApi } from '@/api/auth.api';

export default function Login() {
  const [tab, setTab]       = useState('admin');
  const [form, setForm]     = useState({ email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');
  const dispatch             = useDispatch();
  const navigate             = useNavigate();

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const fn = tab === 'admin' ? authApi.adminLogin : authApi.rmLogin;
      const { data } = await fn(form);
      dispatch(setCredentials({
        user:         { ...data.data.user, role: tab },
        accessToken:  data.data.accessToken,
        refreshToken: data.data.refreshToken,
      }));
      navigate(tab === 'admin' ? '/admin' : '/rm');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-block bg-white rounded-2xl px-6 py-3 mb-3 shadow-lg">
            <img src={logo} alt="OOK Travel" className="h-14 w-auto object-contain" />
          </div>
          <p className="text-blue-200 text-sm mt-1">Insurance Management Platform</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-100">
            {['admin', 'rm'].map(t => (
              <button key={t} onClick={() => { setTab(t); setError(''); }}
                className={`flex-1 py-3.5 text-sm font-medium transition-colors ${
                  tab === t ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'
                }`}>
                {t === 'admin' ? 'Admin Login' : 'RM Login'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                <AlertCircle size={16} className="flex-shrink-0" />
                {error}
              </div>
            )}

            <div>
              <label className="form-label">Email Address</label>
              <input name="email" type="email" value={form.email} onChange={handleChange}
                className="form-input" placeholder="you@example.com" required autoFocus />
            </div>

            <div>
              <label className="form-label">Password</label>
              <div className="relative">
                <input name="password" type={showPwd ? 'text' : 'password'} value={form.password}
                  onChange={handleChange} className="form-input pr-10" placeholder="••••••••" required />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {tab === 'admin' && (
              <div className="text-right">
                <Link to="/forgot-password" className="text-xs text-blue-600 hover:underline">Forgot password?</Link>
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5">
              {loading ? 'Signing in...' : `Sign In as ${tab === 'admin' ? 'Admin' : 'RM'}`}
            </button>

            {tab === 'rm' && (
              <p className="text-center text-xs text-gray-500">
                Don't have an account?{' '}
                <Link to="/rm-signup" className="text-blue-600 hover:underline font-medium">Sign Up</Link>
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
