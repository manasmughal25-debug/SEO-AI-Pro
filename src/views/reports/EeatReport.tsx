import React from 'react';
import { AuditRecord } from '../../types';
import { ScoreGauge } from '../../components/ScoreGauge';
import { IssueCard } from '../../components/IssueCard';
import { Award, ShieldCheck, CheckCircle2, XCircle, UserCheck, FileText, Lock, Building } from 'lucide-react';

interface ReportProps {
  audit: AuditRecord;
}

export const EeatReport: React.FC<ReportProps> = ({ audit }) => {
  const eeatIssues = audit.issues.filter(i => i.category === 'EEAT');
  const signals = audit.summary.eeatSignals;

  return (
    <div className="space-y-8">
      
      {/* Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center gap-6">
        <ScoreGauge score={audit.scores.eeat} size="lg" label="E-E-A-T Score" />
        <div className="flex-1 space-y-2 text-center md:text-left">
          <span className="text-xs font-mono font-semibold text-emerald-400 uppercase tracking-wider">
            Google Quality Rater Standards
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            Experience, Expertise, Authoritativeness &amp; Trust (E-E-A-T)
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Evaluates the trustworthiness of your domain according to Google&apos;s Search Quality Evaluator Guidelines. Inspects author attribution, organizational credentials, customer service contact, and cryptographic HTTPS security.
          </p>
        </div>
      </div>

      {/* Trust Signal Checklist */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Verified Trust &amp; Transparency Signals</h3>
          </div>
          <span className="text-xs text-slate-400">
            {signals.filter(s => s.detected).length} of {signals.length} Signals Present
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {signals.map((sig, i) => (
            <div
              key={i}
              className={`p-4 rounded-xl border flex items-start gap-3 transition ${
                sig.detected 
                  ? 'bg-slate-950/70 border-emerald-500/20' 
                  : 'bg-slate-950/40 border-slate-800/80'
              }`}
            >
              <div className="mt-0.5">
                {sig.detected ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                ) : (
                  <XCircle className="w-5 h-5 text-slate-600 shrink-0" />
                )}
              </div>
              <div>
                <h4 className={`text-xs font-semibold ${sig.detected ? 'text-slate-100' : 'text-slate-400'}`}>
                  {sig.signal}
                </h4>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  {sig.detail}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Four Pillars of E-E-A-T */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl space-y-1.5">
          <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold">Pillar 1</span>
          <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
            <UserCheck className="w-4 h-4 text-emerald-400" />
            Experience
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            First-hand usage, original screenshots, customer case studies, and authentic product demonstration.
          </p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl space-y-1.5">
          <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold">Pillar 2</span>
          <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
            <Award className="w-4 h-4 text-emerald-400" />
            Expertise
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Verified author bios, professional credentials, industry accreditation, and technical depth.
          </p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl space-y-1.5">
          <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold">Pillar 3</span>
          <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
            <Building className="w-4 h-4 text-emerald-400" />
            Authoritativeness
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Reputation among peers, third-party press mentions, backlinks, and recognized topical domain history.
          </p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl space-y-1.5">
          <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold">Pillar 4</span>
          <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-emerald-400" />
            Trustworthiness
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Secure HTTPS checkout, transparent refund policy, customer service phone/email, and privacy terms.
          </p>
        </div>

      </div>

      {/* Issues */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white">Trust &amp; Authority Issues</h3>
        <div className="space-y-3">
          {eeatIssues.map(issue => (
            <IssueCard key={issue.id} issue={issue} />
          ))}
        </div>
      </div>

    </div>
  );
};
