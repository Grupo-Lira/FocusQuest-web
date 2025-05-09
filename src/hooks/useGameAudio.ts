let gameAudio: HTMLAudioElement | null = null;

if (typeof window !== "undefined") {
  gameAudio = new Audio("/audio/fase1.mp3");
  gameAudio.loop = true;
}

export function useGameAudio() {
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
