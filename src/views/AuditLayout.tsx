import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { AuditRecord } from '../types';
import { navigate, useLocation } from '../utils/router';
import { OverallReport } from './reports/OverallReport';
import { SeoReport } from './reports/SeoReport';
import { AeoReport } from './reports/AeoReport';
import { AioReport } from './reports/AioReport';
import { GeoReport } from './reports/GeoReport';
import { EeatReport } from './reports/EeatReport';
import { UrlsReport } from './reports/UrlsReport';
import { IntelligenceReport } from './reports/IntelligenceReport';
import { 
  ArrowLeft, 
  RotateCw, 
  Printer, 
  Globe, 
  ExternalLink, 
  Clock, 
  Zap, 
  ShieldCheck,
  Search,
  HelpCircle,
  Cpu,
  Sparkles,
  Award,
  Link2,
  AlertCircle,
  BrainCircuit
} from 'lucide-react';

interface AuditLayoutProps {
  auditId: string;
  activeTab: 'overall' | 'seo' | 'aeo' | 'aio' | 'geo' | 'eeat' | 'urls' | 'intelligence';
}

export const AuditLayout: React.FC<AuditLayoutProps> = ({ auditId, activeTab }) => {
  const { token } = useAuth();
  const [audit, setAudit] = useState<AuditRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [recrawling, setRecrawling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAudit = async () => {
    try {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/audits/${auditId}`, { headers });
      if (!res.ok) {
        setError('Audit report not found or was removed.');
        setLoading(false);
        return;
      }
      const data = await res.json();
      setAudit(data.audit);
    } catch (err: any) {
      setError(err.message || 'Failed to load audit report.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAudit();
  }, [auditId, token]);

  const handleReCrawl = async () => {
    setRecrawling(true);
    try {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/audits/${auditId}/re-crawl`, {
        method: 'POST',
        headers
      });
      if (res.ok) {
        const data = await res.json();
        setAudit(data.audit);
      }
    } catch (err) {
      console.warn('Re-crawl failed:', err);
    } finally {
      setRecrawling(false);
    }
  };

  const handleExportPdf = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-slate-400 space-y-3">
        <RotateCw className="w-8 h-8 text-indigo-500 animate-spin" />
        <p className="text-sm">Retrieving audit data...</p>
      </div>
    );
  }

  if (error || !audit) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-400 mx-auto flex items-center justify-center">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-white">Audit Not Found</h2>
        <p className="text-sm text-slate-400">{error || 'Unable to locate this audit report.'}</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold inline-flex items-center gap-2 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Return to Dashboard
        </button>
      </div>
    );
  }

  const tabs = [
    { id: 'overall', label: 'Overall Report', icon: <ShieldCheck className="w-4 h-4" />, count: audit.scores.overall },
    { id: 'seo', label: 'SEO Audit', icon: <Search className="w-4 h-4" />, count: audit.scores.seo },
    { id: 'aeo', label: 'AEO', icon: <HelpCircle className="w-4 h-4" />, count: audit.scores.aeo },
    { id: 'aio', label: 'AIO', icon: <Cpu className="w-4 h-4" />, count: audit.scores.aio },
    { id: 'geo', label: 'GEO', icon: <Sparkles className="w-4 h-4" />, count: audit.scores.geo },
    { id: 'eeat', label: 'E-E-A-T', icon: <Award className="w-4 h-4" />, count: audit.scores.eeat },
    { id: 'intelligence', label: 'SEO Intelligence', icon: <BrainCircuit className="w-4 h-4" />, count: audit.scores.intelligence },
    { id: 'urls', label: 'Crawled URLs', icon: <Link2 className="w-4 h-4" />, count: audit.urls.length }
  ] as const;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Header Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl print-card">
        
        {/* Navigation back and Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800 no-print">
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReCrawl}
              disabled={recrawling}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition disabled:opacity-50"
            >
              <RotateCw className={`w-3.5 h-3.5 ${recrawling ? 'animate-spin' : ''}`} />
              <span>{recrawling ? 'Re-crawling...' : 'Re-crawl Site'}</span>
            </button>

            <button
              onClick={handleExportPdf}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition"
              title="Print or Save as PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Export PDF</span>
            </button>
          </div>
        </div>

        {/* Target Details */}
        <div className="pt-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Globe className="w-5 h-5" />
              </span>
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-white print-text-dark tracking-tight flex items-center gap-2">
                  {audit.domain}
                  <a
                    href={audit.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-slate-400 hover:text-indigo-400 transition no-print"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </h1>
                <p className="text-xs text-slate-400 font-mono truncate max-w-md sm:max-w-xl">
                  {audit.url}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Metrics Badges */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 flex items-center gap-1.5 text-slate-300 print-card">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>{new Date(audit.crawledAt).toLocaleString()}</span>
            </div>
            <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 flex items-center gap-1.5 text-slate-300 print-card">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-mono">{audit.responseTimeMs}ms</span>
            </div>
            <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 flex items-center gap-1.5 text-slate-300 print-card">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="font-mono">HTTP {audit.httpStatus}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-slate-800 no-print overflow-x-auto">
        <div className="flex space-x-2 min-w-max pb-2">
          {tabs.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => navigate(`/audits/${auditId}/${tab.id}`)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                    : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.2 rounded font-mono text-[10px] ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sub-Report Content */}
      <div className="pb-12 print-break-inside-avoid">
        {activeTab === 'overall' && <OverallReport audit={audit} />}
        {activeTab === 'seo' && <SeoReport audit={audit} />}
        {activeTab === 'aeo' && <AeoReport audit={audit} />}
        {activeTab === 'aio' && <AioReport audit={audit} />}
        {activeTab === 'geo' && <GeoReport audit={audit} />}
        {activeTab === 'eeat' && <EeatReport audit={audit} />}
        {activeTab === 'intelligence' && <IntelligenceReport audit={audit} />}
        {activeTab === 'urls' && <UrlsReport audit={audit} />}
      </div>

    </div>
  );
};
