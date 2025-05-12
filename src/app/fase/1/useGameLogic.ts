import { useEffect, useState } from "react";
import { useRandomStars } from "@/hooks/useRandomStars";
import { useGameContext } from "@/context/GameContext";

export function useGameLogic() {
  const [stars, setStars] = useState<{ top: number; left: number; id: number }[]>([]);
  const [level, setLevel] = useState(0);
  const { hits, setHits, errors, setErrors } = useGameContext();
  const { generate } = useRandomStars(5);

  useEffect(() => {
    setStars(generate());
  }, []);

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

  return { stars, level, handleHit, handleError };
}
