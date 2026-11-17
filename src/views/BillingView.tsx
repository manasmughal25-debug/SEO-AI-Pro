import React from 'react';
import { 
  CreditCard, 
  CheckCircle2, 
  Zap, 
  ShieldCheck, 
  Globe, 
  Clock, 
  ArrowRight 
} from 'lucide-react';

export const BillingView: React.FC = () => {
  const plans = [
    {
      name: 'Starter',
      price: '$49',
      period: '/mo',
      description: 'Ideal for small businesses and individual site owners.',
      features: ['5 Projects', '500 Keyword Tracking', 'Weekly Audits', 'Standard AI Insights'],
      current: false,
    },
    {
      name: 'Pro',
      price: '$129',
      period: '/mo',
      description: 'Advanced intelligence for scaling digital agencies.',
      features: ['25 Projects', '2,500 Keyword Tracking', 'Daily Audits', 'Advanced AI Search Forecasting', 'Competitor Intelligence', 'White-Label Reports'],
      current: true,
      popular: true,
    },
    {
      name: 'Enterprise',
      price: '$499',
      period: '/mo',
      description: 'High-dimensional data for global enterprise teams.',
      features: ['Unlimited Projects', '10,000+ Keywords', 'Real-time Monitoring', 'Custom AI Model Training', 'Team Collaboration', 'API Access', 'Dedicated Support'],
      current: false,
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 animate-in fade-in duration-500">
      
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <h1 className="text-4xl font-black text-white tracking-tight">SaaS Subscription Management</h1>
        <p className="text-slate-400">Scale your search intelligence with flexible, enterprise-grade plans tailored to your performance goals.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div 
            key={plan.name} 
            className={`relative p-8 rounded-3xl border ${
              plan.current 
                ? 'bg-indigo-600/10 border-indigo-500 shadow-2xl shadow-indigo-600/20' 
                : 'bg-slate-900 border-slate-800'
            } flex flex-col h-full`}
          >
            {plan.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-indigo-500 text-white text-[10px] font-bold rounded-full uppercase tracking-widest shadow-lg">
                Most Popular
              </span>
            )}
            
            <div className="mb-8">
              <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-white">{plan.price}</span>
                <span className="text-slate-400 text-sm font-bold">{plan.period}</span>
              </div>
              <p className="mt-4 text-xs text-slate-400 leading-relaxed">{plan.description}</p>
            </div>

            <ul className="space-y-4 mb-8 flex-1">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3 text-xs text-slate-300">
                  <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${plan.current ? 'text-indigo-400' : 'text-slate-600'}`} />
                  {feature}
                </li>
              ))}
            </ul>

            <button 
              className={`w-full py-4 rounded-2xl text-sm font-bold transition-all ${
                plan.current 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' 
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {plan.current ? 'Manage Current Plan' : `Upgrade to ${plan.name}`}
            </button>
          </div>
        ))}
      </div>

      {/* Transaction History */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-400" />
            Billing History
          </h3>
          <button className="text-xs text-indigo-400 font-bold">Download All (PDF)</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-950/50 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Invoice ID</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              <tr className="hover:bg-slate-800/30 transition">
                <td className="px-6 py-4 font-mono text-xs text-slate-400">#INV-2026-004</td>
                <td className="px-6 py-4 text-xs text-slate-300">Nov 1, 2026</td>
                <td className="px-6 py-4 text-xs font-bold text-white">$129.00</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-widest border border-emerald-500/20">Paid</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-[10px] font-bold text-indigo-400 hover:text-white uppercase">Download</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
