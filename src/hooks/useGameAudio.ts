interface UseGameAudioProps {
  fase: number;
}

export function useGameAudio({fase} : UseGameAudioProps) {
  let gameAudio: HTMLAudioElement | null = null;

  if (globalThis.window !== undefined) {
    gameAudio = new Audio(`/audio/fase${fase}.mp3`);
    gameAudio.loop = true;
  }

  const startAudio = () => {
    if (gameAudio) {
      gameAudio.play().catch((e) => console.warn("Erro ao iniciar o áudio:", e));
    }
  };

  const pauseAudio = () => {
    if (gameAudio) {
      gameAudio.pause();
    }
  };

  return { startAudio, pauseAudio };
}
