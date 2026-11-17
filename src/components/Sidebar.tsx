import React from 'react';
import { 
  LayoutDashboard, 
  Globe, 
  Search, 
  Link2, 
  BarChart3, 
  ShieldCheck, 
  BrainCircuit, 
  Sparkles,
  Zap,
  TrendingUp,
  History,
  Users,
  CreditCard,
  FileText,
  ChevronRight,
  Plus,
  Wrench,
  HelpCircle,
  Cpu,
  Award,
  Play
} from 'lucide-react';
import { navigate, useLocation } from '../utils/router';

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  path: string;
  active?: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, path, active }) => (
  <button
    onClick={() => navigate(path)}
    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
      active 
        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
    }`}
  >
    <div className="flex items-center gap-3">
      <div className={`p-1.5 rounded-lg transition-colors ${active ? 'text-white' : 'group-hover:text-indigo-400'}`}>
        {icon}
      </div>
      <span>{label}</span>
    </div>
    {active && <ChevronRight className="w-3.5 h-3.5" />}
  </button>
);

export const Sidebar: React.FC = () => {
  const { pathname } = useLocation();

  const menuGroups = [
    {
      title: 'Overview',
      items: [
        { icon: <LayoutDashboard className="w-4 h-4" />, label: 'Dashboard', path: '/dashboard' },
        { icon: <Play className="w-4 h-4 text-emerald-400" />, label: 'Live Analysis Studio', path: '/live-analysis' },
        { icon: <Globe className="w-4 h-4" />, label: 'Projects', path: '/projects' },
      ]
    },
    {
      title: 'Audits & Reports',
      items: [
        { icon: <ShieldCheck className="w-4 h-4" />, label: 'Overall Performance Report', path: '/overall-report' },
        { icon: <Wrench className="w-4 h-4" />, label: 'Top 10 Priority Fixes', path: '/top-priorities' },
        { icon: <History className="w-4 h-4" />, label: 'Audit History', path: '/history' },
      ]
    },
    {
      title: 'Analysis Engines',
      items: [
        { icon: <Search className="w-4 h-4" />, label: 'SEO Analysis', path: '/technical' },
        { icon: <HelpCircle className="w-4 h-4" />, label: 'AEO Analysis', path: '/keywords' },
        { icon: <Cpu className="w-4 h-4" />, label: 'AIO Analysis', path: '/ai-insights' },
        { icon: <Sparkles className="w-4 h-4" />, label: 'GEO Analysis', path: '/competitors' },
        { icon: <Award className="w-4 h-4" />, label: 'E-E-A-T Analysis', path: '/recommendations' },
      ]
    },
    {
      title: 'Management',
      items: [
        { icon: <FileText className="w-4 h-4" />, label: 'White-Label Reports', path: '/reports' },
        { icon: <Users className="w-4 h-4" />, label: 'Team', path: '/team' },
        { icon: <CreditCard className="w-4 h-4" />, label: 'Subscription', path: '/billing' },
      ]
    }
  ];

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-950/50 h-[calc(100vh-64px)] sticky top-16 overflow-y-auto hidden lg:block p-4 space-y-8 no-print">
      
      <div className="space-y-6">
        {menuGroups.map((group, idx) => (
          <div key={idx} className="space-y-1.5">
            <h4 className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
              {group.title}
            </h4>
            {group.items.map((item, itemIdx) => (
              <SidebarItem 
                key={itemIdx}
                icon={item.icon}
                label={item.label}
                path={item.path}
                active={pathname === item.path}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Upgrade Callout */}
      <div className="mt-8 p-4 rounded-2xl bg-gradient-to-br from-indigo-600/10 to-purple-600/10 border border-indigo-500/20 relative overflow-hidden group cursor-pointer hover:border-indigo-500/40 transition-all">
        <Zap className="w-8 h-8 text-indigo-400 opacity-20 absolute -right-2 -bottom-2 group-hover:scale-125 transition-transform" />
        <h5 className="text-xs font-bold text-white mb-1">Upgrade to Pro</h5>
        <p className="text-[10px] text-slate-400 leading-relaxed mb-3">
          Unlock advanced search demand forecasting & competitor tracking.
        </p>
        <button className="w-full py-1.5 rounded-lg bg-indigo-600 text-white text-[10px] font-bold hover:bg-indigo-500 transition">
          View Plans
        </button>
      </div>

    </aside>
  );
};
