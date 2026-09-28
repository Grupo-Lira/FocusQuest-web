"use client";

import { T, useT } from "@/i18n/client";
import { Dumbbell, Info } from "lucide-react";
import { useState } from "react";
import { useTrainingMode } from "@/context/TrainingModeContext";

const TRAINING_MODE_DESCRIPTION =
  "Neste modo, a IA não analisa a sessão. Ao fim de cada fase, o profissional registra um feedback e uma nota de 0 a 5 para a performance da criança.";

export function TrainingModeToggle() {
  const t = useT();
  const { isTrainingMode, setIsTrainingMode } = useTrainingMode();
  const [isNoticeOpen, setIsNoticeOpen] = useState(false);

  const handleToggle = () => {
    const nextMode = !isTrainingMode;
    setIsTrainingMode(nextMode);
    setIsNoticeOpen(nextMode);
  };

  return (
    <>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          role="switch"
          aria-checked={isTrainingMode}
          aria-label={t("Alternar modo de treinamento")}
          title={t(TRAINING_MODE_DESCRIPTION)}
          onClick={handleToggle}
          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold transition duration-300 ${
            isTrainingMode
              ? "bg-green-600 text-white shadow-sm"
              : "bg-[var(--white)] text-[var(--primary)] inner-shadow hover:bg-gray-100"
          }`}
        >
          <Dumbbell size={18} />
          <span><T text="Treinamento" /></span>
          <Info size={16} aria-hidden="true" />
          <span
            aria-hidden="true"
            className={`relative h-5 w-10 overflow-hidden rounded-full transition-colors ${
              isTrainingMode ? "bg-white/35" : "bg-gray-300"
            }`}
          >
            <span
              className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200"
              style={{ transform: isTrainingMode ? "translateX(20px)" : "translateX(0)" }}
            />
          </span>
          <span className="text-xs font-bold">{isTrainingMode ? "ON" : "OFF"}</span>
        </button>

      </div>

      {isNoticeOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="training-mode-notice-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-xl">
            <Dumbbell className="mx-auto mb-3 text-green-600" size={32} />
            <h2 id="training-mode-notice-title" className="text-xl font-bold text-gray-800">
              <T text="Modo de treinamento ativado" /></h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-600">{t(TRAINING_MODE_DESCRIPTION)}</p>
            <button
              type="button"
              onClick={() => setIsNoticeOpen(false)}
              className="mt-5 rounded-full bg-[var(--primary)] px-5 py-2 text-sm font-semibold text-white transition hover:brightness-95"
            >
              <T text="Entendi" /></button>
          </div>
        </div>
      )}
    </>
  );
}
