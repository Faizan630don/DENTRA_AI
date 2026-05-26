import { useEffect, useState } from 'react';

export default function DentalAgeClock({ biologicalAge, dentalAge }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const diff = dentalAge - biologicalAge;
  let status = 'good';
  let outerColor = '#10b981'; // green
  let statusPillColor = 'bg-emerald-950/60 text-emerald-400 border-emerald-800/50';

  if (diff > 5) {
    status = 'critical';
    outerColor = '#ef4444'; // red
    statusPillColor = 'bg-red-950/60 text-red-400 border-red-800/50';
  } else if (diff >= 2) {
    status = 'warning';
    outerColor = '#f59e0b'; // amber
    statusPillColor = 'bg-amber-950/60 text-amber-400 border-amber-800/50';
  }

  const innerColor = '#0ea5e9'; // blue

  const outerR = 80;
  const innerR = 55;
  const outerCirc = 2 * Math.PI * outerR;
  const innerCirc = 2 * Math.PI * innerR;

  const maxAge = 100;
  const outerOffset = mounted ? outerCirc - (dentalAge / maxAge) * outerCirc : outerCirc;
  const innerOffset = mounted ? innerCirc - (biologicalAge / maxAge) * innerCirc : innerCirc;

  let headline;
  let subtext;
  let subtextColor;

  if (diff > 0) {
    headline = `Your teeth are ${diff} years older than you.`;
    subtext = 'Early intervention can reverse this.';
    subtextColor = status === 'critical' ? 'text-red-400' : 'text-amber-400';
  } else if (diff === 0 || diff === -1) {
    headline = 'Your teeth match your age — great hygiene!';
    subtext = 'Keep up your current routine.';
    subtextColor = 'text-emerald-400';
  } else {
    headline = 'Your teeth are younger than you — excellent!';
    subtext = "You're in the top 15% of dental health.";
    subtextColor = 'text-emerald-400';
  }

  const rawScore = 100 - (diff * 8);
  const score = Math.max(0, Math.min(100, rawScore));
  let barColor = 'bg-emerald-500';
  if (score < 40) barColor = 'bg-red-500';
  else if (score <= 70) barColor = 'bg-amber-500';

  return (
    <div className="bg-[#1e293b] rounded-xl p-6 flex flex-col items-center text-center">
      <div className="relative w-48 h-48 mb-6">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r={outerR} fill="none" stroke="#334155" strokeWidth="10" />
          <circle cx="100" cy="100" r={innerR} fill="none" stroke="#334155" strokeWidth="8" />
          
          <circle 
            cx="100" cy="100" r={outerR} fill="none" stroke={outerColor} strokeWidth="10"
            strokeDasharray={outerCirc} strokeDashoffset={outerOffset} strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1.5s ease-out' }}
          />
          <circle 
            cx="100" cy="100" r={innerR} fill="none" stroke={innerColor} strokeWidth="8"
            strokeDasharray={innerCirc} strokeDashoffset={innerOffset} strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1.5s ease-out' }}
          />
        </svg>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-1">
          <span className="text-[28px] font-bold text-white leading-none mb-1">{dentalAge}</span>
          <span className="text-[10px] text-gray-400 uppercase tracking-wider">Dental Age</span>
        </div>
      </div>

      <div className="flex gap-4 justify-center mb-6">
        <div className={`px-3 py-1.5 rounded-full border text-xs font-semibold flex items-center gap-1.5 ${statusPillColor}`}>
          <span>🦷</span> Dental Age: {dentalAge}
        </div>
        <div className="px-3 py-1.5 rounded-full border bg-sky-950/60 text-sky-400 border-sky-800/50 text-xs font-semibold flex items-center gap-1.5">
          <span>👤</span> Biological Age: {biologicalAge}
        </div>
      </div>

      <div className="mb-6 space-y-1">
        <h3 className="text-lg font-bold text-white leading-tight">{headline}</h3>
        <p className={`text-sm font-medium ${subtextColor}`}>{subtext}</p>
      </div>

      <div className="w-full max-w-[280px]">
        <div className="flex justify-between text-xs font-bold text-gray-300 mb-2">
          <span>Dental Health Score: {score}/100</span>
        </div>
        <div className="h-2.5 bg-surface-raised rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full ${barColor}`}
            style={{ 
              width: mounted ? `${score}%` : '0%',
              transition: 'width 1.5s ease-out' 
            }}
          />
        </div>
      </div>
    </div>
  );
}
