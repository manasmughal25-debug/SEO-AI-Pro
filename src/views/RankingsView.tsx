import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Search, 
  RotateCw, 
  FolderOpen,
  ArrowUpRight,
  ExternalLink,
  Target,
  BarChart3
} from 'lucide-react';

interface KeywordRanking {
  id: string;
  term: string;
  searchVolume: number;
  difficulty: number;
  rankings: {
    position: number;
    url: string;
    recordedAt: string;
  }[];
}

interface Project {
  id: string;
  name: string;
}

export const RankingsView: React.FC = () => {
  const { token } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [keywords, setKeywords] = useState<KeywordRanking[]>([]);
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

    const fetchKeywords = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/projects/${selectedProjectId}/keywords`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setKeywords(data.keywords || []);
        }
      } catch (err) {
        console.error('Failed to fetch keywords');
      } finally {
        setLoading(false);
      }
    };
    fetchKeywords();
  }, [selectedProjectId, token]);

  const getRankTrend = (keyword: KeywordRanking) => {
    if (keyword.rankings.length < 2) return 'stable';
    const current = keyword.rankings[0].position;
    const previous = keyword.rankings[1].position;
    if (current < previous) return 'rising';
    if (current > previous) return 'falling';
    return 'stable';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Target className="w-8 h-8 text-indigo-400" />
            Rank Intelligence
          </h1>
          <p className="text-slate-400 mt-2">Track real-time search engine positioning and visibility trends for your core keywords.</p>
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

      {loading ? (
        <div className="py-20 text-center text-slate-500">
          <RotateCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          Synchronizing rank data...
        </div>
      ) : keywords.length === 0 ? (
        <div className="py-20 text-center space-y-6 bg-slate-950/30 border-2 border-dashed border-slate-900 rounded-3xl">
          <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto text-slate-700">
            <BarChart3 className="w-8 h-8" />
          </div>
          <div className="max-w-xs mx-auto space-y-2">
            <h3 className="text-lg font-bold text-white">No Tracked Keywords</h3>
            <p className="text-sm text-slate-500">Start by adding keywords from the Intelligence center to track your performance.</p>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-950/50 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">Keyword Term</th>
                  <th className="px-6 py-4">Position</th>
                  <th className="px-6 py-4">Trend</th>
                  <th className="px-6 py-4">Difficulty</th>
                  <th className="px-6 py-4">Monthly Vol</th>
                  <th className="px-6 py-4 text-right">Target URL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {keywords.map(kw => {
                  const latest = kw.rankings[0];
                  const trend = getRankTrend(kw);
                  return (
                    <tr key={kw.id} className="hover:bg-slate-800/30 transition group">
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-slate-200 group-hover:text-indigo-400 transition-colors">{kw.term}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`text-lg font-black ${
                            !latest || latest.position > 10 ? 'text-slate-400' : 'text-indigo-400'
                          }`}>
                            {latest?.position || '--'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`flex items-center gap-1.5 text-xs font-bold ${
                          trend === 'rising' ? 'text-emerald-400' : 
                          trend === 'falling' ? 'text-red-400' : 'text-slate-400'
                        }`}>
                          {trend === 'rising' ? <TrendingUp className="w-3.5 h-3.5" /> : 
                           trend === 'falling' ? <TrendingDown className="w-3.5 h-3.5" /> : 
                           <Minus className="w-3.5 h-3.5" />}
                          {trend.toUpperCase()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-1 w-16 bg-slate-950 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${
                                kw.difficulty > 70 ? 'bg-red-500' : 
                                kw.difficulty > 40 ? 'bg-amber-500' : 'bg-emerald-500'
                              }`} 
                              style={{ width: `${kw.difficulty}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-bold text-slate-500">{kw.difficulty}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-mono text-slate-400">{kw.searchVolume?.toLocaleString() || '0'}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {latest?.url ? (
                          <a 
                            href={latest.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-400 hover:text-white transition uppercase tracking-tighter"
                          >
                            View Page <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-700 uppercase tracking-tighter">No Page Found</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
