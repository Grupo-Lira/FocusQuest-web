"use client";

import NavbarGame from "@/components/NavbarGame";
import SettingsModal from "@/components/SettingsModal";
import { useEffect, useRef, useState } from "react";
import { Bolt } from "lucide-react";
import { useGameContext } from "@/context/GameContext";
import { AnimatedElement } from "@/components/AnimatedElements/AnimatedElement";
import { Button } from "@/components/Button";
import { animatedElementsFase2 } from "@/config/gameConfig";
import { useGameAudio } from "@/hooks/useGameAudio";
import Image from "next/image";
import SuccessScreen from "@/components/SuccessScreen";
import FixedStar from "@/components/FixedStar";
import { stars } from "@/constants/fase2Stars";
import { AnimatePresence, motion } from "framer-motion";
import SettingsButton from "@/components/SettingsButton";

const planets = [
  { id: "blue-green", src: "/img/focos-fase-2/blue-green.png" },
  { id: "blue", src: "/img/focos-fase-2/blue.png" },
  { id: "gray", src: "/img/focos-fase-2/gray.png" },
  { id: "green", src: "/img/focos-fase-2/green.png" },
  { id: "orange", src: "/img/focos-fase-2/orange.png" },
  { id: "pink", src: "/img/focos-fase-2/pink.png" },
  { id: "purple", src: "/img/focos-fase-2/purple.png" },
];

type PlanetInstance = {
  src: string;
  start: { left: string | number; bottom: number | string };
  end: { left: string | number; bottom: number | string };
  side: "left" | "right";
};

export default function GameScreen() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const {
    isPaused,
    setIsPaused,
    setIsGameActive,
    audioGameStarted,
    setAudioGameStarted,
    isGameActive,
    timeLeft,
    setPhase,
  } = useGameContext();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [shiningStar, setShiningStar] = useState<string | null>(null);
  const [activePlanet, setActivePlanet] = useState<PlanetInstance | null>(null);
  const appearedPlanetsRef = useRef<string[]>([]); // armazena os que já apareceram
  const planetCountRef = useRef(0); // contador interno

  const { startAudio, pauseAudio } = useGameAudio({ fase: 2 });

  const handleStartGame = () => {
    setIsGameActive(true);
    setAudioGameStarted(true);
    startAudio();
  };

  useEffect(() => {
    if (!audioGameStarted) return;
    if (isPaused) {
      pauseAudio();
    } else {
      startAudio();
    }
  }, [isPaused, audioGameStarted]);

  const lastIndexRef = useRef<number | null>(null);

  const triggerPlanet = (starLeft: number) => {
    // se já apareceram 3, não mostra mais
    if (planetCountRef.current >= 3) return;

    // chance de 40% de aparecer
    if (Math.random() > 0.9) return;

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

    const newPlanet: PlanetInstance = {
      src: randomPlanet.src,
      start,
      end,
      side,
    };

    // atualiza estados e refs
    setActivePlanet(newPlanet);
    appearedPlanetsRef.current.push(randomPlanet.id);
    planetCountRef.current += 1;

    // remove depois de 4s
    setTimeout(() => setActivePlanet(null), 2000);

    if (planetCountRef.current === 3) {
      console.log("Planetas que apareceram:", appearedPlanetsRef.current);
    }
  };

  useEffect(() => {
    if (!isGameActive) return;

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

    // brilha imediatamente ao começar
    pickStar();

    const interval = setInterval(pickStar, 2000);
    return () => clearInterval(interval);
  }, [isGameActive]);

  useEffect(() => {
    setPhase(2);
  }, []);

  useEffect(() => {
    if (timeLeft === 0) {
      setShowSuccessModal(true);
      setIsPaused(true);
      setIsGameActive(false);
      pauseAudio();
    }
  }, [timeLeft]);

  return (
    <>
      {isModalOpen ? (
        <div className="flex items-center justify-center min-h-screen">
          <SettingsModal
            isStoppedGame={true}
            onClick={() => {
              setIsModalOpen(false);
              setIsPaused(false);
              startAudio();
            }}
          />
        </div>
      ) : (
        <div className="fase2 relative w-full h-screen overflow-hidden">
          <Image
            src="/img/nuvens/nuvem1.svg"
            alt="nuvem"
            className="absolute top-[20%] left-[5%] w-[30%] sm:w-[25%] md:w-[18%] lg:w-[12%] h-auto"
            height={144}
            width={280}
          />

          <Image
            src="/img/nuvens/nuvem2.svg"
            alt="nuvem"
            className="absolute bottom-[23%] left-[14%] w-[28%] sm:w-[24%] md:w-[18%] lg:w-[14%] h-auto"
            height={144}
            width={280}
          />

          <Image
            src="/img/nuvens/nuvem3.svg"
            alt="nuvem"
            className="absolute bottom-[30%] left-[35%] w-[18%] sm:w-[14%] md:w-[12%] lg:w-[10%] h-auto"
            height={100}
            width={200}
          />

          <Image
            src="/img/nuvens/nuvem4.svg"
            alt="nuvem"
            className="absolute bottom-[30%] right-[35%] w-[18%] sm:w-[14%] md:w-[12%] lg:w-[10%] h-auto"
            height={100}
            width={200}
          />

          <Image
            src="/img/nuvens/nuvem5.svg"
            alt="nuvem"
            className="absolute bottom-[55%] right-[15%] w-[18%] sm:w-[14%] md:w-[12%] lg:w-[10%] h-auto"
            height={100}
            width={200}
          />

          <Image
            src="/img/nuvens/nuvem6.svg"
            alt="nuvem"
            className="absolute bottom-[25%] right-[15%] w-[16%] sm:w-[12%] md:w-[10%] lg:w-[8%] h-auto"
            height={100}
            width={200}
          />

          <div className="flex justify-center mt-6 z-20">
            <NavbarGame label="ENCONTRE E FIXE OS OLHOS NO ALVO BRILHANDO" />
          </div>

          {!audioGameStarted && (
            <div className="absolute inset-0 z-50 bg-black/70 flex items-center justify-center">
              <Button text="Clique para iniciar o jogo" onClick={handleStartGame} />
            </div>
          )}

          {showSuccessModal && (
            <div className="absolute inset-0 z-50 bg-black/70 flex items-center justify-center">
              <SuccessScreen />
            </div>
          )}

          <button
            type="button"
            aria-label="Open settings"
            className="bg-[var(--primary)] z-20 w-11 h-11 rounded-full absolute flex items-center justify-center button-glow transition-all duration-300 top-9 right-9"
            onClick={() => {
              setIsModalOpen(true);
              setIsPaused(true);
              pauseAudio();
            }}
          >
            <Bolt color="white" />
          </button>

          <SettingsButton onClick={() => {
            setIsModalOpen(true);
            setIsPaused(true);
            pauseAudio();
          }} />

          <div className="h-[70%] w-screen ml-32 relative">
            {stars.map((star) => (
              <FixedStar
                key={star.id}
                top={star.top}
                left={star.left}
                isShining={shiningStar === star.id}
              />
            ))}
          </div>

          <div className="h-screen w-screen relative">
            {isGameActive &&
              animatedElementsFase2.map((item) => (
                <AnimatedElement
                  key={item.id}
                  id={item.id}
                  src={item.src}
                  duration={item.duration}
                  isPaused={isPaused}
                />
              ))}
          </div>

          <AnimatePresence>
            {activePlanet && (
              <motion.div
                key={activePlanet.src}
                initial={activePlanet.start}
                animate={activePlanet.end}
                exit={{ opacity: 0 }}
                transition={{ duration: 2, ease: "easeInOut" }}
                className="absolute"
              >
                <Image src={activePlanet.src} alt="Planeta" width={120} height={120} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </>
  );
}
