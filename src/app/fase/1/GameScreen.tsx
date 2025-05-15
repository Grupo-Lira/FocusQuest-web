"use client";

import NavbarGame from "@/components/NavbarGame";
import Thermometer from "@/components/Thermometer";
import Star from "@/components/Star";
import SettingsModal from "@/components/SettingsModal";
import { useEffect, useState } from "react";
import { Bolt } from "lucide-react";
import { useGameContext } from "@/context/GameContext";
import { AnimatedElement } from "@/components/AnimatedElements/AnimatedElement";
import { Button } from "@/components/Button";
import { useGameLogic } from "./useGameLogic";
import { animatedElements } from "@/config/gameConfig";
import { useGameAudio } from "@/hooks/useGameAudio";
import TimeOut from "@/components/TimeOut";
import SuccessScreen from "@/components/SuccessScreen";

export default function GameScreen() {
  const { stars, level, handleHit, handleError } = useGameLogic();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTimeUpModalOpen, setIsTimeUpModalOpen] = useState(false);
  const {
    isPaused,
    setIsPaused,
    setIsGameActive,
    audioGameStarted,
    setAudioGameStarted,
    isGameActive,
    hits,
    timeLeft,
  } = useGameContext();
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const { startAudio, pauseAudio } = useGameAudio();

  const handleStartGame = () => {
    setIsGameActive(true);
    setAudioGameStarted(true);
    startAudio();
  };

  useEffect(() => {
    if (!audioGameStarted) return;
    void (isPaused ? pauseAudio() : startAudio());
  }, [isPaused, audioGameStarted]);

  useEffect(() => {
    if (timeLeft === 0) {
      setIsTimeUpModalOpen(true);
      setIsPaused(true);
      pauseAudio();
    }
  }, [timeLeft]);

  useEffect(() => {
    if (hits === 15) {
      setShowSuccessModal(true);
      setIsPaused(true);
      pauseAudio();
    }
  }, [hits]);

  return (
    <>
      {!isModalOpen ? (
        <div className="fase1 relative w-full h-screen overflow-hidden">
          <div className="flex justify-center mt-6 z-20">
            <NavbarGame />
          </div>

          <div className="absolute top-44 ml-6 z-20">
            <Thermometer level={level} />
          </div>

          {!audioGameStarted && (
            <div className="absolute inset-0 z-50 bg-black/70 flex items-center justify-center">
              <Button text="Clique para iniciar o jogo" onClick={handleStartGame} />
            </div>
          )}

          {isTimeUpModalOpen && (
            <div className="absolute inset-0 z-50 bg-black/70 flex items-center justify-center">
              <TimeOut />
            </div>
          )}

          {showSuccessModal && (
            <div className="absolute inset-0 z-50 bg-black/70 flex items-center justify-center">
              <SuccessScreen />
            </div>
          )}

          <div
            className="bg-[var(--primary)] z-20 w-11 h-11 rounded-full absolute flex items-center justify-center button-glow transition-all duration-300 top-9 right-9"
            onClick={() => {
              setIsModalOpen(true);
              setIsPaused(true);
              pauseAudio();
            }}
          >
            <Bolt color="white" />
          </div>

          <div className="h-[70%] w-screen ml-32 relative">
            {stars.map((star) => (
              <Star
                key={star.id}
                top={star.top}
                left={star.left}
                onRemove={() => handleHit(star.id)}
                onError={handleError}
              />
            ))}
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
        </div>
      ) : (
        isModalOpen && (
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
        )
      )}
    </>
  );
}
