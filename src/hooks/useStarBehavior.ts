import { useState, useRef } from "react";

export function useStarBehavior(onRemove: () => void, onError: () => void) {
  const [hovering, setHovering] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [resolved, setResolved] = useState(false);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const enterTimeRef = useRef<number>(0);
  const activeSourceRef = useRef<"mouse" | "eye" | null>(null);

  const handleEnter = (source: "mouse" | "eye") => {
    if (resolved || hovering) return;

    setHovering(true);
    enterTimeRef.current = Date.now();
    activeSourceRef.current = source;

    timeoutRef.current = setTimeout(() => {
      setResolved(true);
      setRemoving(true);
      setTimeout(() => onRemove(), 10);
    }, 500);
  };

  const handleLeave = (source: "mouse" | "eye") => {
    if (activeSourceRef.current !== source) return;

    setHovering(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    const timeHovered = Date.now() - enterTimeRef.current;
    if (timeHovered >= 100 && timeHovered < 500) {
      onError();
    }

    activeSourceRef.current = null;
  };

  return {
    hovering,
    removing,
    handleMouseEnter: () => handleEnter("mouse"),
    handleMouseLeave: () => handleLeave("mouse"),
    handleEyeEnter: () => handleEnter("eye"),
    handleEyeLeave: () => handleLeave("eye"),
  };
}
