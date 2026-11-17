import React, { useState } from 'react';
import { AuditRecord } from '../../types';
import { ScoreGauge } from '../../components/ScoreGauge';
import { IssueCard } from '../../components/IssueCard';
import { Search, CheckCircle2, AlertTriangle, AlertCircle, Image, Heading, Globe, Layout } from 'lucide-react';

interface ReportProps {
  audit: AuditRecord;
}

export const SeoReport: React.FC<ReportProps> = ({ audit }) => {
  const [filter, setFilter] = useState<'all' | 'critical' | 'warning' | 'good'>('all');
  const seoIssues = audit.issues.filter(i => i.category === 'SEO');
  const filteredIssues = seoIssues.filter(i => filter === 'all' || i.severity === filter);

  return (
    <div className="space-y-8">
      
      {/* Top Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center gap-6">
        <ScoreGauge score={audit.scores.seo} size="lg" label="SEO Score" />
        <div className="flex-1 space-y-2 text-center md:text-left">
          <span className="text-xs font-mono font-semibold text-indigo-400 uppercase tracking-wider">
            Technical &amp; On-Page SEO Audit
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            Search Engine Optimization Health
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Evaluates indexability, meta tags, title length, heading hierarchy, image accessibility, canonicalization, and mobile-friendly viewport tags.
          </p>
        </div>
      </div>

      {/* SERP Search Result Simulator */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Globe className="w-4 h-4 text-indigo-400" />
            Google SERP Snippet Preview
          </h3>
          <span className="text-xs text-slate-400">Desktop &amp; Mobile Preview</span>
        </div>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1 font-sans">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5 truncate">
            <span className="w-3.5 h-3.5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[9px] text-white">G</span>
            <span>{audit.domain}</span>
            <span className="text-slate-600">› {audit.url.replace(/^https?:\/\/[^\/]+/, '') || ''}</span>
          </div>
          <div className="text-base text-blue-400 hover:underline cursor-pointer font-medium leading-snug line-clamp-1">
            {audit.summary.title || 'Missing Page Title'}
          </div>
          <div className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
            {audit.summary.metaDescription || 'No meta description provided. Google will generate an automated snippet from the page body.'}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">Title Character Count:</span>
            <span className={`font-mono font-bold ${audit.summary.title.length >= 40 && audit.summary.title.length <= 60 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {audit.summary.title.length} chars (Recommended: 40-60)
            </span>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">Meta Description Count:</span>
            <span className={`font-mono font-bold ${audit.summary.metaDescription.length >= 120 && audit.summary.metaDescription.length <= 160 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {audit.summary.metaDescription.length} chars (Recommended: 120-160)
            </span>
          </div>
        </div>
      </div>

      {/* Headings & Content Hierarchy */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Heading Breakdown */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Heading className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">Heading Structure (H1-H3)</h3>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {audit.summary.headings.length === 0 ? (
              <p className="text-xs text-slate-500">No heading tags identified on page.</p>
            ) : (
              audit.summary.headings.map((h, i) => (
                <div key={i} className="flex items-start gap-2 bg-slate-950/60 p-2 rounded-lg border border-slate-800/80 text-xs">
                  <span className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    h.level === 'H1' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' :
                    h.level === 'H2' ? 'bg-slate-800 text-slate-300' : 'bg-slate-900 text-slate-400'
                  }`}>
                    {h.level}
                  </span>
                  <span className="text-slate-200 line-clamp-1">{h.text}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Media & Links Stats */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Image className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">Media &amp; Accessibility</h3>
          </div>

          <div className="space-y-2 text-xs">
            <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">Total Images</span>
              <span className="font-mono font-bold text-white">{audit.summary.imagesCount}</span>
            </div>
            <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">Missing Alt Attributes</span>
              <span className={`font-mono font-bold ${audit.summary.missingAltImagesCount > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                {audit.summary.missingAltImagesCount}
              </span>
            </div>
            <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">Canonical Tag</span>
              <span className="font-mono text-[11px] text-cyan-400 truncate max-w-[200px]">
                {audit.summary.canonicalUrl || 'None specified'}
              </span>
            </div>
            <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">Estimated Reading Time</span>
              <span className="font-mono text-slate-200">~{audit.summary.readingTimeMinutes} min ({audit.summary.wordCount} words)</span>
            </div>
          </div>
        </div>

      </div>

      {/* Filterable Issues */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h3 className="text-base font-bold text-white">
            SEO Audit Findings ({seoIssues.length})
          </h3>
          <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            {(['all', 'critical', 'warning', 'good'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3 py-1 rounded-lg font-medium capitalize transition ${
                  filter === tab ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {filteredIssues.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm bg-slate-900/40 rounded-xl border border-slate-800">
              No issues in this filter category.
            </div>
          ) : (
            filteredIssues.map(issue => (
              <IssueCard key={issue.id} issue={issue} />
            ))
          )}
        </div>
      </div>

    </div>
  );
};
