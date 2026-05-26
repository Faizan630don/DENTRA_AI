import { useApp } from '../../context/AppContext';
import { useAnimationStore } from '../../store/animationStore';
import { getToothClinicalName } from '../../utils/dataValidator';
import { Shield, ShieldAlert, Sparkles, Activity } from 'lucide-react';

export default function Header() {
  const { scanResult } = useApp();
  const selectedObject = useAnimationStore((state) => state.selectedObject);

  // Find findings for the selected tooth
  const toothFinding = scanResult?.findings?.find(f => f.tooth_id === selectedObject);
  const clinicalName = selectedObject ? getToothClinicalName(selectedObject) : null;

  return (
    <div className="absolute top-4 left-4 right-4 z-20 pointer-events-none flex flex-col md:flex-row justify-between gap-4">
      {/* Platform Title HUD */}
      <div className="bg-slate-950/80 backdrop-blur-md px-4 py-3 rounded-xl border border-white/10 shadow-lg pointer-events-auto flex items-center gap-3 self-start">
        <div className="w-8 h-8 rounded-lg bg-indigo-500/25 border border-indigo-400/30 flex items-center justify-center text-indigo-400">
          <Activity className="w-4 h-4 animate-pulse" />
        </div>
        <div>
          <h2 className="text-xs font-bold text-white tracking-wide uppercase">DentalVision 3D</h2>
          <p className="text-[10px] text-indigo-300">Interactive Diagnosis Simulator</p>
        </div>
      </div>

      {/* Selected Tooth Diagnostics HUD */}
      {selectedObject && (
        <div className="bg-slate-950/85 backdrop-blur-md px-5 py-3.5 rounded-xl border border-white/10 shadow-lg pointer-events-auto flex flex-col gap-2 max-w-sm self-start md:self-auto ml-auto transition-all duration-300 animate-slide-in">
          <div className="flex items-center justify-between gap-6 border-b border-white/10 pb-2">
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Selected Tooth</span>
              <span className="text-sm font-bold text-white">Tooth {selectedObject}</span>
            </div>
            <span className="text-xs font-medium text-indigo-400 bg-indigo-950/40 border border-indigo-800/40 px-2 py-0.5 rounded">
              {clinicalName}
            </span>
          </div>

          {toothFinding ? (
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                {toothFinding.triage === 'RED' ? (
                  <ShieldAlert className="w-4 h-4 text-red-400" />
                ) : (
                  <Shield className="w-4 h-4 text-amber-400" />
                )}
                <span className="text-xs font-bold text-white">{toothFinding.condition}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                  toothFinding.triage === 'RED' 
                    ? 'bg-red-950/50 border-red-800/50 text-red-300' 
                    : 'bg-amber-950/50 border-amber-800/50 text-amber-300'
                }`}>
                  {toothFinding.triage}
                </span>
              </div>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                {toothFinding.explanation || "A dental diagnostic finding requires attention. Click 'View Report' to read details."}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] text-gray-500 font-semibold">AI Confidence:</span>
                <span className="text-[10px] text-indigo-400 font-bold">{Math.round(toothFinding.confidence * 100)}%</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-emerald-400">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold">Healthy Tooth</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
