import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { navigate } from '../utils/router';
import { 
  Globe, 
  Plus, 
  Search, 
  ArrowRight, 
  MoreVertical, 
  Trash2, 
  ExternalLink, 
  Clock,
  Layers,
  LayoutGrid,
  List as ListIcon,
  AlertCircle,
  RotateCw
} from 'lucide-react';

interface Project {
  id: string;
  name: string;
  industry: string;
  createdAt: string;
  domains: { url: string; domain: string }[];
}

export const ProjectsView: React.FC = () => {
  const { token } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', url: '', industry: 'SaaS' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        setProjects(data.projects || []);
      }
    } catch (err) {
      console.error('Failed to fetch projects', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [token]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newProject)
      });

      if (res.ok) {
        await fetchProjects();
        setShowCreateModal(false);
        setNewProject({ name: '', url: '', industry: 'SaaS' });
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to create project');
      }
    } catch (err) {
      setError('Network error creating project');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project and all its data?')) return;
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setProjects(projects.filter(p => p.id !== id));
      }
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Globe className="w-8 h-8 text-indigo-400" />
            Website Projects
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage your digital assets and search performance across domains.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          Connect New Website
        </button>
      </div>

      {/* Projects Grid/List */}
      {loading ? (
        <div className="py-20 text-center space-y-4">
          <RotateCw className="w-8 h-8 text-indigo-500 animate-spin mx-auto" />
          <p className="text-slate-400 text-sm">Synchronizing project data...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-slate-900/60 border-2 border-dashed border-slate-800 rounded-3xl p-12 text-center space-y-6">
          <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto text-slate-600">
            <Globe className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-lg font-bold text-white">No websites connected</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Start by connecting your first website. We'll crawl its structure, track keyword rankings, and monitor technical SEO health automatically.
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-semibold transition"
          >
            Create Your First Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              onClick={() => navigate(`/projects/${project.id}`)}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 cursor-pointer group hover:border-indigo-500/50 transition-all shadow-xl"
            >
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                  <Globe className="w-6 h-6" />
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteProject(project.id);
                  }}
                  className="p-2 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
                  {project.name}
                </h3>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1 font-mono">
                  <ExternalLink className="w-3 h-3" />
                  {project.domains[0]?.domain || 'No domain linked'}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Industry</span>
                  <span className="text-xs font-semibold text-slate-300">{project.industry || 'General'}</span>
                </div>
                <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Health</span>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    <span className="text-xs font-semibold text-emerald-400">Stable</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs font-bold text-indigo-400 uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                <span>View Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-8 shadow-2xl space-y-6 relative overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-32 h-32 bg-indigo-600/20 blur-3xl pointer-events-none" />
            
            <div>
              <h2 className="text-2xl font-bold text-white">Connect Website</h2>
              <p className="text-sm text-slate-400 mt-1">Configure your new enterprise SEO project.</p>
            </div>

            {error && (
              <div className="p-3.5 bg-red-950/30 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Project Name</label>
                <input
                  type="text"
                  required
                  value={newProject.name}
                  onChange={e => setNewProject({...newProject, name: e.target.value})}
                  placeholder="e.g. My Portfolio or Company Corp"
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500 transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Website URL</label>
                <div className="relative">
                  < Globe className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-600" />
                  <input
                    type="url"
                    required
                    value={newProject.url}
                    onChange={e => setNewProject({...newProject, url: e.target.value})}
                    placeholder="https://example.com"
                    className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Industry</label>
                  <select
                    value={newProject.industry}
                    onChange={e => setNewProject({...newProject, industry: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500 appearance-none transition"
                  >
                    <option value="SaaS">SaaS</option>
                    <option value="E-commerce">E-commerce</option>
                    <option value="Local Business">Local Business</option>
                    <option value="Content/Blog">Content/Blog</option>
                    <option value="Agency">Agency</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2"
                >
                  {submitting ? <RotateCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  {submitting ? 'Connecting...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
