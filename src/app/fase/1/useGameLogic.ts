import { useState } from "react";
import { useGameContext } from "@/context/GameContext";

type StarPosition = {
  top: number;
  left: number;
  id: number;
};

const INITIAL_STAR_POSITIONS: ReadonlyArray<StarPosition> = [
  { top: 10, left: 20, id: 1 },
  { top: 30, left: 50, id: 2 },
  { top: 70, left: 70, id: 3 },
  { top: 70, left: 10, id: 4 },
  { top: 20, left: 70, id: 5 },
] as const;

const LEVEL_HIT_INCREMENT = 20;
const LEVEL_ERROR_DECREMENT = 15;
const LEVEL_MIN = 0;
const LEVEL_MAX = 100;

export function useGameLogic() {
  const [stars, setStars] = useState<StarPosition[]>([...INITIAL_STAR_POSITIONS]);
  const [level, setLevel] = useState(0);
  const { hits, setHits, errors, setErrors } = useGameContext();

  const handleRemove = (id: number) => {
    setStars((prev) => prev.filter((star) => star.id !== id));
  };

  const handleHit = (id: number) => {
    setLevel((current) => Math.min(current + LEVEL_HIT_INCREMENT, LEVEL_MAX));
    setHits(hits + 1);
    handleRemove(id);
  };

  const handleError = () => {
    setErrors(errors + 1);
    setLevel((current) => Math.max(current - LEVEL_ERROR_DECREMENT, LEVEL_MIN));
  };

  return { stars, level, handleHit, handleError, handleRemove };
}
