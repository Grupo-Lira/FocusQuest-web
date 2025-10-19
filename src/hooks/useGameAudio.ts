import { useRef, useEffect } from "react";

interface UseGameAudioProps {
  fase: number;
}

export function useGameAudio({ fase }: UseGameAudioProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // cria o áudio apenas uma vez
    audioRef.current = new Audio(`/audio/fase${fase}.mp3`);
    audioRef.current.loop = true;

    return () => {
      // limpa quando o componente desmontar
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, [fase]);

  const startAudio = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.play().catch((e) => console.warn("Erro ao iniciar o áudio:", e));
    }
  };

  const pauseAudio = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
    }
  };

  return { startAudio, pauseAudio };
}
