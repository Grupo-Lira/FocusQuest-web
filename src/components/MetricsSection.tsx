"use client";

import { useState } from "react";
import { Clock, Activity, X, AlertTriangle } from "lucide-react";
import { Metricas } from "@/types/paciente.types";

interface MetricsSectionProps {
  metricas: Metricas;
  onObservacoesChange?: (observacoes: string) => void;
}

export function MetricsSection({ metricas, onObservacoesChange }: MetricsSectionProps) {
  const {
    tempoReacao,
    variabilidadeTemporalRespostas,
    acertos,
    errosOmissao,
    errosComissao,
    observacoes,
    dadosComparativos,
    idade,
  } = metricas;

  const [observacoesEdit, setObservacoesEdit] = useState(observacoes || "");

  const handleObservacoesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setObservacoesEdit(value);
    onObservacoesChange?.(value);
  };

  return (
    <div className="mt-8 border-[1.5px] border-[var(--primary)] rounded-3xl p-6">
      {/* Título */}
      <div className="flex flex-col items-center justify-center mb-8">
        <h3 className="text-2xl font-orbitron text-[var(--primary)] font-semibold uppercase tracking-wider mb-4">
          Métricas
        </h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
            <Clock size={16} />
            <span>TEMPO DE REAÇÃO</span>
          </div>
          <div className="text-3xl font-semibold font-orbitron text-gray-800">
            {tempoReacao ?? "-"}
          </div>
        </div>

        <div className="flex flex-col items-center text-start">
          <div className="flex gap-2 text-gray-500 text-sm mb-1">
            <Activity size={16} />
            <span className="whitespace-nowrap">VARIABILIDADE TEMPORAL</span>
          </div>
          <div className="text-3xl font-semibold font-orbitron text-gray-800">
            {variabilidadeTemporalRespostas ?? "-"}
          </div>
        </div>

        {/* Erros de Omissão */}
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center gap-2 text-red-500 text-sm mb-1">
            <X size={16} />
            <span>ERROS DE OMISSÃO</span>
          </div>
          <div className="text-3xl font-semibold font-orbitron text-red-500">
            {errosOmissao ?? "-"}
          </div>
        </div>

        {/* Erros de Comissão */}
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center gap-2 text-red-500 text-sm mb-1">
            <AlertTriangle size={16} />
            <span>ERROS DE COMISSÃO</span>
          </div>
          <div className="text-3xl font-semibold font-orbitron text-red-500">
            {errosComissao ?? "-"}
          </div>
        </div>
      </div>

      {/* Observações durante o jogo button */}
      <div className="flex justify-center mb-8">
        <button className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium border border-gray-300">
          Observações durante o jogo
        </button>
      </div>

      {/* Seção de Observações e Gráfico */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Lado esquerdo - Observações */}
        <div className="space-y-6">
          {/* Observações */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h4 className="text-[var(--primary)] font-orbitron uppercase font-semibold text-sm tracking-wide">
                Observações
              </h4>
              <div
                className="w-5 h-5 rounded-full bg-orange-400 text-white flex items-center justify-center text-xs cursor-help relative group"
                title="Campo para anotações feitas pelo profissional durante o jogo"
              >
                ℹ{/* Tooltip customizado */}
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  Campo para anotações feitas pelo profissional durante o jogo
                  <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-800"></span>
                </span>
              </div>
            </div>
            <textarea
              value={observacoesEdit}
              onChange={handleObservacoesChange}
              placeholder="Digite as observações..."
              className="w-full h-32 p-3 border border-gray-200 rounded-lg resize-none text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
            />
          </div>

          {/* Observações por IA */}
          <div>
            <h4 className="text-[var(--primary)] font-orbitron uppercase font-semibold text-sm tracking-wide mb-2">
              Observações por IA
            </h4>
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="border-b border-gray-200 h-6"></div>
              ))}
            </div>
          </div>
        </div>

        {/* Lado direito - Gráfico Comparativo */}
        <div>
          <h4 className="text-[var(--primary)] font-orbitron uppercase font-semibold text-sm tracking-wide mb-4 text-center">
            Comparação por Faixa Etária
          </h4>

          {Array.isArray(dadosComparativos) && dadosComparativos.length > 0 ? (
            <ComparisonChart
              dados={dadosComparativos}
              acertos={acertos}
              idadePaciente={idade}
            />
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
              Dados comparativos não disponíveis
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface ComparisonChartProps {
  dados: { idade: number; mediaAcertos: number }[];
  acertos?: number;
  idadePaciente?: number;
}

export function ComparisonChart({ dados, acertos, idadePaciente }: ComparisonChartProps) {
  if (!dados || dados.length === 0) return null;

  const acertosPaciente = acertos || 0;

  // --- CÁLCULOS DE ESCALA DINÂMICA (Idêntico ao Relatório) ---
  const todasMedias = dados.map((d) => d.mediaAcertos);
  const valorMaximoReal = Math.max(...todasMedias, acertosPaciente, 10);
  const maxAcertos = Math.ceil(valorMaximoReal / 2) * 2;

  // Gerar labels do eixo Y dinamicamente (6 faixas)
  const labelsY: number[] = [];
  for (let i = 5; i >= 0; i--) {
    labelsY.push(Math.round((maxAcertos / 5) * i));
  }

  // --- DIMENSÕES E CONVERSORES ---
  const width = 300;
  const height = 150;
  const paddingSide = 25;
  const paddingTop = 30;
  const paddingBottom = 20;

  const getX = (index: number) =>
    paddingSide + (index * (width - 2 * paddingSide)) / (dados.length - 1 || 1);
  const getY = (val: number) => {
    const availableHeight = height - paddingTop - paddingBottom;
    return height - paddingBottom - (val * availableHeight) / maxAcertos;
  };

  const points = dados.map((d, i) => `${getX(i)},${getY(d.mediaAcertos)}`).join(" ");
  const fillPath = `M ${getX(0)},${height - paddingBottom} L ${points} L ${getX(dados.length - 1)},${height - paddingBottom} Z`;

  // --- CÁLCULO DA POSIÇÃO X DO PACIENTE ---
  let indexPaciente = -1;
  if (idadePaciente !== undefined) {
    indexPaciente = dados.findIndex((d) => d.idade === idadePaciente);

    if (indexPaciente === -1) {
      // Interpola se a idade quebrada/diferente não estiver exata no array
      const idades = dados.map((d) => d.idade);
      const minIdade = Math.min(...idades);
      const maxIdade = Math.max(...idades);
      indexPaciente =
        ((idadePaciente - minIdade) / (maxIdade - minIdade)) * (dados.length - 1);
    }
  }

  // Fallback de segurança
  if (indexPaciente === -1 || isNaN(indexPaciente)) {
    indexPaciente = Math.floor(dados.length / 2);
  }

  const xVoce = getX(indexPaciente);
  const yVoce = getY(acertosPaciente);

  return (
    <div className="relative w-full max-w-md mx-auto bg-white p-5 rounded-xl shadow-sm border border-slate-100 font-sans">
      <div className="flex justify-between items-center mb-5">
        <div className="text-[11px] text-slate-800 font-extrabold uppercase tracking-wide">
          Desempenho Comparativo
        </div>
        <div className="flex gap-3 text-[10px] font-semibold">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-sm bg-[#FF7A00]"></span> Média
          </div>
          {acertos !== undefined && (
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-sm bg-[#00C48C]"></span> Paciente
            </div>
          )}
        </div>
      </div>

      {/* Grid Principal */}
      <div className="flex items-stretch h-[200px]">
        {/* Eixo Y */}
        <div className="flex flex-col justify-between py-5 pr-2 text-[10px] text-slate-400 text-right w-[25px]">
          {labelsY.map((label, idx) => (
            <span key={idx}>{label}</span>
          ))}
        </div>

        {/* Área do Gráfico (SVG) */}
        <div className="flex-grow relative">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-full overflow-visible"
          >
            <defs>
              <linearGradient id="gradReact" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FF7A00" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#FF7A00" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Linhas de Grade */}
            {labelsY.map((val, idx) => (
              <line
                key={idx}
                x1="0"
                y1={getY(val)}
                x2={width}
                y2={getY(val)}
                stroke="#F1F5F9"
                strokeWidth="1"
              />
            ))}

            {/* Área e Linha da Média */}
            <path d={fillPath} fill="url(#gradReact)" />
            <polyline
              points={points}
              fill="none"
              stroke="#FF7A00"
              strokeWidth="2.5"
              strokeLinejoin="round"
              strokeLinecap="round"
            />

            {/* Pontos da Média */}
            {dados.map((d, i) => (
              <circle
                key={i}
                cx={getX(i)}
                cy={getY(d.mediaAcertos)}
                r="3"
                fill="#fff"
                stroke="#FF7A00"
                strokeWidth="1.5"
              />
            ))}

            {/* Marcador VOCÊ (Pin) - Agora na Posição Exata */}
            {acertos !== undefined && (
              <g transform={`translate(${xVoce}, ${yVoce})`}>
                <path
                  d="M -15 -35 H 15 V -15 H 5 L 0 -8 L -5 -15 H -15 Z"
                  fill="#00C48C"
                />
                <text
                  x="0"
                  y="-21"
                  fontSize="7"
                  fill="white"
                  textAnchor="middle"
                  fontWeight="900"
                >
                  VOCÊ
                </text>
                <circle
                  cx="0"
                  cy="0"
                  r="5"
                  fill="#00C48C"
                  stroke="#fff"
                  strokeWidth="2"
                />
              </g>
            )}
          </svg>
        </div>
      </div>

      {/* Eixo X (Idades) */}
      <div className="flex justify-between ml-[33px] pt-2 border-t border-slate-100">
        {dados.map((d, i) => (
          <span key={i} className="text-[10px] text-slate-500 font-bold">
            {d.idade}a
          </span>
        ))}
      </div>
      <div className="text-center mt-2 text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">
        Faixa Etária (Anos)
      </div>
    </div>
  );
}
