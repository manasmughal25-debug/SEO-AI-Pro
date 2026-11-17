import React from 'react';
import { navigate } from '../utils/router';
import { 
  Zap, 
  ShieldCheck, 
  Search, 
  TrendingUp, 
  Globe, 
  ArrowRight, 
  CheckCircle2, 
  Layers,
  Sparkles,
  BrainCircuit,
  BarChart3,
  Bot
} from 'lucide-react';

export const LandingView: React.FC = () => {
  return (
    <div className="bg-[#0b0f19] text-white">
      
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl">
          <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-600/20 blur-[120px] rounded-full" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-600/10 blur-[120px] rounded-full" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Sparkles className="w-3.5 h-3.5" />
            Next-Gen SEO Intelligence
          </div>
          <h1 className="text-5xl sm:text-7xl font-black tracking-tight leading-[1.1] mb-8 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            Dominate Search with <br />
            <span className="bg-gradient-to-r from-indigo-400 via-indigo-500 to-cyan-400 bg-clip-text text-transparent">AI-Powered Intelligence.</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg sm:text-xl text-slate-400 leading-relaxed mb-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            Enterprise-grade SEO SaaS for technical audits, keyword forecasting, entity-based optimization, and predictive search demand.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-1000">
            <button
              onClick={() => navigate('/signup')}
              className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl shadow-2xl shadow-indigo-600/40 transition-all flex items-center justify-center gap-2 group"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto px-8 py-4 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white font-bold rounded-2xl transition-all"
            >
              Book Enterprise Demo
            </button>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-24 bg-slate-950/50 border-y border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Full-Stack Search Suite</h2>
            <p className="text-slate-400 max-w-xl mx-auto">One platform. Infinite search insights. Built for the modern enterprise.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: <ShieldCheck className="w-6 h-6" />, title: 'Technical Audit', desc: 'Deep crawl of your site architecture, schema, and core web vitals.' },
              { icon: <BrainCircuit className="w-6 h-6" />, title: 'AI Recommendations', desc: 'Actionable growth strategies powered by Gemini search intelligence.' },
              { icon: <TrendingUp className="w-6 h-6" />, title: 'Demand Forecasting', desc: 'Predict search volume trends before they hit the market.' },
              { icon: <Layers className="w-6 h-6" />, title: 'Entity Intelligence', desc: 'Optimize for knowledge graphs and semantic search relationships.' },
              { icon: <Search className="w-6 h-6" />, title: 'Keyword Research', desc: 'Discover high-intent terms with real-time volume and difficulty data.' },
              { icon: <Bot className="w-6 h-6" />, title: 'Generative SEO', desc: 'Prepare your brand for ChatGPT Search, Perplexity, and Claude.' }
            ].map((feature, i) => (
              <div key={i} className="p-8 bg-slate-900 border border-slate-800 rounded-3xl space-y-4 hover:border-indigo-500/50 transition-all group">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-white">{feature.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-24 text-center">
        <div className="max-w-7xl mx-auto px-4">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-12">Trusted by Search Teams at</h3>
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-50 grayscale contrast-200">
            <span className="text-2xl font-black tracking-tighter">TECHFLOW</span>
            <span className="text-2xl font-black tracking-tighter">DATASTRAT</span>
            <span className="text-2xl font-black tracking-tighter">NEXUS_SEO</span>
            <span className="text-2xl font-black tracking-tighter">AUDITPRO</span>
            <span className="text-2xl font-black tracking-tighter">VANTAGE</span>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-indigo-600/5" />
        <div className="max-w-4xl mx-auto px-4 relative z-10 text-center space-y-8">
           <h2 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight">Ready to scale your search visibility?</h2>
           <p className="text-slate-400">Join 500+ enterprises using SEO AI PRO to win the search landscape.</p>
           <button onClick={() => navigate('/signup')} className="px-10 py-5 bg-white text-indigo-600 font-black rounded-2xl shadow-xl hover:scale-105 transition-transform flex items-center justify-center gap-2 mx-auto">
             Get Started Now
             <ArrowRight className="w-6 h-6" />
           </button>
        </div>
      </section>

    </div>
  );
};
