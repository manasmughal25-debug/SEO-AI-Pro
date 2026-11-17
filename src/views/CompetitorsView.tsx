import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Target, 
  TrendingUp, 
  TrendingDown, 
  ArrowRight, 
  Plus, 
  Search, 
  RotateCw, 
  FolderOpen,
  Globe,
  BarChart3,
  BrainCircuit,
  Zap,
  Trash2
} from 'lucide-react';

interface Competitor {
  id: string;
  domain: string;
  name: string;
  visibilityScore?: number;
  topKeywords?: string[];
}

interface Project {
  id: string;
  name: string;
}

export const CompetitorsView: React.FC = () => {
  const { token } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [newDomain, setNewDomain] = useState('');

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
    
    const fetchCompetitors = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/projects/${selectedProjectId}/competitors`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setCompetitors(data.competitors || []);
        }
      } catch (err) {
        console.error('Failed to fetch competitors');
      } finally {
        setLoading(false);
      }
    };
    fetchCompetitors();
  }, [selectedProjectId, token]);

  const handleAddCompetitor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomain || !selectedProjectId) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${selectedProjectId}/competitors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ domain: newDomain })
      });

      if (res.ok) {
        setNewDomain('');
        // Refresh list
        const updatedRes = await fetch(`/api/projects/${selectedProjectId}/competitors`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await updatedRes.json();
        setCompetitors(data.competitors || []);
      }
    } catch (err) {
      console.error('Failed to add competitor');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCompetitor = async (competitorId: string) => {
    if (!selectedProjectId) return;
    
    try {
      const res = await fetch(`/api/projects/${selectedProjectId}/competitors/${competitorId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setCompetitors(prev => prev.filter(c => c.id !== competitorId));
      }
    } catch (err) {
      console.error('Failed to delete competitor');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <BrainCircuit className="w-8 h-8 text-indigo-400" />
            Competitor Intelligence
          </h1>
          <p className="text-slate-400 mt-2">Monitor competitor search visibility, strategy shifts, and market share positioning.</p>
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

      {/* Benchmarking Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Share of Voice</span>
          <div className="flex items-end justify-between">
            <h4 className="text-2xl font-black text-white">12.4%</h4>
            <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +1.2%
            </span>
          </div>
          <div className="w-full h-1 bg-slate-800 rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-indigo-500 w-[12.4%]" />
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Competitive Gap</span>
          <div className="flex items-end justify-between">
            <h4 className="text-2xl font-black text-white">28 Keywords</h4>
            <span className="text-xs text-red-400 font-bold flex items-center gap-1">
              <TrendingDown className="w-3 h-3" /> -4 this week
            </span>
          </div>
          <div className="w-full h-1 bg-slate-800 rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-amber-500 w-[45%]" />
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">AI Visibility Rank</span>
          <div className="flex items-end justify-between">
            <h4 className="text-2xl font-black text-white">#4 / 12</h4>
            <span className="text-xs text-slate-400 font-bold">Stable</span>
          </div>
          <div className="w-full h-1 bg-slate-800 rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-emerald-500 w-[33%]" />
          </div>
        </div>
      </div>

      {/* Add Competitor */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <form onSubmit={handleAddCompetitor} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={newDomain}
              onChange={e => setNewDomain(e.target.value)}
              placeholder="Add competitor domain (e.g. competitor.com)"
              className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500 transition shadow-inner"
            />
          </div>
          <button 
            type="submit"
            disabled={loading || !newDomain}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl transition flex items-center justify-center gap-2"
          >
            {loading ? <RotateCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Track Competitor
          </button>
        </form>
      </div>

      {/* Competitor Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-white">Direct Competitors</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-950/50 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Competitor</th>
                <th className="px-6 py-4">Visibility Score</th>
                <th className="px-6 py-4">Strategic Advantage</th>
                <th className="px-6 py-4">Top Keywords</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {competitors.map(comp => (
                <tr key={comp.id} className="hover:bg-slate-800/30 transition group">
                  <td className="px-6 py-4">
                    <div>
                      <span className="text-sm font-bold text-slate-200 block">{comp.name}</span>
                      <span className="text-xs text-slate-500 font-mono">{comp.domain}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1.5 w-16 bg-slate-950 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500" style={{ width: `${comp.visibilityScore}%` }} />
                      </div>
                      <span className="text-xs font-bold text-slate-300">{comp.visibilityScore}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs text-slate-400 italic">Predictive content velocity...</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {comp.topKeywords?.map(kw => (
                        <span key={kw} className="px-2 py-0.5 rounded bg-slate-800 text-[9px] font-bold text-slate-400 border border-slate-700">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="p-2 text-slate-600 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition" title="View Intelligence">
                        <Zap className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteCompetitor(comp.id)}
                        className="p-2 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition" 
                        title="Remove Competitor"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
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
