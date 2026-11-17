import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { navigate } from '../utils/router';
import { MailCheck, ArrowRight, RefreshCw, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

export const VerifyEmailView: React.FC = () => {
  const { user, pendingEmailForVerification, latestDevVerificationCode, verifyEmail, resendVerificationCode, error, clearError } = useAuth();
  
  const targetEmail = pendingEmailForVerification || user?.email || '';
  const [code, setCode] = useState(latestDevVerificationCode || '');
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [localErr, setLocalErr] = useState('');

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalErr('');
    setSuccessMsg('');
    clearError();

    if (!code || code.trim().length < 6) {
      setLocalErr('Please enter the full 6-digit verification code.');
      return;
    }

    setSubmitting(true);
    const result = await verifyEmail(code.trim(), targetEmail);
    setSubmitting(false);

    if (result.success) {
      setSuccessMsg('Your email has been verified successfully!');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setLocalErr('');
    const res = await resendVerificationCode(targetEmail);
    setResending(false);
    if (res.success) {
      setSuccessMsg('A new verification code has been generated.');
      if (res.verificationCode) {
        setCode(res.verificationCode);
      }
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md">
        
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-500/10">
            <MailCheck className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Verify Your Email
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            We sent a 6-digit verification code to:
          </p>
          <div className="font-semibold text-slate-200 mt-1 font-mono text-sm">
            {targetEmail || 'your email address'}
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl backdrop-blur-sm">

          {/* Development / Preview Helper */}
          {latestDevVerificationCode && (
            <div className="mb-5 p-3.5 bg-indigo-950/40 border border-indigo-500/30 rounded-xl text-xs space-y-1">
              <div className="flex items-center gap-1.5 text-indigo-300 font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Verification Code Ready</span>
              </div>
              <p className="text-slate-300 text-[11px]">
                In this preview session, your code was delivered:
              </p>
              <div className="flex items-center justify-between pt-1">
                <span className="font-mono text-base font-bold tracking-widest text-cyan-400 bg-slate-950 px-3 py-1 rounded border border-slate-700">
                  {latestDevVerificationCode}
                </span>
                <button
                  type="button"
                  onClick={() => setCode(latestDevVerificationCode)}
                  className="px-2.5 py-1 rounded bg-indigo-600 text-white font-medium hover:bg-indigo-500 transition"
                >
                  Auto-Fill Code
                </button>
              </div>
            </div>
          )}

          {successMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {(localErr || error) && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-950/30 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{localErr || error}</span>
            </div>
          )}

          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 text-center">
                Enter 6-Digit Verification Code
              </label>
              <input
                type="text"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="123456"
                required
                className="w-full py-3 px-4 text-center tracking-[0.5em] font-mono text-xl bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition"
            >
              {submitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying Code...</span>
                </>
              ) : (
                <>
                  <span>Verify Email Address</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Didn&apos;t receive code?</span>
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 font-semibold transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
              Resend Code
            </button>
          </div>

          <div className="mt-4 text-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-xs text-slate-400 hover:text-slate-200 transition"
            >
              Skip for now &amp; go to dashboard
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
