"use client";

import { useEffect, useState } from "react";
import { Bolt } from "lucide-react";
import { useGameContext } from "@/context/GameContext";
import { AnimatedElement } from "@/components/AnimatedElements/AnimatedElement";
import { animatedElements } from "@/config/gameConfig";
import { useAudio } from "@/context/AudioContext";
import { fase3Steps } from "@/constants/steps";
import { SettingsModal } from "@/components/SettingsModal";
import { NavbarGame } from "@/components/NavbarGame";
import { OverlayInstruction } from "@/components/Calibration/OverlayInstruction";
import { SuccessScreen } from "@/components/SuccessScreen";
import { FixedStar } from "@/components/FixedStar";

export function GameScreen() {
  const [isModalOpen, setIsModalOpen] = useState(false);
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
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isBrilhando, setIsBrilhando] = useState(false);

  const { startAudio } = useAudio();

  const handleStartGame = () => {
    setIsGameActive(true);
    setAudioGameStarted(true);
    startAudio();
  };

  useEffect(() => {
    if (!isGameActive) return; // só pisca durante o jogo

    const interval = setInterval(() => {
      setIsBrilhando(true); // acende
      const timeout = setTimeout(() => {
        setIsBrilhando(false); // apaga depois de 3s
      }, 3000);

      return () => clearTimeout(timeout);
    }, 8000);

    return () => clearInterval(interval);
  }, [isGameActive]);

  useEffect(() => {
    if (timeLeft === 0) {
      setShowSuccessModal(true);
      setIsPaused(true);
    }
  }, [timeLeft]);

  useEffect(() => {
    setPhase(3);
  }, [setPhase]);

  return (
    <>
      {isModalOpen ? (
        <div className="flex items-center justify-center min-h-screen">
          <SettingsModal
            isStoppedGame={true}
            onClick={() => {
              setIsModalOpen(false);
              setIsPaused(false);
              startAudio();
            }}
          />
        </div>
      ) : (
        <div className="fase3-container relative w-full h-screen overflow-hidden">
          <div className="flex justify-center mt-6 relative z-11">
            <NavbarGame label="FOQUE OS OLHOS NAS ESTRELAS E QUANDO O SINALIZADOR ACENDER, FOQUE NELE!" />
          </div>

          <div>
            <div className={`sinalizador ${isBrilhando ? "brilhando" : ""}`} />
            <div className="base-sinalizador" />
          </div>

          {!audioGameStarted && (
            <OverlayInstruction onComplete={handleStartGame} steps={fase3Steps} />
          )}

          {showSuccessModal && (
            <div className="absolute inset-0 z-50 bg-black/70 flex items-center justify-center">
              <SuccessScreen fase={2} />
            </div>
          )}

          <button
            type="button"
            aria-label="Open settings"
            className="bg-[var(--primary)] z-20 w-11 h-11 rounded-full absolute flex items-center justify-center button-glow transition-all duration-300 top-9 right-9"
            onClick={() => {
              setIsModalOpen(true);
              setIsPaused(true);
            }}
          >
            <Bolt color="white" />
          </button>

          <div className="h-[45%] w-screen z-11 relative">
            <FixedStar top={45} left={60} />
          </div>

          <div className="h-screen w-screen relative">
            {isGameActive &&
              animatedElements.map((item) => (
                <AnimatedElement
                  key={item.id}
                  id={item.id}
                  src={item.src}
                  duration={item.duration}
                  isPaused={isPaused}
                />
              ))}
          </div>

          <div className="fase3-overlay absolute inset-0 pointer-events-none"></div>
        </div>
      )}
    </>
  );
}
