"use client";

import NavbarGame from "@/components/NavbarGame";
import SettingsModal from "@/components/SettingsModal";
import { useEffect, useRef, useState } from "react";
import { Bolt } from "lucide-react";
import { useGameContext } from "@/context/GameContext";
import { AnimatedElement } from "@/components/AnimatedElements/AnimatedElement";
import { animatedElements } from "@/config/gameConfig";
import SuccessScreen from "@/components/SuccessScreen";
import { useAudio } from "@/context/AudioContext";
import OverlayInstruction from "@/components/Calibration/OverlayInstruction";
import { fase3Steps } from "@/constants/steps";
import FixedStar from "@/components/FixedStar";
import { GazeData, useEyeTracking } from "@/context/EyeTrackingContext";
import { useSocketIO } from "@/hooks/useWebSocket";

type Fase3BoundingBox = {
  x_min: number;
  x_max: number;
  y_min: number;
  y_max: number;
};

export default function GameScreen() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isBrilhando, setIsBrilhando] = useState(false);

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

  const getBoundingBox = (
    element: HTMLElement | null,
    toleranceX = 0.15,
    toleranceY = 0.15
  ): Fase3BoundingBox | null => {
    if (!element) return null;

    const rect = element.getBoundingClientRect();

    // centro do elemento
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // normalização
    const normalizedX = centerX / window.innerWidth;
    const normalizedY = centerY / window.innerHeight;

    return {
      x_min: Math.max(0, normalizedX - toleranceX),
      x_max: Math.min(1, normalizedX + toleranceX),
      y_min: Math.max(0, normalizedY - toleranceY),
      y_max: Math.min(1, normalizedY + toleranceY),
    };
  };

  const handleStartGame = async () => {
    if (isWebGazerLoaded) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      await startTracking(false, false);
    }

    if (isConnected && socket) {
      const estrela = getBoundingBox(starContainerRef.current);
      const radar = getBoundingBox(radarRef.current);
      const fase3 = [estrela, radar].filter((item): item is Fase3BoundingBox => !!item);
      fase3ConfigRef.current = fase3;

      if (fase3.length > 0) {
        socket.emit("iniciar_fase3", {
          usuarioId: "123", // TODO: substituir pelo ID real do usuario logado
          alvoInicialNome: "ESTRELA",
          fase3,
        });
      }
    }

    setIsGameActive(true);
    setAudioGameStarted(true);
    startAudio();
  };

  useEffect(() => {
    setPhase(3);
  }, [setPhase]);

  useEffect(() => {
    if (!socket) return;

    const onBrilhar = (data: { alvo?: string }) => {
      setIsBrilhando(String(data?.alvo).toUpperCase() === "RADAR");
    };

    socket.on("brilhar_alvo_fase3", onBrilhar);
    return () => {
      socket.off("brilhar_alvo_fase3", onBrilhar);
    };
  }, [socket]);

  useEffect(() => {
    if (timeLeft === 0) {
      socket?.emit("fase_3_tempo_excedido");
      stopTracking();
      setShowSuccessModal(true);
      setIsPaused(true);
    }
  }, [timeLeft, socket, stopTracking, setIsPaused]);

  useEffect(() => {
    if (!socket) return;

    socket.on("fase_concluida", (data) => {
      setIsPaused(true);
      stopTracking();

      if (timeLeft !== 0 && data?.motivo !== "TEMPO_FASE_EXCEDIDO") {
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
    if (!isConnected || !socket || !isTracking || isPaused) return;

    const interval = setInterval(() => {
      const gaze = lastGazeRef.current;
      if (!gaze || !socket.connected) return;
      const normalizedX = Math.max(0, Math.min(1, gaze.x / window.innerWidth));
      const normalizedY = Math.max(0, Math.min(1, gaze.y / window.innerHeight));

      const isNewData =
        gaze.x !== lastSentGazeRef.current?.x ||
        gaze.y !== lastSentGazeRef.current?.y ||
        gaze.timestamp !== lastSentGazeRef.current?.timestamp;

      if (isNewData) {
        socket.emit("gaze_data_fase3", {
          x: normalizedX,
          y: normalizedY,
          timestamp: gaze.timestamp,
          larguraTela: window.innerWidth,
        });
        lastSentGazeRef.current = { ...gaze };
      }
    }, 250);

    return () => {
      clearInterval(interval);
    };
  }, [isConnected, socket, isTracking, isPaused]);

  return (
    <>
      {isModalOpen ? (
        <div className="flex items-center justify-center min-h-screen">
          <SettingsModal
            isStoppedGame={true}
            onClick={async () => {
              setIsModalOpen(false);
              setIsPaused(false);
              await startTracking(false, false);
              startAudio();
            }}
          />
        </div>
      ) : (
        <div className="fase3-container relative w-full h-screen overflow-hidden">
          <div className="flex justify-center mt-6 relative z-11">
            <NavbarGame label="FOQUE OS OLHOS NAS ESTRELAS E QUANDO O SINALIZADOR ACENDER, FOQUE NELE!" />
          </div>

          <div>
            <div
              ref={radarRef}
              className={`sinalizador ${isBrilhando ? "brilhando" : ""}`}
            />
            <div className="base-sinalizador" />
          </div>

          {!audioGameStarted && (
            <OverlayInstruction onComplete={handleStartGame} steps={fase3Steps} />
          )}

          {showSuccessModal && (
            <div className="absolute inset-0 z-50 bg-black/70 flex items-center justify-center">
              <SuccessScreen fase={2} />
            </div>
          )}

          <button
            type="button"
            aria-label="Open settings"
            className="bg-[var(--primary)] z-20 w-11 h-11 rounded-full absolute flex items-center justify-center button-glow transition-all duration-300 top-9 right-9"
            onClick={() => {
              setIsModalOpen(true);
              setIsPaused(true);
              stopTracking();
            }}
          >
            <Bolt color="white" />
          </button>

          <div className="h-[45%] w-screen z-11 relative">
            <div
              ref={starContainerRef}
              className="absolute"
              style={{ top: "45%", left: "60%", width: 40, height: 38 }}
            />
            <FixedStar top={45} left={60} isShining={!isBrilhando && isGameActive} />
          </div>

          <div className="h-screen w-screen relative">
            {isGameActive &&
              animatedElements.map((item) => (
                <AnimatedElement
                  key={item.id}
                  id={item.id}
                  src={item.src}
                  duration={item.duration}
                  isPaused={isPaused}
                />
              ))}
          </div>

          <div className="fase3-overlay absolute inset-0 pointer-events-none"></div>
        </div>
      )}
    </>
  );
}
