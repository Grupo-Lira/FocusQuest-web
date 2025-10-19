"use client";

import NavbarGame from "@/components/NavbarGame";
import SettingsModal from "@/components/SettingsModal";
import { useEffect, useRef, useState } from "react";
import { useGameContext } from "@/context/GameContext";
import { AnimatedElement } from "@/components/AnimatedElements/AnimatedElement";
import { animatedElementsFase2 } from "@/config/gameConfig";
import { useGameAudio } from "@/hooks/useGameAudio";
import Image from "next/image";
import FixedStar from "@/components/FixedStar";
import { stars } from "@/constants/fase2Stars";
import { AnimatePresence, motion } from "framer-motion";
import SettingsButton from "@/components/SettingsButton";
import Clouds from "@/components/fase2/Clouds";
import GameOverlay from "@/components/fase2/GameOverlay";
import { usePlanets } from "@/hooks/usePlanets";

export default function GameScreen() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const {
    isPaused,
    setIsPaused,
    setIsGameActive,
    audioGameStarted,
    setAudioGameStarted,
    isGameActive,
    setTimeLeft,
    timeLeft,
    setPhase,
  } = useGameContext();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [shiningStar, setShiningStar] = useState<string | null>(null);

  const [currentRound, setCurrentRound] = useState(1);

  const { startAudio, pauseAudio } = useGameAudio({ fase: 2 });
  const { activePlanet, triggerPlanet, resetPlanets } = usePlanets();

  const handleStartGame = () => {
    setIsGameActive(true);
    setAudioGameStarted(true);
    startAudio();
  };

  const handleCloseForm = () => {
    setShowFormModal(false);
    setCurrentRound((prev) => prev + 1); // avança para a próxima rodada
    setTimeLeft(10); // reseta o tempo para 10 segundos
    setIsPaused(false);
    setIsGameActive(true);
    startAudio();
    resetPlanets();
  };

  useEffect(() => {
    if (!audioGameStarted) return;
    if (isPaused) {
      pauseAudio();
    } else {
      startAudio();
    }
  }, [isPaused, audioGameStarted]);

  const lastIndexRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isGameActive) return;

    const pickStar = () => {
      let randomIndex: number;

      do {
        randomIndex = Math.floor(Math.random() * stars.length);
      } while (randomIndex === lastIndexRef.current);

      const randomStar = stars[randomIndex];
      setShiningStar(randomStar.id);
      lastIndexRef.current = randomIndex;

      triggerPlanet(randomStar.left);

      setTimeout(() => setShiningStar(null), 10000);
    };

    // brilha imediatamente ao começar
    pickStar();

    const interval = setInterval(pickStar, 2000);
    return () => clearInterval(interval);
  }, [isGameActive]);

  useEffect(() => {
    setPhase(2);
  }, []);

  useEffect(() => {
    if (timeLeft === 0) {
      setIsPaused(true);
      setIsGameActive(false);
      pauseAudio();

      if (currentRound < 3) {
        setShowFormModal(true);
      } else {
        // Se for a última, mostra tela de sucesso
        setShowSuccessModal(true);
      }
    }
  }, [timeLeft]);

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
        <div className="fase2 relative w-full h-screen overflow-hidden">
          <Clouds />

          <div className="flex justify-center mt-6 z-20">
            <NavbarGame label="ENCONTRE E FIXE OS OLHOS NO ALVO BRILHANDO" />
          </div>

          <GameOverlay
            audioGameStarted={audioGameStarted}
            showSuccessModal={showSuccessModal}
            showFormModal={showFormModal}
            onStart={handleStartGame}
            onCloseForm={handleCloseForm}
          />

          <SettingsButton
            onClick={() => {
              setIsModalOpen(true);
              setIsPaused(true);
              pauseAudio();
            }}
          />

          <div className="h-[70%] w-screen ml-32 relative">
            {stars.map((star) => (
              <FixedStar
                key={star.id}
                top={star.top}
                left={star.left}
                isShining={shiningStar === star.id}
              />
            ))}
          </div>

          <div className="h-screen w-screen relative">
            {isGameActive &&
              animatedElementsFase2.map((item) => (
                <AnimatedElement
                  key={item.id}
                  id={item.id}
                  src={item.src}
                  duration={item.duration}
                  isPaused={isPaused}
                />
              ))}
          </div>

          <AnimatePresence>
            {activePlanet && (
              <motion.div
                key={activePlanet.src}
                initial={activePlanet.start}
                animate={activePlanet.end}
                exit={{ opacity: 0 }}
                transition={{ duration: 2, ease: "easeInOut" }}
                className="absolute"
              >
                <Image src={activePlanet.src} alt="Planeta" width={120} height={120} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </>
  );
}
