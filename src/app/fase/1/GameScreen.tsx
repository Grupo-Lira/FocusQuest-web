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
import { Input } from "@/components/Input";
import { Card } from "@/components/Card";
import axios from "axios";

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
    errors,
    setName, 
    gameData,
  } = useGameContext();
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const { startAudio, pauseAudio } = useGameAudio();

  const handleGameEnd = async () => {
    setIsPaused(true);
    setIsGameActive(false);
    setAudioGameStarted(false);
    
    const accuracy = ((hits / (hits + errors)) * 100).toFixed(2);
    const time = 60 - timeLeft;
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    const formattedTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0"
    )}`;

    const finalData = {
      ...gameData,
      hits,
      errorsCount: errors,
      accuracy: Number(accuracy),
      time: formattedTime,
    };

    console.log(finalData);

    try{
      const response = await axios.post("http://localhost:4000/ranking", finalData);
      if (response.status === 201) {
        console.log("Dados enviados com sucesso:", response.data);
      }
    } catch (error) {
      console.error("Erro ao finalizar o jogo:", error);
    }
  };

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
      handleGameEnd();
    }
  }, [timeLeft]);

  useEffect(() => {
    if (hits === 15) {
      
      setShowSuccessModal(true);
      setIsPaused(true);
      pauseAudio();
      handleGameEnd();
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
              <Card title="Digite seu nome">
                <Input
                  type="input"
                  placeholder="Nome"
                  name="name"
                  onChange={(e) => setName(e.target.value)}
                />
                <Button text="Clique para iniciar o jogo" onClick={handleStartGame} />
              </Card>
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
