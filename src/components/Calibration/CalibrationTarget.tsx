"use client";

import Image from "next/image";
import { CalibrationTarget as CalibrationTargetData } from "@/constants/calibrationStar";

type Props = {
  readonly target: CalibrationTargetData;
  readonly clicks: number;
  readonly clicksRequired: number;
  readonly isTransitioning: boolean;
  readonly onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
};

export function CalibrationTarget({
  target,
  clicks,
  clicksRequired,
  isTransitioning,
  onClick,
}: Props) {
  const charges = Array.from({ length: clicksRequired }, (_, index) => index < clicks);
  const remainingClicks = clicksRequired - clicks;
  const edgeInset = "3.5rem";
  const positionStyle = {
    top: `clamp(${edgeInset}, ${target.top}%, calc(100% - ${edgeInset}))`,
    left: `clamp(${edgeInset}, ${target.left}%, calc(100% - ${edgeInset}))`,
  };

  return (
    <button
      type="button"
      aria-label={`Estrela de calibração no ${target.label}. ${clicks} de ${clicksRequired} cliques concluídos.`}
      aria-describedby="calibration-target-instruction"
      disabled={isTransitioning}
      onClick={onClick}
      style={positionStyle}
      className="calibration-target group absolute z-10 flex h-28 w-28 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full focus:outline-none focus-visible:ring-4 focus-visible:ring-white disabled:cursor-wait"
    >
      <span aria-hidden="true" className="calibration-target__orbit calibration-target__orbit--outer" />
      <span aria-hidden="true" className="calibration-target__orbit calibration-target__orbit--inner" />
      <span aria-hidden="true" className="calibration-target__glow" />

      <span key={`${target.id}-${clicks}`} className="calibration-target__star relative z-10">
        <Image width={58} height={58} alt="" src="/img/star.svg" priority />
      </span>

      <span className="absolute -bottom-5 left-1/2 z-20 flex -translate-x-1/2 gap-1 rounded-full bg-[#07152A]/80 px-2 py-1 shadow-lg">
        {charges.map((isCharged, index) => (
          <span
            key={`${target.id}-charge-${index}`}
            aria-hidden="true"
            className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${
              isCharged
                ? "scale-110 bg-[#FFE36D] shadow-[0_0_10px_rgba(255,227,109,1)]"
                : "bg-white/35"
            }`}
          />
        ))}
      </span>

      <span className="sr-only">
        {remainingClicks === 0
          ? "Estrela energizada."
          : `Faltam ${remainingClicks} ${remainingClicks === 1 ? "clique" : "cliques"}.`}
      </span>
    </button>
  );
}
