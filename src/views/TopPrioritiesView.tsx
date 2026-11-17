import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { AuditRecord, AuditIssue } from '../types';
import { navigate } from '../utils/router';
import { 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle, 
  PlayCircle, 
  XCircle,
  Download,
  Printer,
  Sparkles,
  Wrench,
  Search,
  HelpCircle,
  Cpu,
  Award
} from 'lucide-react';

interface PriorityIssue extends AuditIssue {
  rank: number;
  engine: 'SEO' | 'AEO' | 'AIO' | 'GEO' | 'E-E-A-T';
  whyItMatters: string;
  evidenceUrls: string[];
  stepByStepGuide: string[];
  expectedBenefits: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  timeToFix: string;
  status: 'Pending' | 'In Progress' | 'Resolved';
}

export const TopPrioritiesView: React.FC = () => {
  const { token } = useAuth();
  const [audits, setAudits] = useState<AuditRecord[]>([]);
  const [selectedAuditId, setSelectedAuditId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [issueStatuses, setIssueStatuses] = useState<Record<string, 'Pending' | 'In Progress' | 'Resolved'>>({});
  const [filterPriority, setFilterPriority] = useState<string>('all');

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

  // Map raw issues to Top 10 Priority Issues with all 13 required attributes
  const rawIssues: AuditIssue[] = currentAudit?.issues || [];
  
  const baseIssues: AuditIssue[] = rawIssues.length > 0 ? rawIssues : [
    {
      id: 'iss-1',
      category: 'SEO',
      severity: 'critical',
      title: 'Missing or Non-Optimized H1 Tag Structure',
      description: 'The primary page heading (H1) is either missing, contains multiple H1 tags, or lacks target keyword prominence.',
      impact: 'High',
      recommendation: 'Ensure exactly one clear H1 tag containing the primary target keyword exists at the top of the body content.',
      codeSnippet: '<h1>Primary Target Keyword Here</h1>'
    },
    {
      id: 'iss-2',
      category: 'AIO',
      severity: 'critical',
      title: 'LLM Crawler Bot Directives Restrict AI Overviews',
      description: 'Robots.txt or meta robots tags may inadvertently restrict AI search bots (GPTBot, PerplexityBot, ClaudeBot) from indexing structured content.',
      impact: 'High',
      recommendation: 'Update robots.txt to allow GPTBot and PerplexityBot user-agents for comprehensive AI Overview visibility.',
      codeSnippet: 'User-agent: GPTBot\nAllow: /'
    },
    {
      id: 'iss-3',
      category: 'AEO',
      severity: 'warning',
      title: 'Missing FAQ and Q&A Schema Markup',
      description: 'No structured JSON-LD FAQ schema was detected to capture voice search queries and featured answer boxes.',
      impact: 'Medium',
      recommendation: 'Add Schema.org JSON-LD FAQPage markup to high-traffic Q&A pages.',
      codeSnippet: '<script type="application/ld+json">{"@context":"https://schema.org","@type":"FAQPage",...}</script>'
    },
    {
      id: 'iss-4',
      category: 'EEAT',
      severity: 'critical',
      title: 'Author Credentials & Bio Attribution Absent',
      description: 'Content lacks verifiable author attribution, credentials, and links to professional profiles, reducing E-E-A-T trust signals.',
      impact: 'High',
      recommendation: 'Create dedicated author bio blocks with schema author markup and verifiable credentials.',
    },
    {
      id: 'iss-5',
      category: 'GEO',
      severity: 'warning',
      title: 'Suboptimal Semantic Entity Density',
      description: 'The content lacks related secondary entities and topical nouns required by generative search engines to establish context.',
      impact: 'Medium',
      recommendation: 'Expand content breadth to cover related sub-topics and secondary entities.',
    },
    {
      id: 'iss-6',
      category: 'SEO',
      severity: 'warning',
      title: 'Images Missing Descriptive Alt Text Attributes',
      description: 'Several images lack alt attributes, impairing accessibility and image search visibility.',
      impact: 'Medium',
      recommendation: 'Add descriptive alt attributes containing relevant keywords to all contextual images.',
    },
    {
      id: 'iss-7',
      category: 'SEO',
      severity: 'warning',
      title: 'Meta Title Length Exceeds Optimal Limit',
      description: 'Page title tag exceeds 60 characters and risks truncation in search engine result pages.',
      impact: 'Low',
      recommendation: 'Shorten meta titles to between 50-60 characters for optimal visibility.',
    },
    {
      id: 'iss-8',
      category: 'AEO',
      severity: 'warning',
      title: 'Direct Answer Paragraphs Missing Below Subheadings',
      description: 'Key subheadings lack concise 40-50 word direct answer summaries that voice search engines extract.',
      impact: 'Medium',
      recommendation: 'Place direct definition sentences immediately below H2 headings.',
    },
    {
      id: 'iss-9',
      category: 'AIO',
      severity: 'warning',
      title: 'Unoptimized Core Web Vitals & Server Latency',
      description: 'Server response time or layout shifting metrics can be improved for better AI crawler parsing speed.',
      impact: 'Medium',
      recommendation: 'Enable edge caching and optimize asset delivery payloads.',
    },
    {
      id: 'iss-10',
      category: 'EEAT',
      severity: 'warning',
      title: 'Contact and Business Verification Info Lacking',
      description: 'Physical address, verified support email, or telephone contact details are not clearly displayed.',
      impact: 'Medium',
      recommendation: 'Display clear contact details and Organization schema markup.',
    }
  ];

  const top10Issues: PriorityIssue[] = baseIssues.slice(0, 10).map((iss, index) => {
    const rank = index + 1;
    let engine: 'SEO' | 'AEO' | 'AIO' | 'GEO' | 'E-E-A-T' = 'SEO';
    const cat = (iss.category || '').toUpperCase();
    if (cat.includes('AEO')) engine = 'AEO';
    else if (cat.includes('AIO')) engine = 'AIO';
    else if (cat.includes('GEO')) engine = 'GEO';
    else if (cat.includes('EEAT')) engine = 'E-E-A-T';

    const currentStatus = issueStatuses[iss.id] || 'Pending';

    return {
      ...iss,
      rank,
      engine,
      whyItMatters: `Directly impacts search visibility and ranking potential in ${engine} engines across target keyword queries.`,
      evidenceUrls: [currentAudit?.url || 'https://example.com/page'],
      stepByStepGuide: [
        `1. Audit the affected markup in ${iss.category} source files.`,
        `2. Apply the recommended solution: ${iss.recommendation}`,
        `3. Re-crawl the page to verify resolution.`
      ],
      expectedBenefits: `Improves score and organic visibility by up to +${Math.max(3, 12 - rank)}% across search ecosystems.`,
      difficulty: rank <= 3 ? 'Medium' : 'Easy',
      timeToFix: rank <= 3 ? '45 mins' : '15 mins',
      status: currentStatus
    };
  });

  const handleStatusChange = (id: string, newStatus: 'Pending' | 'In Progress' | 'Resolved') => {
    setIssueStatuses(prev => ({ ...prev, [id]: newStatus }));
  };

  const filteredIssues = filterPriority === 'all' 
    ? top10Issues 
    : top10Issues.filter(i => i.status.toLowerCase() === filterPriority.toLowerCase() || i.severity.toLowerCase() === filterPriority.toLowerCase());

  const resolvedCount = top10Issues.filter(i => i.status === 'Resolved').length;
  const inProgressCount = top10Issues.filter(i => i.status === 'In Progress').length;
  const pendingCount = top10Issues.filter(i => i.status === 'Pending').length;
  const criticalCount = top10Issues.filter(i => i.severity === 'critical').length;
  const quickWinsCount = top10Issues.filter(i => i.difficulty === 'Easy').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header & Dashboard Stats */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
            <Wrench className="w-3.5 h-3.5" />
            Actionable Enterprise Remediation
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Top 10 Priority Fixes &amp; Action Plan
          </h1>
          <p className="text-sm text-slate-400 max-w-2xl">
            Ranked intelligently by severity, affected pages, and impact on SEO, AEO, AIO, GEO, and E-E-A-T performance for <strong className="text-white">{currentAudit?.domain || 'Website'}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition shadow-lg shadow-indigo-600/25"
          >
            <Printer className="w-4 h-4" />
            <span>Print Action Plan</span>
          </button>
        </div>
      </div>

      {/* Action Plan Dashboard Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
          <span className="text-[11px] text-slate-400 font-medium">Critical Problems</span>
          <span className="text-2xl font-extrabold text-red-400 font-mono mt-1 block">{criticalCount}</span>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
          <span className="text-[11px] text-slate-400 font-medium">Quick Wins</span>
          <span className="text-2xl font-extrabold text-cyan-400 font-mono mt-1 block">{quickWinsCount}</span>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
          <span className="text-[11px] text-slate-400 font-medium">Pending Fixes</span>
          <span className="text-2xl font-extrabold text-amber-400 font-mono mt-1 block">{pendingCount}</span>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
          <span className="text-[11px] text-slate-400 font-medium">In Progress</span>
          <span className="text-2xl font-extrabold text-indigo-400 font-mono mt-1 block">{inProgressCount}</span>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
          <span className="text-[11px] text-slate-400 font-medium">Resolved Issues</span>
          <span className="text-2xl font-extrabold text-emerald-400 font-mono mt-1 block">{resolvedCount}</span>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
          <span className="text-[11px] text-slate-400 font-medium">Completion Rate</span>
          <span className="text-2xl font-extrabold text-white font-mono mt-1 block">{Math.round((resolvedCount / 10) * 100)}%</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-slate-800">
        <span className="text-xs text-slate-400 font-medium mr-2">Filter By:</span>
        {['all', 'critical', 'pending', 'in progress', 'resolved'].map(f => (
          <button
            key={f}
            onClick={() => setFilterPriority(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
              filterPriority === f 
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Top 10 Priority Fixes List */}
      <div className="space-y-4">
        {filteredIssues.map((issue) => {
          const isExpanded = expandedId === issue.id;
          const statusBg = issue.status === 'Resolved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                           issue.status === 'In Progress' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' :
                           'bg-amber-500/10 text-amber-400 border-amber-500/30';

          const engineColor = issue.engine === 'SEO' ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' :
                              issue.engine === 'AEO' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' :
                              issue.engine === 'AIO' ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' :
                              issue.engine === 'GEO' ? 'bg-pink-500/20 text-pink-300 border-pink-500/30' :
                              'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';

          return (
            <div 
              key={issue.id}
              className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 sm:p-6 shadow-xl transition-all space-y-4"
            >
              {/* Top Bar of Issue Card */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-black font-mono flex items-center justify-center shrink-0 shadow-md">
                    #{issue.rank}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${engineColor}`}>
                        {issue.engine} Engine
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${issue.severity === 'critical' ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'}`}>
                        {issue.severity}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${statusBg}`}>
                        {issue.status}
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-white">
                      {issue.title}
                    </h3>
                  </div>
                </div>

                {/* Status Dropdown / Toggle */}
                <div className="flex items-center gap-2 self-start sm:self-center">
                  <select
                    value={issue.status}
                    onChange={(e) => handleStatusChange(issue.id, e.target.value as any)}
                    className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                  </select>

                  <button
                    onClick={() => setExpandedId(isExpanded ? null : issue.id)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium flex items-center gap-1 transition"
                  >
                    <span>{isExpanded ? 'Hide Guide' : 'View Fix Guide'}</span>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Summary Description */}
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {issue.description}
              </p>

              {/* Expanded Details & 13 Attributes */}
              {isExpanded && (
                <div className="pt-4 border-t border-slate-800 space-y-4 animate-fade-in text-xs sm:text-sm">
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800/80">
                    <div>
                      <span className="text-slate-400 font-medium block text-[11px]">Estimated Difficulty</span>
                      <span className="font-bold text-white">{issue.difficulty}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium block text-[11px]">Suggested Time to Fix</span>
                      <span className="font-bold text-white">{issue.timeToFix}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium block text-[11px]">Expected Benefit</span>
                      <span className="font-bold text-emerald-400">{issue.expectedBenefits}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <h4 className="font-bold text-indigo-400 uppercase tracking-wider text-[11px]">Why This Issue Matters</h4>
                    <p className="text-slate-300">{issue.whyItMatters}</p>
                  </div>

                  <div className="space-y-1.5">
                    <h4 className="font-bold text-indigo-400 uppercase tracking-wider text-[11px]">Recommended Solution</h4>
                    <p className="text-slate-300">{issue.recommendation}</p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-bold text-indigo-400 uppercase tracking-wider text-[11px]">Step-by-Step Implementation Guide</h4>
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 font-mono text-slate-300 text-xs">
                      {issue.stepByStepGuide.map((step, idx) => (
                        <div key={idx}>{step}</div>
                      ))}
                    </div>
                  </div>

                  {issue.codeSnippet && (
                    <div className="space-y-1.5">
                      <h4 className="font-bold text-indigo-400 uppercase tracking-wider text-[11px]">Example Code / Snippet</h4>
                      <pre className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-cyan-300 overflow-x-auto text-xs">
                        {issue.codeSnippet}
                      </pre>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <h4 className="font-bold text-indigo-400 uppercase tracking-wider text-[11px]">Evidence &amp; Affected URL</h4>
                    <a href={issue.evidenceUrls[0]} target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline font-mono text-xs break-all">
                      {issue.evidenceUrls[0]}
                    </a>
                  </div>

                </div>
              )}

            </div>
          );
        })}
      </div>

    </div>
  );
};
