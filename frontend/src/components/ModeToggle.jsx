import { Stethoscope, User } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function ModeToggle() {
  const { mode, setMode } = useApp();
  const isDentist = mode === 'dentist';

  return (
    <div className="flex items-center gap-2 shrink-0">
      <span className={`text-xs font-medium transition-colors ${!isDentist ? 'text-brand-300' : 'text-gray-500'}`}>
        <User className="w-3.5 h-3.5 inline mr-1" />
        Patient
      </span>

      <button
        role="switch"
        aria-checked={isDentist}
        onClick={() => setMode(isDentist ? 'patient' : 'dentist')}
        className={`relative w-11 h-6 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-brand-600/50 ${isDentist ? 'bg-brand-600' : 'bg-surface-raised border border-surface-border'
          }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-300 ${isDentist ? 'translate-x-5' : 'translate-x-0'
            }`}
        />
      </button>

      <span className={`text-xs font-medium transition-colors ${isDentist ? 'text-brand-300' : 'text-gray-500'}`}>
        <Stethoscope className="w-3.5 h-3.5 inline mr-1" />
        Dentist
      </span>
    </div>
  );
}
