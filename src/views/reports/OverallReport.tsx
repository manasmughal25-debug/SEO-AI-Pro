import React from 'react';
import { AuditRecord } from '../../types';
import { ScoreGauge } from '../../components/ScoreGauge';
import { IssueCard } from '../../components/IssueCard';
import { navigate } from '../../utils/router';
import { 
  ShieldCheck, 
  Search, 
  HelpCircle, 
  Cpu, 
  Sparkles, 
  Award, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  Printer,
  FileText,
  BrainCircuit
} from 'lucide-react';

interface OverallReportProps {
  audit: AuditRecord;
}

export const OverallReport: React.FC<OverallReportProps> = ({ audit }) => {
  const criticalIssues = audit.issues.filter(i => i.severity === 'critical');
  const warningIssues = audit.issues.filter(i => i.severity === 'warning');
  const passedIssues = audit.issues.filter(i => i.severity === 'good');

  const dimensionCards = [
    {
      name: 'SEO',
      fullName: 'Search Engine Optimization',
      score: audit.scores.seo,
      icon: <Search className="w-5 h-5 text-indigo-400" />,
      route: `/audits/${audit.id}/seo`,
      desc: 'Technical structure, title, meta tags, and indexing signals.'
    },
    {
      name: 'AEO',
      fullName: 'Answer Engine Optimization',
      score: audit.scores.aeo,
      icon: <HelpCircle className="w-5 h-5 text-cyan-400" />,
      route: `/audits/${audit.id}/aeo`,
      desc: 'Voice search readiness, FAQ schemas, and featured snippets.'
    },
    {
      name: 'AIO',
      fullName: 'AI Optimization (Perplexity, Claude, ChatGPT)',
      score: audit.scores.aio,
      icon: <Cpu className="w-5 h-5 text-purple-400" />,
      route: `/audits/${audit.id}/aio`,
      desc: 'LLM crawler accessibility, semantic density, and bot directives.'
    },
    {
      name: 'GEO',
      fullName: 'Generative Engine Optimization',
      score: audit.scores.geo,
      icon: <Sparkles className="w-5 h-5 text-pink-400" />,
      route: `/audits/${audit.id}/geo`,
      desc: 'Market authority, entities, forecasting, and rendering risks.'
    },
    {
      name: 'E-E-A-T',
      fullName: 'Experience, Expertise, Authority & Trust',
      score: audit.scores.eeat,
      icon: <Award className="w-5 h-5 text-emerald-400" />,
      route: `/audits/${audit.id}/eeat`,
      desc: 'Author credentials, About/Contact transparency, and SSL security.'
    },
    {
      name: 'INTEL',
      fullName: 'SEO Intelligence & Predictive Insights',
      score: audit.scores.intelligence,
      icon: <BrainCircuit className="w-5 h-5 text-amber-400" />,
      route: `/audits/${audit.id}/intelligence`,
      desc: 'Search forecasting, entity graphs, and competitor predictions.'
    }
  ];

  return (
    <div className="space-y-8">
      
      {/* Executive Summary Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 print-card">
        <div className="flex flex-col lg:flex-row items-center gap-8">
          
          {/* Main Radial Score */}
          <div className="shrink-0 flex flex-col items-center">
            <ScoreGauge score={audit.scores.overall} size="xl" label="Overall Audit Score" />
          </div>

          {/* Quick Metrics */}
          <div className="flex-1 w-full space-y-4">
            <div>
              <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider font-mono">
                Executive Audit Summary
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white print-text-dark mt-1">
                {audit.scores.overall >= 80 
                  ? 'High Optimization Health Across Web & AI Engines'
                  : audit.scores.overall >= 60 
                  ? 'Moderate Optimization with High-Priority Fixes Required'
                  : 'Critical Deficiencies Found — Action Required'}
              </h2>
              <p className="text-sm text-slate-300 print-text-muted mt-2 leading-relaxed">
                CrawlLens inspected <strong className="text-white print-text-dark">{audit.domain}</strong> across 5 comprehensive evaluation dimensions. We discovered <strong className="text-red-400">{criticalIssues.length} critical issues</strong>, <strong className="text-amber-400">{warningIssues.length} warnings</strong>, and verified <strong className="text-emerald-400">{passedIssues.length} passed optimization factors</strong>.
              </p>
            </div>

            {/* Quick stats pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 print-card">
                <span className="text-[11px] text-slate-400 block font-medium">Word Count</span>
                <span className="text-base font-bold font-mono text-white print-text-dark mt-0.5 block">
                  {audit.summary.wordCount} words
                </span>
              </div>
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 print-card">
                <span className="text-[11px] text-slate-400 block font-medium">Headings</span>
                <span className="text-base font-bold font-mono text-white print-text-dark mt-0.5 block">
                  {audit.summary.h1Count} H1 / {audit.summary.headings.length} Total
                </span>
              </div>
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 print-card">
                <span className="text-[11px] text-slate-400 block font-medium">Images &amp; Alts</span>
                <span className="text-base font-bold font-mono text-white print-text-dark mt-0.5 block">
                  {audit.summary.imagesCount} ({audit.summary.missingAltImagesCount} missing)
                </span>
              </div>
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 print-card">
                <span className="text-[11px] text-slate-400 block font-medium">Links Found</span>
                <span className="text-base font-bold font-mono text-white print-text-dark mt-0.5 block">
                  {audit.summary.internalLinksCount} int / {audit.summary.externalLinksCount} ext
                </span>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* 5-Dimension Scorecards Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white print-text-dark flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            Evaluation Dimensions
          </h3>
          <span className="text-xs text-slate-400 print-text-muted">Click any dimension to view detailed report</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dimensionCards.map((card) => {
            const scoreColor = card.score >= 80 ? 'text-emerald-400' :
                              card.score >= 60 ? 'text-amber-400' : 'text-red-400';
            const barBg = card.score >= 80 ? 'bg-emerald-500' :
                          card.score >= 60 ? 'bg-amber-500' : 'bg-red-500';

            return (
              <div
                key={card.name}
                onClick={() => navigate(card.route)}
                className="bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 hover:border-indigo-500/50 rounded-2xl p-5 cursor-pointer transition-all duration-200 group print-card"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 group-hover:border-indigo-500/30 transition">
                      {card.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-white group-hover:text-indigo-300 transition text-sm">
                        {card.name}
                      </h4>
                      <span className="text-[11px] text-slate-400 block truncate max-w-[150px]">
                        {card.fullName}
                      </span>
                    </div>
                  </div>

                  <span className={`text-xl font-bold font-mono ${scoreColor}`}>
                    {card.score}
                    <span className="text-xs text-slate-500">/100</span>
                  </span>
                </div>

                <div className="w-full h-1.5 bg-slate-950 rounded-full mt-4 overflow-hidden">
                  <div className={`h-full ${barBg} rounded-full transition-all duration-500`} style={{ width: `${card.score}%` }} />
                </div>

                <p className="text-xs text-slate-400 mt-3 leading-relaxed line-clamp-2">
                  {card.desc}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-indigo-400 group-hover:text-indigo-300 font-medium">
                  <span>View Breakdown</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Critical Issues Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <h3 className="text-lg font-bold text-white print-text-dark">High Priority Fixes</h3>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
              {criticalIssues.length} Critical
            </span>
          </div>
        </div>

        {criticalIssues.length === 0 ? (
          <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl flex items-center gap-3 text-emerald-400">
            <CheckCircle2 className="w-6 h-6 shrink-0" />
            <span className="text-sm font-medium">No critical errors detected! All baseline technical requirements are satisfied.</span>
          </div>
        ) : (
          <div className="space-y-3">
            {criticalIssues.map(issue => (
              <IssueCard key={issue.id} issue={issue} />
            ))}
          </div>
        )}
      </div>

      {/* Warnings & Passed Overview */}
      {warningIssues.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-200">Recommended Enhancements ({warningIssues.length})</h3>
          </div>
          <div className="space-y-3">
            {warningIssues.slice(0, 3).map(issue => (
              <IssueCard key={issue.id} issue={issue} />
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
