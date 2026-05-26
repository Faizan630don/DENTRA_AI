import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

function randomInSphere(numPoints, radius) {
  const points = new Float32Array(numPoints * 3);
  for (let i = 0; i < numPoints; i++) {
    const u = Math.random();
    const v = Math.random();
    const theta = u * 2.0 * Math.PI;
    const phi = Math.acos(2.0 * v - 1.0);
    const r = Math.cbrt(Math.random()) * radius;
    const sinPhi = Math.sin(phi);
    const x = r * sinPhi * Math.cos(theta);
    const y = r * sinPhi * Math.sin(theta);
    const z = r * Math.cos(phi);
    points[i * 3] = x;
    points[i * 3 + 1] = y;
    points[i * 3 + 2] = z;
  }
  return points;
}

function ParticleSwarm() {
  const ref = useRef(null);
  const groupRef = useRef(null);
  const sphere = useMemo(() => randomInSphere(3000, 1.5), []);

  useFrame((state, delta) => {
    if (ref.current && groupRef.current) {
      ref.current.rotation.x -= delta / 10;
      ref.current.rotation.y -= delta / 15;

      const mouseX = state.mouse.x * 0.5;
      const mouseY = state.mouse.y * 0.5;
      
      groupRef.current.position.x += (mouseX - groupRef.current.position.x) * 0.05;
      groupRef.current.position.y += (mouseY - groupRef.current.position.y) * 0.05;
      
      groupRef.current.rotation.x += (mouseY - groupRef.current.rotation.x) * 0.02;
      groupRef.current.rotation.y += (mouseX - groupRef.current.rotation.y) * 0.02;
    }
  });

  return (
    <group ref={groupRef} rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={sphere} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#ffffff"
          size={0.015}
          sizeAttenuation={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </Points>
    </group>
  );
}

function GlowingCore() {
  const meshRef = useRef(null);
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.2;
      meshRef.current.rotation.y += delta * 0.3;
    }
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[0.8, 1]} />
        <meshStandardMaterial 
          color="#a78bfa" 
          wireframe 
          emissive="#6d28d9" 
          emissiveIntensity={2} 
        />
      </mesh>
    </Float>
  );
}

export default function Hero3D() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none opacity-50">
      <Canvas camera={{ position: [0, 0, 4], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#c4b5fd" />
        <ParticleSwarm />
        <GlowingCore />
      </Canvas>
    </div>
  );
}
