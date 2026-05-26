import { useState, useCallback } from 'react';

export function useInteraction() {
  const [hoveredId, setHoveredId] = useState(null);
  
  // Set pointer cursor style on document body on hover
  const handlePointerOver = useCallback((event, id) => {
    event.stopPropagation();
    setHoveredId(id);
    document.body.style.cursor = 'pointer';
  }, []);

  const handlePointerOut = useCallback((event) => {
    event.stopPropagation();
    setHoveredId(null);
    document.body.style.cursor = 'default';
  }, []);

  // Reset cursor style when component unmounts
  const cleanupCursor = useCallback(() => {
    document.body.style.cursor = 'default';
  }, []);

  return {
    hoveredId,
    handlePointerOver,
    handlePointerOut,
    cleanupCursor
  };
}
