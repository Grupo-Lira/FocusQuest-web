"use client";

import clsx from "clsx";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

type IrisPosition = {
  x: number;
  y: number;
  timestamp?: string;
};

type Props = {
  readonly top: number;
  readonly left: number;
  readonly onHit: () => void;
  readonly onError?: () => void;
  readonly onClick: (event: React.MouseEvent) => void;
};

const GAZE_TOLERANCE = 5;
const SCREEN_WIDTH = 1560;
const SCREEN_HEIGHT = 1024;
const HIT_DELAY_MS = 600;

const isGazeInside = (position: IrisPosition, left: number, top: number) => {
  const gazeXPercent = (position.x / SCREEN_WIDTH) * 100;
  const gazeYPercent = (position.y / SCREEN_HEIGHT) * 100;
  const inside =
    Math.abs(gazeXPercent - left) < GAZE_TOLERANCE &&
    Math.abs(gazeYPercent - top) < GAZE_TOLERANCE;
  return inside;
};

export function StarCalibration({ top, left, onHit, onError, onClick }: Props) {
  const [isBeingLookedAt, setIsBeingLookedAt] = useState(false);
  const [hasBeenHit, setHasBeenHit] = useState(false);
  const [visible, setVisible] = useState(true);

  const checkGazePosition = useCallback(
    (position: IrisPosition | null) => {
      if (position === null || hasBeenHit === true) return;

      const inside = isGazeInside(position, left, top);
      setIsBeingLookedAt(inside);

      if (inside === false) return;

      setHasBeenHit(true);
      setTimeout(() => {
        setVisible(false);
        onHit();
      }, HIT_DELAY_MS);
    },
    [top, left, hasBeenHit, onHit]
  );

  useEffect(() => {
    if (visible === false && hasBeenHit === false) {
      onError?.();
    }
  }, [visible, hasBeenHit, onError]);

  if (visible === false) return null;

  const handleClick = (event: React.MouseEvent) => {
    onHit();
    onClick(event);
  };

  const containerClass = clsx(
    "absolute transition-all duration-500 ease-out",
    isBeingLookedAt === true
      ? "scale-125 drop-shadow-[0_0_20px_rgba(255,255,0,0.8)]"
      : "scale-100 opacity-90"
  );
  const imageClass = clsx(
    "transition-transform",
    isBeingLookedAt === true ? "animate-pulse" : ""
  );
  const positionStyle = {
    top: `${top}%`,
    left: `${left}%`,
    transform: "translate(-50%, -50%)",
  };

  return (
    <div className={containerClass} style={positionStyle} onClick={handleClick}>
      <Image
        width={50}
        height={50}
        alt="Estrela de calibração"
        src="/img/star.svg"
        className={imageClass}
      />
    </div>
  );
}
