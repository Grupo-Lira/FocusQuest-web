"use client";

import Image from "next/image";
import { useState } from "react";

export default function NavbarGame() {
    const [isPaused, setIsPaused] = useState(false);

  return (
    <div className="bg-[var(--white)] px-6 py-3 flex w-fit rounded-full gap-40">
      <div className="flex gap-5 items-center">
        <p className="font-semibold font-orbitron text-[var(--primary)] ">
          ENCONTRE E FIXE O OLHO NOS 5 ALVOS DURANTE 5 SEGUNDOS
        </p>
      </div>
      <div className="flex items-center gap-1.5 pl-4 pb-2 rounded-full font-semibold bg-[var(--white)] text-[var(--primary)] inner-shadow">
        <p className="pt-2">00:00</p>
        <button className="button-3d bg-[var(--primary)] flex p-2 rounded-full cursor-pointer transition-transform duration-300 hover:scale-105" onClick={() => setIsPaused(!isPaused)}>
          {isPaused ? (
            <Image
              src="/img/icon/pause.svg"
              width={21}
              height={21}
              alt="Botão de pause"
            />
          ) : (
            <Image
              src="/img/icon/play.svg"
              width={21}
              height={21}
              alt="Botão de play"
            />
          )}
          
        </button>
      </div>
    </div>
  );
}
