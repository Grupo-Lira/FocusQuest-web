import { Button } from "@/components/Button";
import SuccessScreen from "@/components/SuccessScreen";

interface GameOverlayProps {
  readonly audioGameStarted: boolean;
  readonly showSuccessModal: boolean;
  readonly onStart: () => void;
}

export default function GameOverlay({ audioGameStarted, showSuccessModal, onStart }: GameOverlayProps) {
  if (!audioGameStarted) {
    return (
      <div className="absolute inset-0 z-50 bg-black/70 flex items-center justify-center">
        <Button text="Clique para iniciar o jogo" onClick={onStart} />
      </div>
    );
  }

  if (showSuccessModal) {
    return (
      <div className="absolute inset-0 z-50 bg-black/70 flex items-center justify-center">
        <SuccessScreen />
      </div>
    );
  }

  return null;
}
