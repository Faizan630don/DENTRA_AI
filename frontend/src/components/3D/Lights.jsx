import { useRef } from 'react';
import { useThreeScene } from '../../hooks/useThreeScene';

export default function Lights() {
  const { ambientIntensity, pointIntensity, shadows } = useThreeScene();
  const dirLightRef = useRef(null);

  return (
    <>
      {/* Soft ambient environment light */}
      <ambientLight intensity={ambientIntensity} />
      
      {/* Key directional light to establish form and shadows */}
      <directionalLight
        ref={dirLightRef}
        position={[5, 10, 5]}
        intensity={1.2}
        castShadow={shadows}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      
      {/* Dynamic point lights for glowing accents */}
      <pointLight 
        position={[-10, 5, -10]} 
        intensity={pointIntensity * 0.5} 
        color="#a78bfa" 
      />
      <pointLight 
        position={[10, -5, 10]} 
        intensity={pointIntensity * 0.7} 
        color="#60a5fa" 
      />
      
      {/* Front fill light */}
      <pointLight 
        position={[0, 0, 8]} 
        intensity={0.8} 
        color="#ffffff" 
      />
    </>
  );
}
