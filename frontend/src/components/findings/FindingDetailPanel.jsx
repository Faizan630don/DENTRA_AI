import { Info } from 'lucide-react';
import { getKnowledge } from '../../data/findingKnowledge';
import { getToothInfo } from '../../data/toothKnowledge';
import SecondOpinionDetails from './SecondOpinionDetails';

function SeverityBar({ level }) {
  const colors = [
    'bg-emerald-500', 'bg-green-400', 'bg-amber-400', 'bg-orange-500', 'bg-red-500'
  ];
  return (
    <div className="flex gap-1 items-center">
      {[1, 2, 3, 4, 5].map(i => (
        <div
          key={i}
          className={`h-2 flex-1 rounded-full transition-all ${
            i <= level ? colors[level - 1] : 'bg-slate-700'
          }`}
        />
      ))}
    </div>
  );
}

export default function FindingDetailPanel({ finding, mode = 'patient' }) {
  const knowledge = getKnowledge(finding.condition);
  const toothInfo = getToothInfo(finding.tooth_id);

  // ── Unknown condition fallback ──────────────────────────────────────────
  if (!knowledge) {
    return (
      <div className="mt-2 p-3 rounded-xl bg-slate-800/60 border border-slate-700/40 space-y-2">
        <p className="text-xs text-slate-400">
          The AI detected <span className="text-white font-medium">{finding.condition}</span> on tooth{' '}
          <span className="text-white font-medium">{finding.tooth_id}</span> with{' '}
          <span className="text-white font-medium">{Math.round(finding.confidence * 100)}%</span> confidence.
        </p>
      </div>
    );
  }

  const sevLevel = Math.max(1, Math.min(5, finding.severity ?? 3));
  const sevDesc = knowledge.severityDescriptions[sevLevel];

  return (
    <div className="mt-2 space-y-2.5 animate-in slide-in-from-top-1 duration-200">

      {/* ── Tooth Anatomy Detail ─────────────────────────────────────── */}
      {toothInfo && (
        <div className="p-3 rounded-xl bg-indigo-950/20 border border-indigo-500/20">
          <div className="flex items-center gap-2 mb-1.5">
            <Info className="w-3 h-3 text-indigo-400" />
            <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">
              Location: Tooth {toothInfo.id}
            </span>
          </div>
          <p className="text-[11px] font-bold text-white mb-0.5">{toothInfo.name}</p>
          <p className="text-[10px] text-indigo-200/60 leading-relaxed italic">{toothInfo.anatomy}</p>
        </div>
      )}

      {/* ── Brief Summary ────────────────────────────────────────────── */}
      <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/40">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-lg">{knowledge.icon}</span>
          <span className="text-[11px] font-bold text-white uppercase tracking-wider">
            {knowledge.conditionName}
          </span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          {mode === 'patient' ? knowledge.whatItIs : knowledge.dentistNote}
        </p>
      </div>

      {/* ── Severity & Confidence ─────────────────────────────────────── */}
      <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/40">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Diagnostic Priority</span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            sevDesc.color === 'green' ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
            : sevDesc.color === 'amber' ? 'bg-amber-950/60 text-amber-400 border border-amber-800/40'
            : 'bg-red-950/60 text-red-400 border border-red-800/40'
          }`}>
            {sevDesc.label}
          </span>
        </div>
        <SeverityBar level={sevLevel} />
        <div className="mt-2">
          <p className="text-[10px] text-slate-500 font-medium italic">{sevDesc.clinical.split('.')[0]}.</p>
        </div>
      </div>

      {/* ── Second Opinion AI Verification ───────────────────────────── */}
      {mode === 'dentist' && (
        <SecondOpinionDetails 
          finding={finding} 
          isLoading={finding.second_opinion === 'pending'} 
        />
      )}
    </div>
  );
}
