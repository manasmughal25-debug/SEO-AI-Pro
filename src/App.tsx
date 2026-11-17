import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useLocation, matchPath } from './utils/router';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { LoginView } from './views/LoginView';
import { SignupView } from './views/SignupView';
import { VerifyEmailView } from './views/VerifyEmailView';
import { ForgotPasswordView } from './views/ForgotPasswordView';
import { ResetPasswordView } from './views/ResetPasswordView';
import { AuditLayout } from './views/AuditLayout';
import { LandingView } from './views/LandingView';
import { ProjectsView } from './views/ProjectsView';
import { ProjectDashboardView } from './views/ProjectDashboardView';
import { KeywordResearchView } from './views/KeywordResearchView';
import { GlobalDashboardView } from './views/GlobalDashboardView';
import { RankingsView } from './views/RankingsView';
import { CompetitorsView } from './views/CompetitorsView';
import { BacklinksView } from './views/BacklinksView';
import { BillingView } from './views/BillingView';
import { TeamView } from './views/TeamView';
import { TechnicalSeoView } from './views/TechnicalSeoView';
import { AiInsightsView } from './views/AiInsightsView';
import { RecommendationsView } from './views/RecommendationsView';
import { HistoryView } from './views/HistoryView';
import { WhiteLabelReportsView } from './views/WhiteLabelReportsView';
import { OverallPerformanceReportView } from './views/OverallPerformanceReportView';
import { TopPrioritiesView } from './views/TopPrioritiesView';
import { LiveAnalysisView } from './views/LiveAnalysisView';

function SaaSLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) return <>{children}</>;
  return (
    <div className="flex flex-1 overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-[#0b0f19]">
        {children}
      </main>
    </div>
  );
}

function PlaceholderView({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 space-y-6">
      <div className="w-20 h-20 bg-indigo-500/10 border border-indigo-500/20 rounded-3xl flex items-center justify-center text-indigo-400">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>
      </div>
      <div className="space-y-2">
        <h2 className="text-3xl font-black text-white">{title}</h2>
        <p className="text-slate-400 max-w-md">This enterprise module is currently being optimized for high-dimensional data processing. Check back soon for predictive visibility insights.</p>
      </div>
    </div>
  );
}

function MainRouter() {
  const { pathname } = useLocation();
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-slate-400 text-sm font-medium">Restoring Session...</p>
        </div>
      </div>
    );
  }

  // Match /audits/:id/:tab
  const auditTabMatch = matchPath('/audits/:id/:tab', pathname);
  if (auditTabMatch.matched) {
    const { id, tab } = auditTabMatch.params;
    const validTabs = ['overall', 'seo', 'aeo', 'aio', 'geo', 'eeat', 'intelligence', 'urls'];
    const activeTab = (validTabs.includes(tab) ? tab : 'overall') as any;
    return <SaaSLayout><AuditLayout auditId={id} activeTab={activeTab} /></SaaSLayout>;
  }

  // Match /audits/:id
  const auditRootMatch = matchPath('/audits/:id', pathname);
  if (auditRootMatch.matched) {
    return <SaaSLayout><AuditLayout auditId={auditRootMatch.params.id} activeTab="overall" /></SaaSLayout>;
  }

  // Match /projects/:id
  const projectDetailMatch = matchPath('/projects/:id', pathname);
  if (projectDetailMatch.matched) {
    return <SaaSLayout><ProjectDashboardView projectId={projectDetailMatch.params.id} /></SaaSLayout>;
  }

  // Project Management
  if (pathname === '/projects') return <SaaSLayout><ProjectsView /></SaaSLayout>;
  
  // Dashboard
  if (pathname === '/dashboard') return <SaaSLayout><GlobalDashboardView /></SaaSLayout>;

  // Keyword Intelligence
  if (pathname === '/keywords') return <SaaSLayout><KeywordResearchView /></SaaSLayout>;

  // Other SaaS routes
  if (pathname === '/rankings') return <SaaSLayout><RankingsView /></SaaSLayout>;
  if (pathname === '/competitors') return <SaaSLayout><CompetitorsView /></SaaSLayout>;
  if (pathname === '/backlinks') return <SaaSLayout><BacklinksView /></SaaSLayout>;
  if (pathname === '/technical') return <SaaSLayout><TechnicalSeoView /></SaaSLayout>;
  if (pathname === '/ai-insights') return <SaaSLayout><AiInsightsView /></SaaSLayout>;
  if (pathname === '/recommendations') return <SaaSLayout><RecommendationsView /></SaaSLayout>;
  if (pathname === '/history') return <SaaSLayout><HistoryView /></SaaSLayout>;
  if (pathname === '/reports') return <SaaSLayout><WhiteLabelReportsView /></SaaSLayout>;
  if (pathname === '/overall-report') return <SaaSLayout><OverallPerformanceReportView /></SaaSLayout>;
  if (pathname === '/top-priorities') return <SaaSLayout><TopPrioritiesView /></SaaSLayout>;
  if (pathname === '/live-analysis') return <SaaSLayout><LiveAnalysisView /></SaaSLayout>;
  if (pathname === '/team') return <SaaSLayout><TeamView /></SaaSLayout>;
  if (pathname === '/billing') return <SaaSLayout><BillingView /></SaaSLayout>;

  // Auth Routes
  if (pathname === '/login') return <LoginView />;
  if (pathname === '/signup') return <SignupView />;
  if (pathname === '/verify-email') return <VerifyEmailView />;
  if (pathname === '/forgot-password') return <ForgotPasswordView />;
  if (pathname === '/reset-password') return <ResetPasswordView />;

  // Landing Page for guests
  if (!user && (pathname === '/' || pathname === '')) {
    return <LandingView />;
  }

  // Default / Dashboard
  return <SaaSLayout>{user ? <GlobalDashboardView /> : <LandingView />}</SaaSLayout>;
}

export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col antialiased selection:bg-indigo-500 selection:text-white">
        <div className="no-print">
          <Navbar />
        </div>
        <MainRouter />
      </div>
    </AuthProvider>
  );
}
