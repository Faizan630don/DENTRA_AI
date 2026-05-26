import * as THREE from 'three';

// Frame-based interpolation helpers for smooth lerping
export function useFrameHelpers() {
  /**
   * Smoothly interpolates (lerps) a Three.js Vector3 or Euler rotation to a target value.
   * Should be called within R3F's useFrame loop.
   */
  const lerpVector = (current, target, alpha = 0.1, delta = 0.016) => {
    if (!current || !target) return;
    
    // Scale alpha by frame delta time to ensure consistent animation speeds across refresh rates (60Hz vs 144Hz)
    const adjustedAlpha = Math.min(1, alpha * (delta / 0.016));
    
    current.x = THREE.MathUtils.lerp(current.x, target[0] ?? target.x ?? 0, adjustedAlpha);
    current.y = THREE.MathUtils.lerp(current.y, target[1] ?? target.y ?? 0, adjustedAlpha);
    current.z = THREE.MathUtils.lerp(current.z, target[2] ?? target.z ?? 0, adjustedAlpha);
  };

  /**
   * Smoothly rotates an object around a specified axis continuously.
   */
  const rotateObject = (mesh, axis = 'y', speed = 0.5, delta = 0.016) => {
    if (!mesh) return;
    mesh.rotation[axis] += speed * delta;
  };

  /**
   * Pulsates scale of a mesh using a sine wave based on elapsed time.
   */
  const pulseObject = (mesh, baseScale = 1, amplitude = 0.1, frequency = 2, elapsedTime = 0) => {
    if (!mesh) return;
    const scale = baseScale + Math.sin(elapsedTime * frequency) * amplitude;
    mesh.scale.set(scale, scale, scale);
  };

  return {
    lerpVector,
    rotateObject,
    pulseObject
  };
}
