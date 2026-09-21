"use client";

import Image from "next/image";
import type { PhaseOneTarget } from "@/constants/fase1Targets";
import styles from "./phaseOne.module.css";

type Props = {
  readonly target: PhaseOneTarget;
  readonly isInside: boolean;
  readonly hasSignal: boolean;
};

export function FocusSector({ target, isInside, hasSignal }: Props) {
  const message = !hasSignal ? "Vamos encontrar seu olhar"
    : !isInside ? "Aguardando o visor confirmar seu olhar"
    : "Isso! Mantenha o olhar na estrela";

  return (
    <section
      aria-label="Área de foco da estrela atual"
      className={`${styles.sector} ${isInside ? styles.focused : ""}`}
      style={{
        left: `${target.x_min * 100}%`, top: `${target.y_min * 100}%`,
        width: `${(target.x_max - target.x_min) * 100}%`,
        height: `${(target.y_max - target.y_min) * 100}%`,
      }}
    >
      <div className={styles.starCore} aria-hidden="true">
        <Image src="/img/star.svg" width={80} height={80} alt="Estrela alvo" className={styles.star} priority />
      </div>
      <div className={styles.focusCaption}>
        <p role="status">{message}</p>
        <small>Olhe por 5 segundos • não precisa clicar</small>
      </div>
    </section>
  );
}
