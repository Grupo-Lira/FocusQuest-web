"use client";
import { useRef, useState } from "react";
import Image from "next/image";
import clsx from "clsx";

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
  const [hovering, setHovering] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [resolved, setResolved] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const enterTimeRef = useRef<number>(0);

  const handleMouseEnter = () => {
    if (resolved) return;
    setHovering(true);
    enterTimeRef.current = Date.now();
    const timeout = setTimeout(() => {
      setResolved(true);
      setRemoving(true);
      setTimeout(() => {
        onRemove();
      }, 10);
    }, 3000); 

    timeoutRef.current = timeout;
  };

  const handleMouseLeave = () => {
    setHovering(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
   const timeHovered = Date.now() - enterTimeRef.current;
   if (timeHovered >= 500 && timeHovered < 3000) {
     // 🟥 só conta como erro se o usuário ficou pelo menos 1 segundo
     onError();
   }
  };

  return (
    <div
      className={clsx(
        "absolute transition-transform duration-500",
        removing ? "rotate-[720deg] opacity-0 scale-0" : "opacity-100"
      )}
      style={{ top: `${top}%`, left: `${left}%` }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {hovering && (
        <div
          className="absolute z-0 bg-[#FFDDBD] opacity-30 rounded-full"
          style={{
            width: 80,
            height: 80,
            top: "-20px",
            left: "-20px",
            transform: "scale(0.2)",
            animation: "grow 3s linear forwards",
            transformOrigin: "center",
          }}
        >
          <style jsx>{`
            @keyframes grow {
              0% {
                transform: scale(0);
              }
              100% {
                transform: scale(1);
              }
            }
          `}</style>
        </div>
      )}

      <Image
        width={40}
        height={38}
        alt="Estrela"
        src="/img/star.svg"
        className="relative z-10"
      />
    </div>
  );
}
