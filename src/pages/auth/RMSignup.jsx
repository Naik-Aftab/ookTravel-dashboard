import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, CheckCircle } from 'lucide-react';
import logo from '@/assets/logo.png';
import { authApi } from '@/api/auth.api';

export default function RMSignup() {
  const navigate = useNavigate();
  const [form, setForm]     = useState({ full_name: '', email: '', mobile: '', password: '', confirm: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone]     = useState(false);
  const [error, setError]   = useState('');

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
      <div className="min-h-screen bg-gradient-to-br from-green-600 to-teal-700 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <CheckCircle size={56} className="text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Registration Submitted!</h2>
          <p className="text-sm text-gray-500 mb-6">Your RM account is pending admin approval. You'll receive an email once approved.</p>
          <Link to="/login" className="btn-primary">Back to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-600 to-teal-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-block bg-white rounded-2xl px-6 py-3 mb-3 shadow-lg">
            <img src={logo} alt="OOK Travel" className="h-14 w-auto object-contain" />
          </div>
          <p className="text-green-200 text-sm">RM Registration</p>
        </div>
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Create RM Account</h2>
          {error && <p className="text-sm text-red-600 mb-4 p-3 bg-red-50 rounded-lg">{error}</p>}
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
                  onChange={handleChange} className="form-input pr-10" placeholder="Min 8 chars" required />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label className="form-label">Confirm Password</label>
              <input name="confirm" type="password" value={form.confirm} onChange={handleChange}
                className="form-input" placeholder="Repeat password" required />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5">
              {loading ? 'Submitting...' : 'Register as RM'}
            </button>
          </form>
          <p className="text-center text-xs text-gray-500 mt-4">
            Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
