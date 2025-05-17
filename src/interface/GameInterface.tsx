
export interface RankingItem {
  _id: string;
  name: string;
  time: number;
  accuracy: number;
  hits: number;
  errorsCount: number;
}
export interface GameContextProps {
  hits: number;
  errors: number;
  timeLeft: number;
  isPaused: boolean;
  isGameActive: boolean;
  audioGameStarted: boolean;
  ranking: RankingItem[];
  loading: boolean;
  setHits: (value: number) => void;
  setErrors: (value: number) => void;
  setTimeLeft: (value: number) => void;
  setIsPaused: (value: boolean) => void;
  setIsGameActive: (value: boolean) => void;
  setAudioGameStarted: (value: boolean) => void;
  setRanking: (value: RankingItem[]) => void;
  setLoading: (value: boolean) => void;
}
