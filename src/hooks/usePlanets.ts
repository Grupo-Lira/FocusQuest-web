import { useRef, useState } from "react";

type Planet = {
  id: string;
  src: string;
};

type PlanetPosition = {
  left: string;
  top: string;
};

type PlanetPath = {
  start: PlanetPosition;
  end: PlanetPosition;
};

type PlanetInstance = {
  src: string;
  start: PlanetPosition;
  end: PlanetPosition;
  duration: number;
};

const planets: ReadonlyArray<Planet> = [
  { id: "blue-green", src: "/img/focos-fase-2/blue-green.png" },
  { id: "blue", src: "/img/focos-fase-2/blue.png" },
  { id: "gray", src: "/img/focos-fase-2/gray.png" },
  { id: "green", src: "/img/focos-fase-2/green.png" },
  { id: "orange", src: "/img/focos-fase-2/orange.png" },
  { id: "pink", src: "/img/focos-fase-2/pink.png" },
  { id: "purple", src: "/img/focos-fase-2/purple.png" },
];

const roundConfig: Readonly<Record<number, ReadonlyArray<string>>> = {
  1: ["blue-green", "pink", "purple"],
  2: ["gray", "blue", "green"],
};

const APPEARANCE_SCHEDULE_MS: ReadonlyArray<number> = [4000, 8000, 12000];
const VISIBLE_DURATION_MS = 2000;
const ROUND_LOG_DELAY_MS = 10000;
const MIN_TRAVEL_DURATION_SECONDS = 1.5;
const MAX_TRAVEL_DURATION_SECONDS = 2.1;
const JITTER_PERCENT = 8;

const randomBetween = (min: number, max: number): number => {
  return Math.random() * (max - min) + min;
};

const toPercent = (value: number): string => `${value}%`;

const applyJitter = (value: number): number => {
  return value + randomBetween(-JITTER_PERCENT, JITTER_PERCENT);
};

const PATH_GENERATORS: ReadonlyArray<() => PlanetPath> = [
  () => ({
    start: { left: toPercent(applyJitter(5)), top: toPercent(applyJitter(10)) },
    end: { left: toPercent(applyJitter(55)), top: toPercent(applyJitter(75)) },
  }),
  () => ({
    start: { left: toPercent(applyJitter(90)), top: toPercent(applyJitter(10)) },
    end: { left: toPercent(applyJitter(40)), top: toPercent(applyJitter(75)) },
  }),
  () => ({
    start: { left: toPercent(applyJitter(10)), top: toPercent(applyJitter(80)) },
    end: { left: toPercent(applyJitter(60)), top: toPercent(applyJitter(15)) },
  }),
  () => ({
    start: { left: toPercent(applyJitter(85)), top: toPercent(applyJitter(80)) },
    end: { left: toPercent(applyJitter(35)), top: toPercent(applyJitter(15)) },
  }),
  () => ({
    start: { left: toPercent(applyJitter(0)), top: toPercent(applyJitter(45)) },
    end: { left: toPercent(applyJitter(80)), top: toPercent(applyJitter(30)) },
  }),
  () => ({
    start: { left: toPercent(applyJitter(95)), top: toPercent(applyJitter(45)) },
    end: { left: toPercent(applyJitter(20)), top: toPercent(applyJitter(60)) },
  }),
  () => ({
    start: { left: toPercent(applyJitter(50)), top: toPercent(applyJitter(0)) },
    end: { left: toPercent(applyJitter(25)), top: toPercent(applyJitter(70)) },
  }),
  () => ({
    start: { left: toPercent(applyJitter(50)), top: toPercent(applyJitter(90)) },
    end: { left: toPercent(applyJitter(70)), top: toPercent(applyJitter(20)) },
  }),
] as const;

const pickPathIndex = (lastIndex: number | null): number => {
  const nextIndex = Math.floor(Math.random() * PATH_GENERATORS.length);
  if (nextIndex === lastIndex) return pickPathIndex(lastIndex);
  return nextIndex;
};

const buildPlanetInstance = (src: string, pathIndex: number): PlanetInstance => {
  const path = PATH_GENERATORS[pathIndex]();
  const duration = randomBetween(MIN_TRAVEL_DURATION_SECONDS, MAX_TRAVEL_DURATION_SECONDS);
  const instance = { src, start: path.start, end: path.end, duration };
  return instance;
};

export function usePlanets() {
  const [activePlanets, setActivePlanets] = useState<PlanetInstance[]>([]);
  const appearedPlanetsRef = useRef<string[]>([]);
  const planetCountRef = useRef(0);
  const lastPathIndexRef = useRef<number | null>(null);

  const removeActivePlanetBySrc = (src: string) => {
    setActivePlanets((prev) => prev.filter((planet) => planet.src !== src));
  };

  const triggerSpecificPlanet = (planetId: string) => {
    const planetToShow = planets.find((planet) => planet.id === planetId);
    if (!planetToShow) {
      console.error(`Planeta com ID "${planetId}" não encontrado.`);
      return;
    }

    const pathIndex = pickPathIndex(lastPathIndexRef.current);
    lastPathIndexRef.current = pathIndex;

    const newPlanet = buildPlanetInstance(planetToShow.src, pathIndex);

    setActivePlanets((prev) => [...prev, newPlanet]);
    appearedPlanetsRef.current.push(planetToShow.id);
    planetCountRef.current += 1;

    setTimeout(() => {
      removeActivePlanetBySrc(planetToShow.src);
    }, VISIBLE_DURATION_MS);

    if (planetCountRef.current === 3) {
      console.log("Planetas que apareceram:", appearedPlanetsRef.current);
    }
  };

  const startGame = (currentRound: number) => {
    setActivePlanets([]);
    appearedPlanetsRef.current = [];
    planetCountRef.current = 0;
    lastPathIndexRef.current = null;

    const planetsForThisRound = roundConfig[currentRound];
    if (!planetsForThisRound) {
      console.error(`Configuração não encontrada para o round: ${currentRound}`);
      return;
    }

    for (const [index, time] of APPEARANCE_SCHEDULE_MS.entries()) {
      const planetIdToShow = planetsForThisRound[index];
      if (planetIdToShow) {
        setTimeout(() => {
          triggerSpecificPlanet(planetIdToShow);
        }, time);
      }
    }

    setTimeout(() => {
      console.log(
        `Fim do round ${currentRound}. Planetas mostrados:`,
        appearedPlanetsRef.current
      );
    }, ROUND_LOG_DELAY_MS);
  };

  const resetPlanets = () => {
    appearedPlanetsRef.current = [];
    planetCountRef.current = 0;
    lastPathIndexRef.current = null;
    setActivePlanets([]);
  };

  return { activePlanets, startGame, resetPlanets };
}