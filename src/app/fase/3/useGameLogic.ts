import { useEffect, useState } from "react";
import { useGameContext } from "@/context/GameContext";
import { useRandomStars } from "@/hooks/useRandomStars";

type StarPosition = {
  top: number;
  left: number;
  id: number;
};

const STAR_COUNT = 5;
const LEVEL_HIT_INCREMENT = 20;
const LEVEL_ERROR_DECREMENT = 15;
const LEVEL_MIN = 0;
const LEVEL_MAX = 100;

export function useGameLogic() {
  const [stars, setStars] = useState<StarPosition[]>([]);
  const [level, setLevel] = useState(0);
  const { hits, setHits, errors, setErrors } = useGameContext();
  const { generate } = useRandomStars(STAR_COUNT);

  useEffect(() => {
    setStars(generate());
  }, []);

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

  return { stars, level, handleHit, handleError };
}
