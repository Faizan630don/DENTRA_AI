import { useRef, useMemo, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useAnimationStore } from '../../store/animationStore';
import { useSceneStore } from '../../store/sceneStore';
import { useApp } from '../../context/AppContext';
import { getToothPosition } from './Camera';

// FDI teeth coordinates definitions
const UPPER_TEETH = [
  '1', '2', '3', '4', '5', '6', '7', '8',
  '9', '10', '11', '12', '13', '14', '15', '16'
];

const LOWER_TEETH = [
  '32', '31', '30', '29', '28', '27', '26', '25',
  '24', '23', '22', '21', '20', '19', '18', '17'
];

function Tooth({ id, position, finding, isSelected, onSelect }) {
  const meshRef = useRef(null);
  const groupRef = useRef(null);
  const hoverRef = useRef(false);
  const elapsedTimeRef = useRef(0);

  const wireframe = useSceneStore((state) => state.wireframe);

  // Calculate base color and glowing characteristics based on finding triage
  let toothColor = '#f3f4f6'; // Healthy tooth color
  let emissiveColor = '#000000';
  const hasFinding = !!finding;

  if (hasFinding) {
    if (finding.triage === 'RED') {
      toothColor = '#fee2e2'; // Light red
      emissiveColor = '#ef4444'; // Red glow
    } else if (finding.triage === 'YELLOW') {
      toothColor = '#fef3c7'; // Light yellow
      emissiveColor = '#f59e0b'; // Amber glow
    } else {
      toothColor = '#dcfce7'; // Light green
      emissiveColor = '#10b981'; // Green glow
    }
  }

  // Update scale and emissive intensity in R3F frame loop
  useFrame((state, delta) => {
    elapsedTimeRef.current += delta;
    const elapsedTime = elapsedTimeRef.current;
    const isHovered = hoverRef.current;
    const targetScale = isSelected ? 1.35 : isHovered ? 1.18 : 1.0;

    // 1. Smoothly lerp scale for natural bouncy feel
    if (groupRef.current) {
      const t = 1 - Math.exp(-12 * delta);
      const currentScale = groupRef.current.scale.x;
      const nextScale = THREE.MathUtils.lerp(currentScale, targetScale, t);
      groupRef.current.scale.set(nextScale, nextScale, nextScale);
    }

    // 2. Animate emissive pulse
    if (meshRef.current && meshRef.current.material) {
      const mat = meshRef.current.material;
      if (hasFinding) {
        const pulse = 0.5 + Math.sin(elapsedTime * 4.5) * 0.45;
        if (mat.emissiveIntensity !== undefined) {
          mat.emissiveIntensity = pulse * 1.8;
        }
      } else if (isSelected) {
        const pulse = 0.6 + Math.sin(elapsedTime * 6) * 0.4;
        if (mat.emissiveIntensity !== undefined) {
          mat.emissiveIntensity = pulse;
        }
      } else {
        if (mat.emissiveIntensity !== undefined) {
          mat.emissiveIntensity = isHovered ? 0.3 : 0.0;
        }
      }
    }
  });

  const numId = parseInt(id, 10);
  const isUpper = numId >= 1 && numId <= 16;

  return (
    <group
      ref={groupRef}
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(id);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        hoverRef.current = true;
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        hoverRef.current = false;
        document.body.style.cursor = 'default';
      }}
    >
      <mesh ref={meshRef} castShadow receiveShadow>
        {/* Crown - Main tooth portion */}
        <cylinderGeometry args={[0.13, 0.16, 0.45, 12, 1, false]} />
        <meshStandardMaterial
          roughness={0.15}
          metalness={0.08}
          color={isSelected ? '#60a5fa' : toothColor}
          emissive={isSelected ? '#3b82f6' : emissiveColor}
          emissiveIntensity={0}
          wireframe={wireframe}
        />
      </mesh>
      
      {/* Root portion of tooth - points away from biting edge */}
      <mesh position={[0, isUpper ? 0.35 : -0.35, 0]} rotation={[isUpper ? 0 : Math.PI, 0, 0]}>
        <coneGeometry args={[0.12, 0.35, 8]} />
        <meshStandardMaterial
          roughness={0.4}
          metalness={0.02}
          color={isSelected ? '#3b82f6' : toothColor}
          opacity={0.7}
          transparent
          wireframe={wireframe}
        />
      </mesh>
    </group>
  );
}

// Procedural arches gums (parabolic curves)
function GumsCurve({ isUpper, explodeFactor }) {
  const wireframe = useSceneStore((state) => state.wireframe);

  const curve = useMemo(() => {
    const points = [];
    const teethList = isUpper ? UPPER_TEETH : LOWER_TEETH;
    
    teethList.forEach((id) => {
      const [x, y, z] = getToothPosition(id, explodeFactor);
      points.push(new THREE.Vector3(x, y - (isUpper ? 0.15 : -0.15), z));
    });

    return new THREE.CatmullRomCurve3(points);
  }, [isUpper, explodeFactor]);

  return (
    <mesh>
      <tubeGeometry args={[curve, 64, 0.18, 8, false]} />
      <meshStandardMaterial
        color="#371c22"
        transparent
        opacity={0.3}
        roughness={0.6}
        wireframe={wireframe}
      />
    </mesh>
  );
}

export default function Model() {
  const { scanResult, setSelectedFinding } = useApp();
  const selectedObject = useAnimationStore((state) => state.selectedObject);
  const setSelectedObject = useAnimationStore((state) => state.setSelectedObject);
  const rotateJaw = useAnimationStore((state) => state.rotateJaw);
  const explodeFactor = useAnimationStore((state) => state.explodeFactor);
  const showUpperJaw = useAnimationStore((state) => state.showUpperJaw);
  const showLowerJaw = useAnimationStore((state) => state.showLowerJaw);

  const modelRef = useRef(null);

  // Slow model rotation when activated
  useFrame((state, delta) => {
    if (modelRef.current && rotateJaw && !selectedObject) {
      modelRef.current.rotation.y += delta * 0.18;
    }
  });

  const handleToothSelect = useCallback((id) => {
    // Set selected tooth in state
    const newSelected = selectedObject === id ? null : id;
    setSelectedObject(newSelected);
    
    // Set active finding in app context
    if (scanResult) {
      const matchedFinding = scanResult.findings.find(f => f.tooth_id === id);
      setSelectedFinding(matchedFinding || null);
    }
  }, [selectedObject, setSelectedObject, scanResult, setSelectedFinding]);

  return (
    <group ref={modelRef} rotation={[0.1, 0, 0]}>
      {/* Upper Jaw Gums and Teeth */}
      {showUpperJaw && (
        <group>
          <GumsCurve isUpper={true} explodeFactor={explodeFactor} />
          {UPPER_TEETH.map((id) => {
            const pos = getToothPosition(id, explodeFactor);
            const finding = scanResult?.findings?.find(f => f.tooth_id === id);
            return (
              <Tooth
                key={id}
                id={id}
                position={pos}
                finding={finding}
                isSelected={selectedObject === id}
                onSelect={handleToothSelect}
              />
            );
          })}
        </group>
      )}

      {/* Lower Jaw Gums and Teeth */}
      {showLowerJaw && (
        <group>
          <GumsCurve isUpper={false} explodeFactor={explodeFactor} />
          {LOWER_TEETH.map((id) => {
            const pos = getToothPosition(id, explodeFactor);
            const finding = scanResult?.findings?.find(f => f.tooth_id === id);
            return (
              <Tooth
                key={id}
                id={id}
                position={pos}
                finding={finding}
                isSelected={selectedObject === id}
                onSelect={handleToothSelect}
              />
            );
          })}
        </group>
      )}
    </group>
  );
}
