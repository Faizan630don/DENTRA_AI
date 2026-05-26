import { useEffect, useState } from 'react';
import { Activity } from 'lucide-react';

const STEPS = [
  'Reading X-Ray file...',
  'Initializing YOLO inference engine...',
  'Detecting caries, bone loss, and periapical lesions...',
  'Spinning up Multi-Agent Second Opinion checkers...',
  'Synthesizing clinical report and translations...',
  'Rendering diagnostics...'
];

export default function LoadingScreen({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Increment progress bar
    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressTimer);
          return 100;
        }
        return prev + 1;
      });
    }, 30);

    // Rotate messages
    const messageTimer = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < STEPS.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 550);

    return () => {
      clearInterval(progressTimer);
      clearInterval(messageTimer);
    };
  }, []);

  useEffect(() => {
    if (progress === 100 && onComplete) {
      const finishTimer = setTimeout(() => {
        onComplete();
      }, 300);
      return () => clearTimeout(finishTimer);
    }
  }, [progress, onComplete]);

  return (
    <div className="fixed inset-0 z-50 bg-[#020617] flex flex-col items-center justify-center p-6 select-none overflow-hidden">
      {/* Holographic Laser Grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none opacity-40" />
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent shadow-[0_0_20px_#6366f1] animate-laser-scan pointer-events-none" />

      <div className="max-w-md w-full flex flex-col items-center relative z-10">
        {/* Animated Scanner Ring */}
        <div className="relative w-28 h-28 mb-8 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
          <div className="absolute inset-2 rounded-full border border-blue-400/20 border-b-blue-400 animate-spin-reverse" />
          <div className="w-14 h-14 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center text-indigo-400 shadow-lg">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
        </div>

        {/* Diagnosis Titles */}
        <h1 className="text-xl font-extrabold text-white tracking-tight text-center mb-1">
          DentalVision AI
        </h1>
        <p className="text-xs text-indigo-300 font-semibold uppercase tracking-wider mb-6 text-center">
          Autonomous Clinical Diagnosis
        </p>

        {/* Diagnostic Steps logs */}
        <div className="w-full bg-slate-950/70 border border-white/5 rounded-xl px-4 py-3.5 mb-6 shadow-inner h-24 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-1.5 text-xs text-indigo-400 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
            <span>AI Status Report</span>
          </div>
          <p className="text-xs text-gray-300 font-mono transition-opacity duration-200">
            &gt; {STEPS[currentStep]}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-900 border border-white/10 rounded-full h-2.5 overflow-hidden p-0.5 shadow-md">
          <div 
            className="bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 h-full rounded-full transition-all duration-100 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex justify-between w-full mt-2 text-[10px] text-gray-500 font-bold uppercase tracking-wider">
          <span>Triage Audit</span>
          <span className="text-indigo-400">{progress}%</span>
        </div>
      </div>
    </div>
  );
}
