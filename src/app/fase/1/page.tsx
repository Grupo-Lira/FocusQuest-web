"use client";
import { useEffect, useState } from "react";
import NavbarGame from "@/components/NavbarGame";
import Thermometer from "@/components/Thermometer";
import Star from "@/components/Star";
import { useGameContext } from "@/context/GameContext";

export default function Fase1() {
  const [stars, setStars] = useState<{ top: number; left: number; id: number }[]>([]);
  const [level, setLevel] = useState(0);
  const {hits, setHits, errors, setErrors } = useGameContext();

  const randomizeStart = (): void => {
    const numStars = 5;
    const minDistance = 10;
    const isFarEnough = (
      top: number,
      left: number,
      starsList: { top: number; left: number }[]
    ) => {
      return starsList.every((star) => {
        const dx = star.left - left;
        const dy = star.top - top;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance >= minDistance;
      });
    };

    const newStars: { top: number; left: number; id: number }[] = [];

    while (newStars.length < numStars) {
      const top = Math.random() * 90;
      const left = Math.random() * 90;

      if (isFarEnough(top, left, newStars)) {
        newStars.push({ top, left, id: newStars.length });
      }
    }

    setStars(newStars);
  };

  useEffect(() => {
    randomizeStart();
  }, []);

  const handleRemove = (id: number) => {
    setStars((prev) => prev.filter((s) => s.id !== id));
  };

  const handleHit = (id: number) => {
    setLevel((l) => Math.min(l + 20, 100)); // aumenta 10%
    setHits(hits + 1);
    handleRemove(id);
  };

  const handleError = () => {
    setErrors(errors + 1);
    setLevel((l) => Math.max(l - 15, 0)); // diminui 5%
  };

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
