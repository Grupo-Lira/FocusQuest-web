"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { GameContextProps } from "@/interface/GameInterface";

const GameContext = createContext<GameContextProps | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hits, setHits] = useState(0);
  const [errors, setErrors] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isGameActive, setIsGameActive] = useState(false);
  const [audioGameStarted, setAudioGameStarted] = useState(false);

  useEffect(() => {
    if (!isGameActive || isPaused || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 500);

    return () => clearInterval(interval);
  }, [isGameActive, isPaused, timeLeft]);

  return (
    <GameContext.Provider
      value={{
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
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGameContext = (): GameContextProps => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGameContext must be used within a GameProvider");
  }
  return context;
};
