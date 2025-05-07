"use client";
import NavbarGame from "@/components/NavbarGame";
import Thermometer from "@/components/Thermometer";
import Star from "@/components/Star";
import { useGameLogic } from "./useGameLogic";

export default function GameScreen() {
  const { stars, level, handleHit, handleError } = useGameLogic();

  return (
    <div className="fase1 relative w-full h-screen overflow-hidden">
      <div className="flex justify-center mt-6">
        <NavbarGame />
      </div>
      <div className="absolute top-44 ml-6">
        <Thermometer level={level} />
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
  );
}
