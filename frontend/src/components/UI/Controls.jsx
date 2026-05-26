import { useAnimationStore } from '../../store/animationStore';
import { useSceneStore } from '../../store/sceneStore';
import { 
  RotateCcw, 
  Compass, 
  Layers, 
  Eye, 
  EyeOff, 
  Grid
} from 'lucide-react';

export default function Controls() {
  const rotateJaw = useAnimationStore((state) => state.rotateJaw);
  const setRotateJaw = useAnimationStore((state) => state.setRotateJaw);
  const explodeFactor = useAnimationStore((state) => state.explodeFactor);
  const setExplodeFactor = useAnimationStore((state) => state.setExplodeFactor);
  const showUpperJaw = useAnimationStore((state) => state.showUpperJaw);
  const setShowUpperJaw = useAnimationStore((state) => state.setShowUpperJaw);
  const showLowerJaw = useAnimationStore((state) => state.showLowerJaw);
  const setShowLowerJaw = useAnimationStore((state) => state.setShowLowerJaw);
  const selectedObject = useAnimationStore((state) => state.selectedObject);
  const resetAnimations = useAnimationStore((state) => state.resetAnimations);

  const wireframe = useSceneStore((state) => state.wireframe);
  const setWireframe = useSceneStore((state) => state.setWireframe);

  return (
    <div className="absolute bottom-4 left-4 right-4 z-20 pointer-events-none flex flex-wrap justify-between gap-4">
      {/* 3D Scene Manipulation Tools */}
      <div className="flex items-center gap-2 bg-slate-950/80 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/10 shadow-lg pointer-events-auto self-end">
        {/* Slow Rotation Toggle */}
        <button
          onClick={() => setRotateJaw(!rotateJaw)}
          className={`p-2 rounded-lg transition-colors ${
            rotateJaw ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-400/40' : 'text-gray-400 hover:bg-white/5 border border-transparent'
          }`}
          title="Toggle Auto Rotation"
        >
          <Compass className="w-4 h-4 animate-spin-slow" />
        </button>

        {/* Explode Jaw Toggle (Explode Factor 0 or 0.8) */}
        <button
          onClick={() => setExplodeFactor(explodeFactor > 0 ? 0 : 0.8)}
          className={`p-2 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-semibold ${
            explodeFactor > 0 ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-400/40' : 'text-gray-400 hover:bg-white/5 border border-transparent'
          }`}
          title="Exploded Teeth View"
        >
          <Layers className="w-4 h-4" />
          <span>Exploded View</span>
        </button>

        {/* Wireframe View */}
        <button
          onClick={() => setWireframe(!wireframe)}
          className={`p-2 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-semibold ${
            wireframe ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-400/40' : 'text-gray-400 hover:bg-white/5 border border-transparent'
          }`}
          title="Toggle Wireframe Mode"
        >
          <Grid className="w-4 h-4" />
          <span>Wireframe</span>
        </button>
      </div>

      {/* Jaw Filters and Reset View */}
      <div className="flex items-center gap-2 bg-slate-950/80 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/10 shadow-lg pointer-events-auto self-end ml-auto">
        {/* Toggle Upper Jaw */}
        <button
          onClick={() => setShowUpperJaw(!showUpperJaw)}
          className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all flex items-center gap-1.5 ${
            showUpperJaw 
              ? 'bg-slate-800 text-white border-white/20' 
              : 'bg-transparent text-gray-500 border-white/5 hover:border-white/10'
          }`}
        >
          {showUpperJaw ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          <span>Upper Jaw</span>
        </button>

        {/* Toggle Lower Jaw */}
        <button
          onClick={() => setShowLowerJaw(!showLowerJaw)}
          className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all flex items-center gap-1.5 ${
            showLowerJaw 
              ? 'bg-slate-800 text-white border-white/20' 
              : 'bg-transparent text-gray-500 border-white/5 hover:border-white/10'
          }`}
        >
          {showLowerJaw ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          <span>Lower Jaw</span>
        </button>

        {/* Reset Camera & Selection */}
        {(selectedObject || explodeFactor > 0 || !rotateJaw || wireframe) && (
          <button
            onClick={() => {
              resetAnimations();
              setWireframe(false);
            }}
            className="p-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-all flex items-center gap-1.5 text-xs font-bold"
            title="Reset View"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        )}
      </div>
    </div>
  );
}
