"use client";

import Image from "next/image";
import clsx from "clsx";
import { useStarBehavior } from "@/hooks/useStarBehavior";
import StarHover from "./StarHover";

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
  const { hovering, removing, handleMouseEnter, handleMouseLeave } = useStarBehavior(
    onRemove,
    onError
  );

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
      {hovering && <StarHover />}
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
