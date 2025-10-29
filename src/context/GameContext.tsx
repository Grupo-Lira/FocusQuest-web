"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import { GameContextProps } from "@/interface/GameInterface";

// Tempo por fase — edite aqui para mudar os tempos por fase
const PHASE_TIMES: Record<number, number> = {
  1: 60, // fase 1 = 60s
  2: 15, // fase 2 = 15s
  3: 30, // fase 3 = 30s
};

const getTimeForPhase = (phase: number) => PHASE_TIMES[phase] ?? 60;

const GameContext = createContext<GameContextProps | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [phase, setPhase] = useState<number>(1); // fase atual
  const faseTime = useMemo(() => getTimeForPhase(phase), [phase]);

  const [hits, setHits] = useState(0);
  const [errors, setErrors] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(faseTime);
  const [isGameActive, setIsGameActive] = useState(false);
  const [audioGameStarted, setAudioGameStarted] = useState(false);

  // quando a fase muda, reseta o timeLeft para o tempo da nova fase
  useEffect(() => {
    setTimeLeft(faseTime);
  }, [faseTime]);

  // contador do jogo
  useEffect(() => {
    if (!isGameActive || isPaused || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsGameActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isGameActive, isPaused, timeLeft, setIsGameActive]);

  const value = useMemo(
    () => ({
      phase,
      setPhase,
      hits,
      errors,
      timeLeft,
      setHits,
      setErrors,
      setTimeLeft,
      setIsPaused,
      isPaused,
      isGameActive,
      setIsGameActive,
      audioGameStarted,
      setAudioGameStarted,
    }),
    [phase, hits, errors, timeLeft, isPaused, isGameActive, audioGameStarted]
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export const useGameContext = (): GameContextProps => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGameContext must be used within a GameProvider");
  }
  return context;
};
