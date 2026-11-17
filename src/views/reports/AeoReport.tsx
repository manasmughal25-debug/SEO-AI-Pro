import React from 'react';
import { AuditRecord } from '../../types';
import { ScoreGauge } from '../../components/ScoreGauge';
import { IssueCard } from '../../components/IssueCard';
import { HelpCircle, Mic, CheckCircle2, AlertCircle, FileCode, MessageSquare, Lightbulb } from 'lucide-react';

interface ReportProps {
  audit: AuditRecord;
}

export const AeoReport: React.FC<ReportProps> = ({ audit }) => {
  const aeoIssues = audit.issues.filter(i => i.category === 'AEO');
  const hasFaq = audit.summary.schemaTypes.some(t => /faq/i.test(t));
  const questionHeadings = audit.summary.headings.filter(h => 
    /^(what|how|why|where|when|who|can|which|is|are)/i.test(h.text) || h.text.endsWith('?')
  );

  return (
    <div className="space-y-8">
      
      {/* Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center gap-6">
        <ScoreGauge score={audit.scores.aeo} size="lg" label="AEO Score" />
        <div className="flex-1 space-y-2 text-center md:text-left">
          <span className="text-xs font-mono font-semibold text-cyan-400 uppercase tracking-wider">
            Answer Engine Optimization (AEO)
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            Conversational &amp; Voice Search Readiness
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Measures how cleanly answer engines (Google SGE, Siri, Google Assistant, Amazon Alexa) can extract concise direct answers, FAQ accordions, and featured snippets from your pages.
          </p>
        </div>
      </div>

      {/* Feature cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">FAQ Schema</span>
            <FileCode className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl font-bold text-white flex items-center gap-2">
            {hasFaq ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span className="text-emerald-400">Detected</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-5 h-5 text-amber-400" />
                <span className="text-amber-400">Not Found</span>
              </>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {hasFaq 
              ? 'Qualifies for accordion rich answers in Google SERP.' 
              : 'Add FAQPage JSON-LD to unlock direct Google question boxes.'}
          </p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Question Headings</span>
            <MessageSquare className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white">
            {questionHeadings.length} Identified
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Headings formatted as natural questions match voice search queries verbatim.
          </p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Voice Synthesis Readiness</span>
            <Mic className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl font-bold font-mono text-cyan-400">
            {audit.scores.aeo >= 75 ? 'High Eligibility' : 'Needs Structure'}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Short definition answers right under headings boost spoken readouts.
          </p>
        </div>

      </div>

      {/* Question Headings Breakdown */}
      {questionHeadings.length > 0 && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-cyan-400" />
            Detected Conversational Queries
          </h3>
          <div className="space-y-2">
            {questionHeadings.map((h, i) => (
              <div key={i} className="flex items-center gap-3 bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-xs">
                <span className="font-mono text-cyan-400 font-bold">{h.level}</span>
                <span className="text-slate-200">{h.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AEO Issues List */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white">AEO Findings &amp; Snippet Upgrades</h3>
        <div className="space-y-3">
          {aeoIssues.map(issue => (
            <IssueCard key={issue.id} issue={issue} />
          ))}
        </div>
      </div>

    </div>
  );
};
