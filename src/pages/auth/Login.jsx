import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Eye, EyeOff, AlertCircle, Plane, Globe, Shield } from 'lucide-react';
import logo from '@/assets/logo.png';
import { setCredentials } from '@/store/authSlice';
import { authApi } from '@/api/auth.api';

const features = [
  { icon: Shield, text: 'Secure insurance management' },
  { icon: Globe,  text: 'Multi-region policy support' },
  { icon: Plane,  text: 'Travel coverage for all destinations' },
];

export default function Login() {
  const [tab, setTab]         = useState('rm');
  const [form, setForm]       = useState({ email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const dispatch               = useDispatch();
  const navigate               = useNavigate();

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
    <div className="min-h-screen flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex flex-col w-5/12 bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 relative overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col h-full px-12 py-14">
          <div className="bg-white rounded-2xl px-5 py-3 self-start">
            <img src={logo} alt="OOK Travel" className="h-10 w-auto object-contain" />
          </div>

          <div className="flex-1 flex flex-col justify-center">
            <h2 className="text-4xl font-extrabold text-white leading-tight mb-4">
              Insurance<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">
                Management
              </span><br />
              Platform
            </h2>
            <p className="text-slate-400 text-base leading-relaxed mb-10">
              Streamline travel insurance operations with a powerful, unified dashboard for admins and relationship managers.
            </p>
            <div className="space-y-4">
              {features.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon size={17} className="text-blue-300" />
                  </div>
                  <span className="text-slate-300 text-sm font-medium">{text}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-slate-600 text-xs">© 2025 OOK Travel. All rights reserved.</p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 px-6 py-12">
        <div className="lg:hidden mb-8">
          <div className="bg-white rounded-2xl px-6 py-3 shadow-md">
            <img src={logo} alt="OOK Travel" className="h-12 w-auto object-contain" />
          </div>
        </div>

        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 className="text-2xl font-extrabold text-gray-900">Welcome back</h1>
            <p className="text-gray-500 text-sm mt-1">Sign in to your account to continue</p>
          </div>

          <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/80 border border-gray-100 overflow-hidden">
            {/* Tabs */}
            <div className="flex bg-gray-50 p-1.5 gap-1.5 border-b border-gray-100">
              {[['rm', 'Staff Login'],['admin', 'Admin Login'], ].map(([key, label]) => (
                <button key={key} onClick={() => { setTab(key); setError(''); }}
                  className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all ${
                    tab === key
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}>
                  {label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="p-7 space-y-5">
              {error && (
                <div className="flex items-start gap-3 p-3.5 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
                  <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                  {error}
                </div>
              )}

              <div>
                <label className="form-label">Email Address</label>
                <input name="email" type="email" value={form.email} onChange={handleChange}
                  className="form-input" placeholder="you@example.com" required autoFocus />
              </div>

              <div>
                <div className="mb-1.5">
                  <label className="form-label !mb-0">Password</label>
                </div>
                <div className="relative">
                  <input name="password" type={showPwd ? 'text' : 'password'} value={form.password}
                    onChange={handleChange} className="form-input pr-11" placeholder="••••••••" required />
                  <button type="button" onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5">
                    {showPwd ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 text-base mt-1">
                {loading ? 'Signing in…' : `Sign In as ${tab === 'admin' ? 'Admin' : 'RM'}`}
              </button>

              {tab === 'rm' && (
                <p className="text-center text-sm text-gray-500 pt-1">
                  Don't have an account?{' '}
                  <Link to="/rm-signup" className="text-blue-600 hover:underline font-semibold">Sign Up</Link>
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
