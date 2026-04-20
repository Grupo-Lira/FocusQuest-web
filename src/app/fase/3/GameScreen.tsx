"use client";

import { Bolt } from "lucide-react";
import { useEffect, useState } from "react";
import { OverlayInstruction } from "@/components/Calibration/OverlayInstruction";
import { AnimatedElement } from "@/components/AnimatedElements/AnimatedElement";
import { FixedStar } from "@/components/FixedStar";
import { NavbarGame } from "@/components/NavbarGame";
import { SettingsModal } from "@/components/SettingsModal";
import { SuccessScreen } from "@/components/SuccessScreen";
import { animatedElements } from "@/config/gameConfig";
import { fase3Steps } from "@/constants/steps";
import { useAudio } from "@/context/AudioContext";
import { useGameContext } from "@/context/GameContext";

const SIGNAL_CYCLE_MS = 8000;
const SIGNAL_DURATION_MS = 3000;
const NAVBAR_LABEL =
  "FOQUE OS OLHOS NAS ESTRELAS E QUANDO O SINALIZADOR ACENDER, FOQUE NELE!" as const;

const getSignalClassName = (isShining: boolean) => {
  if (isShining === true) return "sinalizador brilhando";
  return "sinalizador";
};

export function GameScreen() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isShining, setIsShining] = useState(false);

  const {
    isPaused,
    setIsPaused,
    setIsGameActive,
    audioGameStarted,
    setAudioGameStarted,
    isGameActive,
    timeLeft,
    setPhase,
  } = useGameContext();
  const { startAudio } = useAudio();

  const handleStartGame = () => {
    setIsGameActive(true);
    setAudioGameStarted(true);
    startAudio();
  };

  const onCloseSettings = () => {
    setIsModalOpen(false);
    setIsPaused(false);
    startAudio();
  };

  const onOpenSettings = () => {
    setIsModalOpen(true);
    setIsPaused(true);
  };

  useEffect(() => {
    if (isGameActive === false) return;

    const interval = setInterval(() => {
      setIsShining(true);
      setTimeout(() => setIsShining(false), SIGNAL_DURATION_MS);
    }, SIGNAL_CYCLE_MS);

    return () => clearInterval(interval);
  }, [isGameActive]);

  useEffect(() => {
    if (timeLeft !== 0) return;
    setShowSuccessModal(true);
    setIsPaused(true);
  }, [timeLeft]);

  useEffect(() => {
    setPhase(3);
  }, [setPhase]);

  if (isModalOpen === true) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <SettingsModal isStoppedGame={true} onClick={onCloseSettings} />
      </div>
    );
  }

  const signalClassName = getSignalClassName(isShining);

  return (
    <div className="fase3-container relative w-full h-screen overflow-hidden">
      <div className="flex justify-center mt-6 relative z-11">
        <NavbarGame label={NAVBAR_LABEL} />
      </div>

      <div>
        <div className={signalClassName} />
        <div className="base-sinalizador" />
      </div>

      {audioGameStarted === false ? (
        <OverlayInstruction onComplete={handleStartGame} steps={fase3Steps} />
      ) : null}

      {showSuccessModal === true ? (
        <div className="absolute inset-0 z-50 bg-black/70 flex items-center justify-center">
          <SuccessScreen fase={2} />
        </div>
      ) : null}

      <button
        type="button"
        aria-label="Open settings"
        className="bg-[var(--primary)] z-20 w-11 h-11 rounded-full absolute flex items-center justify-center button-glow transition-all duration-300 top-9 right-9"
        onClick={onOpenSettings}
      >
        <Bolt color="white" />
      </button>

      <div className="h-[45%] w-screen z-11 relative">
        <FixedStar top={45} left={60} />
      </div>

      <div className="h-screen w-screen relative">
        {isGameActive === true
          ? animatedElements.map((item) => (
              <AnimatedElement
                key={item.id}
                id={item.id}
                src={item.src}
                duration={item.duration}
                isPaused={isPaused}
              />
            ))
          : null}
      </div>

      <div className="fase3-overlay absolute inset-0 pointer-events-none" />
    </div>
  );
}
