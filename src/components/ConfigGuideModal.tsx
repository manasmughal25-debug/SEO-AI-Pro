import React from 'react';
import { X, CheckCircle2, ShieldCheck, Mail, Server, Info, AlertTriangle } from 'lucide-react';

interface ConfigGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConfigGuideModal: React.FC<ConfigGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 relative text-slate-200"
        role="dialog"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Authentication & System Setup Guide</h2>
            <p className="text-xs text-slate-400">CrawlLens Security Architecture & Configuration</p>
          </div>
        </div>

        {/* Resolved Urdu Note Highlight */}
        <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-4 mb-5">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-sm">
              <h4 className="font-semibold text-emerald-300">Firebase &apos;operation-not-allowed&apos; Error Resolved</h4>
              <p className="text-slate-300 text-xs mt-1 leading-relaxed">
                The generic Firebase error occurred because Firebase clouds default to disabling Email/Password provider until manually turned on. CrawlLens now operates with a dedicated, hardened <strong>Server-Side Auth Engine</strong>.
              </p>
              <div className="mt-2.5 text-xs text-emerald-200/90 bg-emerald-900/30 p-2.5 rounded-lg border border-emerald-500/20 space-y-1">
                <div>✓ <strong>Dual Authentication:</strong> Existing Google users can now log in via Google OR Email &amp; Password.</div>
                <div>✓ <strong>Seamless Password Linking:</strong> Setting a password on login, signup, or profile attaches to your Google account without duplicates.</div>
                <div>✓ <strong>Password Security:</strong> Salted PBKDF2 cryptography (SHA-512 with 100,000 iterations).</div>
                <div>✓ <strong>Password Recovery:</strong> Secure 1-hour reset tokens enable password creation anytime.</div>
              </div>
            </div>
          </div>
        </div>

        {/* Environment Variables Section */}
        <div className="space-y-4 text-xs">
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-2">
              <Mail className="w-4 h-4 text-indigo-400" />
              Production Email Service Configuration
            </h3>
            <p className="text-slate-300 mb-2 leading-relaxed">
              In this environment, email verification codes and password reset links are delivered directly on screen and via server logs for frictionless testing. For production deployments with third-party transactional mail (SendGrid, Resend, Postmark, AWS SES), add the following environment variables:
            </p>

            <div className="bg-slate-950 rounded-lg p-3 border border-slate-800 font-mono text-slate-300 overflow-x-auto space-y-1">
              <div className="text-slate-500"># Optional: Outbound Transactional Email Settings</div>
              <div><span className="text-indigo-400">SMTP_HOST</span>=&quot;smtp.resend.com&quot;</div>
              <div><span className="text-indigo-400">SMTP_PORT</span>=&quot;587&quot;</div>
              <div><span className="text-indigo-400">SMTP_USER</span>=&quot;resend&quot;</div>
              <div><span className="text-indigo-400">SMTP_PASS</span>=&quot;re_123456789...&quot;</div>
              <div><span className="text-indigo-400">SMTP_FROM</span>=&quot;notifications@yourdomain.com&quot;</div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-2">
              <Server className="w-4 h-4 text-indigo-400" />
              Active System Status
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/60">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Authentication</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1.5 mt-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Active (Secure PBKDF2)
                </span>
              </div>
              <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/60">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Web Crawler</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1.5 mt-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Server Engine (Cheerio)
                </span>
              </div>
              <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/60">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Database Store</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1.5 mt-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  Persistent JSON File
                </span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-1.5">
              <Info className="w-4 h-4 text-indigo-400" />
              Quick Test Credentials
            </h3>
            <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50 flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-slate-300 font-mono">Email: demo@crawllens.io</span>
                <span className="text-slate-400 font-mono block">Password: DemoPass123!</span>
              </div>
              <span className="px-2.5 py-1 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[11px] font-medium">
                Pre-verified account
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition text-xs shadow-lg shadow-indigo-600/20"
          >
            Got it, Back to App
          </button>
        </div>
      </div>
    </div>
  );
};
