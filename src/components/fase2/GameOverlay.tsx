import SuccessScreen from "@/components/SuccessScreen";
import FormModal from "./FormModal";
import OverlayInstruction from "../Calibration/OverlayInstruction";
import { fase2Steps } from "@/constants/steps";

interface GameOverlayProps {
  readonly audioGameStarted: boolean;
  readonly showSuccessModal: boolean;
  readonly showFormModal: boolean;
  readonly onStart: () => void;
  readonly onCloseForm: () => void;
}

export default function GameOverlay({ audioGameStarted, showSuccessModal, showFormModal, onStart, onCloseForm }: GameOverlayProps) {

  if (!audioGameStarted) {
    return <OverlayInstruction onComplete={onStart} steps={fase2Steps} />;
  }

  if (showSuccessModal) {
    return (
      <div className="absolute inset-0 z-50 bg-black/70 flex items-center justify-center">
        <SuccessScreen fase={3}/>
      </div>
    );
  }

  if (showFormModal) {
    return (
      <div className="absolute inset-0 z-50 bg-black/70 flex items-center justify-center">
        <FormModal onClose={onCloseForm} />
      </div>
    );
  }

  return null;
}
