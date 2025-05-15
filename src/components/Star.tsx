"use client";

import Image from "next/image";
import clsx from "clsx";
import { useEffect, useCallback } from "react";
import { useStarBehavior } from "@/hooks/useStarBehavior";
import StarHover from "./StarHover";
import EyeTrackingPoint from "./EyeTrackingPoint";

interface IrisPosition {
  x: number;
  y: number;
  timestamp?: string;
}
<EyeTrackingPoint />;
const GAZE_TOLERANCE = 5;
const SCREEN_WIDTH = 1560;
const SCREEN_HEIGHT = 1024;

function startEyeTracking(
  callback: (position: IrisPosition | null) => void,
  interval: number = 1000
): () => void {
  let isActive = true;

  const fetchData = async () => {
    if (!isActive) return;

    try {
      const res = await fetch("http://localhost:4000/eyetracking");
      const data = await res.json();
      callback(data.iris_position || null);
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

export default function Star({
  top,
  left,
  onRemove,
  onError,
}: {
  top: number;
  left: number;
  onRemove: () => void;
  onError: () => void;
}) {
  const {
    hovering,
    removing,
    handleMouseEnter,
    handleMouseLeave,
    handleEyeEnter,
    handleEyeLeave,
  } = useStarBehavior(onRemove, onError);

  // Detect se o olho está olhando
  const checkGazePosition = useCallback(
    (position: IrisPosition | null) => {
      if (!position) {
        handleEyeLeave();
        return;
      }

      const gazeXPercent = (position.x / SCREEN_WIDTH) * 100;
      const gazeYPercent = (position.y / SCREEN_HEIGHT) * 100;

      const isLooking =
        Math.abs(gazeXPercent - left) < GAZE_TOLERANCE &&
        Math.abs(gazeYPercent - top) < GAZE_TOLERANCE;

      if (isLooking) {
        handleEyeEnter();
      } else {
        handleEyeLeave();
      }
    },
    [top, left, handleEyeEnter, handleEyeLeave]
  );

  useEffect(() => {
    const stop = startEyeTracking(checkGazePosition, 500);
    return stop;
  }, [checkGazePosition]);

  return (
    <div
      className={clsx(
        "absolute transition-all duration-500 z-10",
        removing ? "rotate-[720deg] opacity-0 scale-0" : "opacity-100",
        hovering ? "ring-4 ring-yellow-400 scale-110" : ""
      )}
      style={{ top: `${top}%`, left: `${left}%` }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {hovering && <StarHover />}
      <Image
        width={40}
        height={38}
        alt="Estrela"
        src="/img/star.svg"
        className={clsx(
          "relative transition-transform",
          hovering ? "animate-pulse" : ""
        )}
      />
    </div>
  );
}
