"use client";

import { useEffect, useState, useCallback } from "react";
import { useStarBehavior } from "@/hooks/useStarBehavior";
import FixedStar from "./FixedStar";

interface IrisPosition {
  x: number;
  y: number;
  timestamp?: string;
}

interface StarProps {
  readonly top: number;
  readonly left: number;
  readonly onRemove: () => void;
  readonly onError: () => void;
  readonly isShining: boolean;
}

// Constants
const GAZE_TOLERANCE = 5; // % margin of error
const SCREEN_WIDTH = 1560; // Should match API's WIDTH
const SCREEN_HEIGHT = 1024; // Should match API's HEIGHT

// Eye tracking service function
function startEyeTracking(
  callback: (position: IrisPosition | null) => void,
  interval: number = 1000
): () => void {
  let isActive = true;

  const fetchData = async () => {
    if (!isActive) return;

    try {
      // const res = await fetch("http://localhost:4000/eyetracking");
      // const data = await res.json();
      //callback(data.iris_position || null);
    } catch (error) {
      console.error("Eye Tracking Error:", error);
      callback(null);
    }
  };

  const timerId = setInterval(fetchData, interval);

  return () => {
    isActive = false;
    clearInterval(timerId);
  };
}

export default function Star({ top, left, onRemove, onError, isShining }: StarProps) {
  const { handleMouseEnter, handleMouseLeave } = useStarBehavior(
    onRemove,
    onError
  );
  const [isBeingLookedAt, setIsBeingLookedAt] = useState(false);

  // Detect if gaze is on the star
  const checkGazePosition = useCallback(
    (position: IrisPosition | null) => {
      if (!position) return;

      // Convert absolute coordinates (pixels) to percentage
      const gazeXPercent = (position.x / SCREEN_WIDTH) * 100;
      const gazeYPercent = (position.y / SCREEN_HEIGHT) * 100;

      setIsBeingLookedAt(
        Math.abs(gazeXPercent - left) < GAZE_TOLERANCE &&
          Math.abs(gazeYPercent - top) < GAZE_TOLERANCE
      );
    },
    [top, left]
  );

  // Start eye tracking
  useEffect(() => {
    const stopTracking = startEyeTracking(checkGazePosition, 500);
    return stopTracking;
  }, [checkGazePosition]);

  // Trigger hover behavior when being looked at
  useEffect(() => {
    if (isBeingLookedAt) {
      handleMouseEnter();
    } else {
      handleMouseLeave();
    }
  }, [isBeingLookedAt, handleMouseEnter, handleMouseLeave]);

  return (
    <FixedStar top={top} left={left} isShining={isShining || isBeingLookedAt} />
  );
}
