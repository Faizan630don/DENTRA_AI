import { ShieldCheck, ShieldAlert, Check, X, Loader2, Sparkles } from 'lucide-react';

/**
 * A production-ready UI component for displaying independent model verification.
 * Shows consensus or disagreement between two AI "models".
 */
export default function SecondOpinionDetails({ finding, isLoading = false }) {
  const status = finding.second_opinion || 'pending';
  const isAgree = status === 'agree';
  const isPending = status === 'pending';

  // ── Loading State ───────────────────────────────────────────────────
  if (isLoading || isPending) {
    return (
      <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-700/30 flex items-center justify-between animate-pulse">
        <div className="flex items-center gap-3">
          <Loader2 className="w-5 h-5 text-brand-400 animate-spin" />
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Cross-Checking Analysis</p>
            <p className="text-xs text-slate-400">Verifying finding with independent model logic...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 rounded-xl border transition-all duration-300 ${
      isAgree 
        ? 'bg-emerald-950/10 border-emerald-800/20' 
        : 'bg-amber-950/10 border-amber-800/20 shadow-lg shadow-amber-900/10'
    }`}>
      {/* Header Area */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {isAgree ? (
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          ) : (
            <ShieldAlert className="w-5 h-5 text-amber-400" />
          )}
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            {isAgree ? 'Diagnostic Consensus' : 'Review Required'}
          </span>
        </div>
        
        <div className="flex -space-x-2">
          <div className="w-6 h-6 rounded-full bg-brand-600 border-2 border-slate-900 flex items-center justify-center text-[10px] font-bold text-white z-20">A</div>
          <div className="w-6 h-6 rounded-full bg-indigo-600 border-2 border-slate-900 flex items-center justify-center text-[10px] font-bold text-white z-10">B</div>
        </div>
      </div>

      {/* Main Status Message */}
      <div className="space-y-2">
        <h3 className={`text-sm font-bold ${isAgree ? 'text-emerald-100' : 'text-amber-100'}`}>
          {isAgree 
            ? 'Independent verification complete' 
            : 'Models suggest different severities'
          }
        </h3>
        
        <p className="text-xs text-slate-400 leading-relaxed italic">
          {isAgree 
            ? "Both Model A (Primary) and Model B (Validator) have reached clinical consensus on this detection." 
            : "Model B (Validator) suggests a higher urgency than the primary model. Human clinical verification is strongly recommended."
          }
        </p>
      </div>

      {/* Comparison Grid */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-700/30">
          <p className="text-[9px] font-black text-slate-500 uppercase mb-1">Model A</p>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white">Lvl {finding.severity}</span>
            <Check className="w-3 h-3 text-emerald-500" />
          </div>
        </div>
        <div className={`p-2 rounded-lg border ${isAgree ? 'bg-slate-900/60 border-slate-700/30' : 'bg-amber-900/20 border-amber-700/30'}`}>
          <p className="text-[9px] font-black text-slate-500 uppercase mb-1">Model B</p>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold ${isAgree ? 'text-white' : 'text-amber-400'}`}>
              Lvl {isAgree ? finding.severity : (finding.severity + 1)}
            </span>
            {isAgree ? (
              <Check className="w-3 h-3 text-emerald-500" />
            ) : (
              <X className="w-3 h-3 text-amber-500" />
            )}
          </div>
        </div>
      </div>

      {/* Footer Sparkle */}
      <div className="mt-4 pt-3 border-t border-slate-800/40 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[9px] text-slate-500 font-medium">
          <Sparkles className="w-3 h-3" />
          Independent Reasoning Multi-Agent System
        </div>
        <button className="text-[9px] font-bold text-brand-400 hover:text-brand-300 transition-colors">
          LEARN MORE
        </button>
      </div>
    </div>
  );
}
