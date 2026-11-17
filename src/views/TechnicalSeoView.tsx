import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldCheck, 
  Search, 
  RotateCw, 
  AlertCircle, 
  AlertTriangle,
  CheckCircle2, 
  Info,
  Globe, 
  FileCode2, 
  Link2, 
  Image as ImageIcon, 
  Zap, 
  Smartphone, 
  Monitor, 
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Layers,
  FolderOpen,
  Check,
  Copy,
  Clock,
  Sparkles,
  ArrowUpRight,
  FileText,
  Key
} from 'lucide-react';
import { 
  CrawlJob, 
  CrawledPage, 
  TechnicalIssue, 
  PageSpeedReport 
} from '../types';

export const TechnicalSeoView: React.FC = () => {
  const { token } = useAuth();

  // Projects & Navigation State
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  
  // Crawler Form State
  const [targetUrl, setTargetUrl] = useState<string>('https://');
  const [maxPages, setMaxPages] = useState<number>(25);
  const [isCrawling, setIsCrawling] = useState<boolean>(false);
  const [crawlError, setCrawlError] = useState<string | null>(null);

  // Active Job & Results State
  const [activeJob, setActiveJob] = useState<CrawlJob | null>(null);
  const [crawledPagesList, setCrawledPagesList] = useState<CrawledPage[]>([]);
  const [technicalIssuesList, setTechnicalIssuesList] = useState<TechnicalIssue[]>([]);
  const [recentJobs, setRecentJobs] = useState<CrawlJob[]>([]);
  const [loadingInitial, setLoadingInitial] = useState<boolean>(true);

  // Filters & Tabs
  const [activeTab, setActiveTab] = useState<'issues' | 'pages' | 'pagespeed'>('issues');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'critical' | 'high' | 'medium' | 'low'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [issueSearch, setIssueSearch] = useState<string>('');
  const [pageSearch, setPageSearch] = useState<string>('');
  const [expandedIssueId, setExpandedIssueId] = useState<string | null>(null);
  const [copiedSnippetId, setCopiedSnippetId] = useState<string | null>(null);

  // PageSpeed State
  const [psStrategy, setPsStrategy] = useState<'mobile' | 'desktop'>('mobile');
  const [isAnalyzingPs, setIsAnalyzingPs] = useState<boolean>(false);
  const [psReport, setPsReport] = useState<PageSpeedReport | null>(null);
  const [psError, setPsError] = useState<string | null>(null);
  const [psInstructions, setPsInstructions] = useState<string | null>(null);
  const [showPsSetupModal, setShowPsSetupModal] = useState<boolean>(false);

  const authHeaders: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {};

  // Fetch initial projects & recent jobs
  useEffect(() => {
    const initData = async () => {
      setLoadingInitial(true);
      try {
        const [projRes, jobsRes, auditsRes] = await Promise.all([
          fetch('/api/projects', { headers: authHeaders }),
          fetch('/api/crawler/jobs', { headers: authHeaders }),
          fetch('/api/audits', { headers: authHeaders })
        ]);

        if (projRes.ok) {
          const pData = await projRes.json();
          setProjects(pData.projects || []);
          if (pData.projects?.length > 0) {
            setSelectedProjectId(pData.projects[0].id);
            if (pData.projects[0].url) {
              setTargetUrl(pData.projects[0].url);
            }
          }
        }

        if (jobsRes.ok) {
          const jData = await jobsRes.json();
          setRecentJobs(jData.jobs || []);
          if (jData.jobs?.length > 0) {
            // Load latest crawl job details
            const latestJob = jData.jobs[0];
            await loadCrawlJobDetails(latestJob.id);
            setTargetUrl(latestJob.url);
          }
        } else if (auditsRes.ok) {
          const aData = await auditsRes.json();
          if (aData.audits?.length > 0) {
            setTargetUrl(aData.audits[0].url);
          }
        }
      } catch (err) {
        console.error('Failed to load initial data:', err);
      } finally {
        setLoadingInitial(false);
      }
    };

    initData();
  }, [token]);

  // Handle Project Selection Change
  const handleProjectChange = (projId: string) => {
    setSelectedProjectId(projId);
    const proj = projects.find(p => p.id === projId);
    if (proj?.url) {
      setTargetUrl(proj.url);
    }
  };

  // Load a specific crawl job
  const loadCrawlJobDetails = async (jobId: string) => {
    try {
      const res = await fetch(`/api/crawler/jobs/${jobId}`, { headers: authHeaders });
      if (res.ok) {
        const data = await res.json();
        setActiveJob(data.job);
        setCrawledPagesList(data.pages || []);
        setTechnicalIssuesList(data.issues || []);
      }
    } catch (err) {
      console.error('Failed to load crawl job details:', err);
    }
  };

  // Execute Multi-Page Crawl
  const handleStartCrawl = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!targetUrl || targetUrl.trim() === 'https://') {
      setCrawlError('Please enter a valid website URL to crawl.');
      return;
    }

    setIsCrawling(true);
    setCrawlError(null);

    try {
      const res = await fetch('/api/crawler/start', {
        method: 'POST',
        headers: {
          ...authHeaders,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url: targetUrl.trim(),
          projectId: selectedProjectId || undefined,
          maxPages
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to complete website crawl.');
      }

      setActiveJob(data.job);
      setCrawledPagesList(data.pages || []);
      setTechnicalIssuesList(data.issues || []);
      
      // Refresh recent jobs list
      setRecentJobs(prev => [data.job, ...prev.filter(j => j.id !== data.job.id)]);
      setActiveTab('issues');
    } catch (err: any) {
      console.error('Crawl execution error:', err);
      setCrawlError(err.message || 'Crawl failed. Please verify the URL is accessible.');
    } finally {
      setIsCrawling(false);
    }
  };

  // Run Google PageSpeed Insights
  const handleRunPageSpeed = async (strategyOverride?: 'mobile' | 'desktop') => {
    const strat = strategyOverride || psStrategy;
    const urlToTest = activeJob?.url || targetUrl;
    if (!urlToTest || urlToTest === 'https://') {
      setPsError('Please enter a website URL first.');
      return;
    }

    setIsAnalyzingPs(true);
    setPsError(null);
    setPsInstructions(null);

    try {
      const res = await fetch('/api/pagespeed/analyze', {
        method: 'POST',
        headers: {
          ...authHeaders,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url: urlToTest,
          strategy: strat,
          projectId: selectedProjectId || undefined
        })
      });

      const data = await res.json();
      if (!data.success) {
        if (!data.configured && data.instructions) {
          setPsInstructions(data.instructions);
          setShowPsSetupModal(true);
        } else {
          setPsError(data.error || 'PageSpeed analysis failed.');
        }
        return;
      }

      setPsReport(data.data);
    } catch (err: any) {
      setPsError(err.message || 'Failed to run Google PageSpeed Insights.');
    } finally {
      setIsAnalyzingPs(false);
    }
  };

  // Copy code snippet helper
  const handleCopySnippet = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedSnippetId(id);
    setTimeout(() => setCopiedSnippetId(null), 2000);
  };

  // Filter issues based on severity, category, and search query
  const filteredIssues = technicalIssuesList.filter(issue => {
    if (severityFilter !== 'all' && issue.severity !== severityFilter) return false;
    if (categoryFilter !== 'all' && issue.category !== categoryFilter) return false;
    if (issueSearch.trim()) {
      const q = issueSearch.toLowerCase();
      const matchTitle = issue.title.toLowerCase().includes(q);
      const matchDesc = issue.description.toLowerCase().includes(q);
      const matchUrl = issue.pageUrl.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchUrl) return false;
    }
    return true;
  });

  // Filter crawled pages
  const filteredPages = crawledPagesList.filter(p => {
    if (!pageSearch.trim()) return true;
    const q = pageSearch.toLowerCase();
    return p.url.toLowerCase().includes(q) || (p.title && p.title.toLowerCase().includes(q));
  });

  // Unique categories for filter dropdown
  const availableCategories = Array.from(new Set(technicalIssuesList.map(i => i.category)));

  // Gauge color helper
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
    if (score >= 70) return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
    return 'text-rose-400 border-rose-500/30 bg-rose-500/10';
  };

  const getMetricRatingBadge = (rating: 'good' | 'needs-improvement' | 'poor') => {
    if (rating === 'good') {
      return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Good</span>;
    }
    if (rating === 'needs-improvement') {
      return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">Needs Work</span>;
    }
    return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">Poor</span>;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-500">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-inner">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-extrabold text-white tracking-tight">Technical SEO & Architecture</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Phase 2 Engine
                </span>
              </div>
              <p className="text-slate-400 text-sm mt-1">
                Multi-page link crawler, robots & sitemaps auditor, duplicate detection, and Google PageSpeed Core Web Vitals.
              </p>
            </div>
          </div>
        </div>

        {/* Project Selector */}
        {projects.length > 0 && (
          <div className="relative w-full md:w-64">
            <FolderOpen className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <select
              value={selectedProjectId}
              onChange={e => handleProjectChange(e.target.value)}
              className="w-full pl-10 pr-8 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs font-medium appearance-none focus:outline-none focus:border-indigo-500 transition shadow-lg"
            >
              <option value="">Select Associated Project...</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.domain || 'Domain'})</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          </div>
        )}
      </div>

      {/* Crawl Control Launcher Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden backdrop-blur-sm">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />
        
        <form onSubmit={handleStartCrawl} className="space-y-4">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4">
            
            {/* URL input */}
            <div className="relative flex-1">
              <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={targetUrl}
                onChange={e => setTargetUrl(e.target.value)}
                placeholder="https://example.com"
                disabled={isCrawling}
                className="w-full pl-12 pr-4 py-3.5 bg-slate-950 border border-slate-800 rounded-2xl text-white font-medium text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition shadow-inner"
              />
            </div>

            {/* Max Pages Selector */}
            <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-2xl px-3 py-1.5 self-start lg:self-auto">
              <span className="text-xs text-slate-400 font-medium pl-1">Max Pages:</span>
              <div className="flex gap-1">
                {[10, 25, 50].map(limit => (
                  <button
                    key={limit}
                    type="button"
                    onClick={() => setMaxPages(limit)}
                    disabled={isCrawling}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      maxPages === limit
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    {limit}
                  </button>
                ))}
              </div>
            </div>

            {/* Start Crawl Button */}
            <button
              type="submit"
              disabled={isCrawling}
              className="px-6 py-3.5 bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-indigo-600/20 transition disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap active:scale-[0.98]"
            >
              {isCrawling ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin text-white" />
                  <span>Crawling Architecture...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Start Deep Crawl</span>
                </>
              )}
            </button>
          </div>

          {/* Error Banner */}
          {crawlError && (
            <div className="flex items-start gap-3 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-xs animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Crawl Failed</p>
                <p className="text-rose-400/90 mt-0.5">{crawlError}</p>
              </div>
            </div>
          )}

          {/* Quick Recent Jobs Strip */}
          {recentJobs.length > 0 && !isCrawling && (
            <div className="flex items-center gap-2 pt-2 overflow-x-auto text-xs text-slate-400">
              <span className="shrink-0 text-slate-400 font-medium">Recent Crawls:</span>
              <div className="flex gap-2">
                {recentJobs.slice(0, 4).map(job => (
                  <button
                    key={job.id}
                    type="button"
                    onClick={() => {
                      setTargetUrl(job.url);
                      loadCrawlJobDetails(job.id);
                    }}
                    className={`px-2.5 py-1 rounded-lg border text-xs font-mono transition flex items-center gap-1.5 whitespace-nowrap ${
                      activeJob?.id === job.id 
                        ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300 font-bold' 
                        : 'border-slate-800 bg-slate-950/60 hover:bg-slate-800 text-slate-400'
                    }`}
                  >
                    <span>{job.domain}</span>
                    <span className="text-[10px] text-slate-400">({job.crawledCount}p)</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Main Content Area */}
      {isCrawling ? (
        <div className="py-24 text-center space-y-6 bg-slate-900/40 border border-slate-800/80 rounded-3xl backdrop-blur-sm">
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 animate-ping" />
            <div className="relative w-20 h-20 rounded-full bg-slate-900 border-2 border-indigo-500/50 flex items-center justify-center">
              <RotateCw className="w-8 h-8 text-indigo-400 animate-spin" />
            </div>
          </div>
          <div className="max-w-md mx-auto space-y-2 px-4">
            <h3 className="text-lg font-bold text-white">Crawling Website Architecture</h3>
            <p className="text-sm text-slate-400">
              Traversing internal links, evaluating robots.txt & XML sitemaps, parsing headings, and inspecting images...
            </p>
          </div>
        </div>
      ) : activeJob ? (
        <div className="space-y-8">
          
          {/* Crawl Summary KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            
            {/* Technical Score */}
            <div className="col-span-2 md:col-span-1 lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center gap-4 shadow-xl">
              <div className={`w-16 h-16 rounded-2xl border-2 flex items-center justify-center font-extrabold text-2xl font-mono shrink-0 ${getScoreColor(activeJob.technicalScore)}`}>
                {activeJob.technicalScore}
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Health Score</span>
                <h4 className="text-white font-bold text-base mt-0.5">
                  {activeJob.technicalScore >= 90 ? 'Excellent Architecture' : activeJob.technicalScore >= 70 ? 'Moderate Health' : 'Critical Fixes Required'}
                </h4>
                <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-400">
                  <span>{activeJob.crawledCount} pages analyzed</span>
                </div>
              </div>
            </div>

            {/* Discovered / Crawled */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1 shadow-lg">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pages Crawled</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-extrabold text-white font-mono">{activeJob.crawledCount}</span>
                <span className="text-xs text-slate-400">/ {activeJob.discoveredCount} disc</span>
              </div>
              <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden mt-2">
                <div 
                  className="bg-indigo-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, (activeJob.crawledCount / Math.max(1, activeJob.discoveredCount)) * 100)}%` }}
                />
              </div>
            </div>

            {/* Critical & High Issues */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1 shadow-lg">
              <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider">Critical Issues</span>
              <div className="text-2xl font-extrabold text-rose-400 font-mono">
                {activeJob.criticalCount}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">High priority fixes: {activeJob.highCount}</p>
            </div>

            {/* Redirects & Errors */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1 shadow-lg">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Errors & Redirects</span>
              <div className="flex items-baseline gap-2">
                <span className={`text-2xl font-extrabold font-mono ${activeJob.errorCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {activeJob.errorCount}
                </span>
                <span className="text-xs text-slate-400">errors</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">{activeJob.redirectCount} redirects</p>
            </div>

            {/* Robots & Sitemap Status */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2 shadow-lg">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Indexability Assets</span>
              <div className="space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">robots.txt:</span>
                  <span className={`font-semibold flex items-center gap-1 ${activeJob.hasRobotsTxt ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {activeJob.hasRobotsTxt ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                    {activeJob.hasRobotsTxt ? 'Found' : 'Missing'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">sitemap.xml:</span>
                  <span className={`font-semibold flex items-center gap-1 ${activeJob.hasSitemap ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {activeJob.hasSitemap ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                    {activeJob.hasSitemap ? 'Active' : 'Missing'}
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('issues')}
                className={`px-4 py-2.5 rounded-xl font-bold text-sm transition flex items-center gap-2 ${
                  activeTab === 'issues'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <AlertCircle className="w-4 h-4" />
                <span>Issues & Action Plan</span>
                <span className="px-2 py-0.5 rounded-full text-xs bg-slate-950/60 font-mono">
                  {technicalIssuesList.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('pages')}
                className={`px-4 py-2.5 rounded-xl font-bold text-sm transition flex items-center gap-2 ${
                  activeTab === 'pages'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <FileCode2 className="w-4 h-4" />
                <span>Crawled Pages</span>
                <span className="px-2 py-0.5 rounded-full text-xs bg-slate-950/60 font-mono">
                  {crawledPagesList.length}
                </span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('pagespeed');
                  if (!psReport && !isAnalyzingPs) {
                    handleRunPageSpeed();
                  }
                }}
                className={`px-4 py-2.5 rounded-xl font-bold text-sm transition flex items-center gap-2 ${
                  activeTab === 'pagespeed'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Google PageSpeed</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Lighthouse
                </span>
              </button>
            </div>
          </div>

          {/* TAB 1: TECHNICAL ISSUES EXPLORER */}
          {activeTab === 'issues' && (
            <div className="space-y-6">
              
              {/* Filtering Controls */}
              <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4">
                
                {/* Severity Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto">
                  {(['all', 'critical', 'high', 'medium', 'low'] as const).map(sev => (
                    <button
                      key={sev}
                      onClick={() => setSeverityFilter(sev)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition whitespace-nowrap ${
                        severityFilter === sev
                          ? sev === 'critical' ? 'bg-rose-600 text-white shadow'
                            : sev === 'high' ? 'bg-amber-600 text-white shadow'
                            : sev === 'medium' ? 'bg-indigo-600 text-white shadow'
                            : sev === 'low' ? 'bg-emerald-600 text-white shadow'
                            : 'bg-white text-slate-950 shadow'
                          : 'bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      {sev} {sev === 'all' ? `(${technicalIssuesList.length})` : `(${technicalIssuesList.filter(i => i.severity === sev).length})`}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-3">
                  {/* Category Filter */}
                  {availableCategories.length > 0 && (
                    <select
                      value={categoryFilter}
                      onChange={e => setCategoryFilter(e.target.value)}
                      className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 transition"
                    >
                      <option value="all">All Categories</option>
                      {availableCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  )}

                  {/* Search box */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={issueSearch}
                      onChange={e => setIssueSearch(e.target.value)}
                      placeholder="Filter issues..."
                      className="pl-8 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition w-48"
                    />
                  </div>
                </div>

              </div>

              {/* Issues List */}
              {filteredIssues.length === 0 ? (
                <div className="py-16 text-center space-y-3 bg-slate-900/40 border border-slate-800 rounded-2xl">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                  <h4 className="text-white font-bold text-base">No Issues Found</h4>
                  <p className="text-xs text-slate-400">All scanned elements pass the selected severity and category filters.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredIssues.map(issue => {
                    const isExpanded = expandedIssueId === issue.id;
                    const sevColor = 
                      issue.severity === 'critical' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                      issue.severity === 'high' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                      issue.severity === 'medium' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                      'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';

                    return (
                      <div 
                        key={issue.id}
                        className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 hover:border-slate-700 transition shadow-lg space-y-4"
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <span className={`px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider border shrink-0 mt-0.5 ${sevColor}`}>
                              {issue.severity}
                            </span>
                            <div>
                              <h4 className="text-white font-bold text-base">{issue.title}</h4>
                              <div className="flex flex-wrap items-center gap-2 mt-1">
                                <span className="text-xs font-semibold text-slate-400">{issue.category}</span>
                                <span className="text-slate-500">•</span>
                                <a 
                                  href={issue.pageUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-xs text-indigo-400 hover:text-indigo-300 font-mono flex items-center gap-1 max-w-md truncate"
                                >
                                  {issue.pageUrl}
                                  <ExternalLink className="w-3 h-3 shrink-0" />
                                </a>
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => setExpandedIssueId(isExpanded ? null : issue.id)}
                            className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-semibold self-end md:self-auto px-3 py-1.5 rounded-lg hover:bg-slate-800 transition"
                          >
                            <span>{isExpanded ? 'Hide Details' : 'View Fix Guide'}</span>
                            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          </button>
                        </div>

                        {/* Impact Snippet Preview */}
                        <p className="text-xs text-slate-300 leading-relaxed pl-1">
                          {issue.description}
                        </p>

                        {/* Collapsible Action Guide */}
                        {isExpanded && (
                          <div className="mt-4 pt-4 border-t border-slate-800 space-y-4 animate-in fade-in duration-200">
                            
                            {/* Impact Box */}
                            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-1">
                              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                Search & SEO Impact
                              </span>
                              <p className="text-xs text-slate-300 leading-relaxed">
                                {issue.impact}
                              </p>
                            </div>

                            {/* Recommendation Box */}
                            <div className="bg-indigo-950/20 p-4 rounded-xl border border-indigo-500/20 space-y-2">
                              <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Recommended Action
                              </span>
                              <p className="text-xs text-slate-200 leading-relaxed">
                                {issue.recommendation}
                              </p>
                            </div>

                            {/* Code Snippet if present */}
                            {issue.codeSnippet && (
                              <div className="space-y-1.5">
                                <div className="flex items-center justify-between text-[11px] text-slate-400">
                                  <span className="font-semibold uppercase tracking-wider">Reference Code / Markup Fix</span>
                                  <button
                                    onClick={() => handleCopySnippet(issue.id, issue.codeSnippet!)}
                                    className="text-indigo-400 hover:text-white flex items-center gap-1 font-mono transition"
                                  >
                                    {copiedSnippetId === issue.id ? (
                                      <>
                                        <Check className="w-3 h-3 text-emerald-400" />
                                        <span className="text-emerald-400">Copied!</span>
                                      </>
                                    ) : (
                                      <>
                                        <Copy className="w-3 h-3" />
                                        <span>Copy Code</span>
                                      </>
                                    )}
                                  </button>
                                </div>
                                <pre className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-cyan-300 overflow-x-auto">
                                  <code>{issue.codeSnippet}</code>
                                </pre>
                              </div>
                            )}

                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          )}

          {/* TAB 2: CRAWLED PAGES EXPLORER */}
          {activeTab === 'pages' && (
            <div className="space-y-4">
              
              <div className="flex items-center justify-between gap-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={pageSearch}
                    onChange={e => setPageSearch(e.target.value)}
                    placeholder="Search crawled page URLs..."
                    className="w-full pl-8 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>
                <span className="text-xs text-slate-400 font-mono">
                  Showing {filteredPages.length} of {crawledPagesList.length} pages
                </span>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-950/80 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-800">
                      <tr>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Page URL</th>
                        <th className="px-4 py-4">Title</th>
                        <th className="px-4 py-4">Depth</th>
                        <th className="px-4 py-4">In / Out Links</th>
                        <th className="px-4 py-4">Images / Alt</th>
                        <th className="px-4 py-4">Latency</th>
                        <th className="px-4 py-4 text-right">Issues</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-xs">
                      {filteredPages.map(page => (
                        <tr key={page.id} className="hover:bg-slate-800/30 transition">
                          
                          {/* HTTP Status */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold font-mono ${
                              page.httpStatus === 200 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                              page.httpStatus >= 300 && page.httpStatus < 400 ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' :
                              'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            }`}>
                              {page.httpStatus || 'ERR'}
                            </span>
                          </td>

                          {/* URL */}
                          <td className="px-6 py-4 max-w-xs">
                            <div className="flex items-center gap-1.5 font-mono text-slate-200">
                              <span className="truncate">{page.url}</span>
                              <a 
                                href={page.url} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-slate-400 hover:text-white shrink-0"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                            {page.canonicalUrl && (
                              <div className="text-[10px] text-slate-400 font-mono truncate mt-0.5">
                                Canonical: {page.canonicalUrl}
                              </div>
                            )}
                          </td>

                          {/* Title */}
                          <td className="px-4 py-4 max-w-[200px]">
                            <p className="truncate text-slate-300 font-medium">{page.title || <span className="text-rose-400 italic font-normal">Missing title</span>}</p>
                            <span className="text-[10px] text-slate-400 font-mono">{page.title?.length || 0} chars</span>
                          </td>

                          {/* Depth */}
                          <td className="px-4 py-4 font-mono text-slate-400">
                            L{page.depth}
                          </td>

                          {/* In / Out Links */}
                          <td className="px-4 py-4 font-mono text-slate-300">
                            <span>{page.inlinksCount} in</span>
                            <span className="text-slate-400"> / </span>
                            <span>{page.outlinksCount} out</span>
                          </td>

                          {/* Images / Alt */}
                          <td className="px-4 py-4 font-mono">
                            <span className="text-slate-300">{page.imagesCount}</span>
                            {page.missingAltCount > 0 ? (
                              <span className="text-rose-400 font-bold ml-1.5">({page.missingAltCount} missing alt)</span>
                            ) : (
                              <span className="text-emerald-400 text-[10px] ml-1.5">✓ all alt</span>
                            )}
                          </td>

                          {/* Latency */}
                          <td className="px-4 py-4 font-mono text-slate-400">
                            {page.responseTimeMs}ms
                          </td>

                          {/* Issues Count */}
                          <td className="px-4 py-4 text-right">
                            {page.issuesCount > 0 ? (
                              <button
                                onClick={() => {
                                  setIssueSearch(page.url);
                                  setActiveTab('issues');
                                }}
                                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition"
                              >
                                {page.issuesCount} issues →
                              </button>
                            ) : (
                              <span className="text-emerald-400 text-xs font-semibold">Clean</span>
                            )}
                          </td>

                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: GOOGLE PAGESPEED INSIGHTS */}
          {activeTab === 'pagespeed' && (
            <div className="space-y-6">
              
              {/* PageSpeed Header & Strategy Switcher */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-400" />
                    Google PageSpeed Insights & Core Web Vitals
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Direct benchmark metrics powered by Google Lighthouse v12 engine for {activeJob?.url || targetUrl}.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {/* Strategy Toggle */}
                  <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800">
                    <button
                      onClick={() => {
                        setPsStrategy('mobile');
                        handleRunPageSpeed('mobile');
                      }}
                      disabled={isAnalyzingPs}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                        psStrategy === 'mobile'
                          ? 'bg-indigo-600 text-white shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>Mobile</span>
                    </button>
                    <button
                      onClick={() => {
                        setPsStrategy('desktop');
                        handleRunPageSpeed('desktop');
                      }}
                      disabled={isAnalyzingPs}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                        psStrategy === 'desktop'
                          ? 'bg-indigo-600 text-white shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Monitor className="w-3.5 h-3.5" />
                      <span>Desktop</span>
                    </button>
                  </div>

                  {/* Re-analyze Button */}
                  <button
                    onClick={() => handleRunPageSpeed()}
                    disabled={isAnalyzingPs}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition disabled:opacity-50"
                  >
                    <RotateCw className={`w-3.5 h-3.5 ${isAnalyzingPs ? 'animate-spin' : ''}`} />
                    <span>Run Test</span>
                  </button>
                </div>
              </div>

              {/* Error Notice */}
              {psError && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-xs flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <div>
                    <span className="font-bold">PageSpeed Analysis Error:</span> {psError}
                  </div>
                </div>
              )}

              {/* Loading State */}
              {isAnalyzingPs ? (
                <div className="py-20 text-center space-y-4 bg-slate-900/40 border border-slate-800 rounded-3xl">
                  <RotateCw className="w-10 h-10 text-amber-400 animate-spin mx-auto" />
                  <div className="space-y-1">
                    <h4 className="text-white font-bold text-base">Running Google Lighthouse Diagnostics</h4>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      Simulating {psStrategy} device conditions, measuring FCP, LCP, TBT, CLS, and generating optimization opportunities...
                    </p>
                  </div>
                </div>
              ) : psReport ? (
                <div className="space-y-6 animate-in fade-in duration-300">
                  
                  {/* 4 Lighthouse Score Gauges */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 text-center space-y-2 shadow-xl">
                      <div className={`w-16 h-16 mx-auto rounded-full border-4 flex items-center justify-center font-mono font-extrabold text-xl ${getScoreColor(psReport.scores.performance)}`}>
                        {psReport.scores.performance}
                      </div>
                      <span className="text-xs font-bold text-white uppercase tracking-wider block">Performance</span>
                      <span className="text-[10px] text-slate-400 block">Speed & Rendering</span>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 text-center space-y-2 shadow-xl">
                      <div className={`w-16 h-16 mx-auto rounded-full border-4 flex items-center justify-center font-mono font-extrabold text-xl ${getScoreColor(psReport.scores.accessibility)}`}>
                        {psReport.scores.accessibility}
                      </div>
                      <span className="text-xs font-bold text-white uppercase tracking-wider block">Accessibility</span>
                      <span className="text-[10px] text-slate-400 block">WCAG & Usability</span>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 text-center space-y-2 shadow-xl">
                      <div className={`w-16 h-16 mx-auto rounded-full border-4 flex items-center justify-center font-mono font-extrabold text-xl ${getScoreColor(psReport.scores.bestPractices)}`}>
                        {psReport.scores.bestPractices}
                      </div>
                      <span className="text-xs font-bold text-white uppercase tracking-wider block">Best Practices</span>
                      <span className="text-[10px] text-slate-400 block">Security & Standards</span>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 text-center space-y-2 shadow-xl">
                      <div className={`w-16 h-16 mx-auto rounded-full border-4 flex items-center justify-center font-mono font-extrabold text-xl ${getScoreColor(psReport.scores.seo)}`}>
                        {psReport.scores.seo}
                      </div>
                      <span className="text-xs font-bold text-white uppercase tracking-wider block">SEO Score</span>
                      <span className="text-[10px] text-slate-400 block">Crawler Technicals</span>
                    </div>

                  </div>

                  {/* Core Web Vitals Cards */}
                  <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <Zap className="w-4 h-4 text-indigo-400" />
                      Core Web Vitals Assessment ({psReport.strategy.toUpperCase()})
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                      
                      {/* LCP */}
                      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">LCP</span>
                          {getMetricRatingBadge(psReport.metrics.lcp.rating)}
                        </div>
                        <div className="text-xl font-extrabold text-white font-mono">{psReport.metrics.lcp.value}</div>
                        <p className="text-[10px] text-slate-400">Largest Contentful Paint (Goal: ≤ 2.5s)</p>
                      </div>

                      {/* INP / TBT */}
                      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">TBT / INP</span>
                          {getMetricRatingBadge(psReport.metrics.inp.rating)}
                        </div>
                        <div className="text-xl font-extrabold text-white font-mono">{psReport.metrics.inp.value}</div>
                        <p className="text-[10px] text-slate-400">Total Blocking Time (Goal: ≤ 200ms)</p>
                      </div>

                      {/* CLS */}
                      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">CLS</span>
                          {getMetricRatingBadge(psReport.metrics.cls.rating)}
                        </div>
                        <div className="text-xl font-extrabold text-white font-mono">{psReport.metrics.cls.value}</div>
                        <p className="text-[10px] text-slate-400">Cumulative Layout Shift (Goal: ≤ 0.1)</p>
                      </div>

                      {/* FCP */}
                      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">FCP</span>
                          {getMetricRatingBadge(psReport.metrics.fcp.rating)}
                        </div>
                        <div className="text-xl font-extrabold text-white font-mono">{psReport.metrics.fcp.value}</div>
                        <p className="text-[10px] text-slate-400">First Contentful Paint (Goal: ≤ 1.8s)</p>
                      </div>

                      {/* Speed Index */}
                      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">Speed Index</span>
                          {getMetricRatingBadge(psReport.metrics.speedIndex.rating)}
                        </div>
                        <div className="text-xl font-extrabold text-white font-mono">{psReport.metrics.speedIndex.value}</div>
                        <p className="text-[10px] text-slate-400">Visual Page Progression (Goal: ≤ 3.4s)</p>
                      </div>

                    </div>
                  </div>

                  {/* Opportunities & Diagnostics */}
                  {psReport.opportunities.length > 0 && (
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-amber-400" />
                          Top Performance Opportunities (Estimated Savings)
                        </h4>
                        <span className="text-xs text-slate-400 font-mono">
                          {psReport.opportunities.length} suggestions
                        </span>
                      </div>

                      <div className="space-y-3">
                        {psReport.opportunities.map(opp => (
                          <div key={opp.id} className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-3">
                            <div className="space-y-1">
                              <span className="text-white font-bold text-sm block">{opp.title}</span>
                              <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">{opp.description}</p>
                            </div>
                            {opp.displayValue && (
                              <span className="px-3 py-1.5 rounded-xl text-xs font-bold font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20 whitespace-nowrap self-start md:self-auto">
                                Save {opp.displayValue}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              ) : (
                <div className="py-20 text-center space-y-4 bg-slate-900/40 border border-slate-800 rounded-3xl">
                  <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
                    <Zap className="w-8 h-8" />
                  </div>
                  <div className="max-w-sm mx-auto space-y-2">
                    <h4 className="text-white font-bold text-base">Google PageSpeed Insights Ready</h4>
                    <p className="text-xs text-slate-400">
                      Click the button above to run real-time Google Lighthouse tests for mobile and desktop Core Web Vitals.
                    </p>
                    <button
                      onClick={() => handleRunPageSpeed()}
                      className="mt-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-indigo-600/20"
                    >
                      Run PageSpeed Audit
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}

        </div>
      ) : (
        /* Empty State */
        <div className="py-24 text-center space-y-6 bg-slate-950/40 border-2 border-dashed border-slate-900 rounded-3xl">
          <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto text-indigo-400 border border-slate-800">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div className="max-w-sm mx-auto space-y-2 px-4">
            <h3 className="text-lg font-bold text-white">No Multi-Page Crawl Data Yet</h3>
            <p className="text-xs text-slate-400">
              Enter a website URL above and click <strong>Start Deep Crawl</strong> to explore internal link structure, canonical tags, duplicate content, and Core Web Vitals.
            </p>
          </div>
        </div>
      )}

      {/* PageSpeed API Setup Instructions Modal */}
      {showPsSetupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-5 shadow-2xl relative">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Key className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Google PageSpeed API Setup</h3>
                <span className="text-xs text-slate-400">Configure your free Google Cloud API key</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Google PageSpeed Insights free unauthenticated quota was reached or requires an API key for high-frequency audits.
            </p>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3 text-xs">
              <span className="font-bold text-white uppercase tracking-wider block">How to enable:</span>
              <ol className="list-decimal list-inside space-y-1.5 text-slate-300">
                <li>Go to the <a href="https://console.cloud.google.com/apis/library/pagespeedonline.googleapis.com" target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline">Google Cloud Console</a>.</li>
                <li>Enable the <strong>PageSpeed Insights API</strong>.</li>
                <li>Create an API Key under Credentials.</li>
                <li>Set <code className="text-amber-400 bg-slate-900 px-1.5 py-0.5 rounded font-mono">PAGESPEED_API_KEY</code> in your environment or <code className="text-amber-400 bg-slate-900 px-1.5 py-0.5 rounded font-mono">.env</code> file.</li>
              </ol>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowPsSetupModal(false)}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-indigo-600/20"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
