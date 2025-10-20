"use client";

import Image from "next/image";
import clsx from "clsx";
import { useEffect, useState, useCallback } from "react";

interface IrisPosition {
  x: number;
  y: number;
  timestamp?: string;
}

interface StarCalibrationProps {
  top: number;
  left: number;
  onHit: () => void;
  onError?: () => void;
  onClick: (event: React.MouseEvent) => void;
}

// Configurações do rastreamento ocular
const GAZE_TOLERANCE = 5; // % de margem de erro
const SCREEN_WIDTH = 1560;
const SCREEN_HEIGHT = 1024;

function startEyeTracking(
  callback: (position: IrisPosition | null) => void,
  interval: number = 300
): () => void {
  let isActive = true;

  const fetchData = async () => {
    if (!isActive) return;
    try {
      const res = await fetch("http://localhost:4000/eyetracking");
      const data = await res.json();
      callback(data.iris_position || null);
    } catch (error) {
      console.error("Erro no Eye Tracking:", error);
      callback(null);
    }
  };

  const timerId = setInterval(fetchData, interval);
  return () => {
    isActive = false;
    clearInterval(timerId);
  };
}

export default function StarCalibration({
  top,
  left,
  onHit,
  onError,
  onClick,
}: StarCalibrationProps) {
  const [isBeingLookedAt, setIsBeingLookedAt] = useState(false);
  const [hasBeenHit, setHasBeenHit] = useState(false);
  const [visible, setVisible] = useState(true);

  // Verifica se o olhar está dentro da área da estrela
  const checkGazePosition = useCallback(
    (position: IrisPosition | null) => {
      if (!position || hasBeenHit) return;

      const gazeXPercent = (position.x / SCREEN_WIDTH) * 100;
      const gazeYPercent = (position.y / SCREEN_HEIGHT) * 100;

      const isInside =
        Math.abs(gazeXPercent - left) < GAZE_TOLERANCE &&
        Math.abs(gazeYPercent - top) < GAZE_TOLERANCE;

      setIsBeingLookedAt(isInside);

      if (isInside) {
        setHasBeenHit(true);
        setTimeout(() => {
          setVisible(false);
          onHit();
        }, 600); // pequena pausa antes de sumir
      }
    },
    [top, left, hasBeenHit, onHit]
  );

  // Inicia o rastreamento ocular
  // useEffect(() => {
  //   const stopTracking = startEyeTracking(checkGazePosition, 300);
  //   return stopTracking;
  // }, [checkGazePosition]);

  // Se der erro no carregamento, dispara callback
  useEffect(() => {
    if (!visible && !hasBeenHit) {
      onError?.();
    }
  }, [visible, hasBeenHit, onError]);

  if (!visible) return null;

  const handleClick = (event: React.MouseEvent) => {
    onHit();
    onClick(event);
  };

  return (
    <div
      className={clsx(
        "absolute transition-all duration-500 ease-out",
        isBeingLookedAt
          ? "scale-125 drop-shadow-[0_0_20px_rgba(255,255,0,0.8)]"
          : "scale-100 opacity-90"
      )}
      style={{ top: `${top}%`, left: `${left}%`, transform: "translate(-50%, -50%)" }}
      onClick={handleClick}
    >
      <Image
        width={50}
        height={50}
        alt="Estrela de calibração"
        src="/img/star.svg"
        className={clsx("transition-transform", isBeingLookedAt ? "animate-pulse" : "")}
      />
    </div>
  );
}
