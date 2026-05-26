import { AlertTriangle, CheckCircle, Info, ChevronRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import SecondOpinionPanel from './SecondOpinionPanel';
import FindingDetailPanel from '../findings/FindingDetailPanel';

const getSeverityTheme = (level) => {
  if (level >= 4) return { icon: <AlertTriangle className="w-4 h-4 text-red-400" />, badge: 'badge-high', label: 'High' };
  if (level >= 3) return { icon: <Info className="w-4 h-4 text-amber-400" />, badge: 'badge-medium', label: 'Medium' };
  return { icon: <CheckCircle className="w-4 h-4 text-emerald-400" />, badge: 'badge-low', label: 'Low' };
};

export default function FindingsList({ findings }) {
  const { mode, selectedFinding, setSelectedFinding } = useApp();
  const isDentist = mode === 'dentist';

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-surface-border">
        <h2 className="font-bold text-white text-sm">
          AI Findings
          <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-500/20 text-red-400 text-[10px] font-bold">
            {findings.length}
          </span>
        </h2>
        <p className="text-[11px] text-gray-500 mt-0.5">
          {isDentist ? 'Clinical findings with confidence scores' : 'Click any finding to see it on the X-ray'}
        </p>
      </div>

      {isDentist && <SecondOpinionPanel findings={findings} />}

      <div className="flex-1 overflow-y-auto divide-y divide-surface-border/50">
        {findings.map((f, idx) => {
          const isSelected = selectedFinding?.id === f.id;
          const theme = getSeverityTheme(f.severity);

          return (
            <div
              key={f.id}
              id={`finding-${f.id}`}
              className={`w-full transition-all duration-150 group border-l-2 ${isSelected
                ? 'bg-brand-600/10 border-brand-500'
                : 'hover:bg-surface-raised border-transparent'
                }`}
            >
              <button
                onClick={() => setSelectedFinding(isSelected ? null : f)}
                className="w-full text-left px-4 py-3.5 flex items-start gap-3"
              >
                <div className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold mt-0.5 ${isSelected ? 'bg-brand-600 text-white' : 'bg-surface-raised text-gray-500'
                  }`}>
                  {idx + 1}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {theme.icon}
                    <span className="font-semibold text-white text-sm truncate">
                      #{f.tooth_id}: {isDentist ? f.condition : f.condition.split('(')[0].trim()}
                    </span>
                    <span className={theme.badge}>
                      {theme.label}
                    </span>
                  </div>

                  <p className="text-[11px] text-gray-500 mt-0.5 font-sans">{f.clinical_name}</p>

                  {isDentist && (
                    <div className="mt-2.5 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">AI Confidence</span>
                        <span className="text-[10px] font-mono font-bold text-brand-400">{Math.round(f.confidence * 100)}%</span>
                      </div>
                      <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-brand-500 rounded-full transition-all duration-1000 ease-out"
                          style={{ width: `${f.confidence * 100}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {!isSelected && (
                    <p className="text-xs text-gray-400 mt-1.5 leading-relaxed line-clamp-1">
                      {isDentist ? f.explanation : f.patient_explanation}
                    </p>
                  )}
                </div>

                <ChevronRight className={`w-4 h-4 shrink-0 mt-1 transition-transform ${isSelected ? 'rotate-180 text-brand-400' : 'text-gray-600 group-hover:text-gray-400'
                  }`} />
              </button>

              {isSelected && (
                <div className="px-4 pb-4 animate-in slide-in-from-top-2">
                  <FindingDetailPanel
                    finding={f}
                    mode={isDentist ? 'dentist' : 'patient'}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
