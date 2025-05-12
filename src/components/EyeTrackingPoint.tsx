// EyeTrackingPoint.tsx
"use client";
import { useEffect, useRef, useState } from "react";

const WIDTH = 1560;
const HEIGHT = 1024;

export interface IrisPosition {
  x: number;
  y: number;
  timestamp?: string;
}

export default function EyeTrackingPoint() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [iris, setIris] = useState<IrisPosition | null>(null);

  useEffect(() => {
    let isMounted = true;
    let intervalId: NodeJS.Timeout;

    const fetchIris = async () => {
      try {
        const res = await fetch("http://localhost:4000/eyetracking");
        if (!res.ok) return;
        const data = await res.json();
        if (isMounted) setIris(data.iris_position || null);
      } catch {
        if (isMounted) setIris(null);
      }
    };

    fetchIris();
    intervalId = setInterval(fetchIris, 500);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    if (iris) {
      ctx.beginPath();
      ctx.arc(iris.x, iris.y, 15, 0, 2 * Math.PI);
      ctx.fillStyle = "red";
      ctx.fill();
    }
  }, [iris]);

  return (
    <canvas
      ref={canvasRef}
      width={window.innerWidth}
      height={window.innerHeight}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        pointerEvents: "none",
        zIndex: 1000,
        width: "100vw",
        height: "100vh",
        background: "transparent",
      }}
    />
  );
}