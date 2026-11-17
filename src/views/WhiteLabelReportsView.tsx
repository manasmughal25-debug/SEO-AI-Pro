import React, { useState } from 'react';
import { 
  FileText, 
  Settings, 
  Image as ImageIcon, 
  Palette, 
  Layout, 
  Globe, 
  ArrowRight,
  Sparkles,
  Download,
  Share2
} from 'lucide-react';

export const WhiteLabelReportsView: React.FC = () => {
  const [agencyName, setAgencyName] = useState('My Global Agency');
  const [primaryColor, setPrimaryColor] = useState('#6366f1');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <FileText className="w-8 h-8 text-indigo-400" />
            White-Label Reporting
          </h1>
          <p className="text-slate-400 mt-2">Customize audit reports with your brand identity, logos, and custom color themes for professional client delivery.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Customization Panel */}
        <div className="xl:col-span-1 space-y-6">
           <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
              <div className="flex items-center gap-2">
                 <Settings className="w-5 h-5 text-indigo-400" />
                 <h3 className="font-bold text-white uppercase tracking-widest text-xs">Brand Settings</h3>
              </div>

              <div className="space-y-4">
                 <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500">Agency / Company Name</label>
                    <input 
                      type="text" 
                      value={agencyName}
                      onChange={e => setAgencyName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                 </div>

                 <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500">Brand Primary Color</label>
                    <div className="flex gap-3">
                       <input 
                         type="color" 
                         value={primaryColor}
                         onChange={e => setPrimaryColor(e.target.value)}
                         className="w-12 h-10 rounded-lg bg-slate-950 border border-slate-700 cursor-pointer overflow-hidden"
                       />
                       <input 
                         type="text" 
                         value={primaryColor}
                         onChange={e => setPrimaryColor(e.target.value)}
                         className="flex-1 px-4 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white font-mono uppercase"
                       />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500">Agency Logo</label>
                    <div className="border-2 border-dashed border-slate-800 rounded-2xl p-8 text-center space-y-2 hover:bg-slate-950 transition cursor-pointer group">
                       <ImageIcon className="w-8 h-8 text-slate-700 group-hover:text-indigo-400 mx-auto transition" />
                       <p className="text-[10px] text-slate-500">Upload SVG or Transparent PNG (max 2MB)</p>
                    </div>
                 </div>
              </div>

              <button className="w-full py-3 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-500 transition shadow-lg shadow-indigo-600/20">
                 Save Branding Profile
              </button>
           </div>
        </div>

        {/* Preview Panel */}
        <div className="xl:col-span-2 space-y-6">
           <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 relative overflow-hidden flex flex-col items-center justify-center min-h-[400px]">
              <div className="absolute top-4 left-4 flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                 <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Live Report Preview</span>
              </div>

              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg aspect-[1/1.4] p-8 text-slate-900 flex flex-col transform hover:scale-[1.02] transition-transform duration-500">
                 <div className="flex justify-between items-start border-b-2 pb-6" style={{ borderColor: primaryColor }}>
                    <div className="space-y-1">
                       <h4 className="text-sm font-black uppercase tracking-tighter" style={{ color: primaryColor }}>{agencyName}</h4>
                       <p className="text-[10px] font-bold text-slate-500">SEO Intelligence Report</p>
                    </div>
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 font-black italic">LOGO</div>
                 </div>

                 <div className="mt-8 space-y-6">
                    <div className="space-y-1">
                       <span className="text-[10px] text-slate-400 font-bold uppercase">Target Website</span>
                       <h2 className="text-2xl font-black tracking-tight">client-website.com</h2>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-1">
                          <span className="text-[8px] font-bold text-slate-400 uppercase">Overall Health</span>
                          <div className="text-2xl font-black" style={{ color: primaryColor }}>84%</div>
                       </div>
                       <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-1">
                          <span className="text-[8px] font-bold text-slate-400 uppercase">AI Visibility</span>
                          <div className="text-2xl font-black" style={{ color: primaryColor }}>High</div>
                       </div>
                    </div>

                    <div className="space-y-3">
                       <div className="h-2 w-full bg-slate-100 rounded-full" />
                       <div className="h-2 w-3/4 bg-slate-100 rounded-full" />
                       <div className="h-2 w-1/2 bg-slate-100 rounded-full" />
                    </div>
                 </div>

                 <div className="mt-auto pt-6 border-t border-slate-100 flex justify-between items-center">
                    <span className="text-[8px] text-slate-400 font-medium italic tracking-wide">CONFIDENTIAL: Generated by {agencyName}</span>
                    <span className="text-[8px] text-slate-400 font-mono">Page 1 / 12</span>
                 </div>
              </div>

              <div className="mt-8 flex gap-3">
                 <button className="px-6 py-2.5 rounded-xl bg-slate-800 text-white text-xs font-bold flex items-center gap-2 hover:bg-slate-700 transition">
                    <Download className="w-4 h-4" /> Download Sample PDF
                 </button>
                 <button className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold flex items-center gap-2 hover:bg-indigo-500 transition shadow-lg shadow-indigo-600/20">
                    <Share2 className="w-4 h-4" /> Client Portal Link
                 </button>
              </div>
           </div>
        </div>

      </div>

    </div>
  );
};
