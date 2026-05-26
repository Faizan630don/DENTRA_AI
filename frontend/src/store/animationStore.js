import { create } from 'zustand';

export const useAnimationStore = create((set) => ({
  activeScene: 'viewer',
  isAnimating: false,
  cameraPosition: [0, 0, 8],
  selectedObject: null, // represents selected tooth ID, e.g. '36'
  animationQueue: [],
  explodeFactor: 0, // controls exploded view separation (0 = closed, 1 = fully exploded)
  rotateJaw: true, // controls continuous slow rotation of the 3D model
  showUpperJaw: true,
  showLowerJaw: true,

  setActiveScene: (scene) => set({ activeScene: scene }),
  
  setIsAnimating: (animating) => set({ isAnimating: animating }),
  
  setCameraPosition: (position) => set({ cameraPosition: position }),
  
  setSelectedObject: (objectId) => set({ selectedObject: objectId }),
  
  playAnimation: (animId) => {
    set({ isAnimating: true });
    // Trigger specific animations based on ID
    console.log(`Playing animation: ${animId}`);
    setTimeout(() => {
      set({ isAnimating: false });
    }, 1000); // generic timeout to reset animation status
  },
  
  queueAnimation: (anim) => set((state) => ({ 
    animationQueue: [...state.animationQueue, anim] 
  })),
  
  dequeueAnimation: () => set((state) => {
    const rest = state.animationQueue.slice(1);
    return { animationQueue: rest };
  }),
  
  resetAnimations: () => set({
    isAnimating: false,
    cameraPosition: [0, 0, 8],
    selectedObject: null,
    animationQueue: [],
    explodeFactor: 0,
    rotateJaw: true,
    showUpperJaw: true,
    showLowerJaw: true
  }),

  setExplodeFactor: (factor) => set({ explodeFactor: factor }),
  
  setRotateJaw: (rotate) => set({ rotateJaw: rotate }),
  
  setShowUpperJaw: (show) => set({ showUpperJaw: show }),
  
  setShowLowerJaw: (show) => set({ showLowerJaw: show }),
}));
