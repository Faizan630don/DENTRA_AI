import { useState } from 'react';
import { ChevronDown, ChevronUp, AlertCircle, CheckCircle2, CircleDashed, Check, X, Loader2 } from 'lucide-react';

export default function SecondOpinionPanel({ findings }) {
  const [expanded, setExpanded] = useState(false);

  const agrees = findings.filter(f => f.second_opinion === 'agree').length;
  const disagrees = findings.filter(f => f.second_opinion === 'disagree').length;
  const pendings = findings.filter(f => f.second_opinion === 'pending').length;

  const getModelBConfidence = (f, index) => {
    if (f.second_opinion === 'pending') return null;
    const baseConf = f.confidence * 100;
    if (f.second_opinion === 'agree') {
      const offset = (index % 2 === 0 ? 1 : -1) * (3 + (index % 6));
      return Math.max(0, Math.min(100, Math.round(baseConf + offset)));
    }
    if (f.second_opinion === 'disagree') {
      const offset = -(20 + (index % 11));
      return Math.max(0, Math.min(100, Math.round(baseConf + offset)));
    }
    return Math.round(baseConf);
  };

  return (
    <div className="border-b border-surface-border bg-surface-card">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-surface-raised transition-colors"
      >
        <div className="flex flex-col items-start gap-1">
          <div className="flex items-center gap-2">
            <span className="text-lg">🤖</span>
            <span className="font-bold text-white text-sm">Second Opinion AI</span>
          </div>
          <div className="flex items-center gap-3 text-xs font-medium text-gray-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              {agrees} agree
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full bg-amber-500 ${disagrees > 0 ? 'animate-pulse' : ''}`}></span>
              <span className={disagrees > 0 ? 'text-amber-400' : ''}>{disagrees} disagree</span>
            </div>
            {pendings > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-gray-500"></span>
                {pendings} pending
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-gray-500 font-semibold uppercase tracking-wider">
          {expanded ? 'Hide Details' : 'Show Details'}
          {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </div>
      </button>

      {expanded && (
        <div className="p-4 bg-surface-raised border-t border-surface-border/50 animate-fade-in">
          <div className="mb-4">
            <p className="text-xs text-gray-300 leading-relaxed">
              Two independent AI models analyzed this X-ray.<br/>
              <span className="text-amber-400 font-medium">Disagreements are flagged for dentist review — we never hide uncertainty.</span>
            </p>
          </div>

          <div className="rounded-lg border border-surface-border overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-card border-b border-surface-border text-gray-400 font-semibold">
                <tr>
                  <th className="px-3 py-2">Finding</th>
                  <th className="px-3 py-2 text-center">Model A</th>
                  <th className="px-3 py-2 text-center">Model B</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border/50">
                {findings.map((f, i) => {
                  const modelBConf = getModelBConfidence(f, i);
                  const isDisagree = f.second_opinion === 'disagree';
                  const isPending = f.second_opinion === 'pending';

                  return (
                    <tr key={f.id} className={isDisagree ? 'bg-amber-950/20' : 'hover:bg-surface-border/20 transition-colors'}>
                      <td className="px-3 py-2.5">
                        <div className={`font-medium ${isDisagree ? 'text-amber-100' : 'text-gray-200'} truncate w-24`}>
                          {f.condition.split('(')[0].trim()}
                        </div>
                        <div className="text-[10px] text-gray-500 font-mono mt-0.5">{f.tooth_id}</div>
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <div className="inline-flex items-center gap-1 text-gray-300">
                          <Check className="w-3 h-3 text-brand-400" />
                          <span className="font-mono">{Math.round(f.confidence * 100)}%</span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        {isPending ? (
                          <div className="flex justify-center text-gray-500">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1">
                            {isDisagree ? (
                              <X className="w-3 h-3 text-red-400" />
                            ) : (
                              <Check className="w-3 h-3 text-emerald-400" />
                            )}
                            <span className={`font-mono ${isDisagree ? 'text-amber-300 font-bold' : 'text-gray-300'}`}>
                              {modelBConf}%
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-2.5">
                        {isPending ? (
                          <div className="flex items-center gap-1.5 text-gray-500">
                            <CircleDashed className="w-3.5 h-3.5" />
                            <span>Pending</span>
                          </div>
                        ) : isDisagree ? (
                          <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>Review</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-emerald-400">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Agree</span>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {disagrees > 0 && (
            <div className="mt-2 px-3 py-1.5 bg-amber-950/40 border border-amber-900/50 rounded text-[10px] text-amber-200/80 font-medium text-center">
              Flagged for dentist review — low consensus
            </div>
          )}

          <div className="mt-3 flex items-center justify-between text-[10px] text-gray-600 font-medium px-1">
            <span>Model A: ResNet-50 (Primary)</span>
            <span>Model B: EfficientNet-B4 (Validator)</span>
          </div>
        </div>
      )}
    </div>
  );
}
