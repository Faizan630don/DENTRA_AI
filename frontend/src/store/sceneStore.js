import { create } from 'zustand';

export const useSceneStore = create((set) => ({
  lightingIntensity: 1.0,
  ambientIntensity: 0.5,
  pointIntensity: 1.5,
  wireframe: false,
  shadows: true,
  antialias: true,
  powerPreference: 'high-performance',
  lodDetail: 'high', // 'high' | 'medium' | 'low'
  postprocessing: false,
  gridHelper: false,
  
  setLightingIntensity: (intensity) => set({ lightingIntensity: intensity }),
  setAmbientIntensity: (intensity) => set({ ambientIntensity: intensity }),
  setPointIntensity: (intensity) => set({ pointIntensity: intensity }),
  setWireframe: (wireframe) => set({ wireframe }),
  setShadows: (shadows) => set({ shadows }),
  setAntialias: (antialias) => set({ antialias }),
  setPowerPreference: (pref) => set({ powerPreference: pref }),
  setLodDetail: (detail) => set({ lodDetail: detail }),
  setPostprocessing: (enabled) => set({ postprocessing: enabled }),
  setGridHelper: (enabled) => set({ gridHelper: enabled }),
}));
