"use client";

import Image from "next/image";
import { useT } from "@/i18n/client";

type Props = {
  readonly top: number;
  readonly left: number;
  readonly onHit: () => void;
  readonly onClick: (event: React.MouseEvent) => void;
};

export function StarCalibration({ top, left, onHit, onClick }: Props) {
  const t = useT();

  const handleClick = (event: React.MouseEvent) => {
    onHit();
    onClick(event);
  };

  return (
    <div
      className="absolute transition-all duration-500 ease-out scale-100 opacity-90"
      style={{ top: `${top}%`, left: `${left}%`, transform: "translate(-50%, -50%)" }}
      onClick={handleClick}
    >
      <Image
        width={50}
        height={50}
        alt={t("Estrela de calibração")}
        src="/img/star.svg"
        className="transition-transform"
      />
    </div>
  );
}
