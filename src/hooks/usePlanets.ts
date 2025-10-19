import { useRef, useState } from "react";

const planets = [
  { id: "blue-green", src: "/img/focos-fase-2/blue-green.png" },
  { id: "blue", src: "/img/focos-fase-2/blue.png" },
  { id: "gray", src: "/img/focos-fase-2/gray.png" },
  { id: "green", src: "/img/focos-fase-2/green.png" },
  { id: "orange", src: "/img/focos-fase-2/orange.png" },
  { id: "pink", src: "/img/focos-fase-2/pink.png" },
  { id: "purple", src: "/img/focos-fase-2/purple.png" },
];

interface PlanetInstance {
  src: string;
  start: { left: string | number; bottom: number | string };
  end: { left: string | number; bottom: number | string };
  side: "left" | "right";
}

export function usePlanets() {
  const [activePlanets, setActivePlanets] = useState<PlanetInstance[]>([]);
  const appearedPlanetsRef = useRef<string[]>([]);
  const planetCountRef = useRef(0);

  const removeActivePlanetBySrc = (src: string) => {
    setActivePlanets((prev) => prev.filter((p) => p.src !== src));
  };

  const triggerPlanet = (starLeft: number) => {
    // se já apareceram 3, não mostra mais
    if (planetCountRef.current >= 3) return;

    if (Math.random() > 1) return;

    // pega um planeta que ainda não apareceu
    const remainingPlanets = planets.filter(
      (p) => !appearedPlanetsRef.current.includes(p.id)
    );
    if (remainingPlanets.length === 0) return;

    const randomPlanet =
      remainingPlanets[Math.floor(Math.random() * remainingPlanets.length)];

    // define diagonal: esquerda → canto inferior direito, direita → canto inferior esquerdo
    const side = starLeft < 50 ? "right" : "left";
    const start =
      side === "right" ? { left: "50%", bottom: 0 } : { left: 0, bottom: "100%" };
    const end =
      side === "right" ? { left: "80%", bottom: "100%" } : { left: "50%", bottom: 0 };

    const newPlanet: PlanetInstance = { src: randomPlanet.src, start, end, side };

    // atualiza estados e refs
    
    setActivePlanets((prev) => [...prev, newPlanet]);
    appearedPlanetsRef.current.push(randomPlanet.id);
    planetCountRef.current += 1;

    // remove depois de 4s
    setTimeout(() => {
      removeActivePlanetBySrc(randomPlanet.src);
    }, 2000);

    if (planetCountRef.current === 3) {
      console.log("Planetas que apareceram:", appearedPlanetsRef.current);
    }
  };

  const resetPlanets = () => {
    appearedPlanetsRef.current = [];
    planetCountRef.current = 0;
  };

  return { activePlanets, triggerPlanet, resetPlanets };
}
