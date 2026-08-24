"use client";

import Link from "next/link";
import { Gamepad2, MousePointer2 } from "lucide-react";
import { Card } from "../Card";
import { ControleEnum } from "@/constants/fase2ControleJogo";

type Props = {
  readonly onSelect: (controle: ControleEnum) => void;
};

type ControlOptionProps = {
  readonly icon: React.ReactNode;
  readonly title: string;
  readonly description: string;
  readonly onClick: () => void;
};

const OPTION_CARD_CLASS =
  "w-full min-h-[230px] rounded-[28px] border-2 border-transparent bg-gradient-to-b from-white to-[#f7f2ea] shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-[var(--primary)] hover:shadow-2xl" as const;

const ControlOption = ({ icon, title, description, onClick }: ControlOptionProps) => {
  return (
    <button type="button" onClick={onClick} className={OPTION_CARD_CLASS}>
      <div className="flex h-full flex-col items-center justify-center gap-4 px-6 py-8 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)]">
          {icon}
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-2xl font-orbitron text-[#4a4a4a]">{title}</p>
          <p className="text-base text-[#4a4a4a]">{description}</p>
        </div>
      </div>
    </button>
  );
};

export function ControlSelectModal({ onSelect }: Props) {
  const buttons = (
    <Link
      href="/menu"
      className="inline-flex rounded-xl bg-gray-200 px-6 py-2.5 font-orbitron text-gray-700 transition-all duration-300 hover:bg-gray-300"
    >
      Voltar menu
    </Link>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
      <Card title="Selecionar Controle" buttons={buttons}>
        <div className="flex flex-col gap-4">
          <p className="max-w-2xl text-center text-lg text-[#4a4a4a] font-orbitron">
            Escolha como este usuário irá controlar o sistema.
          </p>

          <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
            <ControlOption
              icon={<Gamepad2 size={40} strokeWidth={2.2} />}
              title="Controle Personalizado"
              description="Use o controle personalizado para interagir com o sistema."
              onClick={() => onSelect(ControleEnum.CONTROLE_ARDUINO)}
            />

            <ControlOption
              icon={<MousePointer2 size={40} strokeWidth={2.2} />}
              title="Clique do Mouse"
              description="Use o mouse para selecionar e clicar nos elementos."
              onClick={() => onSelect(ControleEnum.CONTROLE_MOUSE)}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
