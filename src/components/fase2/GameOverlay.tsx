import { PlanetaResposta } from "@/app/fase/2/GameScreen";
import { Metricas, SuccessScreen } from "@/components/SuccessScreen";
import { fase2Steps } from "@/constants/steps";
import { OverlayInstruction } from "../Calibration/OverlayInstruction";
import { FormModal } from "./FormModal";

type Props = {
  readonly audioGameStarted: boolean;
  readonly showSuccessModal: boolean;
  readonly data?: Metricas;
  readonly planetasSelecionados?: PlanetaResposta[];
  readonly showFormModal: boolean;
  readonly onStart: () => void;
  readonly onCloseForm: () => void;
};

const OVERLAY_CLASS =
  "absolute inset-0 z-50 bg-black/70 flex items-center justify-center" as const;

export function GameOverlay({
  audioGameStarted,
  showSuccessModal,
  data,
  planetasSelecionados,
  showFormModal,
  onStart,
  onCloseForm,
}: Props) {
  if (audioGameStarted === false) {
    return <OverlayInstruction onComplete={onStart} steps={fase2Steps} />;
  }

  if (showSuccessModal === true) {
    return (
      <div className={OVERLAY_CLASS}>
        <SuccessScreen fase={3} data={data} />
      </div>
    );
  }

  if (showFormModal === true) {
    const answers = planetasSelecionados === undefined ? [] : planetasSelecionados;
    return (
      <div className={OVERLAY_CLASS}>
        <FormModal onClose={onCloseForm} planetasSelecionados={answers} />
      </div>
    );
  }

  return null;
}
