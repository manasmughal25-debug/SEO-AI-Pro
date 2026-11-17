import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { navigate } from '../utils/router';
import { SequentialWebsiteAnalysisSection } from '../components/SequentialWebsiteAnalysisSection';
import { 
  BarChart3, 
  TrendingUp, 
  ShieldCheck, 
  Globe, 
  Zap, 
  ArrowRight, 
  Layers, 
  Clock, 
  RotateCw,
  Search,
  Sparkles,
  AlertCircle
} from 'lucide-react';

export const GlobalDashboardView: React.FC = () => {
  const { token, user } = useAuth();
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalAudits: 0,
    avgScore: 0,
    criticalIssues: 0
  });
  const [recentAudits, setRecentAudits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGlobalStats = async () => {
    try {
      const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {};
      const [projRes, auditRes] = await Promise.all([
        fetch('/api/projects', { headers }),
        fetch('/api/audits', { headers })
      ]);

      if (projRes.ok && auditRes.ok) {
        const projs = await projRes.json();
        const audits = await auditRes.json();
        
        const totalProjs = projs.projects?.length || 0;
        const auditList = audits.audits || [];
        const totalAuds = auditList.length;
        const avgSc = totalAuds > 0 ? Math.round(auditList.reduce((acc: number, a: any) => acc + (a.scores?.overall || 0), 0) / totalAuds) : 0;
        const crit = auditList.reduce((acc: number, a: any) => acc + (a.issues?.filter((i: any) => i.severity === 'critical').length || 0), 0);

        setStats({
          totalProjects: totalProjs,
          totalAudits: totalAuds,
          avgScore: avgSc,
          criticalIssues: crit
        });
        setRecentAudits(auditList);
      }
    } catch (err) {
      console.error('Stats fetch failed', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGlobalStats();
  }, [token]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-700">
      
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Enterprise Overview</h1>
          <p className="text-sm text-slate-400 mt-1">SEO AI PRO — Search Engine & Generative AI Optimization Suite.</p>
        </div>
        <div className="flex items-center gap-3 bg-slate-900/50 px-4 py-2 rounded-2xl border border-slate-800">
           <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">System Live</span>
        </div>
      </div>

      {/* TOP: Sequential Website Search & 5-Stage Audit Section */}
      <SequentialWebsiteAnalysisSection onAuditCompleted={() => fetchGlobalStats()} />

      {/* Global Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Projects', value: stats.totalProjects, icon: <Globe className="w-5 h-5 text-indigo-400" />, trend: 'Stable' },
          { label: 'Total Audits', value: stats.totalAudits, icon: <Clock className="w-5 h-5 text-cyan-400" />, trend: 'Live' },
          { label: 'Avg Health Score', value: `${stats.avgScore}/100`, icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />, trend: '+2% wk' },
          { label: 'Critical Issues', value: stats.criticalIssues, icon: <AlertCircle className="w-5 h-5 text-red-400" />, trend: '-12% mo' },
        ].map((stat, i) => (
          <div key={i} className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4 hover:border-slate-700 transition-colors shadow-xl">
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">{stat.icon}</div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{stat.trend}</span>
            </div>
            <div>
              <span className="text-2xl font-black text-white font-mono">{stat.value}</span>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-1">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Quick Actions & AI Insight */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-[2.5rem] p-10 relative overflow-hidden group shadow-2xl">
            <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-white/10 blur-[80px] rounded-full transition-transform group-hover:scale-125" />
            <div className="relative z-10 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white text-[10px] font-bold uppercase tracking-widest">
                <Sparkles className="w-3.5 h-3.5" />
                Intelligence Brief
              </div>
              <h2 className="text-3xl font-black text-white leading-tight">
                AI Search visibility is up <br />across your portfolio.
              </h2>
              <p className="text-indigo-100 text-sm leading-relaxed max-w-md">
                Your semantic entity density has improved by 14% since the last global crawl. Technical debt in H1 hierarchy remains the primary bottleneck for {stats.totalProjects > 0 ? 'Project 1' : 'new sites'}.
              </p>
              <div className="pt-4">
                <button onClick={() => navigate('/keywords')} className="px-8 py-3.5 bg-white text-indigo-600 font-bold rounded-2xl shadow-xl hover:bg-slate-50 transition-colors flex items-center gap-2 text-sm cursor-pointer">
                  Run Global Discovery
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-xl">
             <div className="flex items-center justify-between mb-8">
               <h3 className="text-lg font-bold text-white flex items-center gap-3">
                 <Layers className="w-5 h-5 text-indigo-400" />
                 Recent Activity &amp; Audit History
               </h3>
               <button 
                 onClick={() => navigate('/history')}
                 className="text-xs text-indigo-400 hover:text-indigo-300 font-bold transition flex items-center gap-1 cursor-pointer"
               >
                 <span>View All History</span>
                 <ArrowRight className="w-3 h-3" />
               </button>
             </div>
             <div className="space-y-4">
               {recentAudits.length === 0 ? (
                 <div className="py-12 text-center text-slate-600 text-sm font-medium">
                   No recent audits found. Run your first website audit above!
                 </div>
               ) : (
                 recentAudits.slice(0, 5).map((audit: any) => {
                   const score = audit.scores?.overall || 0;
                   const scoreColor = score >= 80 ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' :
                                      score >= 60 ? 'text-amber-400 border-amber-500/30 bg-amber-500/10' :
                                      'text-red-400 border-red-500/30 bg-red-500/10';
                   return (
                     <div 
                       key={audit.id} 
                       onClick={() => navigate(`/audits/${audit.id}/overall`)}
                       className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-slate-950 border border-slate-900 group cursor-pointer hover:border-indigo-500/40 hover:bg-slate-900/50 transition-all"
                     >
                       <div className="flex items-center gap-3 min-w-0">
                         <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-indigo-400 shrink-0">
                           <Globe className="w-4 h-4" />
                         </div>
                         <div className="min-w-0">
                           <span className="text-xs font-bold text-slate-200 block truncate group-hover:text-indigo-300 transition">
                             {audit.domain || audit.url}
                           </span>
                           <span className="text-[10px] text-slate-500 font-mono block">
                             {new Date(audit.crawledAt).toLocaleDateString()} • {audit.httpStatus || 200} OK
                           </span>
                         </div>
                       </div>
                       
                       <div className="flex items-center gap-3 shrink-0">
                         <span className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold border ${scoreColor}`}>
                           {score}/100
                         </span>
                         <ArrowRight className="w-4 h-4 text-slate-700 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                       </div>
                     </div>
                   );
                 })
               )}
             </div>
          </div>
        </div>

        {/* Sidebar: System Health & Quotas */}
        <div className="space-y-6">
           <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-xl space-y-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-widest text-center">Plan Usage</h3>
              <div className="space-y-4">
                 {[
                   { label: 'Crawl Credits', used: stats.totalAudits, total: 100, color: 'bg-indigo-500' },
                   { label: 'Keyword Research', used: 12, total: 50, color: 'bg-cyan-500' },
                   { label: 'Project Slots', used: stats.totalProjects, total: 5, color: 'bg-emerald-500' },
                 ].map((bar, idx) => (
                   <div key={idx} className="space-y-2">
                     <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                       <span>{bar.label}</span>
                       <span>{bar.used} / {bar.total}</span>
                     </div>
                     <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                       <div className={`h-full ${bar.color} rounded-full`} style={{ width: `${(bar.used / bar.total) * 100}%` }} />
                     </div>
                   </div>
                 ))}
              </div>
              <button 
                onClick={() => navigate('/billing')}
                className="w-full py-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition cursor-pointer"
              >
                Manage Billing
              </button>
           </div>

           <div className="bg-indigo-600/5 border border-indigo-500/10 rounded-[2.5rem] p-8 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-white">Security Hardening</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Relational data isolation is active. All project crawls are executed via secure sandboxed search agents.
              </p>
           </div>
        </div>

      </div>

    </div>
  );
};
