import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Search, 
  Sparkles, 
  TrendingUp, 
  BarChart3, 
  MousePointer2, 
  Zap, 
  RotateCw, 
  ArrowRight,
  Plus,
  AlertCircle,
  CheckCircle2,
  FolderOpen
} from 'lucide-react';

interface KeywordIdea {
  term: string;
  searchVolume: number;
  difficulty: number;
  searchIntent: string;
  trend: string;
}

interface Project {
  id: string;
  name: string;
  url: string;
}

export const KeywordResearchView: React.FC = () => {
  const { token } = useAuth();
  const [term, setTerm] = useState('');
  const [results, setResults] = useState<KeywordIdea[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedKeywords, setSavedKeywords] = useState<Set<string>>(new Set());

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

  const handleResearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!term) return;
    setLoading(true);
    setError('');
    setResults([]);

    try {
      const res = await fetch('/api/keywords/research', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ term })
      });

      if (res.ok) {
        const data = await res.json();
        setResults(data.keywords || []);
      } else {
        setError('Keyword engine is currently under high load. Please try again.');
      }
    } catch (err) {
      setError('Network error during keyword research.');
    } finally {
      setLoading(false);
    }
  };

  const saveKeyword = async (keyword: KeywordIdea) => {
    if (!selectedProjectId) {
      setError('Please select or create a project first to track keywords.');
      return;
    }

    setSavingId(keyword.term);
    try {
      const res = await fetch(`/api/projects/${selectedProjectId}/keywords`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          term: keyword.term,
          searchVolume: keyword.searchVolume,
          difficulty: keyword.difficulty
        })
      });

      if (res.ok) {
        setSavedKeywords(prev => new Set(prev).add(keyword.term));
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to save keyword to project.');
      }
    } catch (err) {
      setError('Network error while saving keyword.');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-500">
      
      {/* Header & Search */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-indigo-600/10 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="max-w-4xl space-y-8">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <Search className="w-8 h-8 text-indigo-400" />
              Keyword Intelligence
            </h1>
            <p className="text-slate-400 mt-2">
              Uncover high-intent keywords, predict search volume trends, and analyze competitive difficulty using AI-driven search models.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="md:col-span-3 space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Research Topic</label>
              <form onSubmit={handleResearch} className="flex gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-4 w-5 h-5 text-slate-500" />
                  <input
                    type="text"
                    value={term}
                    onChange={e => setTerm(e.target.value)}
                    placeholder="Enter a topic or niche (e.g. enterprise seo solutions)"
                    className="w-full pl-12 pr-4 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-white text-sm focus:outline-none focus:border-indigo-500 transition shadow-inner"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-2xl shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2 shrink-0"
                >
                  {loading ? <RotateCw className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                  {loading ? 'Analyzing...' : 'Generate'}
                </button>
              </form>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Target Project</label>
              <div className="relative">
                <FolderOpen className="absolute left-4 top-4 w-5 h-5 text-slate-500" />
                <select
                  value={selectedProjectId}
                  onChange={e => setSelectedProjectId(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-white text-sm appearance-none focus:outline-none focus:border-indigo-500 transition shadow-inner cursor-pointer"
                >
                  {projects.length === 0 ? (
                    <option value="">No Projects Found</option>
                  ) : (
                    projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))
                  )}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-950/30 border border-red-500/30 rounded-2xl text-red-400 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {error}
        </div>
      )}

      {/* Results Table */}
      {results.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <h3 className="font-bold text-white">Keyword Opportunities</h3>
            <span className="text-xs text-slate-500 font-mono">{results.length} insights generated</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-950/50 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">Keyword Term</th>
                  <th className="px-6 py-4">Monthly Vol</th>
                  <th className="px-6 py-4">Difficulty</th>
                  <th className="px-6 py-4">Intent</th>
                  <th className="px-6 py-4">Trend</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {results.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/30 transition group">
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-slate-200 group-hover:text-indigo-400 transition-colors">{item.term}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-mono text-slate-400">{item.searchVolume?.toLocaleString() || '0'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-1.5 w-20 bg-slate-950 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              item.difficulty > 70 ? 'bg-red-500' : 
                              item.difficulty > 40 ? 'bg-amber-500' : 'bg-emerald-500'
                            }`} 
                            style={{ width: `${item.difficulty}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-slate-300">{item.difficulty}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-tighter ${
                        item.searchIntent === 'transactional' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                        item.searchIntent === 'commercial' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' :
                        'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}>
                        {item.searchIntent}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`flex items-center gap-1.5 text-xs font-bold ${
                        item.trend === 'rising' ? 'text-emerald-400' : 
                        item.trend === 'falling' ? 'text-red-400' : 'text-slate-400'
                      }`}>
                        <TrendingUp className={`w-3.5 h-3.5 ${item.trend === 'rising' ? '' : 'rotate-180'}`} />
                        {item.trend}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {savedKeywords.has(item.term) ? (
                        <div className="flex items-center justify-end gap-1 text-emerald-400 text-[10px] font-bold uppercase">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Tracking
                        </div>
                      ) : (
                        <button 
                          onClick={() => saveKeyword(item)}
                          disabled={savingId === item.term}
                          className="p-2 text-slate-600 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition disabled:opacity-50" 
                          title="Add to Rank Tracking"
                        >
                          {savingId === item.term ? <RotateCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && results.length === 0 && (
        <div className="py-20 text-center space-y-6 bg-slate-950/30 border-2 border-dashed border-slate-900 rounded-3xl">
          <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto text-slate-700">
            <Zap className="w-8 h-8" />
          </div>
          <div className="max-w-xs mx-auto space-y-2">
            <h3 className="text-lg font-bold text-white">Explore Niche Keywords</h3>
            <p className="text-sm text-slate-500">Enter a core topic above to generate low-competition, high-volume opportunities.</p>
          </div>
        </div>
      )}

    </div>
  );
};
