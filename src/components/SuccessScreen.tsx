"use client";

import { T, useT } from "@/i18n/client";
import Image from "next/image";
import { Star } from "lucide-react";
import { useState } from "react";
import { Button } from "./Button";
import { Card } from "./Card";
import { ResultsTable } from "./ResultsTable";
import { salvarFeedbackProfissional } from "@/services/estatisticas.service";
import { useTrainingMode } from "@/context/TrainingModeContext";

export type Metricas = {
  tempo_reacao_medio_ms: number;
  total_acertos: number;
  acertos: number;
  total_comissao: number;
  total_omissao: number;
  planetas_vistos?: { id: number }[];
  planetas_ignorados?: { id: number }[];
};

type Props = {
  readonly fase: number;
  readonly faseAtual?: number;
  readonly data?: Metricas;
  readonly experimentoId?: string | null;
  readonly ai?: { avaliacao_final?: string | null; avaliacao_score?: number | null };
  readonly timedOut?: boolean;
};

const FINAL_PHASE = 4;

const buildFase1Results = (data: Metricas | undefined, t: ReturnType<typeof useT>) => {
  const totalAcertos = data?.total_acertos ?? 0;
  const totalComissao = data?.total_comissao ?? 0;
  const totalOmissao = data?.total_omissao ?? 0;
  return [
    { id: 3, name: "🎯 Acertos", score: t("{count} de 5 alvos", { count: totalAcertos }) },
    { id: 4, name: "❌ Demorou para focar", score: t("{count} vezes", { count: totalOmissao }) },
    { id: 5, name: "❌ Distrações", score: t("{count} distrações", { count: totalComissao }) },
  ];
};

const buildFase2Results = (data: Metricas | undefined, t: ReturnType<typeof useT>) => {
  const acertos = data?.acertos ?? 0;
  return [{ id: 1, name: "🎯 Planetas vistos", score: t("{count} de 6 planetas", { count: acertos }) }];
};

const buildFase3Results = (data: Metricas | undefined, t: ReturnType<typeof useT>) => {
  const totalComissao = data?.total_comissao ?? 0;
  const totalOmissao = data?.total_omissao ?? 0;
  return [
    { id: 4, name: "❌ Demorou para focar", score: t(totalOmissao === 1 ? "{count} vez" : "{count} vezes", { count: totalOmissao }) },
    { id: 5, name: "❌ Distrações", score: t(totalComissao === 1 ? "{count} distração" : "{count} distrações", { count: totalComissao }) },
  ];
};

const getResultsForPhase = (fase: number, data: Metricas | undefined, t: ReturnType<typeof useT>) => {
  if (fase === 3) return buildFase2Results(data, t);
  if (fase === 4) return buildFase3Results(data, t);
  return buildFase1Results(data, t);
};

const getNextHref = (fase: number) => (fase === FINAL_PHASE ? "/menu" : `/fase/${fase}`);
const getNextButtonLabel = (fase: number) => (fase === FINAL_PHASE ? "Continuar" : "Próximo Nível");
const getCardTitle = (resultsOpen: boolean, timedOut: boolean) => {
  if (resultsOpen) return "Resultados";
  return timedOut ? "O Tempo Acabou!" : "Missão Cumprida!";
};
const redirectToMenu = () => {
  globalThis.location.href = "/menu";
};

const getPerformanceLabel = (score: number | null | undefined) => {
  if (score === null || score === undefined) return null;
  const percentage = score * 100;
  if (percentage < 30) return "Abaixo do esperado";
  if (percentage < 60) return "Dentro do esperado";
  return "Acima do esperado";
};

export function SuccessScreen({ fase, faseAtual, data, experimentoId, ai, timedOut = false }: Props) {
  const t = useT();
  const { isTrainingMode } = useTrainingMode();
  const [resultsOpen, setResultsOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [nota, setNota] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const trainingFeedbackEnabled = isTrainingMode && Boolean(experimentoId) && Boolean(faseAtual);
  const canContinue = !trainingFeedbackEnabled || saved;
  const results = getResultsForPhase(fase, data, t);

  const saveFeedback = async () => {
    if (!experimentoId || !faseAtual || nota === null) return;
    setSaving(true);
    setError("");
    try {
      await salvarFeedbackProfissional({
        fase: faseAtual,
        experimentoId,
        feedbackProfissional: feedback,
        notaDoProfissional: nota,
        modoTreinamento: true,
      });
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível salvar o feedback.");
    } finally {
      setSaving(false);
    }
  };

  const buttons = resultsOpen ? (
    <div className="flex gap-4">
      <Button text={getNextButtonLabel(fase)} onClick={() => { globalThis.location.href = getNextHref(fase); }} disabled={!canContinue} />
      <Button text="Menu Inicial" onClick={redirectToMenu} disabled={!canContinue} />
    </div>
  ) : (
    <Button text="Ver Resultados" onClick={() => setResultsOpen(true)} />
  );

  return (
    <Card title={getCardTitle(resultsOpen, timedOut)} buttons={buttons}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col items-center">
          {resultsOpen ? (
            <>
              <ResultsTable results={results} data={data} fase={fase} />
              {ai?.avaliacao_score !== null && ai?.avaliacao_score !== undefined ? (
                <div className="mt-4 text-center">
                  <div className="font-semibold"><T text="Resultado da Avaliação" /></div>
                  <div className="mt-2 text-lg font-semibold">{t(getPerformanceLabel(ai.avaliacao_score) ?? "—")}</div>
                  {ai.avaliacao_final ? <div className="mt-1 text-sm text-gray-600"><T text="Classificação:" />{" "}{ai.avaliacao_final}</div> : null}
                  <div className="mt-1 text-sm text-gray-600"><T text="Confiança:" />{" "}{`${Math.round((ai.avaliacao_score ?? 0) * 100)}%`}</div>
                </div>
              ) : null}
              {trainingFeedbackEnabled ? (
                <div className="mt-6 w-full max-w-xl rounded-2xl border border-orange-200 bg-orange-50 p-5">
                  <p className="text-center font-orbitron font-semibold text-[var(--primary)]"><T text="Avaliação profissional — treinamento ON" /></p>
                  <label className="mt-4 block text-sm font-semibold text-[var(--text)]" htmlFor="feedback-profissional"><T text="Feedback sobre a performance" /></label>
                  <textarea id="feedback-profissional" value={feedback} onChange={(event) => setFeedback(event.target.value)} className="mt-2 min-h-24 w-full rounded-xl border border-gray-300 bg-white p-3 text-sm text-gray-800 placeholder:text-gray-500 outline-none focus:border-[var(--primary)]" placeholder={t("Descreva a performance da criança")} />
                  <p className="mt-4 text-sm font-semibold text-[var(--text)]"><T text="Nota da performance:" />{" "}{nota === null ? t("selecione de 0 a 5") : t("{count} de 5", { count: nota })}</p>
                  <div className="mt-2 flex items-center justify-center gap-1">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button key={value} type="button" aria-label={t("{count} estrelas", { count: value })} onClick={() => setNota(value)} className="rounded p-1 text-yellow-500 hover:bg-yellow-100">
                        <Star size={28} fill={nota !== null && nota >= value ? "currentColor" : "none"} />
                      </button>
                    ))}
                    <button type="button" onClick={() => setNota(0)} className="ml-2 rounded px-2 py-1 text-xs text-gray-600 hover:bg-gray-200"><T text="0 estrelas" /></button>
                  </div>
                  {error ? <p className="mt-2 text-center text-sm text-red-600">{t(error)}</p> : null}
                  {saved ? <p className="mt-2 text-center text-sm font-semibold text-green-700"><T text="Feedback salvo." /></p> : <Button text="Salvar avaliação" onClick={saveFeedback} disabled={nota === null} isLoading={saving} className="mt-4 w-full px-4 py-2.5" />}
                </div>
              ) : null}
            </>
          ) : (
            <Image src={timedOut ? "/img/sad.png" : "/img/viva.png"} height={timedOut ? 296 : 400} width={timedOut ? 200 : 275} alt={t(timedOut ? "Personagem de tempo esgotado" : "Personagem de missão cumprida")} />
          )}
        </div>
      </div>
    </Card>
  );
}
