import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { navigate, useLocation, parseQueryParams } from '../utils/router';
import { KeyRound, Mail, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, ExternalLink, Copy, Check } from 'lucide-react';

export const ForgotPasswordView: React.FC = () => {
  const { search } = useLocation();
  const query = parseQueryParams(search);
  const { forgotPassword, error, clearError } = useAuth();
  const [email, setEmail] = useState(query.email || '');
  const [submitting, setSubmitting] = useState(false);
  const [localErr, setLocalErr] = useState('');
  const [resetData, setResetData] = useState<{ resetToken: string; resetLink: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalErr('');
    clearError();

    const cleanEmail = email.trim();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setLocalErr('Please enter a valid registered email address.');
      return;
    }

    setSubmitting(true);
    const result = await forgotPassword(cleanEmail);
    setSubmitting(false);

    if (result.success && result.resetToken && result.resetLink) {
      setResetData({
        resetToken: result.resetToken,
        resetLink: result.resetLink
      });
    }
  };

  const copyResetLink = () => {
    if (resetData) {
      const fullLink = window.location.origin + resetData.resetLink;
      navigator.clipboard.writeText(fullLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md">
        
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-500/10">
            <KeyRound className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Reset Password
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            Enter your registered email to receive a secure recovery link.
          </p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl backdrop-blur-sm">

          {(localErr || error) && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-950/30 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{localErr || error}</span>
            </div>
          )}

          {resetData ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-emerald-300 text-xs flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-emerald-300">Secure Reset Link Generated!</h4>
                  <p className="text-slate-300 mt-1 leading-relaxed">
                    A cryptographically signed password reset token has been created with a 1-hour expiration window.
                  </p>
                </div>
              </div>

              {/* Dev Simulation & Direct Action */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                <div className="text-xs text-slate-400 font-medium">Reset Link:</div>
                <div className="flex items-center gap-2 bg-slate-900 p-2 rounded-lg border border-slate-700/80">
                  <span className="text-xs font-mono text-cyan-400 truncate flex-1">
                    {window.location.origin}{resetData.resetLink}
                  </span>
                  <button
                    onClick={copyResetLink}
                    className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition"
                    title="Copy Link"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => navigate(resetData.resetLink)}
                  className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition shadow-md shadow-indigo-600/20"
                >
                  <span>Open Password Reset Page</span>
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>

              <div className="pt-2 text-center">
                <button
                  onClick={() => navigate('/login')}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to Sign In
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Registered Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (localErr) setLocalErr('');
                    }}
                    placeholder="name@company.com"
                    autoComplete="email"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition"
              >
                {submitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Generating Secure Link...</span>
                  </>
                ) : (
                  <>
                    <span>Send Password Reset Link</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to Sign In
                </button>
              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};
