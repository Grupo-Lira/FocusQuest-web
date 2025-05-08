"use client";
import NavbarGame from "@/components/NavbarGame";
import Thermometer from "@/components/Thermometer";
import Star from "@/components/Star";
import { useGameLogic } from "./useGameLogic";
import SettingsModal from "@/components/SettingsModal";
import { useEffect, useState } from "react";
import { Bolt } from "lucide-react";
import { useGameContext } from "@/context/GameContext";
import { AnimatedElement } from "@/components/AnimatedElement";

export default function GameScreen() {
  const { stars, level, handleHit, handleError } = useGameLogic();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { setIsPaused, setIsGameActive } = useGameContext();

  useEffect(() => {
    setIsGameActive(true);
    return () => {  
      setIsGameActive(false);
    };
  }, [setIsGameActive]);

  return (
    <>
      {!isModalOpen && (
        <div className="fase1 relative w-full h-screen overflow-hidden">
          <div className="flex justify-center mt-6">
            <NavbarGame />
          </div>
          <div className="absolute top-44 ml-6 z-20">
            <Thermometer level={level} />
          </div>
          <div
            className="bg-[var(--primary)] w-11 h-11 rounded-full absolute flex items-center justify-center button-glow transition-all duration-300 top-9 right-9"
            onClick={() => {
              setIsModalOpen(true);
              setIsPaused(true);
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
            <AnimatedElement
              src="/img/distracoes/nave.png"
              initial={{ x: "0%", y: "0%" }}
              animate={{ x: "100vw", y: "-100vh" }}
              duration={5}
            />
            <AnimatedElement
              src="/img/distracoes/meteoro.png"
              initial={{ x: "100vw", y: "-100vh" }}
              animate={{ x: "0vw", y: "-30vh" }}
              duration={3}
            />
            <AnimatedElement
              src="/img/distracoes/meteoroet.png"
              initial={{ x: "0vw", y: "-150vh" }}
              animate={{ x: "100vw", y: "-80vh" }}
              duration={2}
            />
            <AnimatedElement
              src="/img/distracoes/ovni.png"
              initial={{ x: "0vw", y: "-130vh" }}
              animate={{ x: "100vw", y: "-130vh" }}
              duration={5}
              repeatType="reverse"
            />
            <AnimatedElement
              src="/img/distracoes/et.png"
              initial={{ x: "30vw", y: "-130vh" }}
              animate={{ x: "60vw", y: "-130vh" }}
              duration={2}
              repeatType="reverse"
            />
          </div>
        </div>
      )}
      {isModalOpen && (
        <div className="flex items-center justify-center min-h-screen">
          <SettingsModal
            isStoppedGame={true}
            onClick={() => {
              setIsModalOpen(false);
              setIsPaused(false);
            }}
          />
        </div>
      )}
    </>
  );
}
