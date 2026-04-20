"use client";

import { useCallback, useEffect, useState } from "react";
import { useStarBehavior } from "@/hooks/useStarBehavior";
import { FixedStar } from "./FixedStar";

type IrisPosition = {
  x: number;
  y: number;
  timestamp?: string;
};

type Props = {
  readonly top: number;
  readonly left: number;
  readonly onRemove: () => void;
  readonly onError: () => void;
  readonly isShining: boolean;
};

const GAZE_TOLERANCE = 5;
const SCREEN_WIDTH = 1560;
const SCREEN_HEIGHT = 1024;
const POLL_INTERVAL_MS = 500;

const isGazeOnStar = (position: IrisPosition, left: number, top: number) => {
  const gazeXPercent = (position.x / SCREEN_WIDTH) * 100;
  const gazeYPercent = (position.y / SCREEN_HEIGHT) * 100;
  const onStar =
    Math.abs(gazeXPercent - left) < GAZE_TOLERANCE &&
    Math.abs(gazeYPercent - top) < GAZE_TOLERANCE;
  return onStar;
};

const startEyeTracking = (
  _callback: (position: IrisPosition | null) => void,
  interval: number = POLL_INTERVAL_MS
): (() => void) => {
  const state = { isActive: true };

  const fetchData = async () => {
    if (state.isActive === false) return;
    // Eye tracking fetch is disabled; callback stays available for future integration.
  };

  const timerId = setInterval(fetchData, interval);

  return () => {
    state.isActive = false;
    clearInterval(timerId);
  };
};

export function Star({ top, left, onRemove, onError, isShining }: Props) {
  const { handleMouseEnter, handleMouseLeave } = useStarBehavior(onRemove, onError);
  const [isBeingLookedAt, setIsBeingLookedAt] = useState(false);

  const checkGazePosition = useCallback(
    (position: IrisPosition | null) => {
      if (position === null) return;
      setIsBeingLookedAt(isGazeOnStar(position, left, top));
    },
    [top, left]
  );

  useEffect(() => {
    const stopTracking = startEyeTracking(checkGazePosition, POLL_INTERVAL_MS);
    return stopTracking;
  }, [checkGazePosition]);

  useEffect(() => {
    if (isBeingLookedAt === true) {
      handleMouseEnter();
      return;
    }
    handleMouseLeave();
  }, [isBeingLookedAt, handleMouseEnter, handleMouseLeave]);

  const shining = isShining === true || isBeingLookedAt === true;

  return <FixedStar top={top} left={left} isShining={shining} />;
}
