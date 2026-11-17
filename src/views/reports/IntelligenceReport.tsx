import React from 'react';
import { AuditRecord } from '../../types';
import { 
  BrainCircuit, 
  TrendingUp, 
  ShieldAlert, 
  Database, 
  Code2, 
  Users, 
  Sparkles,
  Zap,
  Target,
  BarChart3,
  Search,
  History,
  Fingerprint
} from 'lucide-react';
import { ScoreGauge } from '../../components/ScoreGauge';

interface IntelligenceReportProps {
  audit: AuditRecord;
}

export const IntelligenceReport: React.FC<IntelligenceReportProps> = ({ audit }) => {
  const intel = audit.intelligence;

  if (!intel) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center space-y-4">
        <BrainCircuit className="w-12 h-12 text-slate-700 mx-auto" />
        <p className="text-slate-400">Intelligence data is not available for this audit.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Intelligence Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center gap-8 print-card">
          <div className="shrink-0">
            <ScoreGauge score={audit.scores.intelligence} size="lg" label="Intelligence Score" />
          </div>
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <BrainCircuit className="w-6 h-6 text-indigo-400" />
              Advanced SEO Intelligence
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Our AI engine has synthesized crawl data with real-time search trends to provide predictive visibility insights. 
              This analysis goes beyond technical tags to evaluate your site's strategic positioning in the modern AI-driven search landscape.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-bold uppercase tracking-wider">
                Predictive Analysis
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider">
                Semantic Entities
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold uppercase tracking-wider">
                Trend Forecasting
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 rounded-2xl p-6 flex flex-col justify-between print-card">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">Market Context</span>
            <h3 className="text-lg font-bold text-white">Topical Authority</h3>
            <p className="text-xs text-slate-300 mt-2">
              Detected Niche: <strong className="text-indigo-300">{intel.topicalAuthority?.currentNiche || 'General'}</strong>
            </p>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400">Authority Level</span>
              <span className="text-indigo-300 font-bold">{intel.topicalAuthority?.score}%</span>
            </div>
            <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-1000" 
                style={{ width: `${intel.topicalAuthority?.score || 0}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Intelligence Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Search Demand Forecasting */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 print-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white">Search Demand Forecasting</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full uppercase ${
                intel.searchDemandForecasting?.trend === 'up' ? 'bg-emerald-500/10 text-emerald-400' :
                intel.searchDemandForecasting?.trend === 'down' ? 'bg-red-500/10 text-red-400' :
                'bg-slate-800 text-slate-400'
              }`}>
                Trend: {intel.searchDemandForecasting?.trend || 'Stable'}
              </span>
              <span className="text-xs text-slate-400">Vol: {intel.searchDemandForecasting?.predictedVolume || 'N/A'}</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/50 p-3 rounded-xl border border-slate-800/50">
              {intel.searchDemandForecasting?.insight || 'No specific forecast data available.'}
            </p>
          </div>
        </div>

        {/* Content Decay Prediction */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 print-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <History className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white">Content Decay Prediction</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full uppercase ${
                intel.contentDecayPrediction?.status === 'healthy' ? 'bg-emerald-500/10 text-emerald-400' :
                'bg-amber-500/10 text-amber-400'
              }`}>
                {intel.contentDecayPrediction?.status || 'Stale'}
              </span>
              <span className="text-xs text-slate-400">~{intel.contentDecayPrediction?.estimatedLifeRemainingMonths || 0} months life left</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/50 p-3 rounded-xl border border-slate-800/50">
              {intel.contentDecayPrediction?.refreshRecommendation || 'No refresh data available.'}
            </p>
          </div>
        </div>

        {/* Entity Intelligence */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 print-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Fingerprint className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white">Semantic Entity Intelligence</h3>
          </div>
          <div className="space-y-4">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block mb-2">Detected Entities</span>
              <div className="flex flex-wrap gap-1.5">
                {intel.entityIntelligence?.detectedEntities?.map(ent => (
                  <span key={ent} className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[10px] border border-slate-700">
                    {ent}
                  </span>
                )) || <span className="text-xs text-slate-500">No entities detected</span>}
              </div>
            </div>
            <div>
              <span className="text-[10px] text-red-400/80 uppercase font-bold tracking-wider block mb-2">Missing Salient Entities</span>
              <div className="flex flex-wrap gap-1.5">
                {intel.entityIntelligence?.missingSalientEntities?.map(ent => (
                  <span key={ent} className="px-2 py-0.5 rounded-md bg-red-500/5 text-red-400/80 text-[10px] border border-red-500/20">
                    {ent}
                  </span>
                )) || <span className="text-xs text-slate-500">None identified</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Competitor Strategy */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 print-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Target className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white">Competitor Strategy Prediction</h3>
          </div>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/50">
                <span className="text-[10px] text-slate-500 block">Market Share</span>
                <span className="text-xs font-bold text-white">{intel.competitorStrategy?.marketVisibilityShare || 'N/A'}</span>
              </div>
              <div className="bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/50">
                <span className="text-[10px] text-slate-500 block">Advantage</span>
                <span className="text-xs font-bold text-white truncate">{intel.competitorStrategy?.strategicAdvantage || 'N/A'}</span>
              </div>
            </div>
            <div>
              <span className="text-[10px] text-purple-400 uppercase font-bold tracking-wider block mb-1">Predicted Next Move</span>
              <p className="text-xs text-slate-300 italic">
                "{intel.competitorStrategy?.likelyNextMove || 'Strategy prediction unavailable.'}"
              </p>
            </div>
          </div>
        </div>

        {/* JavaScript SEO Intelligence */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 print-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Code2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white">JavaScript SEO & Rendering</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Rendering Mode: <strong className="text-slate-200 uppercase">{intel.jsSeoIntelligence?.renderingStatus || 'Static'}</strong></span>
              <span className={`font-bold px-2 py-0.5 rounded-full uppercase ${
                intel.jsSeoIntelligence?.indexabilityRisk === 'low' ? 'text-emerald-400' : 'text-amber-400'
              }`}>
                Risk: {intel.jsSeoIntelligence?.indexabilityRisk || 'Low'}
              </span>
            </div>
            <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/50 space-y-2">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Rendering Issues & Risks</span>
              <ul className="space-y-1.5">
                {intel.jsSeoIntelligence?.renderingIssues?.map((issue, idx) => (
                  <li key={idx} className="text-[11px] text-slate-300 flex items-start gap-2">
                    <ShieldAlert className="w-3 h-3 text-amber-500 shrink-0 mt-0.5" />
                    {issue}
                  </li>
                )) || <li className="text-[11px] text-emerald-400 flex items-center gap-2"><Sparkles className="w-3 h-3" /> No critical rendering risks detected</li>}
              </ul>
            </div>
          </div>
        </div>

        {/* Information Gain Analyzer */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 print-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-pink-500/10 text-pink-400 border border-pink-500/20">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white">Information Gain Analyzer</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-400">Uniqueness Score</span>
              <span className="text-xs font-bold text-pink-400">{intel.informationGain?.score || 0}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
              <div className="h-full bg-pink-500 rounded-full" style={{ width: `${intel.informationGain?.score || 0}%` }} />
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed italic border-l-2 border-pink-500/30 pl-3">
              {intel.informationGain?.uniquenessInsight || 'Data not available.'}
            </p>
            <div className="space-y-2">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Augmentation Suggestions</span>
              <div className="flex flex-wrap gap-1.5">
                {intel.informationGain?.augmentationSuggestions?.map(sug => (
                  <span key={sug} className="px-2 py-0.5 rounded-md bg-pink-500/5 text-pink-300 text-[10px] border border-pink-500/10">
                    + {sug}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
