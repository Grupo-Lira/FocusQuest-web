"use client";

import { useState } from "react";
import { Button } from "@/components/Button";
import { SettingsButton } from "@/components/SettingsButton";
import { SettingsModal } from "@/components/SettingsModal";

const CPT_WIKIPEDIA_URL =
  "https://en.wikipedia.org/wiki/Continuous_performance_test" as const;

const redirectToMenu = () => {
  globalThis.location.href = "/menu";
};

const WelcomeCard = ({ onOpenSettings }: { onOpenSettings: () => void }) => {
  return (
    <div className="bg-[var(--white)] px-[4.5rem] py-12 rounded-4xl flex flex-col gap-4 items-center relative">
      <SettingsButton onClick={onOpenSettings} />
      <p className="text-4xl text-[var(--primary)] font-orbitron">
        Bem-vindo ao FocusQuest!
      </p>
      <div className="max-w-[31.25rem] font-semibold text-[var(--text)] text-center flex flex-col gap-4.5">
        <p>
          Embarque numa missão intergaláctica que vai testar sua atenção, foco e precisão.
        </p>
        <p>
          Explore 3 planetas, cada um com desafios progressivos inspirados no{" "}
          <a
            href={CPT_WIKIPEDIA_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--primary)] underline bg-transparent p-0 m-0"
          >
            Teste de Desempenho Contínuo Roosevelt.
          </a>
        </p>
        <p>
          Use apenas o poder do seu olhar para vencer as distrações e conquistar seu lugar
          no ranking da galáxia!
        </p>
      </div>
      <Button text="Iniciar Jornada" onClick={redirectToMenu} />
    </div>
  );
};

export default function ApresentationPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const onOpenSettings = () => setIsModalOpen(true);
  const onCloseSettings = () => setIsModalOpen(false);

  return (
    <div className="flex items-center justify-center min-h-screen">
      {isModalOpen ? (
        <SettingsModal isInitialGame={true} onClick={onCloseSettings} />
      ) : (
        <WelcomeCard onOpenSettings={onOpenSettings} />
      )}
    </div>
  );
}
