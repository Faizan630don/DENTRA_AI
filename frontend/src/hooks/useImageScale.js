import { useState, useEffect, useCallback } from 'react';

/**
 * Robust hook for mapping original image coordinates to display coordinates.
 * Handles object-contain, resizing, and initial load.
 */
export function useImageScale(imgRef) {
  const [scale, setScale] = useState({
    scaleX: 1,
    scaleY: 1,
    offsetX: 0,
    offsetY: 0,
    isReady: false,
  });

  const updateScale = useCallback(() => {
    const img = imgRef.current;
    if (!img || img.naturalWidth === 0) return;

    const { naturalWidth, naturalHeight, clientWidth, clientHeight } = img;

    // Calculate scaling factor for object-contain
    const contentAspectRatio = naturalWidth / naturalHeight;
    const containerAspectRatio = clientWidth / clientHeight;

    let displayWidth = clientWidth;
    let displayHeight = clientHeight;
    let offsetX = 0;
    let offsetY = 0;

    if (containerAspectRatio > contentAspectRatio) {
      // Image is restricted by height
      displayWidth = clientHeight * contentAspectRatio;
      offsetX = (clientWidth - displayWidth) / 2;
    } else {
      // Image is restricted by width
      displayHeight = clientWidth / contentAspectRatio;
      offsetY = (clientHeight - displayHeight) / 2;
    }

    setScale({
      scaleX: displayWidth / naturalWidth,
      scaleY: displayHeight / naturalHeight,
      offsetX,
      offsetY,
      isReady: true,
    });
  }, [imgRef]);

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    const observer = new ResizeObserver(() => updateScale());
    observer.observe(img);

    if (img.complete) {
      updateScale();
    }

    return () => observer.disconnect();
  }, [imgRef, updateScale]);

  return { scale, updateScale };
}
