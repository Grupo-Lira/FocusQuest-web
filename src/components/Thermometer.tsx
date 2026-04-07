"use client";

import Image from "next/image";

interface ThermometerProps {
  readonly level: number;
}

export function Thermometer({ level }: ThermometerProps) {
  return (
    <div className="bg-[var(--white)] px-2.5 py-4 flex flex-col items-center gap-1.5 w-12 rounded-full glow">
      <Image width={36} height={32} alt="Estrela" src="/img/star.svg" />
      <div className="bg-[#FFDDBD] thermometer-img rounded-full relative overflow-hidden">
        <div
          className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-orange-500 to-orange-300 rounded-full transition-all duration-300 ease-in-out"
          style={{ height: `${level}%` }}
        />
      </div>
    </div>
  );
}
