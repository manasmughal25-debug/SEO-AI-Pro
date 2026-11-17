import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  BrainCircuit, 
  Sparkles, 
  RotateCw, 
  FolderOpen,
  TrendingUp,
  Fingerprint,
  Target,
  Zap,
  ArrowRight,
  MousePointer2
} from 'lucide-react';
import { AuditRecord } from '../types';

export const AiInsightsView: React.FC = () => {
  const { token } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [latestAudit, setLatestAudit] = useState<AuditRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch('/api/projects', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setProjects(data.projects || []);
          if (data.projects?.length > 0) {
            setSelectedProjectId(data.projects[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to fetch projects');
      }
    };
    fetchProjects();
  }, [token]);

  useEffect(() => {
    if (!selectedProjectId) return;
    const fetchLatestAudit = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/audits?projectId=${selectedProjectId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.audits?.length > 0) {
            setLatestAudit(data.audits[0]);
          } else {
            setLatestAudit(null);
          }
        }
      } catch (err) {
        console.error('Failed to fetch audit');
      } finally {
        setLoading(false);
      }
    };
    fetchLatestAudit();
  }, [selectedProjectId, token]);

  if (loading) return <div className="p-20 text-center text-slate-500"><RotateCw className="w-8 h-8 animate-spin mx-auto mb-4" /> Synthesizing AI Visibility Intelligence...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <BrainCircuit className="w-8 h-8 text-indigo-400" />
            AI Visibility Intelligence
          </h1>
          <p className="text-slate-400 mt-2">Predictive analytics for AI-driven search engines, answer engines, and generative knowledge graphs.</p>
        </div>

        <div className="relative w-full md:w-64">
          <FolderOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <select
            value={selectedProjectId}
            onChange={e => setSelectedProjectId(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm appearance-none focus:outline-none focus:border-indigo-500 transition shadow-xl"
          >
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {!latestAudit || !latestAudit.intelligence ? (
        <div className="py-20 text-center space-y-6 bg-slate-950/30 border-2 border-dashed border-slate-900 rounded-3xl">
          <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto text-slate-700">
            <Sparkles className="w-8 h-8" />
          </div>
          <div className="max-w-xs mx-auto space-y-2">
            <h3 className="text-lg font-bold text-white">No Intelligence Data</h3>
            <p className="text-sm text-slate-500">Enable advanced AI features in your project settings and run an audit to see predictive insights.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          
          {/* Topical Authority Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-indigo-600/10 blur-[80px] pointer-events-none" />
            <div className="flex items-center justify-between mb-8">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Niche Influence</span>
                <h3 className="text-2xl font-bold text-white">Topical Authority</h3>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-black text-xl">
                {latestAudit.intelligence.topicalAuthority?.score}%
              </div>
            </div>
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Detected Semantic Niche</span>
                <p className="text-sm font-bold text-white">{latestAudit.intelligence.topicalAuthority?.currentNiche}</p>
              </div>
              <div className="space-y-3">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Growth Opportunities</span>
                <div className="flex flex-wrap gap-2">
                  {latestAudit.intelligence.topicalAuthority?.gapOpportunities.map(gap => (
                    <span key={gap} className="px-3 py-1 rounded-lg bg-indigo-500/5 text-indigo-300 text-xs border border-indigo-500/10">
                      + {gap}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Competitor Strategy Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 relative overflow-hidden group">
             <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-purple-600/10 blur-[80px] pointer-events-none" />
             <div className="flex items-center justify-between mb-8">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">Market Context</span>
                <h3 className="text-2xl font-bold text-white">Strategy Prediction</h3>
              </div>
              <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-400">
                <Target className="w-8 h-8" />
              </div>
            </div>
            <div className="space-y-6">
               <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 text-purple-300">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase">Predicted Next Move</span>
                  </div>
                  <p className="text-sm text-slate-300 italic leading-relaxed">
                    "{latestAudit.intelligence.competitorStrategy?.likelyNextMove}"
                  </p>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase block mb-1">Market Share</span>
                    <span className="text-sm font-bold text-white">{latestAudit.intelligence.competitorStrategy?.marketVisibilityShare}</span>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase block mb-1">Edge</span>
                    <span className="text-sm font-bold text-white">{latestAudit.intelligence.competitorStrategy?.strategicAdvantage}</span>
                  </div>
               </div>
            </div>
          </div>

          {/* Entity Intelligence Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Fingerprint className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white">Semantic Entity Graph</h3>
            </div>
            <div className="space-y-6">
               <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block mb-3">Strongly Associated Entities</span>
                  <div className="flex flex-wrap gap-2">
                    {latestAudit.intelligence.entityIntelligence?.detectedEntities.map(ent => (
                      <span key={ent} className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 text-xs border border-slate-700">
                        {ent}
                      </span>
                    ))}
                  </div>
               </div>
               <div>
                  <span className="text-[10px] text-red-400 uppercase font-bold block mb-3">Salient Gaps (High Priority)</span>
                  <div className="flex flex-wrap gap-2">
                    {latestAudit.intelligence.entityIntelligence?.missingSalientEntities.map(ent => (
                      <span key={ent} className="px-2.5 py-1 rounded-md bg-red-500/5 text-red-400 text-xs border border-red-500/20">
                        {ent}
                      </span>
                    ))}
                  </div>
               </div>
            </div>
          </div>

          {/* Information Gain Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6">
             <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-pink-500/10 text-pink-400 border border-pink-500/20">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white">Information Gain Analyzer</h3>
            </div>
            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Uniqueness Score</span>
                  <div className="text-3xl font-black text-white">{latestAudit.intelligence.informationGain?.score}%</div>
                </div>
                <div className="w-32 h-2 bg-slate-950 rounded-full overflow-hidden mb-2">
                  <div className="h-full bg-pink-500" style={{ width: `${latestAudit.intelligence.informationGain?.score}%` }} />
                </div>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/50 p-4 rounded-2xl border border-slate-800">
                {latestAudit.intelligence.informationGain?.uniquenessInsight}
              </p>
              <div className="space-y-3">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Augmentation Strategy</span>
                <div className="flex flex-wrap gap-2">
                  {latestAudit.intelligence.informationGain?.augmentationSuggestions.map(sug => (
                    <span key={sug} className="px-3 py-1 rounded-lg bg-pink-500/5 text-pink-300 text-xs border border-pink-500/10">
                      + {sug}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
