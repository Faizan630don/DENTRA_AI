import { useSceneStore } from '../store/sceneStore';

export function useThreeScene() {
  const wireframe = useSceneStore((state) => state.wireframe);
  const shadows = useSceneStore((state) => state.shadows);
  const antialias = useSceneStore((state) => state.antialias);
  const powerPreference = useSceneStore((state) => state.powerPreference);
  const lodDetail = useSceneStore((state) => state.lodDetail);
  const postprocessing = useSceneStore((state) => state.postprocessing);
  const lightingIntensity = useSceneStore((state) => state.lightingIntensity);
  const ambientIntensity = useSceneStore((state) => state.ambientIntensity);
  const pointIntensity = useSceneStore((state) => state.pointIntensity);

  const setWireframe = useSceneStore((state) => state.setWireframe);
  const setShadows = useSceneStore((state) => state.setShadows);
  const setLodDetail = useSceneStore((state) => state.setLodDetail);
  const setLightingIntensity = useSceneStore((state) => state.setLightingIntensity);

  // Return configurations and control handlers
  return {
    wireframe,
    shadows,
    antialias,
    powerPreference,
    lodDetail,
    postprocessing,
    lightingIntensity,
    ambientIntensity,
    pointIntensity,
    setWireframe,
    setShadows,
    setLodDetail,
    setLightingIntensity,
  };
}
