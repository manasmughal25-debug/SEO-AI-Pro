import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Link2, 
  Plus, 
  Search, 
  RotateCw, 
  FolderOpen,
  Globe,
  BarChart3,
  ExternalLink,
  Target,
  Zap,
  TrendingUp,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

interface LinkOpportunity {
  id: string;
  domain: string;
  authorityScore: number;
  relevance: string;
  type: string;
  status: 'new' | 'outreached' | 'acquired' | 'ignored';
}

interface Project {
  id: string;
  name: string;
}

export const BacklinksView: React.FC = () => {
  const { token } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [opportunities, setOpportunities] = useState<LinkOpportunity[]>([]);
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
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, [token]);

  useEffect(() => {
    if (!selectedProjectId) return;
    setLoading(true);
    // Simulation
    setTimeout(() => {
      setOpportunities([
        { id: '1', domain: 'techcrunch.com', authorityScore: 92, relevance: 'High', type: 'Guest Post', status: 'new' },
        { id: '2', domain: 'searchengineland.com', authorityScore: 88, relevance: 'High', type: 'Expert Citation', status: 'outreached' },
        { id: '3', domain: 'medium.com', authorityScore: 95, relevance: 'Medium', type: 'Syndication', status: 'new' },
      ]);
      setLoading(false);
    }, 800);
  }, [selectedProjectId]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Link2 className="w-8 h-8 text-indigo-400" />
            Link Opportunity Engine
          </h1>
          <p className="text-slate-400 mt-2">Identify high-authority backlink opportunities and manage your outreach strategy.</p>
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

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Backlinks</span>
          <h4 className="text-2xl font-black text-white">1,248</h4>
          <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +12 this week
          </span>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Avg. Authority</span>
          <h4 className="text-2xl font-black text-white">64/100</h4>
          <span className="text-xs text-slate-400 font-bold">Industry Leader</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Pending Outreach</span>
          <h4 className="text-2xl font-black text-white">14 Sites</h4>
          <span className="text-xs text-indigo-400 font-bold">Action Required</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Spam Risk</span>
          <h4 className="text-2xl font-black text-white">Low</h4>
          <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> Secure
          </span>
        </div>
      </div>

      {/* Opportunities Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <h3 className="font-bold text-white">Strategic Opportunities</h3>
          <button className="px-4 py-2 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 text-xs font-bold rounded-lg transition border border-indigo-500/20 flex items-center gap-2">
            <Target className="w-3.5 h-3.5" /> Discovery Mode
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-950/50 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Domain</th>
                <th className="px-6 py-4">Authority</th>
                <th className="px-6 py-4">Relevance</th>
                <th className="px-6 py-4">Link Type</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {opportunities.map(opt => (
                <tr key={opt.id} className="hover:bg-slate-800/30 transition group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-500 group-hover:text-indigo-400 transition-colors">
                        <Globe className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-bold text-slate-200">{opt.domain}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1.5 w-16 bg-slate-950 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500" style={{ width: `${opt.authorityScore}%` }} />
                      </div>
                      <span className="text-xs font-bold text-slate-300">{opt.authorityScore}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      opt.relevance === 'High' ? 'text-emerald-400 bg-emerald-500/10' : 'text-amber-400 bg-amber-500/10'
                    }`}>
                      {opt.relevance}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs text-slate-400">{opt.type}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tighter ${
                      opt.status === 'acquired' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      opt.status === 'outreached' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                      'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}>
                      {opt.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-slate-600 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition" title="Start Outreach">
                      <Zap className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
