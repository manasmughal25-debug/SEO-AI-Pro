import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { AuditRecord } from '../types';
import { navigate } from '../utils/router';
import { 
  Globe, 
  Search, 
  ArrowRight, 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  RotateCw, 
  Trash2, 
  ExternalLink, 
  Zap, 
  TrendingUp, 
  Sparkles,
  ShieldCheck,
  Layers,
  FileCheck2
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const { user, token } = useAuth();
  const [urlInput, setUrlInput] = useState('');
  const [crawling, setCrawling] = useState(false);
  const [crawlStep, setCrawlStep] = useState('');
  const [audits, setAudits] = useState<AuditRecord[]>([]);
  const [loadingAudits, setLoadingAudits] = useState(true);
  const [urlError, setUrlError] = useState<string | null>(null);

  // Fetch audits
  const fetchAudits = async () => {
    try {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/audits', { headers });
      if (res.ok) {
        const data = await res.json();
        setAudits(data.audits || []);
      }
    } catch (err) {
      console.warn('Error fetching audits:', err);
    } finally {
      setLoadingAudits(false);
    }
  };

  useEffect(() => {
    fetchAudits();
  }, [token]);

  // URL Validation helper
  const validateUrlInput = (raw: string): { valid: boolean; normalized?: string; error?: string } => {
    const trimmed = raw.trim();
    if (!trimmed) {
      return { valid: false, error: 'Please enter a website URL or domain name.' };
    }

    if (/\s/.test(trimmed)) {
      return { valid: false, error: 'URL contains spaces. Please enter a valid URL without whitespace.' };
    }

    let testUrl = trimmed;
    if (!/^https?:\/\//i.test(testUrl)) {
      testUrl = 'https://' + testUrl;
    }

    try {
      const parsed = new URL(testUrl);
      if (!parsed.hostname || !parsed.hostname.includes('.')) {
        return { 
          valid: false, 
          error: 'Please enter a valid domain name with extension (e.g. example.com, myapp.io).' 
        };
      }
      if (parsed.hostname === 'localhost' || parsed.hostname.startsWith('127.')) {
        return { 
          valid: false, 
          error: 'Localhost addresses cannot be crawled by CrawlLens server. Please test a live public website.' 
        };
      }
      return { valid: true, normalized: parsed.href };
    } catch {
      return { 
        valid: false, 
        error: 'Invalid URL format. Example: https://mywebsite.com or mywebsite.com' 
      };
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setUrlInput(val);
    if (urlError) {
      setUrlError(null);
    }
  };

  const handleStartCrawl = async (e: React.FormEvent) => {
    e.preventDefault();
    setUrlError(null);

    const validation = validateUrlInput(urlInput);
    if (!validation.valid || !validation.normalized) {
      setUrlError(validation.error || 'Invalid URL entered.');
      return;
    }

    setCrawling(true);
    setCrawlStep('Resolving host & establishing TLS handshake...');

    const stepTimer1 = setTimeout(() => {
      setCrawlStep('Extracting HTML DOM, meta tags, and structured schemas...');
    }, 1200);

    const stepTimer2 = setTimeout(() => {
      setCrawlStep('Auditing SEO, AEO, AIO, GEO, and E-E-A-T signals...');
    }, 2800);

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/crawl', {
        method: 'POST',
        headers,
        body: JSON.stringify({ url: validation.normalized })
      });

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);

      const data = await res.json();
      if (!res.ok) {
        setUrlError(data.error || 'Crawl failed. Please verify the website is online.');
        setCrawling(false);
        return;
      }

      // Add to audits list and navigate directly to overall report
      const newAudit: AuditRecord = data.audit;
      setAudits(prev => [newAudit, ...prev.filter(a => a.id !== newAudit.id)]);
      setCrawling(false);
      navigate(`/audits/${newAudit.id}/overall`);
    } catch (err: any) {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      setUrlError(`Network error while initiating crawl: ${err.message || 'Server did not respond'}`);
      setCrawling(false);
    }
  };

  const handleReCrawl = async (auditId: string) => {
    try {
      const res = await fetch(`/api/audits/${auditId}/re-crawl`, {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        setAudits(prev => prev.map(a => a.id === auditId ? data.audit : a));
        navigate(`/audits/${auditId}/overall`);
      }
    } catch (err) {
      console.warn('Re-crawl failed:', err);
    }
  };

  const handleDeleteAudit = async (auditId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/audits/${auditId}`, {
        method: 'DELETE',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (res.ok) {
        setAudits(prev => prev.filter(a => a.id !== auditId));
      }
    } catch (err) {
      console.warn('Delete audit failed', err);
    }
  };

  const fillQuickUrl = (url: string) => {
    setUrlInput(url);
    setUrlError(null);
  };

  // Calculations for stats
  const totalAudits = audits.length;
  const avgOverallScore = totalAudits > 0 
    ? Math.round(audits.reduce((acc, a) => acc + (a.scores?.overall || 0), 0) / totalAudits) 
    : 0;
  const totalCriticalIssues = audits.reduce((acc, a) => 
    acc + (a.issues?.filter(i => i.severity === 'critical').length || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Banner / Welcome */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            Audit Dashboard
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
              Live Engine
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Analyze website readiness for Google, ChatGPT Search, Perplexity, Claude, and Gemini.
          </p>
        </div>

        {user && (
          <div className="flex items-center gap-3 bg-slate-900/80 px-3.5 py-2 rounded-xl border border-slate-800">
            <img
              src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.fullName)}`}
              alt={user.fullName}
              className="w-8 h-8 rounded-full border border-slate-700 object-cover"
            />
            <div className="text-xs">
              <span className="font-semibold text-slate-200 block">{user.fullName}</span>
              <span className="text-slate-400 font-mono text-[11px]">{user.email}</span>
            </div>
          </div>
        )}
      </div>

      {/* Crawl URL Input Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-72 h-72 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

        <div className="relative max-w-3xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Next-Gen Multi-Dimensional Website Crawler
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            Enter Any Website URL to Start Audit
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            CrawlLens inspects on-page Technical SEO, Voice AEO, AI Search Bot access, Generative citation depth, and E-E-A-T trust factors.
          </p>

          <form onSubmit={handleStartCrawl} className="mt-4">
            <div className="flex flex-col sm:flex-row items-center gap-2 bg-slate-950 p-2 rounded-2xl border border-slate-700 shadow-inner focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition">
              <div className="flex items-center gap-2 pl-3 w-full sm:w-auto flex-1">
                <Globe className="w-5 h-5 text-indigo-400 shrink-0" />
                <input
                  type="text"
                  value={urlInput}
                  onChange={handleInputChange}
                  placeholder="e.g. example.com or https://mysite.com"
                  disabled={crawling}
                  className="w-full py-2.5 bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={crawling}
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 disabled:opacity-50 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition shrink-0"
              >
                {crawling ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin" />
                    <span>Analyzing Site...</span>
                  </>
                ) : (
                  <>
                    <span>Start Audit</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Error Message with Exact Feedback */}
          {urlError && (
            <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-center justify-center gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{urlError}</span>
            </div>
          )}

          {/* Active Crawling Animation & Progress */}
          {crawling && (
            <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/40 text-xs text-indigo-200 animate-pulse space-y-2">
              <div className="flex items-center justify-center gap-2 font-medium">
                <RotateCw className="w-4 h-4 text-cyan-400 animate-spin" />
                <span>{crawlStep}</span>
              </div>
              <div className="w-full max-w-md mx-auto h-1.5 bg-slate-900 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-indigo-500 animate-shimmer" style={{ width: '85%' }} />
              </div>
            </div>
          )}

          {/* Quick URL Suggestions */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs text-slate-400">
            <span className="text-slate-500">Quick tests:</span>
            {['example.com', 'wikipedia.org', 'github.com', 'iana.org'].map(domain => (
              <button
                key={domain}
                type="button"
                onClick={() => fillQuickUrl(`https://${domain}`)}
                className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700 text-xs font-mono transition"
              >
                {domain}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-slate-900/70 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Total Audits</span>
            <span className="text-2xl font-bold font-mono text-white mt-1 block">{totalAudits}</span>
          </div>
          <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Average Score</span>
            <span className="text-2xl font-bold font-mono text-emerald-400 mt-1 block">
              {avgOverallScore > 0 ? `${avgOverallScore}/100` : '--'}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Critical Issues</span>
            <span className="text-2xl font-bold font-mono text-amber-400 mt-1 block">
              {totalCriticalIssues}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Engine Dimensions</span>
            <span className="text-sm font-semibold text-cyan-400 mt-1 block">
              SEO • AEO • AIO • GEO • EEAT
            </span>
          </div>
          <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Recent Audits Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <FileCheck2 className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">Recent Crawl Audits</h3>
            <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-mono">
              {audits.length}
            </span>
          </div>
          <button
            onClick={fetchAudits}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-slate-800 transition"
          >
            <RotateCw className="w-3.5 h-3.5" />
            Refresh
          </button>
        </div>

        {loadingAudits ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            <RotateCw className="w-6 h-6 mx-auto mb-2 animate-spin text-indigo-400" />
            Loading audits database...
          </div>
        ) : audits.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <Globe className="w-10 h-10 mx-auto text-slate-600" />
            <p className="text-sm">No audits conducted yet. Enter a website URL above to run your first comprehensive crawl!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 uppercase font-semibold border-b border-slate-800/80">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">Domain / URL</th>
                  <th className="py-3.5 px-4 text-center">Overall</th>
                  <th className="py-3.5 px-4 text-center hidden md:table-cell">SEO</th>
                  <th className="py-3.5 px-4 text-center hidden md:table-cell">AEO</th>
                  <th className="py-3.5 px-4 text-center hidden md:table-cell">AIO</th>
                  <th className="py-3.5 px-4 text-center hidden lg:table-cell">GEO</th>
                  <th className="py-3.5 px-4 text-center hidden lg:table-cell">E-E-A-T</th>
                  <th className="py-3.5 px-4 hidden sm:table-cell">Audited At</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {audits.map(audit => {
                  const score = audit.scores?.overall || 0;
                  const scoreColor = score >= 80 ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' :
                                    score >= 60 ? 'text-amber-400 bg-amber-500/10 border-amber-500/30' :
                                    'text-red-400 bg-red-500/10 border-red-500/30';

                  return (
                    <tr 
                      key={audit.id} 
                      onClick={() => navigate(`/audits/${audit.id}/overall`)}
                      className="hover:bg-slate-800/50 cursor-pointer transition"
                    >
                      <td className="py-4 px-4 sm:px-6">
                        <div className="font-semibold text-slate-100 flex items-center gap-2">
                          <Globe className="w-4 h-4 text-indigo-400 shrink-0" />
                          <span className="truncate max-w-[180px] sm:max-w-xs">{audit.domain}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 truncate max-w-[200px] sm:max-w-sm mt-0.5 font-mono">
                          {audit.url}
                        </div>
                      </td>

                      <td className="py-4 px-4 text-center">
                        <span className={`inline-block px-2.5 py-1 rounded-lg font-mono font-bold border ${scoreColor}`}>
                          {score}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-center font-mono text-slate-300 hidden md:table-cell">
                        {audit.scores?.seo ?? '--'}
                      </td>
                      <td className="py-4 px-4 text-center font-mono text-slate-300 hidden md:table-cell">
                        {audit.scores?.aeo ?? '--'}
                      </td>
                      <td className="py-4 px-4 text-center font-mono text-slate-300 hidden md:table-cell">
                        {audit.scores?.aio ?? '--'}
                      </td>
                      <td className="py-4 px-4 text-center font-mono text-slate-300 hidden lg:table-cell">
                        {audit.scores?.geo ?? '--'}
                      </td>
                      <td className="py-4 px-4 text-center font-mono text-slate-300 hidden lg:table-cell">
                        {audit.scores?.eeat ?? '--'}
                      </td>

                      <td className="py-4 px-4 text-slate-400 hidden sm:table-cell whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          <span>{new Date(audit.crawledAt).toLocaleDateString()}</span>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => navigate(`/audits/${audit.id}/overall`)}
                            className="p-1.5 text-indigo-400 hover:text-white hover:bg-indigo-600/20 rounded-lg transition"
                            title="View Full Report"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleReCrawl(audit.id)}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
                            title="Re-crawl Site"
                          >
                            <RotateCw className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => handleDeleteAudit(audit.id, e)}
                            className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                            title="Delete Audit"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
