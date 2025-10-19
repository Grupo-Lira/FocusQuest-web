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

  const triggerPlanet = () => {
    if (planetCountRef.current >= 3) return;

    // pega um planeta que ainda não apareceu
    const remainingPlanets = planets.filter(
      (p) => !appearedPlanetsRef.current.includes(p.id)
    );
    if (remainingPlanets.length === 0) return;

    const randomPlanet =
      remainingPlanets[Math.floor(Math.random() * remainingPlanets.length)];

    // sorteia o lado e a diagonal
    const side = Math.random() < 0.5 ? "right" : "left";
    const start =
      side === "right" ? { left: "50%", bottom: 0 } : { left: 0, bottom: "100%" };
    const end =
      side === "right" ? { left: "80%", bottom: "100%" } : { left: "50%", bottom: 0 };

    const newPlanet: PlanetInstance = { src: randomPlanet.src, start, end, side };

    // adiciona planeta ativo e marca como exibido
    setActivePlanets((prev) => [...prev, newPlanet]);
    appearedPlanetsRef.current.push(randomPlanet.id);
    planetCountRef.current += 1;

    // remove após 2s
    setTimeout(() => {
      removeActivePlanetBySrc(randomPlanet.src);
    }, 2000);

    // log final quando completar os 3
    if (planetCountRef.current === 3) {
      console.log("Planetas que apareceram:", appearedPlanetsRef.current);
    }
  };

  // --- 💫 NOVO: controla o tempo das aparições ---
  const startGame = () => {
    // limpa tudo
    setActivePlanets([]);
    appearedPlanetsRef.current = [];
    planetCountRef.current = 0;

    // define os segundos em que os planetas aparecem
    const schedule = [2000, 6000, 8000]; // ms = segundos 2, 6 e 8
  
    for (const time of schedule) {
      setTimeout(() => {
        triggerPlanet();
      }, time);
    }

    // log final após 10s
    setTimeout(() => {
      console.log("Fim do jogo. Planetas mostrados:", appearedPlanetsRef.current);
    }, 10000);
  };

  const resetPlanets = () => {
    appearedPlanetsRef.current = [];
    planetCountRef.current = 0;
    setActivePlanets([]);
  };

  return { activePlanets, triggerPlanet, startGame, resetPlanets };
}
