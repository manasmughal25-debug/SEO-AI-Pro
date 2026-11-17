import React, { useState } from 'react';
import { AuditRecord } from '../../types';
import { Link2, ExternalLink, Search, CheckCircle2, AlertCircle } from 'lucide-react';

interface ReportProps {
  audit: AuditRecord;
}

export const UrlsReport: React.FC<ReportProps> = ({ audit }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'internal' | 'external'>('all');

  const filteredLinks = audit.urls.filter(link => {
    const matchesQuery = link.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         link.anchor.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || link.type === typeFilter;
    return matchesQuery && matchesType;
  });

  return (
    <div className="space-y-6">
      
      {/* Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-mono font-semibold text-indigo-400 uppercase tracking-wider">
            Crawled Link Inventory &amp; Graph
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
            Site Link Architecture &amp; Discovery
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Discovered {audit.summary.internalLinksCount} internal links and {audit.summary.externalLinksCount} outbound references on {audit.domain}.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center min-w-[100px]">
            <span className="text-[11px] text-slate-400 block font-medium">Internal Links</span>
            <span className="text-lg font-bold font-mono text-indigo-400">{audit.summary.internalLinksCount}</span>
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center min-w-[100px]">
            <span className="text-[11px] text-slate-400 block font-medium">External Links</span>
            <span className="text-lg font-bold font-mono text-cyan-400">{audit.summary.externalLinksCount}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search URL or anchor text..."
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          {(['all', 'internal', 'external'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setTypeFilter(tab)}
              className={`px-3 py-1 rounded-lg capitalize font-medium transition ${
                typeFilter === tab ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {filteredLinks.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            No links found matching your current filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4 sm:px-6">Discovered URL</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Anchor Text</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Target</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredLinks.map((link, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 sm:px-6 font-mono text-slate-200 max-w-xs sm:max-w-md truncate">
                      <div className="flex items-center gap-2">
                        <Link2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="truncate">{link.url}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                        link.type === 'internal'
                          ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                          : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                      }`}>
                        {link.type}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-300 max-w-[200px] truncate">
                      {link.anchor}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className="font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded text-[11px] font-bold">
                        {link.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="inline-flex items-center gap-1 text-slate-400 hover:text-indigo-400 transition"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
