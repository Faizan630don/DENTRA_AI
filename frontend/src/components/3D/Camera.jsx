/* eslint-disable react-hooks/immutability, react-refresh/only-export-components */
import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useAnimationStore } from '../../store/animationStore';

// Convert Universal notation (1-32) to FDI notation (11-48)
export function universalToFdi(universalId) {
  const num = parseInt(universalId, 10);
  if (isNaN(num) || num < 1 || num > 32) return String(universalId);

  if (num >= 1 && num <= 8) {
    return String(19 - num); // 1->18, 8->11
  }
  if (num >= 9 && num <= 16) {
    return String(12 + num); // 9->21, 16->28
  }
  if (num >= 17 && num <= 24) {
    return String(55 - num); // 17->38, 24->31
  }
  if (num >= 25 && num <= 32) {
    return String(16 + num); // 25->41, 32->48
  }
  return String(universalId);
}

// Exact mathematical layout for teeth matching Model.jsx
export function getToothPosition(toothId, explodeFactor = 0) {
  // Convert Universal notation to FDI notation if it is a Universal ID
  const fdiId = universalToFdi(toothId);
  const num = parseInt(fdiId, 10);
  if (isNaN(num)) return [0, 0, 0];

  const quadrant = Math.floor(num / 10);
  const positionIndex = num % 10;

  const isUpper = quadrant === 1 || quadrant === 2;
  let idx = 0;

  if (quadrant === 1) {
    idx = 8 - positionIndex;
  } else if (quadrant === 2) {
    idx = 7 + positionIndex;
  } else if (quadrant === 4) {
    idx = 8 - positionIndex;
  } else if (quadrant === 3) {
    idx = 7 + positionIndex;
  }

  const theta = -Math.PI / 3 + (idx * (Math.PI * 2 / 3)) / 15;
  const rx = 2.2;
  const rz = 2.2;

  let x = rx * Math.sin(theta);
  let z = rz * Math.cos(theta) - 0.8;
  let y = isUpper ? 0.6 : -0.6;

  if (explodeFactor > 0) {
    const pushX = Math.sin(theta);
    const pushZ = Math.cos(theta);
    x += pushX * explodeFactor * 0.8;
    z += pushZ * explodeFactor * 0.8;
    y += (isUpper ? 0.5 : -0.5) * explodeFactor;
  }

  return [x, y, z];
}

export default function Camera() {
  const { camera } = useThree();
  const controlsRef = useRef(null);
  
  const selectedObject = useAnimationStore((state) => state.selectedObject);
  const explodeFactor = useAnimationStore((state) => state.explodeFactor);

  useFrame((state, delta) => {
    const controls = controlsRef.current;
    if (!controls) return;

    // Adjust speed factors
    const t = 1 - Math.exp(-6 * delta);

    if (selectedObject) {
      // Focus on selected tooth
      const [tx, ty, tz] = getToothPosition(selectedObject, explodeFactor);
      
      // Calculate target camera position (close-up view)
      // Position the camera slightly outward and facing the tooth
      const normalX = tx;
      const normalZ = tz + 0.8;
      const length = Math.sqrt(normalX * normalX + normalZ * normalZ);
      
      const dirX = normalX / length;
      const dirZ = normalZ / length;

      const targetCamX = tx + dirX * 2.2;
      const targetCamY = ty + 0.3;
      const targetCamZ = tz + dirZ * 2.2;

      // Lerp camera position
      camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetCamX, t);
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetCamY, t);
      camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetCamZ, t);

      // Lerp OrbitControls target to look at the tooth
      controls.target.x = THREE.MathUtils.lerp(controls.target.x, tx, t);
      controls.target.y = THREE.MathUtils.lerp(controls.target.y, ty, t);
      controls.target.z = THREE.MathUtils.lerp(controls.target.z, tz, t);
    } else {
      // Return to default overview position
      camera.position.x = THREE.MathUtils.lerp(camera.position.x, 0, t);
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, 1.5, t);
      camera.position.z = THREE.MathUtils.lerp(camera.position.z, 7, t);

      controls.target.x = THREE.MathUtils.lerp(controls.target.x, 0, t);
      controls.target.y = THREE.MathUtils.lerp(controls.target.y, 0, t);
      controls.target.z = THREE.MathUtils.lerp(controls.target.z, -0.8, t);
    }

    controls.update();
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.05}
      maxPolarAngle={Math.PI / 1.7}
      minPolarAngle={Math.PI / 3}
      maxDistance={12}
      minDistance={2.5}
    />
  );
}
