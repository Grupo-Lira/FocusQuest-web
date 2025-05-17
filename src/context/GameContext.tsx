"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { GameContextProps, GameData, RankingItem } from "@/interface/GameInterface";

const GameContext = createContext<GameContextProps | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [gameData, setGameData] = useState<Partial<GameData>>({});

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

  const setName = (name: string) => {
    setGameData((prev) => ({ ...prev, name }));
  };

  const resetGameData = () => {
    setGameData({});
    setHits(0);
    setErrors(0);
    setIsPaused(false);
    setTimeLeft(60);
    setIsGameActive(false);
    setAudioGameStarted(false);
    setRanking([]);
    setLoading(true);
  };

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
        gameData,
        setGameData,
        setName,
        resetGameData,
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
