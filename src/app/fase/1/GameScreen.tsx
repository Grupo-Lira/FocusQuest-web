"use client";
import NavbarGame from "@/components/NavbarGame";
import Thermometer from "@/components/Thermometer";
import Star from "@/components/Star";
import { useGameLogic } from "./useGameLogic";
import SettingsModal from "@/components/SettingsModal";
import { useEffect, useState, useRef } from "react";
import { Bolt } from "lucide-react";
import { useGameContext } from "@/context/GameContext";
import { createTimeline } from "animejs";

export default function GameScreen() {
  const { stars, level, handleHit, handleError } = useGameLogic();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { setIsPaused, setIsGameActive } = useGameContext();

  const etRef = useRef<HTMLDivElement>(null);
  const naveRef = useRef<HTMLDivElement>(null);
  const meteoroRef = useRef<HTMLDivElement>(null);
  const meteoroetRef = useRef<HTMLDivElement>(null);
  const ovniRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsGameActive(true);
    return () => {
      setIsGameActive(false);
    };
  }, [setIsGameActive]);

  useEffect(() => {
    if (
      !etRef.current ||
      !naveRef.current ||
      !meteoroRef.current ||
      !meteoroetRef.current ||
      !ovniRef.current
    )
      return;

    const tl = createTimeline({
      defaults: {
        duration: 10000,
      },
      loop: true,
    });

    tl.label("start")
      // ET vai e volta horizontalmente
      .add(".et",
        {
          translateX: ["0vw", "100vw"],
          direction: "alternate",
        },
        "start"
      )

      // Nave entra e sai
      .add(".nave",
        {
          translateX: ["-10vw", "110vw"],
          opacity: [0, 1, 1, 0],
        },
        "start+=1000"
      )

      // Meteoro entra e sai ao contrário
      .add(".meteoro",
        {
          translateX: ["110vw", "-10vw"],
          opacity: [0, 1, 1, 0],
        },
        "start+=2000"
      )

      // OVNI passeando
      .add(".ovni",
        {
          translateX: ["0vw", "30vw", "60vw", "90vw", "0vw"],
          translateY: ["0vh", "20vh", "10vh", "30vh", "0vh"],
        },
        "start+=2500"
      )

      // MeteoroET diagonal
      .add(".meteoroet",
        {
          translateX: ["100vw", "-30vw"],
          translateY: ["0vh", "80vh"],
          opacity: [0, 1, 1, 0],
        },
        "start+=3000"
      );
  }, []);

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

          <div className="h-screen w-screen relative pointer-events-none">
            <div ref={etRef} className="et absolute" />
            <div ref={naveRef} className="nave absolute" />
            <div ref={meteoroRef} className="meteoro absolute" />
            <div ref={meteoroetRef} className="meteoroet absolute" />
            <div ref={ovniRef} className="ovni absolute" />
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
