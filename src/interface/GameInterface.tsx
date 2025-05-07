export interface GameContextProps {
  hits: number;
  errors: number;
  timeLeft: number;
  isPaused: boolean;
  isGameActive: boolean;
  setHits: (value: number) => void;
  setErrors: (value: number) => void;
  setTimeLeft: (value: number) => void;
  setIsPaused: (value: boolean) => void;
  setIsGameActive: (value: boolean) => void;
}
