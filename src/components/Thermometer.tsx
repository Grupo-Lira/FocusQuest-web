"use client";

import Image from "next/image";

export default function Thermometer({ level }: { level: number }) {

  return (
    <div className="bg-[var(--white)] px-2.5 py-4 flex flex-col items-center gap-1.5 w-16 rounded-full glow">
      <Image width={40} height={38} alt="Estrela" src="/img/star.svg" />
      <div className="bg-[#FFDDBD] thermometer-img rounded-full relative overflow-hidden">
        <div
          className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-orange-500 to-orange-300 rounded-full transition-all duration-300 ease-in-out"
          style={{ height: `${level}%` }}
        />
      </div>

    </div>
  );
}
