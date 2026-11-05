import { PlanetaResposta } from "@/app/fase/2/GameScreen";
import { Metricas, SuccessScreen } from "@/components/SuccessScreen";
import { fase2Steps } from "@/constants/steps";
import { OverlayInstruction } from "../Calibration/OverlayInstruction";
import { FormModal } from "./FormModal";
import { ControleEnum } from "@/constants/fase2ControleJogo";

type Props = {
  readonly audioGameStarted: boolean;
  readonly showSuccessModal: boolean;
  readonly data?: Metricas;
  readonly controleSelecionado: ControleEnum;
  readonly planetasSelecionados?: PlanetaResposta[];
  readonly showFormModal: boolean;
  readonly onStart: () => void;
  readonly onCloseForm: () => void;
  readonly onClickPlaneta: (planetaId: number) => void;
  readonly experimentoId?: string | null;
};

const OVERLAY_CLASS =
  "absolute inset-0 z-50 bg-black/70 flex items-center justify-center" as const;

export function GameOverlay({
  audioGameStarted,
  showSuccessModal,
  data,
  planetasSelecionados,
  controleSelecionado,
  showFormModal,
  onStart,
  onCloseForm,
  onClickPlaneta,
  experimentoId,
}: Props) {
  if (audioGameStarted === false) {
    return <OverlayInstruction onComplete={onStart} steps={fase2Steps} />;
  }

  if (showSuccessModal === true) {
    return (
      <div className={OVERLAY_CLASS}>
        <SuccessScreen fase={3} faseAtual={2} data={data} experimentoId={experimentoId} />
      </div>
    );
  }

  if (showFormModal === true) {
    const answers = planetasSelecionados === undefined ? [] : planetasSelecionados;
    return (
      <div className={OVERLAY_CLASS}>
        <FormModal
          onClose={onCloseForm}
          onClick={onClickPlaneta}
          planetasSelecionados={answers}
          controleSelecionado={controleSelecionado}
        />
      </div>
    );
  }

  return null;
}
