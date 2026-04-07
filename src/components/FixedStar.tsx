"use client";

import Image from "next/image";

interface StarProps {
  readonly top: number;
  readonly left: number;
  readonly isShining?: boolean;
}

export function FixedStar({ top, left, isShining }: StarProps) {
  return (
    <button
      type="button"
      className={`absolute transition-all duration-700 ${
        isShining ? "brightness-150 scale-125" : "brightness-75 scale-100"
      }`}
      style={{ top: `${top}%`, left: `${left}%` }}
    >
      <span
        aria-hidden="true"
        className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none -z-10 transition-all duration-700 ${
          isShining ? "w-20 h-20 bg-yellow-300/80 blur-2xl scale-125 animate-pulse" : ""
        }`}
      />
      <Image
        width={40}
        height={38}
        alt="Estrela"
        src="/img/star.svg"
        className={"relative z-10"}
      />
    </button>
  );
}
