import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  History, 
  Search, 
  RotateCw, 
  FolderOpen,
  ArrowRight,
  Trash2,
  Filter,
  BarChart3,
  Calendar,
  Globe
} from 'lucide-react';
import { navigate } from '../utils/router';
import { AuditRecord } from '../types';

export const HistoryView: React.FC = () => {
  const { token } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [audits, setAudits] = useState<AuditRecord[]>([]);
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
        }
      } catch (err) {
        console.error('Failed to fetch projects');
      }
    };
    fetchProjects();
  }, [token]);

  const fetchAudits = async () => {
    setLoading(true);
    try {
      const url = selectedProjectId ? `/api/audits?projectId=${selectedProjectId}` : '/api/audits';
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAudits(data.audits || []);
      }
    } catch (err) {
      console.error('Failed to fetch audits');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAudits();
  }, [selectedProjectId, token]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this audit report?')) return;
    try {
      const res = await fetch(`/api/audits/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setAudits(audits.filter(a => a.id !== id));
        fetchAudits();
      }
    } catch (err) {
      console.error('Delete failed');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <History className="w-8 h-8 text-indigo-400" />
            Audit History
          </h1>
          <p className="text-slate-400 mt-2">Historical archive of all website performance audits and intelligence reports.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative w-full sm:w-64">
            <FolderOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <select
              value={selectedProjectId}
              onChange={e => setSelectedProjectId(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white appearance-none focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Projects</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-500"><RotateCw className="w-8 h-8 animate-spin mx-auto mb-4" /> Retrieving Archives...</div>
      ) : audits.length === 0 ? (
        <div className="py-20 text-center space-y-6 bg-slate-950/30 border-2 border-dashed border-slate-900 rounded-3xl">
          <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto text-slate-700">
            <Calendar className="w-8 h-8" />
          </div>
          <div className="max-w-xs mx-auto space-y-2">
            <h3 className="text-lg font-bold text-white">Empty Archive</h3>
            <p className="text-sm text-slate-500">No historical audits found. Start analyzing your projects to build a performance history.</p>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
           <div className="overflow-x-auto">
             <table className="w-full text-left">
               <thead className="bg-slate-950/50 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800">
                 <tr>
                   <th className="px-6 py-4">Audit Date</th>
                   <th className="px-6 py-4">Target Website</th>
                   <th className="px-6 py-4">Overall Score</th>
                   <th className="px-6 py-4">Status</th>
                   <th className="px-6 py-4 text-right">Actions</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-800/50">
                 {audits.map(audit => (
                   <tr key={audit.id} className="hover:bg-slate-800/30 transition group">
                     <td className="px-6 py-4">
                       <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          <span className="text-sm font-bold text-slate-200">
                            {new Date(audit.crawledAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                       </div>
                     </td>
                     <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-500">
                              <Globe className="w-4 h-4" />
                           </div>
                           <span className="text-xs text-slate-400 font-mono truncate max-w-[200px]">{audit.url}</span>
                        </div>
                     </td>
                     <td className="px-6 py-4">
                        <div className={`inline-flex items-center gap-1.5 font-black text-lg ${
                          audit.scores.overall >= 80 ? 'text-emerald-400' : 
                          audit.scores.overall >= 60 ? 'text-amber-400' : 'text-red-400'
                        }`}>
                           {audit.scores.overall}
                        </div>
                     </td>
                     <td className="px-6 py-4">
                        <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] font-bold uppercase tracking-widest border border-indigo-500/20">
                          {audit.status}
                        </span>
                     </td>
                     <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => navigate(`/audits/${audit.id}/overall`)}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-indigo-600 text-white text-xs font-bold transition"
                          >
                            Open Report
                          </button>
                          <button 
                            onClick={() => handleDelete(audit.id)}
                            className="p-2 text-slate-600 hover:text-red-400 transition"
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
      )}

    </div>
  );
};
