import React from 'react';
import { AuditRecord } from '../../types';
import { ScoreGauge } from '../../components/ScoreGauge';
import { IssueCard } from '../../components/IssueCard';
import { Cpu, Bot, CheckCircle2, XCircle, Sparkles, Database, FileCheck } from 'lucide-react';

interface ReportProps {
  audit: AuditRecord;
}

export const AioReport: React.FC<ReportProps> = ({ audit }) => {
  const aioIssues = audit.issues.filter(i => i.category === 'AIO');

  return (
    <div className="space-y-8">
      
      {/* Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center gap-6">
        <ScoreGauge score={audit.scores.aio} size="lg" label="AIO Score" />
        <div className="flex-1 space-y-2 text-center md:text-left">
          <span className="text-xs font-mono font-semibold text-purple-400 uppercase tracking-wider">
            Artificial Intelligence Optimization (AIO)
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            AI Search Engine &amp; LLM Retrieval Readiness
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Evaluates your website for generative AI search tools (ChatGPT Search, Perplexity AI, Claude, and Gemini). Verifies crawler access, semantic context depth, and knowledge representation.
          </p>
        </div>
      </div>

      {/* AI Bot Crawler Directive Matrix */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-purple-400" />
            <h3 className="text-base font-bold text-white">Generative AI Web Crawler Directives</h3>
          </div>
          <span className="text-xs text-slate-400">Robots Meta &amp; Access Check</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {audit.summary.aiBotDirectives.map((botInfo, i) => (
            <div 
              key={i}
              className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between"
            >
              <div className="flex items-center gap-2.5">
                <div className={`p-1.5 rounded-lg ${botInfo.allowed ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                  <Bot className="w-4 h-4" />
                </div>
                <span className="text-xs font-medium text-slate-200">{botInfo.bot}</span>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                botInfo.allowed 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                  : 'bg-red-500/10 text-red-400 border-red-500/20'
              }`}>
                {botInfo.allowed ? 'Allowed' : 'Blocked'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* RAG & LLM Extraction Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-2">
          <span className="text-xs font-semibold text-slate-400">Context Window Density</span>
          <div className="text-xl font-bold font-mono text-purple-400">
            {audit.summary.wordCount} Words
          </div>
          <p className="text-xs text-slate-400">
            {audit.summary.wordCount >= 600 
              ? 'Sufficient token depth for vector embeddings & RAG retrieval.' 
              : 'Thin content may get skipped by AI citation models.'}
          </p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-2">
          <span className="text-xs font-semibold text-slate-400">Knowledge Schemas</span>
          <div className="text-xl font-bold font-mono text-white">
            {audit.summary.schemaTypes.length > 0 ? audit.summary.schemaTypes.join(', ') : 'None'}
          </div>
          <p className="text-xs text-slate-400">
            Helps LLMs connect verified factual attributes to your brand entity.
          </p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-2">
          <span className="text-xs font-semibold text-slate-400">AI Citation Potential</span>
          <div className="text-xl font-bold font-mono text-emerald-400">
            {audit.scores.aio >= 75 ? 'Strong Citation Odds' : 'Medium Potential'}
          </div>
          <p className="text-xs text-slate-400">
            Pages with clear definitions and clean data are frequently linked in Perplexity answers.
          </p>
        </div>

      </div>

      {/* Issues */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white">AI Search Recommendations</h3>
        <div className="space-y-3">
          {aioIssues.map(issue => (
            <IssueCard key={issue.id} issue={issue} />
          ))}
        </div>
      </div>

    </div>
  );
};
