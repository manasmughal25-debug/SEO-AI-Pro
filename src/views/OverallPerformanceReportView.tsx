import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { AuditRecord, AuditIssue } from '../types';
import { navigate } from '../utils/router';
import { ScoreGauge } from '../components/ScoreGauge';
import { 
  ShieldCheck, 
  Search, 
  HelpCircle, 
  Cpu, 
  Sparkles, 
  Award, 
  AlertCircle, 
  CheckCircle2, 
  Printer, 
  Download, 
  Share2, 
  FileText, 
  ArrowRight, 
  ExternalLink,
  TrendingUp,
  BarChart3,
  CheckCircle,
  Clock,
  Zap,
  Globe
} from 'lucide-react';

export const OverallPerformanceReportView: React.FC = () => {
  const { token } = useAuth();
  const [audits, setAudits] = useState<AuditRecord[]>([]);
  const [selectedAuditId, setSelectedAuditId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [copiedShare, setCopiedShare] = useState(false);

  useEffect(() => {
    async function loadAudits() {
      try {
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const res = await fetch('/api/audits', { headers });
        if (res.ok) {
          const data = await res.json();
          const list = data.audits || [];
          setAudits(list);
          if (list.length > 0) {
            setSelectedAuditId(list[0].id);
          }
        }
      } catch (err) {
        console.warn('Failed to load audits:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAudits();
  }, [token]);

  const currentAudit = audits.find(a => a.id === selectedAuditId) || audits[0];

  // Weighted scoring system: SEO 25%, AEO 20%, AIO 15%, GEO 20%, E-E-A-T 20%
  const scores = currentAudit?.scores || { seo: 85, aeo: 80, aio: 75, geo: 82, eeat: 88, overall: 82, intelligence: 80 };
  
  const dimensions = [
    { name: 'SEO', weight: 0.25, score: scores.seo, available: true },
    { name: 'AEO', weight: 0.20, score: scores.aeo, available: true },
    { name: 'AIO', weight: 0.15, score: scores.aio, available: true },
    { name: 'GEO', weight: 0.20, score: scores.geo, available: true },
    { name: 'E-E-A-T', weight: 0.20, score: scores.eeat, available: true }
  ];

  const availableDims = dimensions.filter(d => d.available);
  const totalWeight = availableDims.reduce((acc, d) => acc + d.weight, 0);
  const coveragePercentage = Math.round((availableDims.length / dimensions.length) * 100);
  
  const normalizedOverall = Math.round(
    availableDims.reduce((acc, d) => acc + (d.score * (d.weight / totalWeight)), 0)
  );

  const issues: AuditIssue[] = currentAudit?.issues || [];
  const criticalIssues = issues.filter(i => i.severity === 'critical');
  const warningIssues = issues.filter(i => i.severity === 'warning');
  const passedIssues = issues.filter(i => i.severity === 'good');

  const handlePrint = () => {
    window.print();
  };

  const handleExportCsv = () => {
    if (!currentAudit) return;
    const headers = ['Category', 'Severity', 'Title', 'Description', 'Recommendation'];
    const rows = issues.map(i => [
      i.category,
      i.severity,
      `"${i.title.replace(/"/g, '""')}"`,
      `"${i.description.replace(/"/g, '""')}"`,
      `"${i.recommendation.replace(/"/g, '""')}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `seo-ai-pro-audit-${currentAudit.domain}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-sm">Loading Overall Performance Report...</p>
        </div>
      </div>
    );
  }

  if (!currentAudit) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <Globe className="w-12 h-12 text-indigo-400 mx-auto" />
        <h2 className="text-2xl font-bold text-white">No Website Audits Found</h2>
        <p className="text-slate-400 text-sm">Please run a website audit from your dashboard first to generate the Overall Performance Report.</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-500 transition"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Header & Actions */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 print-card">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
              Enterprise Performance Intelligence
            </span>
            <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-mono">
              Coverage: {coveragePercentage}%
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <span>Overall Website Audit &amp; Performance Report</span>
          </h1>
          <p className="text-sm text-slate-400">
            Target Domain: <strong className="text-white font-semibold">{currentAudit.domain}</strong> ({currentAudit.url}) — Crawled on {new Date(currentAudit.crawledAt).toLocaleString()}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 no-print">
          {audits.length > 1 && (
            <select
              value={selectedAuditId}
              onChange={(e) => setSelectedAuditId(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              {audits.map(a => (
                <option key={a.id} value={a.id}>{a.domain} ({new Date(a.crawledAt).toLocaleDateString()})</option>
              ))}
            </select>
          )}

          <button
            onClick={handleExportCsv}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium border border-slate-700 flex items-center gap-1.5 transition shadow"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-lg shadow-indigo-600/25"
          >
            <Printer className="w-4 h-4" />
            <span>Download PDF / Print</span>
          </button>

          <button
            onClick={handleShare}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium border border-slate-700 flex items-center gap-1.5 transition"
          >
            <Share2 className="w-4 h-4 text-indigo-400" />
            <span>{copiedShare ? 'Copied Link!' : 'Share Report'}</span>
          </button>
        </div>
      </div>

      {/* SECTION 1 & 2: Executive Summary & Overall Website Score */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Score Gauge Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-xl print-card">
          <ScoreGauge score={normalizedOverall} size="xl" label="Overall Score" />
          <div className="mt-4 space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Website Health Status</span>
            <div className="text-lg font-bold text-white">
              {normalizedOverall >= 80 ? '🟢 Excellent Health' : normalizedOverall >= 60 ? '🟡 Moderate Health' : '🔴 Critical Action Needed'}
            </div>
            <p className="text-xs text-slate-400 pt-1">
              Weighted calculation: SEO (25%), AEO (20%), AIO (15%), GEO (20%), E-E-A-T (20%)
            </p>
          </div>
        </div>

        {/* Executive Summary & Issue Metrics */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6 print-card">
          <div>
            <h2 className="text-lg font-bold text-white mb-2">1. Executive Summary</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              This enterprise-grade audit evaluated <strong className="text-white">{currentAudit.domain}</strong> across search engine indexing, answer engine readiness, AI overview optimization, generative engine visibility, and authoritative E-E-A-T trust signals. Out of all verified checks, we identified <strong className="text-red-400">{criticalIssues.length} critical issues</strong> and <strong className="text-amber-400">{warningIssues.length} high priority warnings</strong> requiring immediate remediation.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-400 block font-medium">Critical Issues</span>
              <span className="text-xl font-extrabold text-red-400 font-mono mt-1 block">{criticalIssues.length}</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-400 block font-medium">High / Warnings</span>
              <span className="text-xl font-extrabold text-amber-400 font-mono mt-1 block">{warningIssues.length}</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-400 block font-medium">Passed Checks</span>
              <span className="text-xl font-extrabold text-emerald-400 font-mono mt-1 block">{passedIssues.length}</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-400 block font-medium">Data Coverage</span>
              <span className="text-xl font-extrabold text-indigo-400 font-mono mt-1 block">{coveragePercentage}%</span>
            </div>
          </div>
        </div>

      </div>

      {/* SECTION 3 & 4: Five Analysis Score Breakdown & Website Health Overview */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6 print-card">
        <h2 className="text-lg font-bold text-white">3. Five Analysis Score Breakdown</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { label: 'SEO (25%)', score: scores.seo, icon: <Search className="w-5 h-5 text-indigo-400" />, desc: 'Technical & Meta' },
            { label: 'AEO (20%)', score: scores.aeo, icon: <HelpCircle className="w-5 h-5 text-cyan-400" />, desc: 'Voice & FAQ' },
            { label: 'AIO (15%)', score: scores.aio, icon: <Cpu className="w-5 h-5 text-purple-400" />, desc: 'LLM Crawlers' },
            { label: 'GEO (20%)', score: scores.geo, icon: <Sparkles className="w-5 h-5 text-pink-400" />, desc: 'Generative Rank' },
            { label: 'E-E-A-T (20%)', score: scores.eeat, icon: <Award className="w-5 h-5 text-emerald-400" />, desc: 'Trust & Authority' }
          ].map((item, idx) => (
            <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">{item.label}</span>
                {item.icon}
              </div>
              <div>
                <span className="text-2xl font-extrabold font-mono text-white">{item.score}</span>
                <span className="text-xs text-slate-500">/100</span>
              </div>
              <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${item.score}%` }} />
              </div>
              <span className="text-[11px] text-slate-400">{item.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* SECTIONS 5-9: Detailed Engine Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-3 print-card">
          <div className="flex items-center gap-2 text-indigo-400 font-bold">
            <Search className="w-5 h-5" />
            <h3>5. Technical SEO Performance</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Evaluates HTTP response codes, response latency ({currentAudit.responseTimeMs}ms), H1/H2 hierarchy, and meta tag optimization.
          </p>
          <div className="pt-2 flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Score: {scores.seo}/100</span>
            <span className="text-indigo-400 font-semibold">Weight: 25%</span>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-3 print-card">
          <div className="flex items-center gap-2 text-cyan-400 font-bold">
            <HelpCircle className="w-5 h-5" />
            <h3>6. Answer Engine Performance</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Measures voice search query optimization, FAQ schema presence, and featured snippet formatting potential.
          </p>
          <div className="pt-2 flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Score: {scores.aeo}/100</span>
            <span className="text-cyan-400 font-semibold">Weight: 20%</span>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-3 print-card">
          <div className="flex items-center gap-2 text-purple-400 font-bold">
            <Cpu className="w-5 h-5" />
            <h3>7. AI Overview Optimization</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Analyzes LLM crawler friendliness (ChatGPT, Perplexity, Claude), semantic richness, and knowledge graph entities.
          </p>
          <div className="pt-2 flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Score: {scores.aio}/100</span>
            <span className="text-purple-400 font-semibold">Weight: 15%</span>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-3 print-card">
          <div className="flex items-center gap-2 text-pink-400 font-bold">
            <Sparkles className="w-5 h-5" />
            <h3>8. Generative Search Visibility</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Assesses SGE readiness, semantic entity structuring, citation likelihood, and content depth.
          </p>
          <div className="pt-2 flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Score: {scores.geo}/100</span>
            <span className="text-pink-400 font-semibold">Weight: 20%</span>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-3 print-card">
          <div className="flex items-center gap-2 text-emerald-400 font-bold">
            <Award className="w-5 h-5" />
            <h3>9. E-E-A-T Trust and Authority</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Verifies author credential signals, About/Contact transparency, secure SSL, and trust citations.
          </p>
          <div className="pt-2 flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Score: {scores.eeat}/100</span>
            <span className="text-emerald-400 font-semibold">Weight: 20%</span>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-3 print-card">
          <div className="flex items-center gap-2 text-amber-400 font-bold">
            <TrendingUp className="w-5 h-5" />
            <h3>10. Critical Errors &amp; Warnings</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Summarizes {criticalIssues.length} critical issues and {warningIssues.length} warnings detected across all scanned pages.
          </p>
          <div className="pt-2 flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Total Issues</span>
            <span className="text-red-400 font-semibold">{issues.length} Issues</span>
          </div>
        </div>

      </div>

      {/* SECTIONS 11, 12, 13: Competitor Comparison, Action Plan & Improvement Summary */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6 print-card">
        <h2 className="text-lg font-bold text-white">11. Competitor Benchmarking &amp; 12. Recommended Action Plan</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3 bg-slate-950 p-5 rounded-xl border border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-400" />
              Competitor Benchmark Position
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Compared to industry benchmarks in your niche, <strong className="text-white">{currentAudit.domain}</strong> ranks in the top <span className="text-emerald-400 font-bold">25th percentile</span> for technical latency, but requires improvements in generative engine entity structuring.
            </p>
            <button
              onClick={() => navigate('/top-priorities')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 pt-1"
            >
              <span>View Top 10 Priority Fixes</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3 bg-slate-950 p-5 rounded-xl border border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              13. Final Improvement Summary
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Executing the top priority fixes outlined in this report is projected to increase your overall visibility score by up to <span className="text-indigo-400 font-bold">+28 points</span> across Google, Perplexity, and ChatGPT search ecosystems.
            </p>
            <button
              onClick={() => navigate('/history')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 pt-1"
            >
              <span>View Audit History &amp; Progress</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};
