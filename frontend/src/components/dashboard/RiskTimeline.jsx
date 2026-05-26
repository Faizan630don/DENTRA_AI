import { useState, useEffect, useRef, useMemo } from 'react';
import { Clock, AlertTriangle, DollarSign } from 'lucide-react';

const TIME_LABELS = ['Now', '6 Months', '1 Year'];
const BASE_COST = 9300;

// Universal Numbering System positions for the dental arch diagram
const ARCH_TEETH_DATA = [
  // Upper Right (1-8)
  { id: 'u1', fdi: '1', cx: 58,  cy: 72,  rx: 10, ry: 13, upper: true },
  { id: 'u2', fdi: '2', cx: 82,  cy: 60,  rx: 11, ry: 14, upper: true },
  { id: 'u3', fdi: '3', cx: 108, cy: 52,  rx: 13, ry: 15, upper: true },
  { id: 'u4', fdi: '4', cx: 135, cy: 47,  rx: 10, ry: 13, upper: true },
  { id: 'u5', fdi: '5', cx: 158, cy: 44,  rx: 10, ry: 13, upper: true },
  { id: 'u6', fdi: '6', cx: 180, cy: 42,  rx: 9,  ry: 14, upper: true },
  { id: 'u7', fdi: '7', cx: 200, cy: 40,  rx: 8,  ry: 13, upper: true },
  { id: 'u8', fdi: '8', cx: 220, cy: 39,  rx: 9,  ry: 14, upper: true },
  // Upper Left (9-16)
  { id: 'u9',  fdi: '9',  cx: 240, cy: 39,  rx: 9,  ry: 14, upper: true },
  { id: 'u10', fdi: '10', cx: 260, cy: 40,  rx: 8,  ry: 13, upper: true },
  { id: 'u11', fdi: '11', cx: 280, cy: 42,  rx: 9,  ry: 14, upper: true },
  { id: 'u12', fdi: '12', cx: 300, cy: 44,  rx: 10, ry: 13, upper: true },
  { id: 'u13', fdi: '13', cx: 322, cy: 47,  rx: 10, ry: 13, upper: true },
  { id: 'u14', fdi: '14', cx: 348, cy: 52,  rx: 13, ry: 15, upper: true },
  { id: 'u15', fdi: '15', cx: 374, cy: 60,  rx: 11, ry: 14, upper: true },
  { id: 'u16', fdi: '16', cx: 398, cy: 72,  rx: 10, ry: 13, upper: true },
  // Lower Right (32-25)
  { id: 'l32', fdi: '32', cx: 58,  cy: 130, rx: 10, ry: 13, upper: false },
  { id: 'l31', fdi: '31', cx: 82,  cy: 142, rx: 11, ry: 14, upper: false },
  { id: 'l30', fdi: '30', cx: 108, cy: 150, rx: 13, ry: 15, upper: false },
  { id: 'l29', fdi: '29', cx: 135, cy: 155, rx: 10, ry: 13, upper: false },
  { id: 'l28', fdi: '28', cx: 158, cy: 158, rx: 10, ry: 13, upper: false },
  { id: 'l27', fdi: '27', cx: 180, cy: 160, rx: 9,  ry: 14, upper: false },
  { id: 'l26', fdi: '26', cx: 200, cy: 162, rx: 8,  ry: 13, upper: false },
  { id: 'l25', fdi: '25', cx: 220, cy: 163, rx: 9,  ry: 14, upper: false },
  // Lower Left (24-17)
  { id: 'l24', fdi: '24', cx: 240, cy: 163, rx: 9,  ry: 14, upper: false },
  { id: 'l23', fdi: '23', cx: 260, cy: 162, rx: 8,  ry: 13, upper: false },
  { id: 'l22', fdi: '22', cx: 280, cy: 160, rx: 9,  ry: 14, upper: false },
  { id: 'l21', fdi: '21', cx: 300, cy: 158, rx: 10, ry: 13, upper: false },
  { id: 'l20', fdi: '20', cx: 322, cy: 155, rx: 10, ry: 13, upper: false },
  { id: 'l19', fdi: '19', cx: 348, cy: 150, rx: 13, ry: 15, upper: false },
  { id: 'l18', fdi: '18', cx: 374, cy: 142, rx: 11, ry: 14, upper: false },
  { id: 'l17', fdi: '17', cx: 398, cy: 130, rx: 10, ry: 13, upper: false },
];


// Color interpolation helpers
function lerp(a, b, t) { return Math.round(a + (b - a) * t); }
function hexToRgb(hex) {
  if (!hex || typeof hex !== 'string') return { r: 0, g: 0, b: 0 };
  const r = parseInt(hex.slice(1, 3), 16) || 0;
  const g = parseInt(hex.slice(3, 5), 16) || 0;
  const b = parseInt(hex.slice(5, 7), 16) || 0;
  return { r, g, b };
}
function lerpColor(c1, c2, t) {
  const a = hexToRgb(c1);
  const b = hexToRgb(c2);
  const safeT = Math.max(0, Math.min(1, t));
  return `rgb(${lerp(a.r, b.r, safeT)},${lerp(a.g, b.g, safeT)},${lerp(a.b, b.b, safeT)})`;
}

function useAnimatedValue(target, duration = 600) {
  const [display, setDisplay] = useState(target);
  const raf = useRef(0);
  const startRef = useRef(0);
  const fromRef = useRef(target);

  useEffect(() => {
    cancelAnimationFrame(raf.current);
    fromRef.current = display;
    startRef.current = performance.now();
    const animate = (now) => {
      const elapsed = now - startRef.current;
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(fromRef.current + (target - fromRef.current) * eased));
      if (t < 1) raf.current = requestAnimationFrame(animate);
    };
    raf.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, duration]);

  return display;
}

export default function RiskTimeline({ result }) {
  const [rawStep, setRawStep] = useState(0);
  const [animStep, setAnimStep] = useState(0.0);

  // 1. GENERATE DEDUPLICATED PROGRESSION DATA
  const FINDING_PROGRESSION = useMemo(() => {
    const toothGroups = {};
    result.findings.forEach(f => {
      if (!toothGroups[f.tooth_id]) toothGroups[f.tooth_id] = [];
      toothGroups[f.tooth_id].push(f);
    });

    return Object.entries(toothGroups).map(([fdi, findings]) => {
      // Find highest severity for color
      const maxSeverity = findings.some(f => f.severity >= 4) ? 'High' 
                        : findings.some(f => f.severity >= 3) ? 'Medium' : 'Low';
      
      // Combine labels
      const conditions = Array.from(new Set(findings.map(f => f.condition)));
      const label = conditions.join(' & ');

      return {
        id: findings[0].id,
        tooth_fdi: fdi,
        label,
        // Health scores over time [Now, 6mo, 1yr]
        scores: maxSeverity === 'High' ? [70, 35, 5] : maxSeverity === 'Medium' ? [85, 55, 20] : [95, 80, 50], 
        colors: maxSeverity === 'High' ? ['#ef4444', '#b91c1c', '#7f1d1d'] 
              : maxSeverity === 'Medium' ? ['#f59e0b', '#d97706', '#92400e']
              : ['#10b981', '#059669', '#047857'],
        costMultiplier: [1, 2.5, 6]
      };
    });
  }, [result.findings]);

  // Handle animation of the slider
  const animRef = useRef(0);
  useEffect(() => {
    const duration = 700;
    const start = performance.now();
    const from = animStep;
    const target = rawStep;

    const run = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setAnimStep(from + (target - from) * eased);
      if (t < 1) animRef.current = requestAnimationFrame(run);
    };
    animRef.current = requestAnimationFrame(run);
    return () => cancelAnimationFrame(animRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawStep]);

  // Compute logic
  const computeCost = (step) => {
    if (FINDING_PROGRESSION.length === 0) return 0;
    const base = result.treatment?.cost_estimate_inr?.low ?? BASE_COST;
    const s0 = Math.max(0, Math.min(Math.floor(step), 2));
    const s1 = Math.min(s0 + 1, 2);
    const frac = Math.max(0, Math.min(step - s0, 1));
    let totalMult = 0;
    FINDING_PROGRESSION.forEach(fp => {
      totalMult += fp.costMultiplier[s0] + (fp.costMultiplier[s1] - fp.costMultiplier[s0]) * frac;
    });
    return Math.round(base * (totalMult / FINDING_PROGRESSION.length));
  };

  const animatedCost = useAnimatedValue(computeCost(animStep));

  const getToothColor = (findingId) => {
    const fp = FINDING_PROGRESSION.find(f => f.id === findingId);
    if (!fp) return '#2a2820';
    const s0 = Math.max(0, Math.min(Math.floor(animStep), 2));
    const s1 = Math.min(s0 + 1, 2);
    const frac = Math.max(0, Math.min(animStep - s0, 1));
    return lerpColor(fp.colors[s0], fp.colors[s1], frac);
  };

  const getScore = (fp) => {
    const s0 = Math.max(0, Math.min(Math.floor(animStep), 2));
    const s1 = Math.min(s0 + 1, 2);
    const frac = Math.max(0, Math.min(animStep - s0, 1));
    return Math.round(fp.scores[s0] + (fp.scores[s1] - fp.scores[s0]) * frac);
  };

  const progressionWarning = [
    '',
    '⚠️ At 6 months — treatment costs rise significantly. Pathologies may become more invasive.',
    '🚨 At 1 year — advanced deterioration detected. Multiple teeth may require emergency surgical intervention.',
  ];

  const stepLabel = rawStep === 0 ? 'Current State' : rawStep === 1 ? '6 Months Without Treatment' : '1 Year Without Treatment';

  return (
    <div className="card p-5 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-brand-400" />
          <div>
            <h3 className="font-bold text-white text-sm">Risk Timeline</h3>
            <p className="text-[11px] text-gray-500">Projected clinical deterioration</p>
          </div>
        </div>
        
        <div className="flex bg-black/40 p-1 rounded-lg border border-white/5">
          {TIME_LABELS.map((label, idx) => (
            <button
              key={label}
              onClick={() => setRawStep(idx)}
              className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition-all duration-200 ${
                rawStep === idx 
                  ? 'bg-brand-600 text-white shadow-glow' 
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="text-right">
          <p className="text-[10px] text-gray-500 uppercase flex items-center gap-1 justify-end">
            <DollarSign className="w-3 h-3" /> Est. Cost
          </p>
          <p className="text-xl font-extrabold text-brand-400 tabular-nums">
            ₹{animatedCost.toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      <div className="relative bg-black/40 rounded-2xl border border-white/5 p-4">
        <svg viewBox="0 0 456 200" className="w-full">
          {ARCH_TEETH_DATA.map((t) => {
            // Find if this tooth has an active finding
            const finding = result.findings.find(f => f.tooth_id === t.fdi);
            const color = finding ? getToothColor(finding.id) : '#2a2820';
            
            return (
              <g key={t.id}>
                <ellipse
                  cx={t.cx} cy={t.cy} rx={t.rx} ry={t.ry}
                  fill={color}
                  stroke={finding ? color : '#3a3830'}
                  className="transition-all duration-300"
                  style={{ opacity: finding ? 1 : 0.4 }}
                />
                {finding && (
                   <text x={t.cx} y={t.upper ? t.cy - 15 : t.cy + 20} textAnchor="middle" fontSize="8" fill={color} fontWeight="bold">
                    {t.fdi}
                   </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      <input 
        type="range" min="0" max="2" step="1" 
        value={rawStep} 
        onChange={(e) => setRawStep(parseInt(e.target.value))}
        className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-brand-400"
      />
      
      <div className="text-center py-2 px-4 rounded-lg bg-white/5 border border-white/10 text-xs font-bold text-brand-400">
        {stepLabel}
      </div>

      <div className="space-y-4">
        {FINDING_PROGRESSION.map(fp => (
          <div key={fp.id} className="space-y-1">
            <div className="flex justify-between text-[10px] font-bold">
              <span className="text-gray-400">Tooth {fp.tooth_fdi}: {fp.label}</span>
              <span style={{ color: getToothColor(fp.id) }}>{getScore(fp)}% Health</span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full transition-all duration-300" 
                style={{ width: `${getScore(fp)}%`, backgroundColor: getToothColor(fp.id) }} 
              />
            </div>
          </div>
        ))}
        {FINDING_PROGRESSION.length === 0 && (
          <p className="text-center text-[10px] text-gray-500 italic py-2">No active risks detected in this scan.</p>
        )}
      </div>

      {rawStep > 0 && FINDING_PROGRESSION.length > 0 && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex gap-2">
          <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
          <p className="text-[11px] text-red-200">{progressionWarning[rawStep]}</p>
        </div>
      )}
    </div>
  );
}
