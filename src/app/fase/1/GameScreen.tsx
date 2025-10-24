"use client";

import NavbarGame from "@/components/NavbarGame";
import Thermometer from "@/components/Thermometer";
import Star from "@/components/Star";
import SettingsModal from "@/components/SettingsModal";
import { useEffect, useRef, useState } from "react";
import { Bolt } from "lucide-react";
import { useGameContext } from "@/context/GameContext";
import { AnimatedElement } from "@/components/AnimatedElements/AnimatedElement";
import { useGameLogic } from "./useGameLogic";
import { animatedElements } from "@/config/gameConfig";
import TimeOut from "@/components/TimeOut";
import SuccessScreen from "@/components/SuccessScreen";
import { useAudio } from "@/context/AudioContext";
import OverlayInstruction from "@/components/Calibration/OverlayInstruction";
import { fase1Steps } from "@/constants/steps";
import { GazeData, useEyeTracking } from "@/context/EyeTrackingContext";
import { useSocketIO } from "@/hooks/useWebSocket";

export default function GameScreen() {
  const starsContainerRef = useRef<HTMLDivElement>(null);
  const { stars, level, handleHit, handleError, handleRemove } = useGameLogic();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTimeUpModalOpen, setIsTimeUpModalOpen] = useState(false);
  const {
    isPaused,
    setIsPaused,
    setIsGameActive,
    audioGameStarted,
    setAudioGameStarted,
    isGameActive,
    hits,
    timeLeft,
  } = useGameContext();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const {
    stopTracking,
    isWebGazerLoaded,
    startTrackingWithoutMouse,
    lastGazeData,
    isTracking,
  } = useEyeTracking();
  const lastSentGazeRef = useRef<GazeData | null>(null); //Vamos guardar a coordenada do olho anterior a coordenada atual
  const { startAudio } = useAudio();
  const { socket, isConnected } = useSocketIO();

  const lastGazeRef = useRef<GazeData | null>(null);
  const [estrelasBrilhantes, setEstrelasBrilhantes] = useState<number[]>([]);

  const handleStartGame = async () => {
    if (isWebGazerLoaded) {
      console.log("Iniciando rastreamento ocular...");
      await startTrackingWithoutMouse();
    } else {
      console.warn("Web gazer ainda não está carregado!");
    }

    if (isConnected && socket && stars.length > 0) {
      console.log("Enviando configuração dos alvos para o servidor...");
      const configAlvos = stars
        .map((star) => {
          const relativeCoords = getRelativeCoordinates(star.left, star.top);
          return {
            id: star.id,
            ...relativeCoords,
          };
        })
        .filter(Boolean);

      console.log(configAlvos.length);
      if (configAlvos.length > 0) {
        console.log(
          "EMITINDO evento: fase_1_alvos_configuracao, {}",
          configAlvos.length > 0
        );
        socket.emit("iniciar_experimento_com_config", configAlvos);
      }
    }

    setIsGameActive(true);
    setAudioGameStarted(true);
    startAudio();
  };

  const getRelativeCoordinates = (relativeLeft: number, relativeTop: number) => {
    if (!starsContainerRef.current) return null;

    const container = starsContainerRef.current;
    const rect = container.getBoundingClientRect();

    const centerX = rect.left + (rect.width * relativeLeft) / 100;
    const centerY = rect.top + (rect.height * relativeTop) / 100;

    const normalizedX = centerX / window.innerWidth;
    const normalizedY = centerY / window.innerHeight;

    //Aumentar área aceitavel de fixação
    const toleranceX = 0.05;
    const toleranceY = 0.05 * (window.innerWidth / window.innerHeight);

    return {
      x_min: Math.max(0, normalizedX - toleranceX),
      x_max: Math.min(1, normalizedX + toleranceX),
      y_min: Math.max(0, normalizedY - toleranceY),
      y_max: Math.min(1, normalizedY + toleranceY),
    };
  };

  //LOGICA DE BRILHAR ALVO ATUAL
  function brilharEstrela(alvo: {
    id: number;
    x_max: string;
    x_min: string;
    y_max: string;
    y_min: string;
  }) {
    // Adiciona o ID ao array de estrelas brilhantes
    setEstrelasBrilhantes((prev) => {
      if (!prev.includes(alvo.id)) {
        return [...prev, alvo.id];
      }
      return prev;
    });
  }

  //LOGICA DE APAGAR ALVO ATUAL
  function apagarEstrela(alvo: {
    id: number;
    x_max: string;
    x_min: string;
    y_max: string;
    y_min: string;
  }) {
    handleRemove(alvo.id);
  }

  useEffect(() => {
    if (timeLeft === 0) {
      stopTracking();
      setIsTimeUpModalOpen(true);
      setIsPaused(true);
    }
  }, [timeLeft]);

  useEffect(() => {
    if (hits === 5) {
      setShowSuccessModal(true);
      setIsPaused(true);
    }
  }, [hits]);

  useEffect(() => {
    if (!socket) return;

    socket.on("fase_iniciada", (data) => {
      console.log("Fase iniciada:", data);

      brilharEstrela(data.alvo);
    });

    socket.on("gaze_status", (data) => {
      console.log("Status do gaze:", data);
    });

    socket.on("fase_atual_finalizada", (data) => {
      console.log("Fase finalizada:", data);
      apagarEstrela(data.alvo);
    });

    socket.on("experimento_concluido", (data) => {
      console.log("Experimento concluído:", data);
    });

    return () => {
      socket.off("fase_iniciada");
      socket.off("gaze_status");
      socket.off("fase_atual_finalizada");
      socket.off("experimento_concluido");
    };
  }, [socket]);

  useEffect(() => {
    lastGazeRef.current = lastGazeData;
  }, [lastGazeData]);

  useEffect(() => {
    if (!isConnected || !socket || !isTracking) return;

    const interval = setInterval(() => {
      const gaze = lastGazeRef.current;
      if (gaze && socket.connected) {
        try {
          const normalizedX = Math.max(0, Math.min(1, gaze.x / window.innerWidth));
          const normalizedY = Math.max(0, Math.min(1, gaze.y / window.innerHeight));
          console.log("x: ", gaze.x, "x last: ", lastSentGazeRef.current?.x);
          console.log("y: ", gaze.y, "y last: ", lastSentGazeRef.current?.y);
          console.log("gaze.x !== last.x: ", gaze.x !== lastSentGazeRef.current?.x);
          console.log("gaze.y !== last.y: ", gaze.y !== lastSentGazeRef.current?.y);
          const isNewData =
            !gaze ||
            gaze.x !== lastSentGazeRef.current?.x ||
            gaze.y !== lastSentGazeRef.current?.y ||
            gaze.timestamp !== lastSentGazeRef.current?.timestamp;

          if (isNewData) {
            socket.emit("gaze_data", {
              x: normalizedX,
              y: normalizedY,
              rawX: gaze.x,
              rawY: gaze.y,
              timestamp: gaze.timestamp,
            });
            lastSentGazeRef.current = { ...gaze };
          }
        } catch (error) {
          console.error("Erro ao emitir gaze data:", error);
        }
      }
    }, 1000);

    return () => {
      console.log("Parando emissão de gaze data...");
      clearInterval(interval);
    };
  }, [isConnected, socket, isTracking]);

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
        <div className="fase1 relative w-full h-screen overflow-hidden">
          <div className="flex justify-center mt-6 z-20">
            <NavbarGame label="ENCONTRE E FIXE OS OLHOS NOS 5 ALVOS DURANTE 5 SEGUNDOS" />
          </div>

          <div className="absolute top-44 ml-6 z-20">
            <Thermometer level={level} />
          </div>

          {!audioGameStarted && (
            <OverlayInstruction onComplete={handleStartGame} steps={fase1Steps} />
          )}

          {isTimeUpModalOpen && (
            <div className="absolute inset-0 z-50 bg-black/70 flex items-center justify-center">
              <TimeOut />
            </div>
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
            }}
          >
            <Bolt color="white" />
          </button>

          <div className="h-[70%] w-screen ml-32 relative" ref={starsContainerRef}>
            {stars.map((star) => (
              <Star
                key={star.id}
                top={star.top}
                left={star.left}
                onRemove={() => handleHit(star.id)}
                onError={handleError}
                isBrilhante={estrelasBrilhantes.includes(star.id)}
              />
            ))}
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
        </div>
      )}
    </>
  );
}
