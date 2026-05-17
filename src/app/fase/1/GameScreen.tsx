"use client";

import { Bolt } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { OverlayInstruction } from "@/components/Calibration/OverlayInstruction";
import { AnimatedElement } from "@/components/AnimatedElements/AnimatedElement";
import { NavbarGame } from "@/components/NavbarGame";
import { SettingsModal } from "@/components/SettingsModal";
import { Star } from "@/components/Star";
import { Metricas, SuccessScreen } from "@/components/SuccessScreen";
import { Thermometer } from "@/components/Thermometer";
import { TimeOut } from "@/components/TimeOut";
import { PatientSelectModal } from "@/components/PatientSelectModal";
import { animatedElements } from "@/config/gameConfig";
import { fase1Steps } from "@/constants/steps";
import { useAudio } from "@/context/AudioContext";
import { GazeData, useEyeTracking } from "@/context/EyeTrackingContext";
import { useGameContext } from "@/context/GameContext";
import { usePatient } from "@/context/PatientContext";
import { useSocketIO } from "@/hooks/useWebSocket";
import { useGameLogic } from "./useGameLogic";

type TargetConfig = {
  id: number;
  x_max: string;
  x_min: string;
  y_max: string;
  y_min: string;
};

const TOLERANCE_X = 0.15;
const TOLERANCE_Y = 0.15;
const START_TRACKING_DELAY_MS = 500;
const GAZE_EMIT_INTERVAL_MS = 1000;
const NAVBAR_LABEL = "ENCONTRE E FIXE OS OLHOS NOS 5 ALVOS DURANTE 5 SEGUNDOS" as const;
const TIME_EXCEEDED_REASON = "TEMPO_FASE_EXCEDIDO" as const;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const computeRelativeCoordinates = (
  container: HTMLDivElement,
  relativeLeft: number,
  relativeTop: number
) => {
  const rect = container.getBoundingClientRect();
  const centerX = rect.left + (rect.width * relativeLeft) / 100;
  const centerY = rect.top + (rect.height * relativeTop) / 100;
  const normalizedX = centerX / window.innerWidth;
  const normalizedY = centerY / window.innerHeight;

  return {
    x_min: Math.max(0, normalizedX - TOLERANCE_X),
    x_max: Math.min(1, normalizedX + TOLERANCE_X),
    y_min: Math.max(0, normalizedY - TOLERANCE_Y),
    y_max: Math.min(1, normalizedY + TOLERANCE_Y),
  };
};

const normalizeGaze = (value: number, max: number) => {
  const clamped = Math.max(0, Math.min(1, value / max));
  return clamped;
};

const hasGazeChanged = (current: GazeData, last: GazeData | null) => {
  if (last === null) return true;
  return (
    current.x !== last.x || current.y !== last.y || current.timestamp !== last.timestamp
  );
};

export function GameScreen() {
  const starsContainerRef = useRef<HTMLDivElement>(null);
  const lastSentGazeRef = useRef<GazeData | null>(null);
  const lastGazeRef = useRef<GazeData | null>(null);

  const { stars, level, handleHit, handleError, handleRemove } = useGameLogic();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTimeUpModalOpen, setIsTimeUpModalOpen] = useState(false);
  const [successModalData, setSuccessModalData] = useState<Metricas | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [shiningStars, setShiningStars] = useState<number[]>([]);
  const [isPatientSelectOpen, setIsPatientSelectOpen] = useState(true);

  const {
    isPaused,
    setIsPaused,
    setIsGameActive,
    audioGameStarted,
    setAudioGameStarted,
    isGameActive,
    timeLeft,
  } = useGameContext();
  const { stopTracking, isWebGazerLoaded, startTracking, lastGazeData, isTracking } =
    useEyeTracking();
  const { startAudio } = useAudio();
  const { socket, isConnected } = useSocketIO();
  const { selectedPacienteId, setSelectedPacienteId } = usePatient();

  const turnOnStar = (target: TargetConfig) => {
    setShiningStars((prev) => {
      if (prev.includes(target.id) === true) return prev;
      return [...prev, target.id];
    });
  };

  const turnOffStar = (target: TargetConfig) => {
    handleRemove(target.id);
  };

  const buildTargetsConfig = () => {
    const container = starsContainerRef.current;
    if (container === null) return [];

    const configs = stars.map((star) => {
      const coords = computeRelativeCoordinates(container, star.left, star.top);
      return { id: star.id, ...coords };
    });
    return configs;
  };

  const handleStartGame = async () => {
    if (isWebGazerLoaded === true) {
      console.debug("Iniciando rastreamento ocular...");
      await wait(START_TRACKING_DELAY_MS);
      await startTracking(false, false);
    } else {
      console.warn("Web gazer ainda não está carregado!");
    }

    if (isConnected === true && socket !== null && stars.length > 0) {
      console.debug("Enviando configuração dos alvos para o servidor...");
      const targetsConfig = buildTargetsConfig();

      if (targetsConfig.length > 0) {
        console.debug("EMITINDO evento: fase_1_alvos_configuracao", targetsConfig.length);
        console.log("FASE 1 - usuarioId sendo enviado:", selectedPacienteId);
        socket.emit("iniciar_fase1", {
          fase1: targetsConfig,
          usuarioId: selectedPacienteId,
        });
      }
    }

    setIsGameActive(true);
    setAudioGameStarted(true);
    startAudio();
  };

  const handlePatientSelect = (pacienteId: string) => {
    setSelectedPacienteId(pacienteId);
    setIsPatientSelectOpen(false);
  };

  const handlePatientSelectCancel = () => {
    window.location.href = "/fichas";
  };

  const onCloseSettings = async () => {
    setIsModalOpen(false);
    setIsPaused(false);
    await startTracking(false, false);
    startAudio();
  };

  const onOpenSettings = () => {
    setIsModalOpen(true);
    setIsPaused(true);
    stopTracking();
  };

  useEffect(() => {
    if (timeLeft !== 0) return;
    socket?.emit("fase_1_tempo_excedido");
    stopTracking();
    setIsTimeUpModalOpen(true);
    setIsPaused(true);
  }, [timeLeft]);

  useEffect(() => {
    if (socket === null) return;

    socket.on("fase1_iniciada", (data) => {
      console.debug("Fase iniciada:", data);
      turnOnStar(data.alvo);
    });

    socket.on("brilhar_estrela", (data) => {
      console.debug("Destaque Estrela:", data);
      turnOnStar(data.alvo);
    });

    socket.on("gaze_status", (data) => {
      console.debug("Status do gaze:", data);
    });

    socket.on("alvo_fase1_concluido", (data) => {
      console.debug("Alvo finalizado, apagando:", data);
      turnOffStar(data.alvo);
    });

    socket.on("experimento_concluido", (data) => {
      console.debug("Experimento concluído:", data);
    });

    socket.on("fase_concluida", (data) => {
      console.debug("Fase concluída:", data);
      setIsPaused(true);
      stopTracking();
      setSuccessModalData(data?.metricas);

      const shouldShowSuccess = timeLeft !== 0 && data?.motivo !== TIME_EXCEEDED_REASON;
      if (shouldShowSuccess === true) {
        setShowSuccessModal(true);
      }
    });

    return () => {
      socket.off("fase_iniciada");
      socket.off("gaze_status");
      socket.off("fase_atual_finalizada");
      socket.off("experimento_concluido");
      socket.off("alvo_fase1_concluido");
      socket.off("fase_concluida");
    };
  }, [socket]);

  useEffect(() => {
    lastGazeRef.current = lastGazeData;
  }, [lastGazeData]);

  useEffect(() => {
    if (isConnected === false || socket === null) return;
    if (isTracking === false || isPaused === true) return;

    const interval = setInterval(() => {
      const gaze = lastGazeRef.current;
      if (gaze === null || socket.connected === false) return;

      const normalizedX = normalizeGaze(gaze.x, window.innerWidth);
      const normalizedY = normalizeGaze(gaze.y, window.innerHeight);
      const isNewData = hasGazeChanged(gaze, lastSentGazeRef.current);

      if (isNewData === false) return;

      socket.emit("gaze_data_fase1", {
        x: normalizedX,
        y: normalizedY,
        rawX: gaze.x,
        rawY: gaze.y,
        timestamp: gaze.timestamp,
      });
      lastSentGazeRef.current = { ...gaze };
    }, GAZE_EMIT_INTERVAL_MS);

    return () => {
      console.debug("Parando emissão de gaze data...");
      clearInterval(interval);
    };
  }, [isConnected, socket, isTracking, isPaused]);

  if (isModalOpen === true) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <SettingsModal isStoppedGame={true} onClick={onCloseSettings} />
      </div>
    );
  }

  const successData = successModalData === null ? undefined : successModalData;

  return (
    <div className="fase1 relative w-full h-screen overflow-hidden">
      <PatientSelectModal
        isOpen={isPatientSelectOpen}
        onSelect={handlePatientSelect}
        onCancel={handlePatientSelectCancel}
      />

      <div className="flex justify-center mt-6 z-20">
        <NavbarGame label={NAVBAR_LABEL} />
      </div>

      <div className="absolute top-15 ml-6 z-20">
        <Thermometer level={level} />
      </div>

      {audioGameStarted === false ? (
        <OverlayInstruction onComplete={handleStartGame} steps={fase1Steps} />
      ) : null}

      {isTimeUpModalOpen === true ? (
        <div className="absolute inset-0 z-50 bg-black/70 flex items-center justify-center">
          <TimeOut data={successData} />
        </div>
      ) : null}

      {showSuccessModal === true ? (
        <div className="absolute inset-0 z-50 bg-black/70 flex items-center justify-center">
          <SuccessScreen fase={2} data={successData} />
        </div>
      ) : null}

      <button
        type="button"
        aria-label="Open settings"
        className="bg-[var(--primary)] z-20 w-11 h-11 rounded-full absolute flex items-center justify-center button-glow transition-all duration-300 top-9 right-9"
        onClick={onOpenSettings}
      >
        <Bolt color="white" />
      </button>

      <div className="h-[70%] w-[100%] ml-32 relative" ref={starsContainerRef}>
        {stars.map((star) => (
          <Star
            key={star.id}
            top={star.top}
            left={star.left}
            onRemove={() => handleHit(star.id)}
            onError={handleError}
            isShining={shiningStars.includes(star.id)}
          />
        ))}
      </div>

      <div className="h-screen w-screen relative">
        {isGameActive === true
          ? animatedElements.map((item) => (
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
    </div>
  );
}
