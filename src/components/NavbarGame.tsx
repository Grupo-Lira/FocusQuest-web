"use client";

import Image from "next/image";
import { useGameContext } from "@/context/GameContext";
import { formatTime } from "@/utils/formatTime";

type Props = {
  readonly label: string;
};

const PauseToggleIcon = ({ isPaused }: { isPaused: boolean }) => {
  if (isPaused === true) {
    return <Image src="/img/icon/play.svg" width={21} height={21} alt="Botão de play" />;
  }
  return <Image src="/img/icon/pause.svg" width={21} height={21} alt="Botão de pause" />;
};

export function NavbarGame({ label }: Props) {
  const { timeLeft, setIsPaused, isPaused } = useGameContext();

  const onTogglePause = () => setIsPaused(!isPaused);
  const formattedTime = formatTime(timeLeft);

  return (
    <div className="bg-[var(--white)] px-4 py-2 flex w-fit rounded-full gap-40">
      <div className="flex gap-5 items-center">
        <p className="font-semibold font-orbitron text-[var(--primary)]">{label}</p>
      </div>
      <div className="flex items-center gap-1.5 pl-4 pb-2 rounded-full font-semibold bg-[var(--white)] text-[var(--primary)] inner-shadow">
        <p className="pt-2">{formattedTime}</p>
        <button
          type="button"
          className="button-3d bg-[var(--primary)] flex p-2 rounded-full cursor-pointer transition-transform duration-300 hover:scale-105"
          onClick={onTogglePause}
        >
          <PauseToggleIcon isPaused={isPaused} />
        </button>
      </div>
    </div>
  );
}
