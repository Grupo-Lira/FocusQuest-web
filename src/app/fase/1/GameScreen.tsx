"use client";
import NavbarGame from "@/components/NavbarGame";
import Thermometer from "@/components/Thermometer";
import Star from "@/components/Star";
import { useGameLogic } from "./useGameLogic";
import SettingsModal from "@/components/SettingsModal";
import { useEffect, useState } from "react";
import { Bolt } from "lucide-react";
import { useGameContext } from "@/context/GameContext";
import { AnimatedElement } from "@/components/AnimatedElements/AnimatedElement";
import { Button } from "@/components/Button";

const animatedElements = [
  {
    id: "nave",
    src: "/img/distracoes/nave.png",
    initial: { x: "0%", y: "0%" },
    animate: { x: "100vw", y: "-100vh" },
    duration: 5,
  },
  {
    id: "meteoro",
    src: "/img/distracoes/meteoro.png",
    initial: { x: "100vw", y: "-100vh" },
    animate: { x: "0vw", y: "-30vh" },
    duration: 3,
  },
  {
    id: "meteoroet",
    src: "/img/distracoes/meteoroet.png",
    initial: { x: "0vw", y: "-150vh" },
    animate: { x: "100vw", y: "-80vh" },
    duration: 2,
  },
  {
    id: "ovni",
    src: "/img/distracoes/ovni.png",
    initial: { x: "0vw", y: "-130vh" },
    animate: { x: "100vw", y: "-130vh" },
    duration: 5,
    repeatType: "reverse" as const,
  },
  {
    id: "et",
    src: "/img/distracoes/et.png",
    initial: { x: "30vw", y: "-130vh" },
    animate: { x: "60vw", y: "-130vh" },
    duration: 2,
    repeatType: "reverse" as const,
  },
];

const gameAudio = typeof window !== "undefined" ? new Audio("/audio/fase1.mp3") : null;

export default function GameScreen() {
  const { stars, level, handleHit, handleError } = useGameLogic();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const {
    isPaused,
    setIsPaused,
    setIsGameActive,
    audioGameStarted,
    setAudioGameStarted,
    isGameActive,
  } = useGameContext();

  const handleStartGame = () => {
    setIsGameActive(true);
    setAudioGameStarted(true);

    if (gameAudio) {
      gameAudio.loop = true;
      gameAudio.play().catch((e) => {
        console.warn("Falha ao tocar o áudio automaticamente:", e);
      });
    }
  };

  useEffect(() => {
    if (!audioGameStarted) return;

    return () => {
      setIsGameActive(false);
      if (gameAudio) {
        gameAudio.pause();
        gameAudio.currentTime = 0;
      }
    };
  }, [audioGameStarted, setAudioGameStarted]);

  return (
    <>
      {!isModalOpen ? (
        <div className="fase1 relative w-full h-screen overflow-hidden">
          {/* Navbar */}
          <div className="flex justify-center mt-6">
            <NavbarGame />
          </div>

          {/* Termômetro */}
          <div className="absolute top-44 ml-6 z-20">
            <Thermometer level={level} />
          </div>

          {/* Botão para iniciar o jogo com fundo escuro */}
          {!audioGameStarted && (
            <div className="absolute inset-0 z-50 bg-black/70 flex items-center justify-center">
              <Button text="Clique para iniciar o jogo" onClick={handleStartGame} />
            </div>
          )}

          {/* Botão para abrir configurações */}
          <div
            className="bg-[var(--primary)] w-11 h-11 rounded-full absolute flex items-center justify-center button-glow transition-all duration-300 top-9 right-9"
            onClick={() => {
              setIsModalOpen(true);
              setIsPaused(true);
              if (gameAudio) {
                gameAudio.pause();
              }
            }}
          >
            <Bolt color="white" />
          </div>

          {/* Estrelas */}
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

          {/* Elementos animados */}
          <div className="h-screen w-screen relative">
            {isGameActive &&
              animatedElements.map((item: (typeof animatedElements)[number]) => (
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
        <div className="flex items-center justify-center min-h-screen">
          <SettingsModal
            isStoppedGame={true}
            onClick={() => {
              setIsModalOpen(false);
              setIsPaused(false);
              if (gameAudio) {
                gameAudio.play();
              }
            }}
          />
        </div>
      )}
    </>
  );
}
