import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, CheckCircle, AlertCircle, Users, Briefcase } from 'lucide-react';
import logo from '@/assets/logo.png';
import { authApi } from '@/api/auth.api';

export default function RMSignup() {
  const [form, setForm]       = useState({ full_name: '', email: '', mobile: '', password: '', confirm: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone]       = useState(false);
  const [error, setError]     = useState('');

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (form.password !== form.confirm) { setError('Passwords do not match'); return; }
    setError(''); setLoading(true);
    try {
      await authApi.rmSignup({ full_name: form.full_name, email: form.email, mobile: form.mobile, password: form.password });
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-950 to-teal-950 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-sm w-full text-center relative">
          <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <CheckCircle size={36} className="text-emerald-500" />
          </div>
          <h2 className="text-xl font-extrabold text-gray-900 mb-2">Registration Submitted!</h2>
          <p className="text-sm text-gray-500 mb-7 leading-relaxed">
            Your RM account is pending admin approval. You'll receive an email once approved.
          </p>
          <Link to="/login" className="btn-primary w-full justify-center py-2.5">Back to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex flex-col w-5/12 bg-gradient-to-br from-slate-900 via-emerald-950 to-teal-950 relative overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col h-full px-12 py-14">
          <div className="bg-white rounded-2xl px-5 py-3 self-start">
            <img src={logo} alt="OOK Travel" className="h-10 w-auto object-contain" />
          </div>

          <div className="flex-1 flex flex-col justify-center">
            <h2 className="text-4xl font-extrabold text-white leading-tight mb-4">
              Join as a<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
                Relationship
              </span><br />
              Manager
            </h2>
            <p className="text-slate-400 text-base leading-relaxed mb-8">
              Manage your agents, track policies, and grow your network with OOK Travel's RM portal.
            </p>
            <div className="space-y-4">
              {[
                { icon: Users,     text: 'Manage your agent network' },
                { icon: Briefcase, text: 'Track commissions & policies' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon size={17} className="text-emerald-300" />
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
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 px-6 py-12 overflow-y-auto">
        <div className="lg:hidden mb-8">
          <div className="bg-white rounded-2xl px-6 py-3 shadow-md">
            <img src={logo} alt="OOK Travel" className="h-12 w-auto object-contain" />
          </div>
        </div>

        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 className="text-2xl font-extrabold text-gray-900">Create RM Account</h1>
            <p className="text-gray-500 text-sm mt-1">Fill in your details to register as a Relationship Manager</p>
          </div>

          <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/80 border border-gray-100 p-7">
            {error && (
              <div className="flex items-start gap-3 p-3.5 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 mb-5">
                <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              {[
                { name: 'full_name', label: 'Full Name',     type: 'text',  placeholder: 'John Doe' },
                { name: 'email',     label: 'Email Address', type: 'email', placeholder: 'you@example.com' },
                { name: 'mobile',    label: 'Mobile Number', type: 'tel',   placeholder: '9876543210' },
              ].map(({ name, label, type, placeholder }) => (
                <div key={name}>
                  <label className="form-label">{label}</label>
                  <input name={name} type={type} value={form[name]} onChange={handleChange}
                    className="form-input" placeholder={placeholder} required />
                </div>
              ))}
              <div>
                <label className="form-label">Password</label>
                <div className="relative">
                  <input name="password" type={showPwd ? 'text' : 'password'} value={form.password}
                    onChange={handleChange} className="form-input pr-11" placeholder="Min 8 characters" required />
                  <button type="button" onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPwd ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="form-label">Confirm Password</label>
                <input name="confirm" type="password" value={form.confirm} onChange={handleChange}
                  className="form-input" placeholder="Repeat your password" required />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 text-base mt-1">
                {loading ? 'Submitting…' : 'Register as RM'}
              </button>
            </form>
            <p className="text-center text-sm text-gray-500 mt-5">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 hover:underline font-semibold">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
