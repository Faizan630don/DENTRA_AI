import { Suspense, Component, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';
import Camera from './Camera';
import Lights from './Lights';
import Model from './Model';
import { useSceneStore } from '../../store/sceneStore';

// Simple Error Boundary component for Three.js Canvas issues
class CanvasErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ThreeJS Canvas Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center p-6 bg-slate-900 border border-white/10 rounded-xl overflow-auto">
          <p className="text-red-400 font-bold mb-2">3D View Temporarily Unavailable</p>
          <p className="text-xs text-red-300 font-mono max-w-lg mb-2 text-left bg-black/50 p-3 rounded border border-red-500/20 whitespace-pre-wrap">
            {this.state.error?.message || String(this.state.error)}
          </p>
          <p className="text-[10px] text-gray-500 max-w-lg text-left font-mono bg-black/30 p-2 rounded max-h-48 overflow-y-auto whitespace-pre-wrap">
            {this.state.error?.stack}
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

const PARTICLE_COUNT = 400;

// Initialize background particle positions statically at the module level to ensure purity during render
const STATIC_PARTICLE_POSITIONS = new Float32Array(PARTICLE_COUNT * 3);
for (let i = 0; i < PARTICLE_COUNT; i++) {
  STATIC_PARTICLE_POSITIONS[i * 3] = (Math.random() - 0.5) * 8;
  STATIC_PARTICLE_POSITIONS[i * 3 + 1] = (Math.random() - 0.5) * 8;
  STATIC_PARTICLE_POSITIONS[i * 3 + 2] = (Math.random() - 0.5) * 8;
}

// Particle Swarm background for high-end aesthetic
function BackgroundParticles() {
  const ref = useRef(null);

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.03;
      ref.current.rotation.x += delta * 0.02;
    }
  });

  return (
    <Points ref={ref} positions={STATIC_PARTICLE_POSITIONS} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#a78bfa"
        size={0.035}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        opacity={0.35}
      />
    </Points>
  );
}

export default function Scene() {
  const antialias = useSceneStore((state) => state.antialias);
  const powerPreference = useSceneStore((state) => state.powerPreference);

  const glConfig = useMemo(() => ({ antialias, powerPreference }), [antialias, powerPreference]);
  const cameraConfig = useMemo(() => ({ position: [0, 1.5, 7], fov: 45 }), []);
  const shadowsConfig = useMemo(() => ({ type: THREE.PCFShadowMap }), []);

  return (
    <CanvasErrorBoundary>
      <div className="w-full h-full relative bg-slate-950/90 rounded-xl border border-white/5 shadow-inner overflow-hidden">
        {/* Cinematic styling and grid */}
        <div className="absolute inset-0 bg-radial-gradient pointer-events-none z-10 opacity-30" />
        
        <Canvas
          shadows={shadowsConfig}
          gl={glConfig}
          camera={cameraConfig}
          className="w-full h-full"
        >
          <Suspense fallback={null}>
            {/* Color matching ambient environment */}
            <color attach="background" args={['#070a13']} />
            
            {/* Soft fog for depth perception */}
            <fog attach="fog" args={['#070a13', 5, 12]} />
            
            <BackgroundParticles />
            <Lights />
            <Model />
            <Camera />
          </Suspense>
        </Canvas>
      </div>
    </CanvasErrorBoundary>
  );
}
