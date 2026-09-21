"use client";

import Image from "next/image";
import { Button } from "../Button";

export type CalibrationCoachState = "intro" | "preparing" | "error" | "transition";

type Props = {
  readonly state: CalibrationCoachState;
  readonly isWebGazerLoaded: boolean;
  readonly error: string | null;
  readonly completedTargets?: number;
  readonly onStart: () => void;
};

const getCoachCopy = (
  state: CalibrationCoachState,
  isWebGazerLoaded: boolean,
  error: string | null,
  completedTargets: number
) => {
  if (state === "preparing") {
    return {
      title: "Preparando a nave...",
      description: "Estamos ligando a câmera e o visor de olhar. Fique olhando para a tela.",
    };
  }

  if (state === "error") {
    return {
      title: "Vamos tentar de novo?",
      description:
        error ??
        "Não conseguimos preparar o visor. Confira a permissão da câmera e tente novamente.",
    };
  }

  if (state === "transition") {
    return {
      title: "Setor energizado!",
      description: `Você já mapeou ${completedTargets} de 9 regiões. Prepare os olhos para a próxima estrela.`,
    };
  }

  if (isWebGazerLoaded === false) {
    return {
      title: "Ligando o visor...",
      description: "Aguarde um instante enquanto preparamos o rastreador de olhar.",
    };
  }

  return {
    title: "Vamos mapear a galáxia!",
    description:
      "Quando uma estrela dourada aparecer, olhe para o centro dela e clique 5 vezes. Eu vou mostrar uma estrela por vez.",
  };
};

const getButtonLabel = (state: CalibrationCoachState, isWebGazerLoaded: boolean) => {
  if (state === "preparing") return "Preparando...";
  if (state === "error") return "Tentar novamente";
  if (isWebGazerLoaded === false) return "Aguardando visor...";
  return "Iniciar missão";
};

export function CalibrationCoach({
  state,
  isWebGazerLoaded,
  error,
  completedTargets = 0,
  onStart,
}: Props) {
  const copy = getCoachCopy(state, isWebGazerLoaded, error, completedTargets);
  const isTransition = state === "transition";
  const isPreparing = state === "preparing";
  const canStart = state === "error" || (state === "intro" && isWebGazerLoaded);

  return (
    <div
      className={`absolute inset-0 z-30 flex items-center justify-center bg-[#06152bcc] px-4 backdrop-blur-sm ${
        isTransition ? "pointer-events-none" : ""
      }`}
      aria-live="polite"
    >
      <div className="relative flex w-full max-w-4xl flex-col items-center overflow-hidden rounded-[2.5rem] border-2 border-[#FFD26A] bg-white px-7 py-9 text-center shadow-[0_0_45px_rgba(255,210,106,0.55)] md:min-h-[320px] md:justify-center md:px-16">
        <div className="absolute -left-24 -top-24 h-52 w-52 rounded-full bg-[#FFE6A5]/60 blur-2xl" />
        <div className="absolute -bottom-24 -right-24 h-56 w-56 rounded-full bg-[#FF9D3D]/30 blur-2xl" />

        <div className="relative z-10 max-w-2xl space-y-5 md:pr-40">
          <p className="font-orbitron text-2xl font-semibold text-[var(--primary)] md:text-4xl">
            {copy.title}
          </p>
          <p className="text-lg font-semibold leading-relaxed text-[var(--text)] md:text-xl">
            {copy.description}
          </p>

          {isTransition ? null : (
            <Button
              text={getButtonLabel(state, isWebGazerLoaded)}
              onClick={onStart}
              disabled={canStart === false}
              isLoading={isPreparing}
              className="px-8 py-3 text-base"
            />
          )}
        </div>

        <Image
          src="/img/astronauta.svg"
          alt="Astronauta guiando a calibração"
          width={250}
          height={390}
          className="calibration-coach__astronaut relative z-10 mt-5 h-auto w-32 md:absolute md:bottom-0 md:right-4 md:mt-0 md:w-44"
          priority
        />
      </div>
    </div>
  );
}
