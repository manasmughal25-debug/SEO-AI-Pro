import React from 'react';
import { AuditRecord } from '../../types';
import { ScoreGauge } from '../../components/ScoreGauge';
import { IssueCard } from '../../components/IssueCard';
import { Sparkles, Table, Quote, Share2, TrendingUp, CheckCircle2 } from 'lucide-react';

interface ReportProps {
  audit: AuditRecord;
}

export const GeoReport: React.FC<ReportProps> = ({ audit }) => {
  const geoIssues = audit.issues.filter(i => i.category === 'GEO');

  return (
    <div className="space-y-8">
      
      {/* Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center gap-6">
        <ScoreGauge score={audit.scores.geo} size="lg" label="GEO Score" />
        <div className="flex-1 space-y-2 text-center md:text-left">
          <span className="text-xs font-mono font-semibold text-pink-400 uppercase tracking-wider">
            Generative Engine Optimization (GEO)
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            Generative Synthesis &amp; Multi-Angle Authority
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Measures how effectively generative engines can synthesize your content into comparison grids, summary bullet points, and authoritative citations.
          </p>
        </div>
      </div>

      {/* Synthesis Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Structured Data Tables</span>
            <Table className="w-4 h-4 text-pink-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white">
            Comparative Tables
          </div>
          <p className="text-xs text-slate-400">
            Generative AI heavily favors HTML tables to produce comparative side-by-side matrices.
          </p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Quotable Soundbites</span>
            <Quote className="w-4 h-4 text-pink-400" />
          </div>
          <div className="text-xl font-bold font-mono text-pink-400">
            High Extractability
          </div>
          <p className="text-xs text-slate-400">
            Clear bold definitions and summary callouts allow LLMs to extract exact quotes without hallucination.
          </p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Multimodal OpenGraph</span>
            <Share2 className="w-4 h-4 text-pink-400" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-400">
            Social Cards
          </div>
          <p className="text-xs text-slate-400">
            Rich image cards (og:image) provide visual anchors for multimodal generative search cards.
          </p>
        </div>

      </div>

      {/* Issues */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white">Generative Optimization Findings</h3>
        <div className="space-y-3">
          {geoIssues.map(issue => (
            <IssueCard key={issue.id} issue={issue} />
          ))}
        </div>
      </div>

    </div>
  );
};
