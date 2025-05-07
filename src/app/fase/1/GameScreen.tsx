"use client";
import NavbarGame from "@/components/NavbarGame";
import Thermometer from "@/components/Thermometer";
import Star from "@/components/Star";
import { useGameLogic } from "./useGameLogic";
import SettingsModal from "@/components/SettingsModal";
import { useState } from "react";
import { Bolt } from "lucide-react";
import { useGameContext } from "@/context/GameContext";

export default function GameScreen() {
  const { stars, level, handleHit, handleError } = useGameLogic();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { setIsPaused } = useGameContext();

  return (
    <>
      {!isModalOpen && (
        <div className="fase1 relative w-full h-screen overflow-hidden">
          <div className="flex justify-center mt-6">
            <NavbarGame />
          </div>
          <div className="absolute top-44 ml-6">
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
        </div>
      )}
      {isModalOpen && (
        <div className="flex items-center justify-center min-h-screen">
          <SettingsModal isStoppedGame={true} onClick={() => {
            setIsModalOpen(false);
            setIsPaused(false);
            }} />
        </div>
      )}
    </>
  );
}
