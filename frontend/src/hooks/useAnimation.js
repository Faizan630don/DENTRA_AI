import { useEffect } from 'react';
import gsap from 'gsap';
import { useAnimationStore } from '../store/animationStore';
const config = {
  wobbly: { tension: 180, friction: 12 },
  gentle: { tension: 120, friction: 14 },
  stiff: { tension: 210, friction: 20 },
  default: { tension: 170, friction: 26 }
};

export function useAnimation() {
  const isAnimating = useAnimationStore((state) => state.isAnimating);
  const setIsAnimating = useAnimationStore((state) => state.setIsAnimating);
  const animationQueue = useAnimationStore((state) => state.animationQueue);
  const dequeueAnimation = useAnimationStore((state) => state.dequeueAnimation);

  // Process the animation queue sequentially
  useEffect(() => {
    if (animationQueue.length > 0 && !isAnimating) {
      const nextAnimation = animationQueue[0];
      dequeueAnimation();
      
      if (nextAnimation && typeof nextAnimation.run === 'function') {
        setIsAnimating(true);
        Promise.resolve(nextAnimation.run()).finally(() => {
          setIsAnimating(false);
        });
      }
    }
  }, [animationQueue, isAnimating, dequeueAnimation, setIsAnimating]);

  // Spring physics preset mapper
  const getSpringPreset = (type) => {
    switch (type) {
      case 'bouncy':
        return config.wobbly;
      case 'smooth':
        return config.gentle;
      case 'fast':
        return config.stiff;
      default:
        return config.default;
    }
  };

  // Helper to run sequential GSAP animations on elements
  const animateSequence = (elements, properties, duration = 0.5, stagger = 0.1) => {
    const tl = gsap.timeline({
      onStart: () => setIsAnimating(true),
      onComplete: () => setIsAnimating(false)
    });
    
    tl.to(elements, {
      ...properties,
      duration,
      stagger,
      ease: 'power3.out'
    });
    
    return tl;
  };

  return {
    isAnimating,
    setIsAnimating,
    getSpringPreset,
    animateSequence,
    queueAnimation: useAnimationStore((state) => state.queueAnimation)
  };
}
