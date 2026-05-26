import { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const particleCount = 100;
const maxDistance = 1.2;

// Initialize particles once at the module level to keep render functions pure
const STATIC_PARTICLES = new Float32Array(particleCount * 3);
for (let i = 0; i < particleCount; i++) {
  STATIC_PARTICLES[i * 3] = (Math.random() - 0.5) * 8;
  STATIC_PARTICLES[i * 3 + 1] = (Math.random() - 0.5) * 8;
  STATIC_PARTICLES[i * 3 + 2] = (Math.random() - 0.5) * 8;
}

// Pre-allocate line positions and colors at module level
const linePositions = new Float32Array(particleCount * particleCount * 3);
const lineColors = new Float32Array(particleCount * particleCount * 3);

function Network() {
  const pointsRef = useRef(null);
  const linesRef = useRef(null);
  const groupRef = useRef(null);

  // Set line geometry attributes on mount using standard Three.js
  useEffect(() => {
    if (linesRef.current) {
      const geom = linesRef.current.geometry;
      geom.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
      geom.setAttribute('color', new THREE.BufferAttribute(lineColors, 3));
    }
  }, []);

  useFrame((state, delta) => {
    if (!pointsRef.current || !linesRef.current || !groupRef.current) return;
    
    const mouseX = state.mouse.x * 2;
    const mouseY = state.mouse.y * 2;
    
    groupRef.current.position.x += (mouseX - groupRef.current.position.x) * 0.05;
    groupRef.current.position.y += (mouseY - groupRef.current.position.y) * 0.05;
    
    groupRef.current.rotation.y += delta * 0.05 + (mouseX * 0.01);
    groupRef.current.rotation.x += delta * 0.02 - (mouseY * 0.01);

    let vertexpos = 0;
    let colorpos = 0;
    let numConnected = 0;

    const positionsArray = pointsRef.current.geometry.attributes.position.array;

    for (let i = 0; i < particleCount; i++) {
      for (let j = i + 1; j < particleCount; j++) {
        const dx = positionsArray[i * 3] - positionsArray[j * 3];
        const dy = positionsArray[i * 3 + 1] - positionsArray[j * 3 + 1];
        const dz = positionsArray[i * 3 + 2] - positionsArray[j * 3 + 2];
        const distSq = dx * dx + dy * dy + dz * dz;

        if (distSq < maxDistance * maxDistance) {
          const alpha = 1.0 - Math.sqrt(distSq) / maxDistance;

          linePositions[vertexpos++] = positionsArray[i * 3];
          linePositions[vertexpos++] = positionsArray[i * 3 + 1];
          linePositions[vertexpos++] = positionsArray[i * 3 + 2];

          linePositions[vertexpos++] = positionsArray[j * 3];
          linePositions[vertexpos++] = positionsArray[j * 3 + 1];
          linePositions[vertexpos++] = positionsArray[j * 3 + 2];

          lineColors[colorpos++] = alpha;
          lineColors[colorpos++] = alpha;
          lineColors[colorpos++] = alpha;

          lineColors[colorpos++] = alpha;
          lineColors[colorpos++] = alpha;
          lineColors[colorpos++] = alpha;

          numConnected++;
        }
      }
    }

    linesRef.current.geometry.setDrawRange(0, numConnected * 2);
    linesRef.current.geometry.attributes.position.needsUpdate = true;
    linesRef.current.geometry.attributes.color.needsUpdate = true;
  });

  return (
    <group ref={groupRef}>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particleCount}
            array={STATIC_PARTICLES}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.06}
          color="#ffffff"
          transparent
          opacity={0.8}
          sizeAttenuation
        />
      </points>
      <lineSegments ref={linesRef}>
        <bufferGeometry />
        <lineBasicMaterial
          vertexColors
          transparent
          opacity={0.3}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>
    </group>
  );
}

export default function NeuralNetwork3D() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none opacity-50 bg-[#020617]">
      <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
        <fog attach="fog" args={['#020617', 2, 10]} />
        <Network />
      </Canvas>
    </div>
  );
}
