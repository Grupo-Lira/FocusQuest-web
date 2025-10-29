import { useGameContext } from "@/context/GameContext";
import { useState } from "react";

const positions_stars = [
  { top: 10, left: 20, id: 1 },
  { top: 30, left: 50, id: 2 },
  { top: 70, left: 70, id: 3 },
  { top: 70, left: 10, id: 4 },
  { top: 20, left: 70, id: 5 },
];

type StarPosition = {
  top: number;
  left: number;
  id: number;
};

export function useGameLogic() {
  const [stars, setStars] = useState<StarPosition[]>(positions_stars);
  const [level, setLevel] = useState(0);
  const { hits, setHits, errors, setErrors } = useGameContext();

  const handleRemove = (id: number) => {
    setStars((prev) => prev.filter((s) => s.id !== id));
  };

  const handleHit = (id: number) => {
    setLevel((l) => Math.min(l + 20, 100));
    setHits(hits + 1);
    handleRemove(id);
  };

  const handleError = () => {
    setErrors(errors + 1);
    setLevel((l) => Math.max(l - 15, 0));
  };

  return { stars, level, handleHit, handleError, handleRemove };
}
