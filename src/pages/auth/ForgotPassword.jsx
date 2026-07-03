import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Mail } from 'lucide-react';
import logo from '@/assets/logo.png';
import { authApi } from '@/api/auth.api';

export default function ForgotPassword() {
  const [email, setEmail]     = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);
  const [error, setError]     = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await authApi.forgotPassword(email);
      setSent(true);
    } catch {
      setError('Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute -top-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm relative">
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-2xl px-6 py-3">
            <img src={logo} alt="OOK Travel" className="h-12 w-auto object-contain" />
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8">
          {sent ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <CheckCircle size={32} className="text-green-500" />
              </div>
              <h2 className="text-xl font-extrabold text-gray-900 mb-2">Email Sent!</h2>
              <p className="text-sm text-gray-500 mb-7 leading-relaxed">
                Check your inbox for a password reset link. It may take a few minutes.
              </p>
              <Link to="/login" className="btn-primary w-full justify-center py-2.5">Back to Login</Link>
            </div>
          ) : (
            <>
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mb-5">
                <Mail size={24} className="text-blue-600" />
              </div>
              <h2 className="text-xl font-extrabold text-gray-900 mb-1.5">Forgot Password?</h2>
              <p className="text-sm text-gray-500 mb-6">Enter your admin email to receive a reset link.</p>
              {error && (
                <p className="text-sm text-red-600 mb-4 p-3.5 bg-red-50 border border-red-100 rounded-xl">{error}</p>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="form-label">Email Address</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    className="form-input" placeholder="admin@ooktravel.com" required autoFocus />
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 text-base">
                  {loading ? 'Sending…' : 'Send Reset Link'}
                </button>
              </form>
              <Link to="/login"
                className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-700 mt-5 font-medium">
                <ArrowLeft size={14} /> Back to Login
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
