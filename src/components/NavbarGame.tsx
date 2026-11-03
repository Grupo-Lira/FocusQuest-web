"use client";

import { T, useT } from "@/i18n/client";
import Image from "next/image";
import { useGameContext } from "@/context/GameContext";
import { useTrainingMode } from "@/context/TrainingModeContext";
import { formatTime } from "@/utils/dateUtils";

type Props = {
  readonly label: string;
  readonly onPauseToggle?: (isPaused: boolean) => void;
};

const PauseToggleIcon = ({ isPaused }: { isPaused: boolean }) => {
  const t = useT();
  if (isPaused === true) {
    return <Image src="/img/icon/play.svg" width={21} height={21} alt={t("Botão de play")} />;
  }
  return <Image src="/img/icon/pause.svg" width={21} height={21} alt={t("Botão de pause")} />;
};

export function NavbarGame({ label, onPauseToggle }: Props) {
  const t = useT();
  const { timeLeft, setIsPaused, isPaused } = useGameContext();
  const { isTrainingMode } = useTrainingMode();

  const onTogglePause = () => {
    const nextPaused = !isPaused;
    setIsPaused(nextPaused);
    onPauseToggle?.(nextPaused);
  };
  const formattedTime = formatTime(timeLeft);

  return (
    <div className="bg-[var(--white)] px-4 py-2 flex w-fit rounded-full gap-40">
      <div className="flex gap-5 items-center">
        <p className="font-semibold font-orbitron text-[var(--primary)]">{t(label)}</p>
        {isTrainingMode ? (
          <span className="rounded-full bg-green-600 px-3 py-1 text-xs font-bold text-white">
            <T text="TREINAMENTO ON" /></span>
        ) : null}
      </div>
      <div className="flex items-center gap-1.5 pl-4 pb-2 rounded-full font-semibold bg-[var(--white)] text-[var(--primary)] inner-shadow">
        <p className="pt-2">{formattedTime}</p>
        <button
          type="button"
          aria-label={t(isPaused ? "Continuar missão" : "Pausar missão")}
          className="button-3d bg-[var(--primary)] flex p-2 rounded-full cursor-pointer transition-transform duration-300 hover:scale-105"
          onClick={onTogglePause}
        >
          <PauseToggleIcon isPaused={isPaused} />
        </button>
      </div>
    </div>
  );
}
