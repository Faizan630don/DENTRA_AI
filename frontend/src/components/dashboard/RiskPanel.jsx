import { ShieldAlert, ShieldCheck, Shield, DollarSign, AlertOctagon, TrendingUp } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import DentalAgeClock from './DentalAgeClock';

const RISK_CONFIG = {
  High: {
    icon: ShieldAlert,
    color: 'text-red-400',
    bg: 'bg-red-950/40',
    border: 'border-red-800/50',
    glow: 'shadow-glow-red',
    bar: 'from-red-500 to-red-400',
    label: 'High Risk',
    description: 'Immediate professional attention required.',
  },
  Medium: {
    icon: Shield,
    color: 'text-amber-400',
    bg: 'bg-amber-950/30',
    border: 'border-amber-800/40',
    glow: '',
    bar: 'from-amber-500 to-amber-400',
    label: 'Medium Risk',
    description: 'Treatment needed within 4–8 weeks.',
  },
  Low: {
    icon: ShieldCheck,
    color: 'text-emerald-400',
    bg: 'bg-emerald-950/30',
    border: 'border-emerald-800/40',
    glow: '',
    bar: 'from-emerald-500 to-emerald-400',
    label: 'Low Risk',
    description: 'Good oral health. Routine check-ups recommended.',
  },
};

const URGENCY_STYLES = {
  Immediate: 'bg-red-950/60 text-red-400 border-red-800/50',
  Soon:      'bg-amber-950/60 text-amber-400 border-amber-800/50',
  Routine:   'bg-emerald-950/60 text-emerald-400 border-emerald-800/50',
};

export default function RiskPanel({ result }) {
  const { mode } = useApp();
  const isDentist = mode === 'dentist';
  const cfg = RISK_CONFIG[result.risk_score] || RISK_CONFIG.Low;
  const RiskIcon = cfg.icon;

  const toothGroups = Object.entries(
    result.findings.reduce((acc, f) => {
      if (!acc[f.tooth_id]) acc[f.tooth_id] = [];
      acc[f.tooth_id].push(f);
      return acc;
    }, {})
  );

  const untreatedWarnings = toothGroups
    .filter(([, findings]) => findings.some(f => f.severity >= 3))
    .slice(0, 3)
    .map(([fdi, findings]) => {
      const condition = Array.from(new Set(findings.map(f => f.condition))).join(' & ');
      return {
        tooth: `Tooth ${fdi}`,
        warning: isDentist 
          ? `Potential progression of ${condition} leading to pulp involvement or structural failure within 3-6 months.`
          : `If left untreated, ${condition} on this tooth could lead to severe pain or tooth loss.`
      };
    });

  return (
    <div className="space-y-4">
      {/* Risk Score Card */}
      <div className={`card p-5 ${cfg.bg} border ${cfg.border} ${cfg.glow}`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="section-label">Overall Risk Score</p>
            <div className="flex items-center gap-3">
              <RiskIcon className={`w-8 h-8 ${cfg.color}`} />
              <div>
                <p className={`text-2xl font-extrabold ${cfg.color}`}>{cfg.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{cfg.description}</p>
              </div>
            </div>
          </div>
          <div className="relative w-20 h-20">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#21262d" strokeWidth="3" />
              <circle
                cx="18" cy="18" r="15.9" fill="none"
                stroke={result.overall_health > 60 ? '#10b981' : result.overall_health > 35 ? '#f59e0b' : '#ef4444'}
                strokeWidth="3"
                strokeDasharray={`${result.overall_health} ${100 - result.overall_health}`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-bold text-white">{result.overall_health}</span>
              <span className="text-[9px] text-gray-500 uppercase tracking-wide">Health</span>
            </div>
          </div>
        </div>

        <div className="h-2 bg-surface-raised rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${cfg.bar} transition-all duration-1000`}
            style={{ width: `${result.risk_score === 'High' ? 85 : result.risk_score === 'Medium' ? 55 : 25}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-gray-600 mt-1">
          <span>Low</span><span>Medium</span><span>High</span>
        </div>
      </div>

      <DentalAgeClock 
        biologicalAge={result.biological_age} 
        dentalAge={result.dental_age} 
        patientName={result.patient_name} 
      />

      {/* Cost Estimate */}
      <div className="card p-4">
        <div className="flex items-center gap-2 mb-3">
          <DollarSign className="w-4 h-4 text-brand-400" />
          <p className="section-label !mb-0">Estimated Treatment Cost</p>
        </div>
        <div className="flex items-end gap-2 mb-3">
          <span className="text-2xl font-extrabold text-white">
            ₹{result.treatment.cost_estimate_inr.low.toLocaleString('en-IN')}
          </span>
          {result.treatment.cost_estimate_inr.high > 0 && (
            <>
              <span className="text-gray-500 text-sm mb-0.5">—</span>
              <span className="text-2xl font-extrabold text-brand-400">
                ₹{result.treatment.cost_estimate_inr.high.toLocaleString('en-IN')}
              </span>
            </>
          )}
        </div>
        <div className="space-y-2 mt-3">
          {result.treatment.procedures.map((p, i) => (
            <div key={`${p.name}-${i}`} className="flex items-center justify-between gap-3 py-1.5 border-b border-surface-border/50 last:border-0">
              <div className="flex items-center gap-2 min-w-0">
                <span className={`shrink-0 badge border text-[10px] ${URGENCY_STYLES[p.urgency] || URGENCY_STYLES.Routine}`}>
                  {p.urgency}
                </span>
                <span className="text-sm text-gray-300 truncate">
                  {isDentist ? p.name : p.patient_description.split('.')[0]}
                </span>
              </div>
              <span className="shrink-0 text-xs text-gray-400 font-mono">
                ₹{p.cost_low.toLocaleString('en-IN')}–{p.cost_high.toLocaleString('en-IN')}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Priority List */}
      <div className="card p-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-brand-400" />
          <p className="section-label !mb-0">Treatment Priority</p>
        </div>
        <ol className="space-y-2">
          {result.treatment.priority_list.map((item, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="shrink-0 w-5 h-5 rounded-full bg-brand-600/20 text-brand-400 text-[10px] font-bold flex items-center justify-center mt-0.5">
                {i + 1}
              </span>
              <span className="text-sm text-gray-300 leading-snug">{item}</span>
            </li>
          ))}
        </ol>
      </div>

      {untreatedWarnings.length > 0 && (
        <div className="card p-4 border-red-900/30 bg-red-950/10">
          <div className="flex items-center gap-2 mb-3">
            <AlertOctagon className="w-4 h-4 text-red-400" />
            <p className="section-label !mb-0 text-red-400/80">If Left Untreated…</p>
          </div>
          <div className="space-y-2.5">
            {untreatedWarnings.map((w, i) => (
              <div key={i} className="flex gap-2.5">
                <div className="shrink-0 w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5" />
                <div>
                  <span className="text-xs font-semibold text-red-300 font-mono">{w.tooth}: </span>
                  <span className="text-xs text-gray-400">{w.warning}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
