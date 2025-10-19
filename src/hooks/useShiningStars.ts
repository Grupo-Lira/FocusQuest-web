import { useRef, useState } from "react";
import { stars } from "@/constants/fase2Stars";

export function useShiningStars(triggerPlanet: (n: number) => void) {
  const [shiningStar, setShiningStar] = useState<string | null>(null);
  const lastIndexRef = useRef<number | null>(null);

  const pickStar = () => {
    let randomIndex: number;
    do {
      randomIndex = Math.floor(Math.random() * stars.length);
    } while (randomIndex === lastIndexRef.current);

    const randomStar = stars[randomIndex];
    setShiningStar(randomStar.id);
    lastIndexRef.current = randomIndex;
    triggerPlanet(randomStar.left);

    setTimeout(() => setShiningStar(null), 8000);
  };

  const startShiningLoop = () => {
    pickStar();
    const interval = setInterval(pickStar, 2000);
    return () => clearInterval(interval);
  };

  return { shiningStar, pickStar, startShiningLoop };
}
