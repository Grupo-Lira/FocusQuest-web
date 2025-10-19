"use client";

import { createContext, useContext, useRef, useState, useEffect, useCallback, useMemo } from "react";
import { useGameContext } from "./GameContext";
import { AudioContextType } from "@/interface/AudioInterface";

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [volume, setVolume] = useState(50); // volume padrão
   const {
      phase,
    } = useGameContext();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // cria o áudio e atualiza quando a fase muda
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }

    audioRef.current = new Audio(`/audio/fase${phase}.mp3`);
    audioRef.current.loop = true;
    audioRef.current.volume = volume / 100;

    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, [phase]);

  // atualiza o volume sempre que mudar
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  const startAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play().catch((e) => console.warn("Erro ao iniciar o áudio:", e));
    }
  }, []);

  const pauseAudio = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const value = useMemo(() => ({ volume, setVolume, startAudio, pauseAudio }), [volume, setVolume, startAudio, pauseAudio]);

  return (
    <AudioContext.Provider
      value={value}
    >
      {children}
    </AudioContext.Provider>
  );
};

export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error("useAudio deve ser usado dentro de um AudioProvider");
  }
  return context;
}
