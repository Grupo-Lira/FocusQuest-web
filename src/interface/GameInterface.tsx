export interface GameData {
  name: string;
  time: string;
  hits: number;
  errorsCount: number;
  accuracy: number;
}
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
  gameData: Partial<GameData>;
  setName: (name: string) => void;
  resetGameData: () => void;
  setHits: React.Dispatch<React.SetStateAction<number>>;
  setErrors: React.Dispatch<React.SetStateAction<number>>;
  setTimeLeft: React.Dispatch<React.SetStateAction<number>>;
  setIsPaused: React.Dispatch<React.SetStateAction<boolean>>;
  setIsGameActive: React.Dispatch<React.SetStateAction<boolean>>;
  setAudioGameStarted: React.Dispatch<React.SetStateAction<boolean>>;
  setRanking: React.Dispatch<React.SetStateAction<RankingItem[]>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setGameData: React.Dispatch<React.SetStateAction<Partial<GameData>>>;
}
