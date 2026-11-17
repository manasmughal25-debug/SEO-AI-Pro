import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Sparkles, 
  RotateCw, 
  FolderOpen,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Zap,
  Clock,
  Layout
} from 'lucide-react';
import { AuditRecord } from '../types';

export const RecommendationsView: React.FC = () => {
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

  if (loading) return <div className="p-20 text-center text-slate-500"><RotateCw className="w-8 h-8 animate-spin mx-auto mb-4" /> Prioritizing Fixes...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-indigo-400" />
            Growth Recommendations
          </h1>
          <p className="text-slate-400 mt-2">Actionable, prioritized SEO fixes and AI-powered strategy suggestions to improve your search visibility.</p>
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

      {!latestAudit ? (
        <div className="py-20 text-center space-y-6 bg-slate-950/30 border-2 border-dashed border-slate-900 rounded-3xl">
          <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto text-slate-700">
            <Layout className="w-8 h-8" />
          </div>
          <div className="max-w-xs mx-auto space-y-2">
            <h3 className="text-lg font-bold text-white">No Recommendations</h3>
            <p className="text-sm text-slate-500">Complete your first project audit to generate a prioritized list of SEO improvements.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* Summary Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6">
              <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest block mb-1">Critical Fixes</span>
              <div className="text-3xl font-black text-white">{latestAudit.issues.filter(i => i.severity === 'critical').length}</div>
            </div>
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-6">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block mb-1">Optimization Alerts</span>
              <div className="text-3xl font-black text-white">{latestAudit.issues.filter(i => i.severity === 'warning').length}</div>
            </div>
            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-6">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block mb-1">Healthy Signals</span>
              <div className="text-3xl font-black text-white">{latestAudit.issues.filter(i => i.severity === 'good').length}</div>
            </div>
          </div>

          {/* Recommendations Feed */}
          <div className="grid grid-cols-1 gap-4">
            {latestAudit.issues.filter(i => i.severity !== 'good').map(issue => (
              <div key={issue.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 group hover:border-indigo-500/30 transition-all">
                <div className="flex flex-col md:flex-row gap-6">
                   <div className="shrink-0">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                        issue.severity === 'critical' ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400'
                      }`}>
                        {issue.severity === 'critical' ? <AlertCircle className="w-6 h-6" /> : <Zap className="w-6 h-6" />}
                      </div>
                   </div>
                   <div className="flex-1 space-y-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                         <div>
                            <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">{issue.title}</h3>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{issue.category} • {issue.severity} priority</span>
                         </div>
                         <button className="px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-indigo-600 transition flex items-center gap-2">
                           View Fix Details
                           <ArrowRight className="w-3.5 h-3.5" />
                         </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         <div className="space-y-2">
                            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">The Problem</span>
                            <p className="text-sm text-slate-300 leading-relaxed">{issue.description}</p>
                         </div>
                         <div className="space-y-2">
                            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">The Solution</span>
                            <p className="text-sm text-indigo-200 leading-relaxed font-medium">{issue.recommendation}</p>
                         </div>
                      </div>
                      <div className="pt-4 border-t border-slate-800/50 flex items-center justify-between">
                         <div className="flex items-center gap-4 text-xs">
                            <span className="text-slate-500 italic">Impact on visibility: <strong className="text-slate-300 not-italic uppercase font-black ml-1">High</strong></span>
                         </div>
                         <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                            <Clock className="w-3 h-3" />
                            Estimated effort: 15-30m
                         </div>
                      </div>
                   </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

    </div>
  );
};
