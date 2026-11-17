import React from 'react';
import { SequentialWebsiteAnalysisSection } from '../components/SequentialWebsiteAnalysisSection';
import { Sparkles, Activity } from 'lucide-react';

export const LiveAnalysisView: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-500">
      
      {/* Studio Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Live Audit Studio
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            5-Stage Sequential Website Analysis
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Validate website reachability, run 5 sequential analysis stages in real time, and inspect composite optimization health.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-slate-900/50 px-4 py-2 rounded-2xl border border-slate-800 self-start md:self-auto">
          <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span className="text-xs font-bold text-slate-300">Sequential Engine Ready</span>
        </div>
      </div>

      {/* Main Sequential Analysis Engine */}
      <SequentialWebsiteAnalysisSection />

    </div>
  );
};
