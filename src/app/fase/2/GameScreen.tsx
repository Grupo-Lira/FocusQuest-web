"use client";

import { AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { AnimatedElement } from "@/components/AnimatedElements/AnimatedElement";
import { NavbarGame } from "@/components/NavbarGame";
import { SettingsButton } from "@/components/SettingsButton";
import { SettingsModal } from "@/components/SettingsModal";
import { Metricas } from "@/components/SuccessScreen";
import { Clouds } from "@/components/fase2/Clouds";
import { GameOverlay } from "@/components/fase2/GameOverlay";
import { PlanetsAnimation } from "@/components/fase2/PlanetsAnimations";
import { StarsField } from "@/components/fase2/StarsField";
import { animatedElementsFase2 } from "@/config/gameConfig";
import { stars } from "@/constants/fase2Stars";
import { useAudio } from "@/context/AudioContext";
import { useGameContext } from "@/context/GameContext";
import { usePatient } from "@/context/PatientContext";
import { usePlanets } from "@/hooks/usePlanets";
import { useSocketIO } from "@/hooks/useWebSocket";

export type PlanetaResposta = {
  planeta: number;
  correto: boolean;
};

const ROUND_TIME_SECONDS = 15;
const STAR_PICK_INTERVAL_MS = 2000;
const SHINING_DURATION_MS = 10000;
const FIRST_ROUND = 1;
const NAVBAR_LABEL = "ENCONTRE E FIXE OS OLHOS NO ALVO BRILHANDO" as const;

const pickRandomIndex = (total: number, lastIndex: number | null) => {
  const nextIndex = Math.floor(Math.random() * total);
  if (nextIndex === lastIndex) return pickRandomIndex(total, lastIndex);
  return nextIndex;
};

export function GameScreen() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [shiningStar, setShiningStar] = useState<string | null>(null);
  const [data, setData] = useState<Metricas | undefined>(undefined);
  const [planetasSelecionados, setPlanetasSelecionados] = useState<PlanetaResposta[]>([]);
  const [currentRound, setCurrentRound] = useState(FIRST_ROUND);

  const lastIndexRef = useRef<number | null>(null);

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
  const { startAudio } = useAudio();
  const { activePlanets, startGame, resetPlanets } = usePlanets();
  const { socket, isConnected } = useSocketIO();
  const { selectedPacienteId } = usePatient();

  const handleStartGame = () => {
    setIsGameActive(true);
    setAudioGameStarted(true);
    startAudio();
    startGame(currentRound);

    socket?.emit("iniciar_fase2", { fase: 2, usuarioId: selectedPacienteId });
  };

  const advanceToNextRound = () => {
    const nextRound = currentRound + 1;
    setCurrentRound(nextRound);
    setTimeLeft(ROUND_TIME_SECONDS);
    setIsPaused(false);
    setIsGameActive(true);
    resetPlanets();
    startGame(nextRound);
  };

  const handleCloseForm = () => {
    setShowFormModal(false);
    setPlanetasSelecionados([]);

    if (currentRound === FIRST_ROUND) {
      advanceToNextRound();
      return;
    }
    setShowSuccessModal(true);
  };

  const onCloseSettings = () => {
    setIsModalOpen(false);
    setIsPaused(false);
  };

  const onOpenSettings = () => {
    setIsModalOpen(true);
    setIsPaused(true);
  };

  useEffect(() => {
    if (isGameActive === false) return;

    const pickStar = () => {
      const randomIndex = pickRandomIndex(stars.length, lastIndexRef.current);
      const randomStar = stars[randomIndex];
      setShiningStar(randomStar.id);
      lastIndexRef.current = randomIndex;
      setTimeout(() => setShiningStar(null), SHINING_DURATION_MS);
    };

    pickStar();
    const interval = setInterval(pickStar, STAR_PICK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [isGameActive]);

  useEffect(() => {
    setPhase(2);
  }, []);

  useEffect(() => {
    if (timeLeft !== 0) return;
    setIsPaused(true);
    setIsGameActive(false);
    setShowFormModal(true);

    if (socket !== null && isConnected === true) {
      console.debug("Tempo esgotado. Emitindo 'aguardando_iot' para o backend.");
      socket.emit("aguardando_iot");
    }
  }, [timeLeft, setIsPaused, setIsGameActive, socket, isConnected]);

  useEffect(() => {
    if (showSuccessModal === false) return;
    if (socket === null || isConnected === false) return;
    console.debug("Mostrando tela de sucesso. Emitindo 'fase_atual_finalizada'.");
    socket.emit("fase_atual_finalizada");
  }, [showSuccessModal, socket, isConnected]);

  useEffect(() => {
    if (socket === null) return;

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

  if (isModalOpen === true) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <SettingsModal isStoppedGame={true} onClick={onCloseSettings} />
      </div>
    );
  }

  return (
    <div className="fase2 relative w-full h-screen overflow-hidden">
      <Clouds />

      <div className="flex justify-center mt-6 z-20">
        <NavbarGame label={NAVBAR_LABEL} />
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

      <SettingsButton onClick={onOpenSettings} />

      <StarsField shiningStar={shiningStar} />

      <div className="h-screen w-screen relative">
        {isGameActive === true
          ? animatedElementsFase2.map((item) => (
              <AnimatedElement
                key={item.id}
                id={item.id}
                src={item.src}
                duration={item.duration}
                isPaused={isPaused}
              />
            ))
          : null}
      </div>

      <AnimatePresence>
        {activePlanets.map((planet) => (
          <PlanetsAnimation key={planet.src} activePlanet={planet} />
        ))}
      </AnimatePresence>
    </div>
  );
}
