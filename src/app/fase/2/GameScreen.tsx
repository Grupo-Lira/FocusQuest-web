"use client";

import NavbarGame from "@/components/NavbarGame";
import SettingsModal from "@/components/SettingsModal";
import { useEffect, useRef, useState } from "react";
import { useGameContext } from "@/context/GameContext";
import { AnimatedElement } from "@/components/AnimatedElements/AnimatedElement";
import { animatedElementsFase2 } from "@/config/gameConfig";
import { stars } from "@/constants/fase2Stars";
import { AnimatePresence } from "framer-motion";
import SettingsButton from "@/components/SettingsButton";
import Clouds from "@/components/fase2/Clouds";
import GameOverlay from "@/components/fase2/GameOverlay";
import { usePlanets } from "@/hooks/usePlanets";
import PlanetsAnimation from "@/components/fase2/PlanetsAnimations";
import StarsField from "@/components/fase2/StarsField";
import { useAudio } from "@/context/AudioContext";
import { useSocketIO } from "@/hooks/useWebSocket";
import { Metricas } from "@/components/SuccessScreen";

export type PlanetaResposta = {
  planeta: number;
  correto: boolean;
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
    setTimeLeft,
    timeLeft,
    setPhase,
  } = useGameContext();

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [shiningStar, setShiningStar] = useState<string | null>(null);
  const [data, setData] = useState<Metricas | undefined>(undefined);

  const [planetasSelecionados, setPlanetasSelecionados] = useState<PlanetaResposta[]>([]);

  const [currentRound, setCurrentRound] = useState(1);

  const { startAudio } = useAudio();
  const { activePlanets, startGame, resetPlanets } = usePlanets();
  const { socket, isConnected } = useSocketIO();

  const handleStartGame = () => {
    setIsGameActive(true);
    setAudioGameStarted(true);
    startAudio();
    startGame(currentRound);

    //TODO-USAR-ID-DO-PACIENTE-REAL
    socket?.emit("iniciar_fase2", { fase: 2, usuarioId: 123 });
  };

  const handleCloseForm = () => {
    setShowFormModal(false);
    setPlanetasSelecionados([]);

    if (currentRound == 1) {
      const nextRound = currentRound + 1;
      setCurrentRound(nextRound); // avança para a próxima rodada
      setTimeLeft(15); // reseta o tempo para 15 segundos
      setIsPaused(false);
      setIsGameActive(true);
      resetPlanets();
      startGame(nextRound);
    } else {
      setShowSuccessModal(true);
    }
  };

  const lastIndexRef = useRef<number | null>(null);

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

      setTimeout(() => setShiningStar(null), 10000);
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
      setIsPaused(true);
      setIsGameActive(false);
      setShowFormModal(true);

      // AVISA O BACKEND QUE ESTÁ ESPERANDO A RESPOSTA DO IOT
      if (socket && isConnected) {
        console.debug("Tempo esgotado. Emitindo 'aguardando_iot' para o backend.");
        socket.emit("aguardando_iot");
      }
    }
  }, [timeLeft, setIsPaused, setIsGameActive, socket, isConnected]);

  useEffect(() => {
    // dispara no final do round 2, quando showSuccessModal vira true
    if (showSuccessModal && socket && isConnected) {
      console.debug("Mostrando tela de sucesso. Emitindo 'fase_atual_finalizada'.");
      socket.emit("fase_atual_finalizada");
    }
  }, [showSuccessModal, socket, isConnected]);

  useEffect(() => {
    if (!socket) return;

    const handlePlanetaResponse = (response: PlanetaResposta) => {
      console.debug("Resposta do planeta recebida:", response);
      setPlanetasSelecionados((prev) => [...prev, response]);
    };

    const handleFaseConcluida = (response: Metricas) => {
      console.debug("Fase concluída. Métricas recebidas:", response);
      setData(response);
    };

    socket.on("resposta_planeta", handlePlanetaResponse);
    socket.on("fase_atual_finalizada", handleFaseConcluida);
  }, [socket]);

  return (
    <>
      {isModalOpen ? (
        <div className="flex items-center justify-center min-h-screen">
          <SettingsModal
            isStoppedGame={true}
            onClick={() => {
              setIsModalOpen(false);
              setIsPaused(false);
            }}
          />
        </div>
      ) : (
        <div className="fase2 relative w-full h-screen overflow-hidden">
          <Clouds />

          <div className="flex justify-center mt-6 z-20">
            <NavbarGame label="ENCONTRE E FIXE OS OLHOS NO ALVO BRILHANDO" />
          </div>

          <GameOverlay
            audioGameStarted={audioGameStarted}
            showSuccessModal={showSuccessModal}
            data={data}
            planetasSelecionados={planetasSelecionados}
            showFormModal={showFormModal}
            onStart={handleStartGame}
            onCloseForm={handleCloseForm}
          />

          <SettingsButton
            onClick={() => {
              setIsModalOpen(true);
              setIsPaused(true);
            }}
          />

          <StarsField shiningStar={shiningStar} />

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
            {activePlanets.map((planet) => (
              <PlanetsAnimation key={planet.src} activePlanet={planet} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </>
  );
}
