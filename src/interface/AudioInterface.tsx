export interface AudioContextType {
  volume: number;
  setVolume: (value: number) => void;
  startAudio: () => void;
  pauseAudio: () => void;
}