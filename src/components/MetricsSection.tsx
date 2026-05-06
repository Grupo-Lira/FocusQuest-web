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
                ℹ
                {/* Tooltip customizado */}
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
          
          {dadosComparativos && dadosComparativos.length > 0 ? (
            <ComparisonChart dados={dadosComparativos} acertos={acertos} />
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

// Componente do Gráfico Comparativo
interface ComparisonChartProps {
  dados: { idade: number; mediaAcertos: number }[];
  acertos?: number;
}

function ComparisonChart({ dados, acertos }: ComparisonChartProps) {
  const padding = { top: 15, right: 15, bottom: 25, left: 40 };
  const innerWidth = 100 - padding.left - padding.right;
  const innerHeight = 100 - padding.top - padding.bottom;

  // Calcula min/max com margem
  const allValues = [...dados.map(d => d.mediaAcertos), ...(acertos !== undefined ? [acertos] : [])];
  const maxValue = Math.max(...allValues) + 0.5;
  const minValue = Math.max(0, Math.min(...allValues) - 0.5);
  const range = maxValue - minValue || 1;

  // Função para converter valor em coordenada Y
  const getY = (value: number) => {
    return padding.top + innerHeight - ((value - minValue) / range) * innerHeight;
  };

  // Função para converter índice em coordenada X
  const getX = (index: number) => {
    return padding.left + (index / (dados.length - 1)) * innerWidth;
  };

  // Gerar linhas de grade
  const gridLines = [0, 0.25, 0.5, 0.75, 1];

  return (
    <div className="relative">
      {/* Legenda */}
      <div className="flex items-center justify-center gap-6 mb-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[var(--primary)]"></div>
          <span className="text-gray-600">Média por idade</span>
        </div>
        {acertos !== undefined && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500 border-2 border-white shadow"></div>
            <span className="text-gray-600 font-medium">Paciente atual ({acertos} acertos)</span>
          </div>
        )}
      </div>

      {/* Container do Gráfico */}
      <div className="relative h-48 w-full max-w-md mx-auto">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 80" preserveAspectRatio="xMidYMid meet">
          {/* Grid de fundo */}
          {gridLines.map((line, i) => {
            const y = padding.top + line * innerHeight;
            return (
              <line
                key={i}
                x1={padding.left}
                y1={y}
                x2={padding.left + innerWidth}
                y2={y}
                stroke="#e5e7eb"
                strokeWidth="0.3"
                strokeDasharray="2,2"
              />
            );
          })}

          {/* Linha de área preenchida */}
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f97316" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#f97316" stopOpacity="0.05" />
            </linearGradient>
          </defs>
          <polygon
            fill="url(#areaGradient)"
            points={`${getX(0)},${getY(dados[0].mediaAcertos)} ${dados.map((d, i) => `${getX(i)},${getY(d.mediaAcertos)}`).join(' ')} ${getX(dados.length - 1)},${padding.top + innerHeight} ${getX(0)},${padding.top + innerHeight}`}
          />

          {/* Linha principal */}
          <polyline
            fill="none"
            stroke="#f97316"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={dados.map((d, i) => `${getX(i)},${getY(d.mediaAcertos)}`).join(' ')}
          />

          {/* Pontos da média por idade */}
          {dados.map((d, i) => (
            <circle
              key={i}
              cx={getX(i)}
              cy={getY(d.mediaAcertos)}
              r="1.2"
              fill="#f97316"
              stroke="white"
              strokeWidth="0.3"
            />
          ))}

          {/* Ponto do paciente atual */}
          {acertos !== undefined && (
            <g>
              {/* Glow effect */}
              <circle
                cx={getX(Math.floor(dados.length / 2))}
                cy={getY(acertos)}
                r="3"
                fill="rgba(34, 197, 94, 0.3)"
              />
              <circle
                cx={getX(Math.floor(dados.length / 2))}
                cy={getY(acertos)}
                r="2"
                fill="#22c55e"
                stroke="white"
                strokeWidth="0.5"
              />
              {/* Label do paciente */}
              <rect
                x={getX(Math.floor(dados.length / 2)) - 6}
                y={getY(acertos) - 10}
                width="12"
                height="4"
                rx="1"
                fill="#22c55e"
              />
              <text
                x={getX(Math.floor(dados.length / 2))}
                y={getY(acertos) - 7}
                textAnchor="middle"
                fill="white"
                fontSize="2.5"
                fontWeight="bold"
              >
                VOCÊ
              </text>
            </g>
          )}
        </svg>

        {/* Eixo Y - Labels */}
        <div className="absolute left-0 top-0 bottom-6 w-10 flex flex-col justify-between text-[10px] text-gray-400 py-4">
          {[maxValue, (maxValue + minValue) / 2, minValue].map((val, i) => (
            <span key={i} className="text-right pr-2">
              {val.toFixed(1)}
            </span>
          ))}
        </div>

        {/* Eixo X - Labels (Idade) */}
        <div className="absolute bottom-0 left-10 right-4 flex justify-between text-[10px] text-gray-400">
          {dados.map((d, i) => (
            <span key={i} className="text-center w-6">
              {d.idade}a
            </span>
          ))}
        </div>
      </div>

      {/* Labels dos eixos */}
      <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
        <span className="font-medium">Idade (anos)</span>
        <span className="font-medium">Média de Acertos</span>
      </div>
    </div>
  );
}
