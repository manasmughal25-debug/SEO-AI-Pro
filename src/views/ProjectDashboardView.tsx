import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { navigate } from '../utils/router';
import { 
  Globe, 
  Zap, 
  Search, 
  TrendingUp, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  RotateCw,
  ArrowRight,
  Sparkles,
  Layers,
  History,
  ExternalLink,
  BrainCircuit,
  Target
} from 'lucide-react';
import { ScoreGauge } from '../components/ScoreGauge';
import { AuditRecord } from '../types';

interface ProjectDashboardProps {
  projectId: string;
}

export const ProjectDashboardView: React.FC<ProjectDashboardProps> = ({ projectId }) => {
  const { token } = useAuth();
  const [project, setProject] = useState<any>(null);
  const [latestAudit, setLatestAudit] = useState<AuditRecord | null>(null);
  const [audits, setAudits] = useState<AuditRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [crawling, setCrawling] = useState(false);

  const fetchProjectData = async () => {
    try {
      const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {};
      const [projRes, auditRes] = await Promise.all([
        fetch(`/api/projects/${projectId}`, { headers }),
        fetch(`/api/audits?projectId=${projectId}`, { headers })
      ]);

      if (projRes.ok && auditRes.ok) {
        const projData = await projRes.json();
        const auditData = await auditRes.json();
        setProject(projData.project);
        setAudits(auditData.audits || []);
        if (auditData.audits && auditData.audits.length > 0) {
          setLatestAudit(auditData.audits[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load project dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectData();
  }, [projectId, token]);

  const handleStartAudit = async () => {
    if (!project || !project.domains?.[0]) return;
    setCrawling(true);
    try {
      const res = await fetch('/api/crawl', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          url: project.domains[0].url,
          projectId: project.id
        })
      });
      if (res.ok) {
        await fetchProjectData();
      }
    } catch (err) {
      console.error('Crawl failed', err);
    } finally {
      setCrawling(false);
    }
  };

  if (loading) return <div className="p-20 text-center text-slate-500"><RotateCw className="w-8 h-8 animate-spin mx-auto mb-4" /> Loading Dashboard...</div>;
  if (!project) return <div className="p-20 text-center text-slate-400">Project not found.</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-500">
      
      {/* Project Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-xl shadow-indigo-500/5">
            <Globe className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">{project.name}</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-xs font-mono text-slate-400">{project.domains[0]?.domain}</span>
              <span className="w-1 h-1 rounded-full bg-slate-700" />
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">{project.industry}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleStartAudit}
            disabled={crawling}
            className="flex-1 sm:flex-none px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2"
          >
            {crawling ? <RotateCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            {crawling ? 'Analyzing...' : 'Run Performance Audit'}
          </button>
        </div>
      </div>

      {/* Main Stats Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Overall Health Card */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-8 flex flex-col md:flex-row items-center gap-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-indigo-600/10 blur-3xl pointer-events-none" />
          <div className="shrink-0 scale-110">
            <ScoreGauge score={latestAudit?.scores.overall || 0} size="xl" label="Overall SEO Health" />
          </div>
          <div className="space-y-4 text-center md:text-left">
            <div>
              <h2 className="text-2xl font-bold text-white">Project Performance</h2>
              <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                {latestAudit 
                  ? `Last analyzed on ${new Date(latestAudit.crawledAt).toLocaleDateString()}. We discovered ${latestAudit.issues.filter(i => i.severity === 'critical').length} critical issues across ${project.name}.`
                  : 'No audit data available yet. Start your first crawl to see deep SEO intelligence insights.'}
              </p>
            </div>
            <div className="flex flex-wrap justify-center md:justify-start gap-2 pt-2">
              {['SEO', 'AEO', 'AIO', 'GEO', 'EEAT'].map(dim => (
                <div key={dim} className="px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[10px] font-bold text-slate-400">
                  {dim}: <span className="text-indigo-400">{(latestAudit?.scores as any)?.[dim.toLowerCase()] || '--'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Visibility Stats */}
        <div className="bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 rounded-3xl p-8 flex flex-col justify-between shadow-2xl">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">Market Presence</span>
            <h3 className="text-xl font-bold text-white">Search Visibility</h3>
          </div>
          <div className="mt-8 space-y-6">
            <div className="flex items-end justify-between">
              <div>
                <span className="text-3xl font-black text-white">12.4%</span>
                <div className="flex items-center gap-1 text-emerald-400 text-xs font-bold mt-1">
                  <TrendingUp className="w-3 h-3" />
                  +2.1% this month
                </div>
              </div>
              <div className="w-24 h-12 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                 <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-tighter">AI Prediction</span>
              </div>
            </div>
            <div className="pt-4 border-t border-indigo-500/20 flex items-center justify-between text-xs text-indigo-200 font-bold uppercase tracking-wider cursor-pointer hover:text-white transition">
              <span>View Visibility Report</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>

      </div>

      {/* Audit History & Recent Issues */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        {/* Recent Audits */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <History className="w-5 h-5 text-indigo-400" />
              Audit History
            </h3>
            <button className="text-xs text-indigo-400 font-bold hover:text-white transition">View All</button>
          </div>
          <div className="divide-y divide-slate-800">
            {audits.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-sm">No historical audits yet.</div>
            ) : (
              audits.slice(0, 5).map(audit => (
                <div key={audit.id} onClick={() => navigate(`/audits/${audit.id}/overall`)} className="p-5 hover:bg-slate-800/40 cursor-pointer transition flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                      audit.scores.overall >= 80 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      audit.scores.overall >= 60 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                      'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                      {audit.scores.overall}
                    </div>
                    <div>
                      <span className="text-sm font-bold text-slate-200 block group-hover:text-indigo-300 transition-colors">
                        {new Date(audit.crawledAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                      </span>
                      <span className="text-[10px] text-slate-500 uppercase font-mono tracking-widest">{audit.status} • {audit.responseTimeMs}ms</span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-600 group-hover:translate-x-1 transition-transform" />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Intelligence Quick Feed */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 space-y-6 shadow-xl">
           <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-indigo-400" />
                AI SEO Recommendations
              </h3>
              <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 text-[10px] font-bold">GEMINI 3.8</span>
           </div>
           
           <div className="space-y-4">
              {!latestAudit ? (
                <div className="py-10 text-center space-y-4">
                  <Sparkles className="w-10 h-10 text-slate-700 mx-auto" />
                  <p className="text-slate-500 text-sm">Run an audit to generate AI-powered growth strategies.</p>
                </div>
              ) : (
                <>
                  {/* Entity Intelligence Insight */}
                  {latestAudit.intelligence?.entityIntelligence && latestAudit.intelligence.entityIntelligence.missingSalientEntities.length > 0 && (
                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 relative group cursor-pointer hover:border-indigo-500/30 transition-all">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
                          <BrainCircuit className="w-4 h-4" />
                        </div>
                        <div className="space-y-1">
                          <span className="text-xs font-bold text-white">Semantic Gap Opportunity</span>
                          <p className="text-[11px] text-slate-400 leading-relaxed">
                            Your page is missing semantic context for <span className="text-indigo-300">"{latestAudit.intelligence.entityIntelligence.missingSalientEntities.slice(0, 3).join(', ')}"</span>. 
                            Integrating these entities will improve Knowledge Graph relevance.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Competitor Strategy Insight */}
                  {latestAudit.intelligence?.competitorStrategy && (
                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 relative group cursor-pointer hover:border-purple-500/30 transition-all">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 shrink-0">
                          <Target className="w-4 h-4" />
                        </div>
                        <div className="space-y-1">
                          <span className="text-xs font-bold text-white">Strategic Forecast</span>
                          <p className="text-[11px] text-slate-400 leading-relaxed">
                            {latestAudit.intelligence.competitorStrategy.likelyNextMove}. Market visibility share is currently at {latestAudit.intelligence.competitorStrategy.marketVisibilityShare}.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {!latestAudit.intelligence && (
                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 relative group cursor-pointer hover:border-indigo-500/30 transition-all">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20 shrink-0">
                          <Zap className="w-4 h-4" />
                        </div>
                        <div className="space-y-1">
                          <span className="text-xs font-bold text-white">Technical Priority</span>
                          <p className="text-[11px] text-slate-400 leading-relaxed">
                            Address {latestAudit.issues.filter(i => i.severity === 'critical').length} critical issues immediately to restore ranking potential.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <button 
                    onClick={() => navigate(`/audits/${latestAudit.id}/intelligence`)}
                    className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition flex items-center justify-center gap-2"
                  >
                    Open AI Strategy Center
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
           </div>
        </div>

      </div>

    </div>
  );
};
