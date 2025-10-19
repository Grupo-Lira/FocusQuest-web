export interface GameContextProps {
  hits: number;
  phase: number;
  errors: number;
  timeLeft: number;
  isPaused: boolean;
  isGameActive: boolean;
  audioGameStarted: boolean;
  setHits: (value: number) => void;
  setPhase: (value: number) => void;
  setErrors: (value: number) => void;
  setTimeLeft: (value: number) => void;
  setIsPaused: (value: boolean) => void;
  setIsGameActive: (value: boolean) => void;
  setAudioGameStarted: (value: boolean) => void;
}
