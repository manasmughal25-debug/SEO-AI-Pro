import React, { useState } from 'react';
import { AuditIssue } from '../types';
import { AlertCircle, AlertTriangle, CheckCircle2, Copy, Check, ChevronDown, ChevronUp, Code2 } from 'lucide-react';

interface IssueCardProps {
  issue: AuditIssue;
}

export const IssueCard: React.FC<IssueCardProps> = ({ issue }) => {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(issue.severity === 'critical');

  const copySnippet = () => {
    if (issue.codeSnippet) {
      navigator.clipboard.writeText(issue.codeSnippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const severityConfig = {
    critical: {
      border: 'border-red-500/30 bg-red-950/20 hover:border-red-500/50',
      badge: 'bg-red-500/10 text-red-400 border-red-500/20',
      icon: <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />,
      label: 'Critical Issue'
    },
    warning: {
      border: 'border-amber-500/30 bg-amber-950/20 hover:border-amber-500/50',
      badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      icon: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
      label: 'Warning'
    },
    good: {
      border: 'border-emerald-500/30 bg-emerald-950/20 hover:border-emerald-500/50',
      badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
      label: 'Passed'
    }
  }[issue.severity];

  return (
    <div className={`rounded-xl border transition-all duration-200 p-4 md:p-5 ${severityConfig.border}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="mt-0.5">{severityConfig.icon}</div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${severityConfig.badge}`}>
                {severityConfig.label}
              </span>
              <span className="px-2 py-0.5 rounded-md text-xs font-mono font-medium bg-slate-800 text-slate-300 border border-slate-700">
                {issue.category}
              </span>
            </div>
            <h3 className="text-base font-semibold text-slate-100">{issue.title}</h3>
            <p className="text-sm text-slate-300 mt-1 leading-relaxed">{issue.description}</p>
          </div>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800 transition"
          aria-label="Toggle details"
        >
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {expanded && (
        <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-3 pl-8">
          {issue.impact && (
            <div className="text-xs">
              <span className="font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">Impact:</span>
              <p className="text-slate-300">{issue.impact}</p>
            </div>
          )}

          {issue.recommendation && (
            <div className="text-xs">
              <span className="font-semibold text-indigo-400 uppercase tracking-wider block mb-0.5">Recommended Fix:</span>
              <p className="text-slate-200 font-medium">{issue.recommendation}</p>
            </div>
          )}

          {issue.codeSnippet && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs text-slate-400 bg-slate-900 px-3 py-1.5 rounded-t-lg border-x border-t border-slate-700/80">
                <span className="flex items-center gap-1.5 font-mono">
                  <Code2 className="w-3.5 h-3.5 text-indigo-400" />
                  Code Recommendation
                </span>
                <button
                  onClick={copySnippet}
                  className="flex items-center gap-1 text-slate-300 hover:text-white hover:bg-slate-800 px-2 py-0.5 rounded transition"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-3 bg-slate-950 text-slate-200 rounded-b-lg border border-slate-700/80 text-xs overflow-x-auto font-mono">
                <code>{issue.codeSnippet}</code>
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
