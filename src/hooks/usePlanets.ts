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

const roundConfig: { [key: number]: string[] } = {
  1: ["blue-green", "pink", "purple"], 
  2: ["gray", "blue", "green"],
};

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

  const triggerSpecificPlanet = (planetId: string) => {
    const planetToShow = planets.find((p) => p.id === planetId);
    if (!planetToShow) {
      console.error(`Planeta com ID "${planetId}" não encontrado.`);
      return;
    } // sorteia o lado e a diagonal (mantém essa parte aleatória)

    const side = Math.random() < 0.5 ? "right" : "left";
    const start =
      side === "right" ? { left: "50%", bottom: 0 } : { left: 0, bottom: "100%" };
    const end =
      side === "right" ? { left: "80%", bottom: "100%" } : { left: "50%", bottom: 0 };

    const newPlanet: PlanetInstance = {
      src: planetToShow.src,
      start,
      end,
      side,
    }; // adiciona planeta ativo e marca como exibido

    setActivePlanets((prev) => [...prev, newPlanet]);
    appearedPlanetsRef.current.push(planetToShow.id);
    planetCountRef.current += 1; // remove após 2s

    setTimeout(() => {
      removeActivePlanetBySrc(planetToShow.src);
    }, 2000); // log final quando completar os 3

    if (planetCountRef.current === 3) {
      console.log("Planetas que apareceram:", appearedPlanetsRef.current);
    }
  };

  // --- 💫 NOVO: controla o tempo das aparições ---
  const startGame = (currentRound: number) => {
    // limpa tudo
    setActivePlanets([]);
    appearedPlanetsRef.current = [];
    planetCountRef.current = 0; // Pega os planetas definidos para o round atual

    const planetsForThisRound = roundConfig[currentRound];
    if (!planetsForThisRound) {
      console.error(`Configuração não encontrada para o round: ${currentRound}`);
      return;
    } // define os segundos em que os planetas aparecem

    const schedule = [4000, 8000, 12000]; // ms = segundos 4, 8 e 12 // Agenda cada planeta específico do round

    schedule.forEach((time, index) => {
      const planetIdToShow = planetsForThisRound[index];
      if (planetIdToShow) {
        setTimeout(() => {
          triggerSpecificPlanet(planetIdToShow);
        }, time);
      }
    }); // log final após 10s

    setTimeout(() => {
      console.log(
        `Fim do round ${currentRound}. Planetas mostrados:`,
        appearedPlanetsRef.current
      );
    }, 10000);
  };

  const resetPlanets = () => {
    appearedPlanetsRef.current = [];
    planetCountRef.current = 0;
    setActivePlanets([]);
  }; // Remove triggerPlanet do retorno, pois não é mais usado externamente

  return { activePlanets, startGame, resetPlanets };
}
