"use client";

import { Bolt } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { OverlayInstruction } from "@/components/Calibration/OverlayInstruction";
import { AnimatedElement } from "@/components/AnimatedElements/AnimatedElement";
import { FixedStar } from "@/components/FixedStar";
import { NavbarGame } from "@/components/NavbarGame";
import { SettingsModal } from "@/components/SettingsModal";
import { SuccessScreen } from "@/components/SuccessScreen";
import { animatedElements } from "@/config/gameConfig";
import { fase3Steps } from "@/constants/steps";
import { useAudio } from "@/context/AudioContext";
import { GazeData, useEyeTracking } from "@/context/EyeTrackingContext";
import { useGameContext } from "@/context/GameContext";
import { useSocketIO } from "@/hooks/useWebSocket";

type Fase3BoundingBox = {
  x_min: number;
  x_max: number;
  y_min: number;
  y_max: number;
};

const NAVBAR_LABEL =
  "FOQUE OS OLHOS NAS ESTRELAS E QUANDO O SINALIZADOR ACENDER, FOQUE NELE!" as const;
const TIME_EXCEEDED_REASON = "TEMPO_FASE_EXCEDIDO" as const;
const PHASE_NUMBER = 3;
const START_TRACKING_DELAY_MS = 500;
const GAZE_EMIT_INTERVAL_MS = 250;
const DEFAULT_TOLERANCE_X = 0.15;
const DEFAULT_TOLERANCE_Y = 0.15;
const STAR_CONTAINER_STYLE = { top: "45%", left: "60%", width: 40, height: 38 } as const;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const normalizeGaze = (value: number, max: number) => {
  const clamped = Math.max(0, Math.min(1, value / max));
  return clamped;
};

const hasGazeChanged = (current: GazeData, last: GazeData | null) => {
  if (last === null) return true;
  return (
    current.x !== last.x ||
    current.y !== last.y ||
    current.timestamp !== last.timestamp
  );
};

const getBoundingBox = (
  element: HTMLElement | null,
  toleranceX: number = DEFAULT_TOLERANCE_X,
  toleranceY: number = DEFAULT_TOLERANCE_Y,
): Fase3BoundingBox | null => {
  if (element === null) return null;

  const rect = element.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const normalizedX = centerX / window.innerWidth;
  const normalizedY = centerY / window.innerHeight;

  return {
    x_min: Math.max(0, normalizedX - toleranceX),
    x_max: Math.min(1, normalizedX + toleranceX),
    y_min: Math.max(0, normalizedY - toleranceY),
    y_max: Math.min(1, normalizedY + toleranceY),
  };
};

const getSignalClassName = (isShining: boolean) => {
  if (isShining === true) return "sinalizador brilhando";
  return "sinalizador";
};

const isRadarTarget = (alvo: string | undefined) => {
  if (alvo === undefined) return false;
  return String(alvo).toUpperCase() === "RADAR";
};

export function GameScreen() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isShining, setIsShining] = useState(false);

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
  const { startAudio } = useAudio();
  const { socket, isConnected } = useSocketIO();
  const { stopTracking, isWebGazerLoaded, startTracking, lastGazeData, isTracking } =
    useEyeTracking();

  const radarRef = useRef<HTMLDivElement>(null);
  const starContainerRef = useRef<HTMLDivElement>(null);
  const lastGazeRef = useRef<GazeData | null>(null);
  const lastSentGazeRef = useRef<GazeData | null>(null);
  const fase3ConfigRef = useRef<Fase3BoundingBox[]>([]);

  const buildPhaseConfig = () => {
    const estrela = getBoundingBox(starContainerRef.current);
    const radar = getBoundingBox(radarRef.current);
    const fase3 = [estrela, radar].filter(
      (item): item is Fase3BoundingBox => item !== null,
    );
    return fase3;
  };

  const handleStartGame = async () => {
    if (isWebGazerLoaded === true) {
      await wait(START_TRACKING_DELAY_MS);
      await startTracking(false, false);
    }

    if (isConnected === true && socket !== null) {
      const fase3 = buildPhaseConfig();
      fase3ConfigRef.current = fase3;

      if (fase3.length > 0) {
        // TODO: Replace hardcoded usuarioId with dynamic value
        socket.emit("iniciar_fase3", {
          usuarioId: "123",
          alvoInicialNome: "ESTRELA",
          fase3,
        });
      }
    }

    setIsGameActive(true);
    setAudioGameStarted(true);
    startAudio();
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
    setPhase(PHASE_NUMBER);
  }, [setPhase]);

  useEffect(() => {
    if (socket === null) return;

    const onBrilhar = (data: { alvo?: string }) => {
      setIsShining(isRadarTarget(data?.alvo));
    };

    socket.on("brilhar_alvo_fase3", onBrilhar);
    return () => {
      socket.off("brilhar_alvo_fase3", onBrilhar);
    };
  }, [socket]);

  useEffect(() => {
    if (timeLeft !== 0) return;
    socket?.emit("fase_3_tempo_excedido");
    stopTracking();
    setShowSuccessModal(true);
    setIsPaused(true);
  }, [timeLeft, socket, stopTracking, setIsPaused]);

  useEffect(() => {
    if (socket === null) return;

    socket.on("fase_concluida", (data) => {
      setIsPaused(true);
      stopTracking();

      const shouldShowSuccess = timeLeft !== 0 && data?.motivo !== TIME_EXCEEDED_REASON;
      if (shouldShowSuccess === true) {
        setShowSuccessModal(true);
      }
    });

    return () => {
      socket.off("fase_concluida");
    };
  }, [socket, setIsPaused, stopTracking, timeLeft]);

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

      socket.emit("gaze_data_fase3", {
        x: normalizedX,
        y: normalizedY,
        timestamp: gaze.timestamp,
        larguraTela: window.innerWidth,
      });
      lastSentGazeRef.current = { ...gaze };
    }, GAZE_EMIT_INTERVAL_MS);

    return () => {
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

  const signalClassName = getSignalClassName(isShining);
  const showStar = isShining === false && isGameActive === true;

  return (
    <div className="fase3-container relative w-full h-screen overflow-hidden">
      <div className="flex justify-center mt-6 relative z-11">
        <NavbarGame label={NAVBAR_LABEL} />
      </div>

      <div>
        <div ref={radarRef} className={signalClassName} />
        <div className="base-sinalizador" />
      </div>

      {audioGameStarted === false ? (
        <OverlayInstruction onComplete={handleStartGame} steps={fase3Steps} />
      ) : null}

      {showSuccessModal === true ? (
        <div className="absolute inset-0 z-50 bg-black/70 flex items-center justify-center">
          <SuccessScreen fase={2} />
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

      <div className="h-[45%] w-screen z-11 relative">
        <div ref={starContainerRef} className="absolute" style={STAR_CONTAINER_STYLE} />
        <FixedStar top={45} left={60} isShining={showStar} />
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

      <div className="fase3-overlay absolute inset-0 pointer-events-none" />
    </div>
  );
}
