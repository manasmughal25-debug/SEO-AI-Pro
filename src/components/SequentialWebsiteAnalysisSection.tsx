import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { navigate } from '../utils/router';
import { ScoreGauge } from './ScoreGauge';
import { IssueCard } from './IssueCard';
import { AuditRecord, AuditIssue } from '../types';
import {
  Search,
  Globe,
  Play,
  RotateCw,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Cpu,
  HelpCircle,
  Sparkles,
  Award,
  Lock,
  Unlock,
  Zap,
  Clock,
  Printer,
  Download,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Layers,
  FileCheck2,
  Check
} from 'lucide-react';

export interface WebsiteProbeInfo {
  valid: boolean;
  reachable: boolean;
  normalizedUrl?: string;
  domain?: string;
  httpStatus?: number;
  responseTimeMs?: number;
  title?: string;
  description?: string;
  h1?: string;
  isHttps?: boolean;
  server?: string;
  contentType?: string;
  error?: string;
}

export interface StageState {
  id: 'seo' | 'aeo' | 'aio' | 'geo' | 'eeat';
  name: string;
  shortName: string;
  weight: number; // percentage (25, 20, 15, 20, 20)
  icon: React.ReactNode;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  score?: number;
  summary?: string;
  metrics?: Record<string, any>;
  issues?: AuditIssue[];
  errorMessage?: string;
}

const INITIAL_STAGES: StageState[] = [
  {
    id: 'seo',
    name: 'Stage 1: SEO Analysis',
    shortName: 'SEO',
    weight: 25,
    icon: <Search className="w-5 h-5 text-indigo-400" />,
    description: 'Technical structure, on-page tags, meta title/description, headings, crawlability, mobile & page speed.',
    status: 'pending'
  },
  {
    id: 'aeo',
    name: 'Stage 2: AEO Analysis',
    shortName: 'AEO',
    weight: 20,
    icon: <HelpCircle className="w-5 h-5 text-cyan-400" />,
    description: 'Answer Engine Optimization, FAQ schema, question-based keywords, direct answers & readability.',
    status: 'pending'
  },
  {
    id: 'aio',
    name: 'Stage 3: AIO Analysis',
    shortName: 'AIO',
    weight: 15,
    icon: <Cpu className="w-5 h-5 text-purple-400" />,
    description: 'AI Search Visibility, AI crawler directives (GPTBot, ClaudeBot), semantic clarity & vector retrieval.',
    status: 'pending'
  },
  {
    id: 'geo',
    name: 'Stage 4: GEO Analysis',
    shortName: 'GEO',
    weight: 20,
    icon: <Sparkles className="w-5 h-5 text-pink-400" />,
    description: 'Generative Engine Optimization, brand entities, content authority, original research & citation potential.',
    status: 'pending'
  },
  {
    id: 'eeat',
    name: 'Stage 5: E-E-A-T Analysis',
    shortName: 'E-E-A-T',
    weight: 20,
    icon: <Award className="w-5 h-5 text-emerald-400" />,
    description: 'Experience, Expertise, Authoritativeness, Trustworthiness, author bios, about/contact pages & SSL trust.',
    status: 'pending'
  }
];

export interface SequentialWebsiteAnalysisSectionProps {
  onAuditCompleted?: (audit: AuditRecord) => void;
}

export const SequentialWebsiteAnalysisSection: React.FC<SequentialWebsiteAnalysisSectionProps> = ({
  onAuditCompleted
}) => {
  const { token } = useAuth();
  
  // Search & probe states
  const [urlInput, setUrlInput] = useState('');
  const [probeStatus, setProbeStatus] = useState<'idle' | 'probing' | 'reachable' | 'unreachable'>('idle');
  const [probeData, setProbeData] = useState<WebsiteProbeInfo | null>(null);
  const [probeError, setProbeError] = useState<string | null>(null);

  // Sequential execution states
  const [isAuditing, setIsAuditing] = useState(false);
  const [currentRunningIndex, setCurrentRunningIndex] = useState<number | null>(null);
  const [stages, setStages] = useState<StageState[]>(INITIAL_STAGES);
  const [expandedStageId, setExpandedStageId] = useState<string | null>(null);

  // Verification Workflow states
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'started' | 'analyzing' | 'checking' | 'verifying' | 'completed' | 'failed'>('idle');
  const [verificationMessage, setVerificationMessage] = useState<string>('');

  // Overall Report state
  const [finalAudit, setFinalAudit] = useState<AuditRecord | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'issues' | 'strengths' | 'recommendations'>('overview');

  // Run a single stage by index
  const executeSingleStage = async (index: number, currentStagesState: StageState[], targetUrl: string): Promise<StageState> => {
    const stage = currentStagesState[index];
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch('/api/audit/stage', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        url: targetUrl,
        stage: stage.id
      })
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `Stage ${stage.shortName} failed.`);
    }

    const { result } = await res.json();
    return {
      ...stage,
      status: 'completed',
      score: result.score,
      summary: result.summary,
      metrics: result.metrics,
      issues: result.issues || []
    };
  };

  // Start Audit: Validates URL, probes reachability, and executes all 5 sequential stages with verification workflow
  const handleStartAudit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isAuditing || verificationStatus === 'started' || verificationStatus === 'analyzing' || verificationStatus === 'checking' || verificationStatus === 'verifying') {
      return; // Prevent duplicate requests
    }

    const cleanUrl = urlInput.trim();
    if (!cleanUrl) {
      setProbeError('Please enter a website URL to audit.');
      setProbeStatus('unreachable');
      setVerificationStatus('failed');
      setVerificationMessage('Please enter a valid website URL.');
      return;
    }

    setProbeError(null);
    setFinalAudit(null);
    setVerificationStatus('started');
    setVerificationMessage('Verification Started');
    setStages(INITIAL_STAGES.map(s => ({ ...s, status: 'pending', score: undefined, issues: undefined, errorMessage: undefined })));

    // Step 1: Validate URL & check whether website is reachable -> Analyzing Website...
    setProbeStatus('probing');
    setVerificationStatus('analyzing');
    setVerificationMessage('Analyzing Website...');
    let targetUrl = cleanUrl;

    try {
      const probeRes = await fetch('/api/search-website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: cleanUrl })
      });

      const data: WebsiteProbeInfo = await probeRes.json();

      if (!probeRes.ok || !data.reachable) {
        setProbeStatus('unreachable');
        setProbeError(data.error || 'Website is unreachable or invalid. Please check the URL and try again.');
        setVerificationStatus('failed');
        setVerificationMessage(data.error || 'Website is unreachable or invalid.');
        setIsAuditing(false);
        return;
      }

      setProbeData(data);
      setProbeStatus('reachable');
      setVerificationStatus('checking'); // Checking Website Information...
      setVerificationMessage('Checking Website Information...');
      if (data.normalizedUrl) {
        targetUrl = data.normalizedUrl;
        setUrlInput(data.normalizedUrl);
      }
    } catch (err: any) {
      setProbeStatus('unreachable');
      setProbeError(err.message || 'Network error while attempting to reach website.');
      setVerificationStatus('failed');
      setVerificationMessage(err.message || 'Verification failed during reachability check.');
      setIsAuditing(false);
      return;
    }

    // Step 2: Start 5-stage sequential execution -> Verifying Results...
    setIsAuditing(true);
    setVerificationStatus('verifying');
    setVerificationMessage('Verifying Results...');

    let workingStages: StageState[] = INITIAL_STAGES.map(s => ({
      ...s,
      status: 'pending',
      score: undefined,
      issues: undefined,
      errorMessage: undefined
    }));
    setStages(workingStages);

    const stageResultsMap: Record<string, any> = {};

    for (let i = 0; i < workingStages.length; i++) {
      setCurrentRunningIndex(i);
      workingStages = workingStages.map((s, idx) => idx === i ? { ...s, status: 'running' } : s);
      setStages([...workingStages]);

      try {
        const completedStage = await executeSingleStage(i, workingStages, targetUrl);
        workingStages[i] = completedStage;
        stageResultsMap[completedStage.id] = {
          stage: completedStage.id.toUpperCase(),
          score: completedStage.score,
          issues: completedStage.issues,
          metrics: completedStage.metrics,
          summary: completedStage.summary,
          completed: true
        };
        setStages([...workingStages]);
      } catch (err: any) {
        workingStages[i] = {
          ...workingStages[i],
          status: 'failed',
          errorMessage: err.message || 'Stage execution failed.'
        };
        setStages([...workingStages]);
        setIsAuditing(false);
        setCurrentRunningIndex(null);
        setVerificationStatus('failed');
        setVerificationMessage(err.message || 'Verification failed during sequential analysis.');
        return;
      }
    }

    setCurrentRunningIndex(null);
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const finalizeRes = await fetch('/api/audit/finalize', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          url: targetUrl,
          stageResults: stageResultsMap
        })
      });

      if (finalizeRes.ok) {
        const finData = await finalizeRes.json();
        setFinalAudit(finData.audit);
        setVerificationStatus('completed');
        setVerificationMessage('Verification Complete');
        if (finData.audit && onAuditCompleted) {
          onAuditCompleted(finData.audit);
        }
      } else {
        setVerificationStatus('failed');
        setVerificationMessage('Failed to finalize verified audit report.');
      }
    } catch (finErr: any) {
      console.warn('Failed to finalize audit record:', finErr);
      setVerificationStatus('failed');
      setVerificationMessage(finErr.message || 'Failed to finalize verified audit report.');
    } finally {
      setIsAuditing(false);
    }
  };



  // Retry a specific failed stage
  const handleRetryStage = async (index: number) => {
    const targetUrl = probeData?.normalizedUrl || urlInput.trim();
    if (!targetUrl) return;

    setIsAuditing(true);
    setCurrentRunningIndex(index);

    let workingStages = [...stages];
    workingStages[index] = { ...workingStages[index], status: 'running', errorMessage: undefined };
    setStages(workingStages);

    try {
      const completedStage = await executeSingleStage(index, workingStages, targetUrl);
      workingStages[index] = completedStage;
      setStages([...workingStages]);

      // Check if all other stages are completed; if so, finalize
      const allDone = workingStages.every(s => s.status === 'completed');
      if (allDone) {
        const stageResultsMap: Record<string, any> = {};
        workingStages.forEach(s => {
          stageResultsMap[s.id] = {
            stage: s.id.toUpperCase(),
            score: s.score,
            issues: s.issues,
            metrics: s.metrics,
            summary: s.summary,
            completed: true
          };
        });

        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const finRes = await fetch('/api/audit/finalize', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            url: targetUrl,
            stageResults: stageResultsMap
          })
        });

        if (finRes.ok) {
          const finData = await finRes.json();
          setFinalAudit(finData.audit);
          if (finData.audit && onAuditCompleted) {
            onAuditCompleted(finData.audit);
          }
        }
      }
    } catch (err: any) {
      workingStages[index] = {
        ...workingStages[index],
        status: 'failed',
        errorMessage: err.message || 'Retry failed'
      };
      setStages([...workingStages]);
    } finally {
      setIsAuditing(false);
      setCurrentRunningIndex(null);
    }
  };

  // Derived Overall Score with weighted calculation:
  // SEO 25%, AEO 20%, AIO 15%, GEO 20%, E-E-A-T 20%
  const calculateOverallScore = () => {
    if (finalAudit?.scores?.overall !== undefined) {
      return finalAudit.scores.overall;
    }
    const completedStages = stages.filter(s => s.status === 'completed' && typeof s.score === 'number');
    if (completedStages.length === 0) return 0;
    
    // Renormalize weights among completed stages
    const totalCompletedWeight = completedStages.reduce((sum, s) => sum + s.weight, 0);
    const weightedSum = completedStages.reduce((sum, s) => sum + (s.score || 0) * s.weight, 0);
    return Math.round(weightedSum / totalCompletedWeight);
  };

  const overallScore = calculateOverallScore();
  const allIssues = finalAudit?.issues || stages.flatMap(s => s.issues || []);
  const criticalIssues = allIssues.filter(i => i.severity === 'critical');
  const warningIssues = allIssues.filter(i => i.severity === 'warning');
  const passedIssues = allIssues.filter(i => i.severity === 'good');

  const technicalIssues = allIssues.filter(i => i.category === 'SEO' || i.category === 'INTELLIGENCE');
  const contentIssues = allIssues.filter(i => i.category === 'AEO' || i.category === 'AIO');
  const geoEeatIssues = allIssues.filter(i => i.category === 'GEO' || i.category === 'EEAT');

  return (
    <div className="space-y-8">
      
      {/* 1. WEBSITE SEARCH SECTION */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/10 blur-[80px] rounded-full pointer-events-none" />
        
        <div className="max-w-4xl space-y-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Sequential Website Analysis Engine
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Analyze Any Website Across 5 Sequential Engines
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Enter any live URL and click Start Audit to validate reachability and run all 5 analysis engines sequentially to produce your verified Overall Report.
            </p>
          </div>

          {/* Audit Form */}
          <form onSubmit={handleStartAudit} className="space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch gap-3">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                  <Globe className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={urlInput}
                  onChange={(e) => {
                    setUrlInput(e.target.value);
                    if (probeStatus === 'reachable' || probeStatus === 'unreachable') {
                      setProbeStatus('idle');
                      setProbeData(null);
                    }
                  }}
                  placeholder="https://example.com"
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-2xl text-white placeholder-slate-500 text-sm font-mono transition-all outline-none"
                />
              </div>

              {/* Start Audit Button */}
              <button
                type="submit"
                disabled={isAuditing || verificationStatus === 'started' || verificationStatus === 'analyzing' || verificationStatus === 'checking' || verificationStatus === 'verifying' || probeStatus === 'probing'}
                className="px-8 py-3.5 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white cursor-pointer ring-2 ring-indigo-500/50 shadow-indigo-500/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {probeStatus === 'probing' ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin text-white" />
                    <span>Checking Website...</span>
                  </>
                ) : isAuditing ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin text-white" />
                    <span>Running Audit...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current text-white" />
                    <span>Start Audit</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Validation / Reachability Error Message */}
          {probeStatus === 'unreachable' && probeError && (
            <div className="p-4 bg-red-950/40 border border-red-500/30 rounded-2xl flex items-start gap-3 text-red-300 text-sm animate-in fade-in">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold block text-red-200">Website Reachability Check Failed</span>
                <p className="text-xs text-red-300/90">{probeError}</p>
              </div>
            </div>
          )}

          {/* Website Information Preview Card (when reachable) */}
          {probeStatus === 'reachable' && probeData && (
            <div className="p-5 bg-slate-950 border border-emerald-500/30 rounded-2xl space-y-4 animate-in fade-in slide-in-from-top-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-base font-bold text-white block">{probeData.domain}</span>
                    <span className="text-xs text-slate-400 font-mono truncate block max-w-md">{probeData.normalizedUrl}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Reachable ({probeData.httpStatus || 200} OK)
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-slate-800 text-slate-300 border border-slate-700">
                    {probeData.isHttps ? <Lock className="w-3 h-3 text-emerald-400" /> : <Unlock className="w-3 h-3 text-amber-400" />}
                    {probeData.isHttps ? 'HTTPS Secure' : 'HTTP Insecure'}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-slate-800 text-slate-300 border border-slate-700">
                    <Zap className="w-3 h-3 text-amber-400" />
                    {probeData.responseTimeMs} ms
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-500 font-bold uppercase tracking-wider block mb-1">Page Title</span>
                  <span className="text-slate-200 font-medium line-clamp-2">{probeData.title || 'No Title Tag'}</span>
                </div>
                <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-500 font-bold uppercase tracking-wider block mb-1">Meta Description</span>
                  <span className="text-slate-300 line-clamp-2">{probeData.description || 'No Meta Description'}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-emerald-400 font-medium pt-1">
                <span>Validation successful. Click <strong>Start Audit</strong> above to begin sequential analysis.</span>
                <span className="text-slate-500 font-mono">100% Real Live Signals</span>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* VERIFICATION & ANALYSIS WORKFLOW STATUS */}
      {verificationStatus !== 'idle' && (
        <div className="bg-slate-900 border border-indigo-500/30 rounded-3xl p-6 space-y-4 shadow-xl animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {verificationStatus === 'completed' ? (
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              ) : verificationStatus === 'failed' ? (
                <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                  <AlertCircle className="w-6 h-6" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 animate-spin">
                  <RotateCw className="w-6 h-6" />
                </div>
              )}
              <div>
                <h4 className="text-white font-bold text-base">
                  {verificationStatus === 'completed' ? 'Verification & Analysis Complete' : verificationStatus === 'failed' ? 'Verification Failed' : 'Website Verification in Progress'}
                </h4>
                <p className="text-xs text-indigo-400 font-mono">{verificationMessage}</p>
              </div>
            </div>
            <span className="text-xs font-mono text-slate-400">
              {verificationStatus === 'completed' ? '100% Verified' : verificationStatus === 'failed' ? 'Error' : 'Processing...'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 pt-2">
            <div className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
              ['started', 'analyzing', 'checking', 'verifying', 'completed'].includes(verificationStatus) ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300' : 'bg-slate-950 border-slate-800 text-slate-500'
            }`}>
              <CheckCircle2 className={`w-4 h-4 ${['started', 'analyzing', 'checking', 'verifying', 'completed'].includes(verificationStatus) ? 'text-indigo-400' : 'text-slate-600'}`} />
              <span>Verification Started</span>
            </div>

            <div className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
              ['analyzing', 'checking', 'verifying', 'completed'].includes(verificationStatus) ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300' : 'bg-slate-950 border-slate-800 text-slate-500'
            }`}>
              <CheckCircle2 className={`w-4 h-4 ${['analyzing', 'checking', 'verifying', 'completed'].includes(verificationStatus) ? 'text-indigo-400' : 'text-slate-600'}`} />
              <span>Analyzing Website...</span>
            </div>

            <div className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
              ['checking', 'verifying', 'completed'].includes(verificationStatus) ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300' : 'bg-slate-950 border-slate-800 text-slate-500'
            }`}>
              <CheckCircle2 className={`w-4 h-4 ${['checking', 'verifying', 'completed'].includes(verificationStatus) ? 'text-indigo-400' : 'text-slate-600'}`} />
              <span>Checking Info...</span>
            </div>

            <div className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
              verificationStatus === 'completed' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : verificationStatus === 'verifying' ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300 animate-pulse' : 'bg-slate-950 border-slate-800 text-slate-500'
            }`}>
              <CheckCircle2 className={`w-4 h-4 ${verificationStatus === 'completed' ? 'text-emerald-400' : verificationStatus === 'verifying' ? 'text-indigo-400' : 'text-slate-600'}`} />
              <span>Verifying Results...</span>
            </div>
          </div>
        </div>
      )}

      {/* 2. FIVE SEQUENTIAL ANALYSIS STAGES PROGRESS DISPLAY */}
      {(isAuditing || stages.some(s => s.status !== 'pending') || finalAudit) && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-white tracking-tight">Five Sequential Analysis Stages</h3>
                {isAuditing && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 animate-pulse">
                    Stage {((currentRunningIndex ?? 0) + 1)} in Progress
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Strict sequential execution: each engine analyzes, completes, and saves its findings before the next engine begins.
              </p>
            </div>

            {/* Overall Step Progress Meter */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-xs font-mono text-slate-400 block">Stage Progress</span>
                <span className="text-sm font-bold text-white font-mono">
                  {stages.filter(s => s.status === 'completed').length} / 5 Finished
                </span>
              </div>
              <div className="w-24 h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-500"
                  style={{ width: `${(stages.filter(s => s.status === 'completed').length / 5) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Sequential Stages List */}
          <div className="space-y-3">
            {stages.map((stage, idx) => {
              const isRunning = stage.status === 'running';
              const isCompleted = stage.status === 'completed';
              const isFailed = stage.status === 'failed';
              const isExpanded = expandedStageId === stage.id;

              return (
                <div
                  key={stage.id}
                  className={`rounded-2xl border transition-all ${
                    isRunning 
                      ? 'bg-indigo-950/20 border-indigo-500/50 ring-1 ring-indigo-500/30' 
                      : isCompleted
                      ? 'bg-slate-950 border-slate-800 hover:border-slate-700'
                      : isFailed
                      ? 'bg-red-950/20 border-red-500/40'
                      : 'bg-slate-950/50 border-slate-800/60 opacity-70'
                  }`}
                >
                  <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start sm:items-center gap-4">
                      {/* Icon */}
                      <div className={`p-3 rounded-xl border shrink-0 ${
                        isRunning
                          ? 'bg-indigo-500/20 border-indigo-500/40'
                          : isCompleted
                          ? 'bg-slate-900 border-slate-800'
                          : isFailed
                          ? 'bg-red-500/20 border-red-500/30'
                          : 'bg-slate-900 border-slate-800'
                      }`}>
                        {stage.icon}
                      </div>

                      {/* Title & Info */}
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-bold text-white">{stage.name}</h4>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-400 border border-slate-700">
                            Weight: {stage.weight}%
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 max-w-xl">{stage.description}</p>
                      </div>
                    </div>

                    {/* Status Pill & Action */}
                    <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                      {isRunning && (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold">
                          <RotateCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Analyzing...</span>
                        </div>
                      )}

                      {stage.status === 'pending' && (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-slate-500 text-xs font-medium">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Pending Queue</span>
                        </div>
                      )}

                      {isCompleted && (
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span className="text-[10px] uppercase font-bold text-slate-500 block">Stage Score</span>
                            <span className={`text-base font-mono font-bold ${
                              (stage.score || 0) >= 80 ? 'text-emerald-400' :
                              (stage.score || 0) >= 60 ? 'text-amber-400' : 'text-red-400'
                            }`}>
                              {stage.score}/100
                            </span>
                          </div>
                          <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <Check className="w-4 h-4" />
                          </span>
                          <button
                            onClick={() => setExpandedStageId(isExpanded ? null : stage.id)}
                            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition"
                            title="Toggle Stage Report"
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </div>
                      )}

                      {isFailed && (
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold flex items-center gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5" />
                            Failed
                          </span>
                          <button
                            onClick={() => handleRetryStage(idx)}
                            disabled={isAuditing}
                            className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md"
                          >
                            <RefreshCw className="w-3 h-3" />
                            Retry
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Expandable Individual Stage Report */}
                  {isExpanded && isCompleted && (
                    <div className="p-5 border-t border-slate-800/80 bg-slate-900/40 space-y-4 animate-in fade-in">
                      <div className="flex items-center justify-between text-xs text-indigo-400 font-bold uppercase tracking-wider">
                        <span>{stage.shortName} Diagnostic Summary</span>
                        <span>{stage.issues?.length || 0} Issues Detected</span>
                      </div>
                      <p className="text-sm text-slate-300 leading-relaxed">{stage.summary}</p>

                      {/* Stage Metrics Key-Value Grid */}
                      {stage.metrics && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                          {Object.entries(stage.metrics).slice(0, 8).map(([key, val]) => (
                            <div key={key} className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                              <span className="text-[10px] text-slate-500 font-mono uppercase block truncate">{key}</span>
                              <span className="text-xs font-bold text-white font-mono block truncate mt-0.5">
                                {typeof val === 'boolean' ? (val ? 'Yes' : 'No') : typeof val === 'object' ? JSON.stringify(val) : String(val)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Stage Issues */}
                      {stage.issues && stage.issues.length > 0 && (
                        <div className="space-y-2 pt-2">
                          <span className="text-xs font-bold text-slate-400 block">Stage Action Items</span>
                          {stage.issues.slice(0, 3).map(issue => (
                            <IssueCard key={issue.id} issue={issue} />
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Stage Failure Message */}
                  {isFailed && stage.errorMessage && (
                    <div className="p-4 border-t border-red-500/20 text-xs text-red-300 bg-red-950/30">
                      <strong>Failure Details:</strong> {stage.errorMessage}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. AUTOMATIC OVERALL REPORT (Generated after all 5 stages complete and verification is fully finished) */}
      {finalAudit && verificationStatus === 'completed' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-8 shadow-2xl animate-in fade-in">
          
          {/* Header & Print/Export Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
                <FileCheck2 className="w-3.5 h-3.5" />
                Verified Overall Website Audit Report
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Overall Performance & Optimization Report
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Weighted composite analysis for <strong className="text-white">{probeData?.domain || finalAudit?.domain || 'Website'}</strong> across all 5 evaluation dimensions.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition flex items-center gap-2 border border-slate-700 shadow-sm"
              >
                <Printer className="w-4 h-4 text-indigo-400" />
                <span>Print / PDF</span>
              </button>
              
              <button
                onClick={() => {
                  const rows = allIssues.map(i => [i.category, i.severity, `"${i.title}"`, `"${i.recommendation}"`]);
                  const csv = "data:text/csv;charset=utf-8,Category,Severity,Title,Recommendation\n" + rows.map(r => r.join(',')).join('\n');
                  const link = document.createElement("a");
                  link.setAttribute("href", encodeURI(csv));
                  link.setAttribute("download", `seo_ai_pro_audit_${probeData?.domain || 'report'}.csv`);
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition flex items-center gap-2 border border-slate-700 shadow-sm"
              >
                <Download className="w-4 h-4 text-cyan-400" />
                <span>Export CSV</span>
              </button>

              {finalAudit?.id && (
                <button
                  onClick={() => navigate(`/audits/${finalAudit.id}/overall`)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-2 shadow-lg"
                >
                  <span>Open Full Studio</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Executive Overview Score Gauge + Highlights */}
          <div className="bg-slate-950 border border-slate-800/80 rounded-2xl p-6 sm:p-8">
            <div className="flex flex-col lg:flex-row items-center gap-8">
              
              {/* Radial Overall Score Gauge */}
              <div className="shrink-0 flex flex-col items-center">
                <ScoreGauge score={overallScore} size="xl" label="Overall Website Score" />
                <span className="text-xs text-slate-500 mt-2 font-mono">Weighted Formula (100 Max)</span>
              </div>

              {/* Summary Description & Weight Breakdown */}
              <div className="flex-1 w-full space-y-4">
                <div>
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest font-mono">
                    Website Health Status
                  </span>
                  <h4 className="text-xl sm:text-2xl font-bold text-white mt-1">
                    {overallScore >= 80 
                      ? 'Grade A: Strong Optimization Across Search & Generative AI'
                      : overallScore >= 60 
                      ? 'Grade B: Moderate Optimization with Key High-Priority Fixes'
                      : 'Grade C: High Optimization Debt — Immediate Action Required'}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                    Evaluated across 5 sequential dimensions with weighted scoring: <strong className="text-indigo-300">SEO (25%)</strong>, <strong className="text-cyan-300">AEO (20%)</strong>, <strong className="text-purple-300">AIO (15%)</strong>, <strong className="text-pink-300">GEO (20%)</strong>, and <strong className="text-emerald-300">E-E-A-T (20%)</strong>.
                  </p>
                </div>

                {/* Score Pills */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider block">Critical Issues</span>
                    <span className="text-lg font-black text-white font-mono block mt-0.5">{criticalIssues.length}</span>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">Warnings</span>
                    <span className="text-lg font-black text-white font-mono block mt-0.5">{warningIssues.length}</span>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">Passed Checks</span>
                    <span className="text-lg font-black text-white font-mono block mt-0.5">{passedIssues.length}</span>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider block">Latency</span>
                    <span className="text-lg font-black text-white font-mono block mt-0.5">{probeData?.responseTimeMs || 140} ms</span>
                  </div>
                </div>

              </div>

            </div>
          </div>

          {/* 5 Dimension Breakdown Cards Grid */}
          <div className="space-y-4">
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
              Individual Engine Scores & Weights
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {stages.map(stage => {
                const sc = stage.score || 0;
                const scoreColor = sc >= 80 ? 'text-emerald-400' : sc >= 60 ? 'text-amber-400' : 'text-red-400';
                const barColor = sc >= 80 ? 'bg-emerald-500' : sc >= 60 ? 'bg-amber-500' : 'bg-red-500';

                return (
                  <div key={stage.id} className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-300">{stage.shortName}</span>
                      <span className="text-[10px] font-mono text-slate-500">wt: {stage.weight}%</span>
                    </div>

                    <div className="flex items-baseline justify-between">
                      <span className={`text-2xl font-black font-mono ${scoreColor}`}>{sc}</span>
                      <span className="text-xs text-slate-500">/100</span>
                    </div>

                    <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                      <div className={`h-full ${barColor} rounded-full`} style={{ width: `${sc}%` }} />
                    </div>

                    <span className="text-[11px] text-slate-400 block line-clamp-2 leading-relaxed">
                      {stage.description}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Navigation Tabs for Granular Audit Categories */}
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-2">
              {[
                { id: 'overview', label: `Critical Errors (${criticalIssues.length})`, icon: <AlertCircle className="w-4 h-4 text-red-400" /> },
                { id: 'strengths', label: `Website Strengths (${passedIssues.length})`, icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" /> },
                { id: 'issues', label: 'Technical & Content Breakdown', icon: <Layers className="w-4 h-4 text-indigo-400" /> },
                { id: 'recommendations', label: 'Step-by-Step Action Plan', icon: <Sparkles className="w-4 h-4 text-cyan-400" /> }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                    activeTab === tab.id
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* TAB 1: Critical Errors */}
            {activeTab === 'overview' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-200">High-Priority Critical Issues</h4>
                  <span className="text-xs text-slate-500">Requires prompt remediation</span>
                </div>

                {criticalIssues.length === 0 ? (
                  <div className="p-6 bg-slate-950 border border-emerald-500/20 rounded-2xl flex items-center gap-3 text-emerald-400 text-sm">
                    <CheckCircle2 className="w-6 h-6 shrink-0" />
                    <span>No critical errors detected. Baseline indexability and technical health are satisfactory.</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {criticalIssues.map(issue => (
                      <IssueCard key={issue.id} issue={issue} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: Website Strengths */}
            {activeTab === 'strengths' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-200">Verified Passed Optimization Factors</h4>
                  <span className="text-xs text-emerald-400 font-mono">{passedIssues.length} Factors Active</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {passedIssues.map(issue => (
                    <div key={issue.id} className="p-4 rounded-xl bg-slate-950 border border-emerald-500/20 flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {issue.category}
                          </span>
                          <span className="text-xs font-bold text-white">{issue.title}</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">{issue.description}</p>
                      </div>
                    </div>
                  ))}
                  {passedIssues.length === 0 && (
                    <div className="p-6 bg-slate-950 border border-slate-800 rounded-2xl text-slate-500 text-sm">
                      No passed checks recorded.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: Technical & Content Breakdown */}
            {activeTab === 'issues' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Technical Issues */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="text-sm font-bold text-white flex items-center gap-2">
                      <Search className="w-4 h-4 text-indigo-400" />
                      Technical &amp; Indexing Issues
                    </h5>
                    <span className="text-xs font-mono text-slate-500">{technicalIssues.length}</span>
                  </div>
                  <div className="space-y-2">
                    {technicalIssues.slice(0, 4).map(issue => (
                      <IssueCard key={issue.id} issue={issue} />
                    ))}
                    {technicalIssues.length === 0 && (
                      <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-500">
                        No technical issues identified.
                      </div>
                    )}
                  </div>
                </div>

                {/* Content & Optimization Opportunities */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="text-sm font-bold text-white flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-cyan-400" />
                      Content &amp; AEO/AIO Opportunities
                    </h5>
                    <span className="text-xs font-mono text-slate-500">{contentIssues.length}</span>
                  </div>
                  <div className="space-y-2">
                    {contentIssues.slice(0, 4).map(issue => (
                      <IssueCard key={issue.id} issue={issue} />
                    ))}
                    {contentIssues.length === 0 && (
                      <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-500">
                        No content opportunities found.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: Step-by-Step Recommendations */}
            {activeTab === 'recommendations' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white">Prioritized Remediation Roadmap</h4>
                  <span className="text-xs text-slate-500">Actionable step-by-step guidance</span>
                </div>

                <div className="space-y-3">
                  {allIssues.filter(i => i.severity !== 'good').slice(0, 8).map((issue, idx) => (
                    <div key={issue.id} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                            #{idx + 1}
                          </span>
                          <div>
                            <span className="text-sm font-bold text-white block">{issue.title}</span>
                            <span className="text-[11px] text-slate-400 font-mono">Category: {issue.category} • Impact: {issue.impact || 'Moderate'}</span>
                          </div>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                          issue.severity === 'critical' 
                            ? 'bg-red-500/10 text-red-400 border-red-500/30' 
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        }`}>
                          {issue.severity.toUpperCase()}
                        </span>
                      </div>

                      <div className="p-3 bg-slate-900 rounded-xl border border-slate-800/80 text-xs text-slate-300 leading-relaxed">
                        <strong className="text-indigo-400 block mb-1">Recommended Solution:</strong>
                        {issue.recommendation}
                      </div>

                      {issue.codeSnippet && (
                        <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-800 font-mono text-xs text-emerald-300 overflow-x-auto">
                          {issue.codeSnippet}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
};
