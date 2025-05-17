"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { GameContextProps, RankingItem } from "@/interface/GameInterface";

const GameContext = createContext<GameContextProps | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hits, setHits] = useState(0);
  const [errors, setErrors] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isGameActive, setIsGameActive] = useState(false);
  const [audioGameStarted, setAudioGameStarted] = useState(false);
  const [ranking, setRanking] = useState<RankingItem[]>([]);
  const [loading, setLoading] = useState(true);

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
        ranking,
        setRanking,
        loading,
        setLoading,
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
