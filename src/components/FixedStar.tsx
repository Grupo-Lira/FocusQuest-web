"use client";

import Image from "next/image";

type Props = {
  readonly top: number;
  readonly left: number;
  readonly isShining?: boolean;
};

const getButtonClass = (isShining: boolean | undefined) => {
  if (isShining === true)
    return "absolute transition-all duration-700 brightness-150 scale-125";
  return "absolute transition-all duration-700 brightness-75 scale-100";
};

const getGlowClass = (isShining: boolean | undefined) => {
  const base =
    "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none -z-10 transition-all duration-700";
  if (isShining === true)
    return `${base} w-20 h-20 bg-yellow-300/80 blur-2xl scale-125 animate-pulse`;
  return base;
};

export function FixedStar({ top, left, isShining }: Props) {
  const buttonClass = getButtonClass(isShining);
  const glowClass = getGlowClass(isShining);
  const positionStyle = { top: `${top}%`, left: `${left}%` };

  return (
    <button type="button" className={buttonClass} style={positionStyle}>
      <span aria-hidden="true" className={glowClass} />
      <Image
        width={40}
        height={38}
        alt="Estrela"
        src="/img/star.svg"
        className="relative z-10"
      />
    </button>
  );
}
