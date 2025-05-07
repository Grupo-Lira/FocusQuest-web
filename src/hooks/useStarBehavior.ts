import { useState, useRef } from "react";

export function useStarBehavior(onRemove: () => void, onError: () => void) {
  const [hovering, setHovering] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [resolved, setResolved] = useState(false);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const enterTimeRef = useRef<number>(0);

  const handleMouseEnter = () => {
    if (resolved) return;
    setHovering(true);
    enterTimeRef.current = Date.now();
    timeoutRef.current = setTimeout(() => {
      setResolved(true);
      setRemoving(true);
      setTimeout(() => onRemove(), 10);
    }, 3000);
  };

  const handleMouseLeave = () => {
    setHovering(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    const timeHovered = Date.now() - enterTimeRef.current;
    if (timeHovered >= 500 && timeHovered < 3000) {
      onError();
    }
  };

  return { hovering, removing, handleMouseEnter, handleMouseLeave };
}
