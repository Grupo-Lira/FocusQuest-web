# Precisão do eye tracking — plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fazer com que o evento `FOCANDO` da fase 1 signifique de fato "o paciente olhou para o alvo", com margem de erro medida e reportada.

**Architecture:** Duas frentes complementares. No front, parar de descartar amostras — filtro one-euro sobre o fluxo do WebGazer e emissão a 10 Hz em vez de 1 Hz — e medir acurácia com pontos de validação que não treinaram o modelo. No backend, trocar o teste de contenção em caixa por classificação por proximidade entre todos os alvos, com margem de confiança e histerese no dwell.

**Tech Stack:** Next.js 15 / React 19 / TypeScript no front (WebGazer.js via `globalThis.webgazer`); Node + Express + Socket.IO + Redis + Mongo no backend; Jest no backend, Vitest a ser introduzido no front.

**Spec:** `docs/superpowers/specs/2026-09-21-precisao-eyetracking-design.md` (repositório `FocusQuest-web`)

## Global Constraints

- Branches de trabalho: `feat/precisao-eyetracking` em **ambos** os repositórios, baseadas em `17-melhorarsimplificar-fase-1-para-garantir-eficácia-do-eyetracking`. Nunca commitar na branch 17.
- Repositórios: `/home/arthur/fatec/PI/FocusQuest-web` e `/home/arthur/fatec/PI/backend-rastreamento-ocular`.
- Unidade de medida de erro e distância: **fração da tela** (0 a 1), nunca pixels nem graus.
- Apenas a **fase 1** é alterada nesta iteração. A fase 3 fica para depois, com os parâmetros já calibrados.
- Backend usa ESM (`"type": "module"`). Todo import interno leva extensão `.js`.
- Estilo: nomes explícitos em português, early return, uma função faz uma coisa, comentário explica "porquê" e nunca "o quê".
- Valores iniciais de parâmetros são pontos de partida para ajuste empírico, não valores finais: `mincutoff = 1.0`, `beta = 0.007`, `dcutoff = 1.0`, `RAIO_MAXIMO = 0.15`, `RAZAO_MARGEM_MINIMA = 1.25`, `FATOR_RAIO_SAIDA = 1.3`, `AMOSTRAS_FORA_PARA_QUEBRAR = 3`, `LIMIAR_APROVACAO_CALIBRACAO = 0.10`.
- Fora de escopo: compensação de pose, CI do web, divergência `main`/`develop`, `.gitignore` do backend.

---

## Ordem e razão

A régua vem antes de tudo (Tasks 1-2): sem medir, ajustar filtro é chute. Os bugs de calibração vêm logo depois (Task 3) porque sem eles é impossível recalibrar entre as tentativas de ajuste. Só então a filtragem (Tasks 4-6), a taxa de emissão (Task 7) e a lógica do backend (Tasks 8-10).

---

## Task 1: Cálculo de erro de validação (front, puro)

Introduz o Vitest e a matemática da régua. Nada de UI ainda.

**Files:**
- Create: `src/lib/gaze/erroValidacao.ts`
- Create: `src/lib/gaze/erroValidacao.test.ts`
- Create: `vitest.config.ts`
- Modify: `package.json` (scripts e devDependencies)

**Interfaces:**
- Consumes: nada.
- Produces: `AmostraGaze`, `PontoValidacao`, `ResultadoPonto`, `ResumoValidacao`, `calcularErroDoPonto(amostras, pontoVerdadeiro, larguraTela, alturaTela)`, `resumirValidacao(resultados, limiarAprovacao)`, `PONTOS_VALIDACAO`, `LIMIAR_APROVACAO_CALIBRACAO`.

- [ ] **Step 1: Instalar o Vitest**

```bash
cd /home/arthur/fatec/PI/FocusQuest-web
npm install --save-dev vitest@^3.2.4
```

- [ ] **Step 2: Criar `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
```

- [ ] **Step 3: Adicionar o script de teste ao `package.json`**

No bloco `"scripts"`, adicionar após `"lint"`:

```json
    "test": "vitest run",
    "test:watch": "vitest"
```

- [ ] **Step 4: Escrever o teste que falha**

Criar `src/lib/gaze/erroValidacao.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  calcularErroDoPonto,
  PONTOS_VALIDACAO,
  resumirValidacao,
} from "./erroValidacao";

const LARGURA = 1000;
const ALTURA = 1000;

const amostrasEm = (x: number, y: number, quantidade: number) =>
  Array.from({ length: quantidade }, (_, indice) => ({
    x,
    y,
    timestamp: 1000 + indice * 33,
  }));

describe("calcularErroDoPonto", () => {
  it("retorna erro zero quando todas as amostras caem no ponto verdadeiro", () => {
    const amostras = amostrasEm(500, 500, 10);
    const resultado = calcularErroDoPonto(
      amostras,
      { left: 50, top: 50 },
      LARGURA,
      ALTURA
    );

    expect(resultado).not.toBeNull();
    expect(resultado!.erro).toBeCloseTo(0, 6);
    expect(resultado!.amostrasUsadas).toBe(10);
  });

  it("usa a mediana, de modo que amostras absurdas isoladas não dominam o erro", () => {
    const amostras = [...amostrasEm(500, 500, 9), { x: 9000, y: 9000, timestamp: 2000 }];
    const resultado = calcularErroDoPonto(
      amostras,
      { left: 50, top: 50 },
      LARGURA,
      ALTURA
    );

    expect(resultado!.erro).toBeCloseTo(0, 6);
  });

  it("mede erro em fração da tela, não em pixels", () => {
    // 100px de desvio horizontal numa tela de 1000px = 0.1 da tela
    const amostras = amostrasEm(600, 500, 10);
    const resultado = calcularErroDoPonto(
      amostras,
      { left: 50, top: 50 },
      LARGURA,
      ALTURA
    );

    expect(resultado!.erro).toBeCloseTo(0.1, 6);
  });

  it("separa dispersão de erro: nuvem espalhada centrada no alvo tem erro baixo e dispersão alta", () => {
    const amostras = [
      { x: 400, y: 500, timestamp: 1 },
      { x: 600, y: 500, timestamp: 2 },
      { x: 500, y: 400, timestamp: 3 },
      { x: 500, y: 600, timestamp: 4 },
      { x: 500, y: 500, timestamp: 5 },
    ];
    const resultado = calcularErroDoPonto(
      amostras,
      { left: 50, top: 50 },
      LARGURA,
      ALTURA
    );

    expect(resultado!.erro).toBeCloseTo(0, 6);
    expect(resultado!.dispersao).toBeGreaterThan(0.05);
  });

  it("retorna null quando não há amostras", () => {
    const resultado = calcularErroDoPonto([], { left: 50, top: 50 }, LARGURA, ALTURA);
    expect(resultado).toBeNull();
  });
});

describe("resumirValidacao", () => {
  it("reprova quando o erro médio passa do limiar", () => {
    const resultados = [
      { ponto: { left: 20, top: 20 }, erro: 0.2, dispersao: 0.01, amostrasUsadas: 10 },
      { ponto: { left: 80, top: 20 }, erro: 0.2, dispersao: 0.01, amostrasUsadas: 10 },
    ];

    const resumo = resumirValidacao(resultados, 0.1);

    expect(resumo.aprovado).toBe(false);
    expect(resumo.erroMedio).toBeCloseTo(0.2, 6);
    expect(resumo.erroMaximo).toBeCloseTo(0.2, 6);
  });

  it("aprova quando o erro médio fica abaixo do limiar", () => {
    const resultados = [
      { ponto: { left: 20, top: 20 }, erro: 0.05, dispersao: 0.01, amostrasUsadas: 10 },
      { ponto: { left: 80, top: 20 }, erro: 0.03, dispersao: 0.01, amostrasUsadas: 10 },
    ];

    const resumo = resumirValidacao(resultados, 0.1);

    expect(resumo.aprovado).toBe(true);
  });

  it("reprova quando nenhum ponto produziu medida", () => {
    const resumo = resumirValidacao([], 0.1);
    expect(resumo.aprovado).toBe(false);
  });
});

describe("PONTOS_VALIDACAO", () => {
  it("não repete nenhum ponto de treino da calibração", () => {
    const pontosDeTreino = [3, 50, 95].flatMap((left) =>
      [5, 50, 90].map((top) => `${left}:${top}`)
    );

    const colisoes = PONTOS_VALIDACAO.filter((ponto) =>
      pontosDeTreino.includes(`${ponto.left}:${ponto.top}`)
    );

    expect(colisoes).toEqual([]);
  });
});
```

- [ ] **Step 5: Rodar o teste e confirmar que falha**

Run: `npm test`
Expected: FAIL — `Failed to resolve import "./erroValidacao"`.

- [ ] **Step 6: Implementar `src/lib/gaze/erroValidacao.ts`**

```ts
export type AmostraGaze = {
  x: number;
  y: number;
  timestamp: number;
};

/** Posição em porcentagem da tela, no mesmo formato usado pelas estrelas de calibração. */
export type PontoValidacao = {
  left: number;
  top: number;
};

export type ResultadoPonto = {
  ponto: PontoValidacao;
  /** Distância entre a mediana das amostras e o ponto verdadeiro, em fração da tela. */
  erro: number;
  /** Espalhamento das amostras em torno da própria mediana, em fração da tela. */
  dispersao: number;
  amostrasUsadas: number;
};

export type ResumoValidacao = {
  erroMedio: number;
  erroMaximo: number;
  aprovado: boolean;
  resultados: ResultadoPonto[];
};

export const LIMIAR_APROVACAO_CALIBRACAO = 0.1;

// Nenhum destes coincide com os pontos de treino, que ocupam left 3/50/95 e top 5/50/90.
// As posições perto da borda são propositais: é onde o WebGazer erra mais, e validar
// somente no centro da tela produziria um número otimista.
export const PONTOS_VALIDACAO: PontoValidacao[] = [
  { left: 20, top: 20 },
  { left: 80, top: 20 },
  { left: 50, top: 60 },
  { left: 20, top: 80 },
  { left: 80, top: 80 },
];

export function medianaDe(valores: number[]): number {
  const ordenados = [...valores].sort((a, b) => a - b);
  const meio = Math.floor(ordenados.length / 2);

  if (ordenados.length % 2 === 1) return ordenados[meio];
  return (ordenados[meio - 1] + ordenados[meio]) / 2;
}

const distanciaNormalizada = (
  deltaX: number,
  deltaY: number,
  larguraTela: number,
  alturaTela: number
) => {
  const fracaoX = deltaX / larguraTela;
  const fracaoY = deltaY / alturaTela;
  return Math.sqrt(fracaoX * fracaoX + fracaoY * fracaoY);
};

export function calcularErroDoPonto(
  amostras: AmostraGaze[],
  pontoVerdadeiro: PontoValidacao,
  larguraTela: number,
  alturaTela: number
): ResultadoPonto | null {
  if (amostras.length === 0) return null;

  // A mediana, e não a média, porque o WebGazer produz amostras absurdas isoladas
  // que arrastariam a média para longe sem dizer nada sobre a acurácia real.
  const medianaX = medianaDe(amostras.map((amostra) => amostra.x));
  const medianaY = medianaDe(amostras.map((amostra) => amostra.y));

  const verdadeiroX = (pontoVerdadeiro.left / 100) * larguraTela;
  const verdadeiroY = (pontoVerdadeiro.top / 100) * alturaTela;

  const erro = distanciaNormalizada(
    medianaX - verdadeiroX,
    medianaY - verdadeiroY,
    larguraTela,
    alturaTela
  );

  const desviosDaMediana = amostras.map((amostra) =>
    distanciaNormalizada(
      amostra.x - medianaX,
      amostra.y - medianaY,
      larguraTela,
      alturaTela
    )
  );
  const dispersao = medianaDe(desviosDaMediana);

  return {
    ponto: pontoVerdadeiro,
    erro,
    dispersao,
    amostrasUsadas: amostras.length,
  };
}

export function resumirValidacao(
  resultados: ResultadoPonto[],
  limiarAprovacao: number = LIMIAR_APROVACAO_CALIBRACAO
): ResumoValidacao {
  if (resultados.length === 0) {
    return { erroMedio: Infinity, erroMaximo: Infinity, aprovado: false, resultados };
  }

  const erros = resultados.map((resultado) => resultado.erro);
  const somaDosErros = erros.reduce((soma, erro) => soma + erro, 0);
  const erroMedio = somaDosErros / erros.length;
  const erroMaximo = Math.max(...erros);

  return {
    erroMedio,
    erroMaximo,
    aprovado: erroMedio <= limiarAprovacao,
    resultados,
  };
}
```

- [ ] **Step 7: Rodar os testes e confirmar que passam**

Run: `npm test`
Expected: PASS — 9 testes.

- [ ] **Step 8: Commit**

```bash
cd /home/arthur/fatec/PI/FocusQuest-web
git add package.json package-lock.json vitest.config.ts src/lib/gaze/
git commit -m "feat: adiciona calculo de erro de validacao da calibracao

Introduz o Vitest e a matematica da regua de acuracia: erro medido pela
mediana das amostras contra pontos que nao treinaram o modelo, em fracao
da tela, com dispersao reportada separadamente do vies.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

## Task 2: Fase de validação na calibração

Usa a Task 1 para transformar a calibração num instrumento que reprova.

**Files:**
- Create: `src/components/Calibration/ValidacaoPrecisao.tsx`
- Modify: `src/app/calibration/page.tsx`

**Interfaces:**
- Consumes: `calcularErroDoPonto`, `resumirValidacao`, `PONTOS_VALIDACAO`, `LIMIAR_APROVACAO_CALIBRACAO`, `AmostraGaze`, `ResumoValidacao` de `@/lib/gaze/erroValidacao`; `useEyeTracking` de `@/context/EyeTrackingContext`.
- Produces: componente `ValidacaoPrecisao` com props `{ onConcluir: (resumo: ResumoValidacao) => void }`.

- [ ] **Step 1: Criar o componente de validação**

Criar `src/components/Calibration/ValidacaoPrecisao.tsx`:

```tsx
"use client";

import {
  AmostraGaze,
  calcularErroDoPonto,
  PONTOS_VALIDACAO,
  ResultadoPonto,
  ResumoValidacao,
  resumirValidacao,
} from "@/lib/gaze/erroValidacao";
import { useEyeTracking } from "@/context/EyeTrackingContext";
import { useCallback, useEffect, useRef, useState } from "react";

const MS_DE_ACOMODACAO = 700;
const MS_DE_COLETA = 1500;

type ValidacaoPrecisaoProps = {
  readonly onConcluir: (resumo: ResumoValidacao) => void;
};

export function ValidacaoPrecisao({ onConcluir }: ValidacaoPrecisaoProps) {
  const { lastGazeData } = useEyeTracking();
  const [indiceDoPonto, setIndiceDoPonto] = useState(0);
  const [estaColetando, setEstaColetando] = useState(false);

  const amostrasRef = useRef<AmostraGaze[]>([]);
  const resultadosRef = useRef<ResultadoPonto[]>([]);
  const gazeRef = useRef(lastGazeData);

  useEffect(() => {
    gazeRef.current = lastGazeData;
  }, [lastGazeData]);

  const pontoAtual = PONTOS_VALIDACAO[indiceDoPonto];

  const finalizarPonto = useCallback(() => {
    const resultado = calcularErroDoPonto(
      amostrasRef.current,
      pontoAtual,
      window.innerWidth,
      window.innerHeight
    );

    if (resultado !== null) resultadosRef.current.push(resultado);

    amostrasRef.current = [];
    setEstaColetando(false);

    const proximoIndice = indiceDoPonto + 1;
    if (proximoIndice < PONTOS_VALIDACAO.length) {
      setIndiceDoPonto(proximoIndice);
      return;
    }

    onConcluir(resumirValidacao(resultadosRef.current));
  }, [indiceDoPonto, onConcluir, pontoAtual]);

  // O paciente precisa de um instante para mover o olhar até o ponto novo antes
  // de a coleta começar; medir durante a sacada contaminaria o erro do ponto.
  useEffect(() => {
    const timerDeAcomodacao = setTimeout(() => setEstaColetando(true), MS_DE_ACOMODACAO);
    return () => clearTimeout(timerDeAcomodacao);
  }, [indiceDoPonto]);

  useEffect(() => {
    if (estaColetando === false) return;

    const timerDeAmostragem = setInterval(() => {
      const gaze = gazeRef.current;
      if (gaze === null) return;
      amostrasRef.current.push({ x: gaze.x, y: gaze.y, timestamp: gaze.timestamp });
    }, 33);

    const timerDeEncerramento = setTimeout(finalizarPonto, MS_DE_COLETA);

    return () => {
      clearInterval(timerDeAmostragem);
      clearTimeout(timerDeEncerramento);
    };
  }, [estaColetando, finalizarPonto]);

  return (
    <div className="absolute inset-0 z-40 bg-black/80">
      <p className="absolute top-8 w-full text-center text-white text-lg">
        Olhe fixamente para o ponto, sem clicar. {indiceDoPonto + 1} de{" "}
        {PONTOS_VALIDACAO.length}
      </p>

      <div
        className="absolute w-8 h-8 rounded-full -translate-x-1/2 -translate-y-1/2"
        style={{
          left: `${pontoAtual.left}%`,
          top: `${pontoAtual.top}%`,
          backgroundColor: estaColetando === true ? "#facc15" : "#6b7280",
        }}
      />
    </div>
  );
}
```

- [ ] **Step 2: Ligar a validação ao fluxo da calibração**

Em `src/app/calibration/page.tsx`:

Adicionar aos imports:

```tsx
import { ValidacaoPrecisao } from "@/components/Calibration/ValidacaoPrecisao";
import { ResumoValidacao } from "@/lib/gaze/erroValidacao";
```

Adicionar ao corpo do componente, junto aos outros `useState`:

```tsx
  const [validacaoVisivel, setValidacaoVisivel] = useState(false);
  const [resumoValidacao, setResumoValidacao] = useState<ResumoValidacao | null>(null);
```

Substituir o `useEffect` que hoje termina a calibração:

```tsx
  useEffect(() => {
    if (hits < MAX_TOTAL_HITS) return;
    if (successModalVisible === true) return;

    console.log("Calibração concluída com", hits, "hits");
    stopTracking();
    setSuccessModalVisible(true);
    logCalibrationStats(clickLog);
  }, [hits, successModalVisible, clickLog, stopTracking]);
```

por:

```tsx
  // O rastreamento continua ligado: a validação precisa das amostras de gaze.
  // Parar aqui, como antes, tornaria impossível medir a acurácia.
  useEffect(() => {
    if (hits < MAX_TOTAL_HITS) return;
    if (validacaoVisivel === true) return;
    if (resumoValidacao !== null) return;

    logCalibrationStats(clickLog);
    setValidacaoVisivel(true);
  }, [hits, validacaoVisivel, resumoValidacao, clickLog]);

  const handleValidacaoConcluida = useCallback(
    (resumo: ResumoValidacao) => {
      setValidacaoVisivel(false);
      setResumoValidacao(resumo);
      stopTracking();

      console.log("=== VALIDAÇÃO DE PRECISÃO ===");
      console.log("Erro médio:", (resumo.erroMedio * 100).toFixed(2), "% da tela");
      console.log("Erro máximo:", (resumo.erroMaximo * 100).toFixed(2), "% da tela");
      console.table(resumo.resultados);
      console.log("Aprovado:", resumo.aprovado);

      if (resumo.aprovado === true) setSuccessModalVisible(true);
    },
    [stopTracking]
  );
```

Adicionar ao `handleRestart`, antes de `setShowInstructions(true)`:

```tsx
    setResumoValidacao(null);
    setValidacaoVisivel(false);
```

No JSX, logo antes do bloco `{successModalVisible === true ? ... }`:

```tsx
        {validacaoVisivel === true ? (
          <ValidacaoPrecisao onConcluir={handleValidacaoConcluida} />
        ) : null}

        {resumoValidacao !== null && resumoValidacao.aprovado === false ? (
          <div className="absolute inset-0 z-50 bg-black/80 flex flex-col items-center justify-center gap-4 text-white">
            <h2 className="text-2xl">Calibração insuficiente</h2>
            <p>
              Erro médio de {(resumoValidacao.erroMedio * 100).toFixed(1)}% da tela.
              O exame exige no máximo {(LIMIAR_APROVACAO_CALIBRACAO * 100).toFixed(0)}%.
            </p>
            <p className="text-sm opacity-70">
              Reposicione o paciente, verifique a iluminação e calibre novamente.
            </p>
            <button
              className="px-6 py-2 bg-white text-black rounded"
              onClick={handleRestart}
              type="button"
            >
              Calibrar novamente
            </button>
          </div>
        ) : null}
```

Adicionar `LIMIAR_APROVACAO_CALIBRACAO` ao import de `@/lib/gaze/erroValidacao`.

- [ ] **Step 3: Verificar que o projeto compila**

Run: `npx next build`
Expected: build conclui sem erros de tipo.

- [ ] **Step 4: Commit**

```bash
git add src/components/Calibration/ValidacaoPrecisao.tsx src/app/calibration/page.tsx
git commit -m "feat: adiciona fase de validacao que reprova calibracao ruim

A calibracao media o erro nos proprios cliques que treinaram o modelo, o
que e erro de treino e tende a parecer melhor do que a realidade. Passa a
existir uma fase de validacao com cinco pontos nao treinados onde o
paciente apenas fixa o olhar, e um limiar que bloqueia o exame.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

## Task 3: Corrigir os dois bugs de calibração

Sem isto, recalibrar durante o ajuste empírico não funciona — e ajuste empírico é o próximo passo.

**Files:**
- Modify: `src/constants/calibrationStar.tsx`
- Modify: `src/app/calibration/page.tsx`
- Modify: `src/context/EyeTrackingContext.tsx`

**Interfaces:**
- Consumes: nada novo.
- Produces: `POSICOES_ESTRELAS_CALIBRACAO` exportado de `@/constants/calibrationStar` (substitui `stars`).

- [ ] **Step 1: Tornar as posições das estrelas imutáveis**

Substituir todo o conteúdo de `src/constants/calibrationStar.tsx` por:

```tsx
// Posições em porcentagem da tela. Sem contador de acertos aqui: o progresso da
// calibração é estado de uma sessão, e mantê-lo no módulo fazia com que uma
// segunda calibração começasse já "completa".
export const POSICOES_ESTRELAS_CALIBRACAO = [
  { top: 5, left: 3 },
  { top: 5, left: 50 },
  { top: 5, left: 95 },
  { top: 50, left: 3 },
  { top: 50, left: 50 },
  { top: 50, left: 95 },
  { top: 90, left: 3 },
  { top: 90, left: 50 },
  { top: 90, left: 95 },
] as const;

export const TOTAL_DE_ESTRELAS_CALIBRACAO = POSICOES_ESTRELAS_CALIBRACAO.length;
```

- [ ] **Step 2: Mover o contador de acertos para o estado do componente**

Em `src/app/calibration/page.tsx`:

Trocar o import `import { stars } from "@/constants/calibrationStar";` por:

```tsx
import {
  POSICOES_ESTRELAS_CALIBRACAO,
  TOTAL_DE_ESTRELAS_CALIBRACAO,
} from "@/constants/calibrationStar";
```

Trocar a constante de total:

```tsx
const MAX_TOTAL_HITS = TOTAL_DE_ESTRELAS_CALIBRACAO * MAX_HITS_PER_STAR;
```

Remover a função `incrementStarHit` inteira.

Adicionar ao corpo do componente, junto aos outros `useState`:

```tsx
  const [acertosPorEstrela, setAcertosPorEstrela] = useState<number[]>(() =>
    POSICOES_ESTRELAS_CALIBRACAO.map(() => 0)
  );
```

Substituir `handleStarClick` por:

```tsx
  const handleStarClick = (event: React.MouseEvent, indiceDaEstrela: number) => {
    logClick(event, `star-${indiceDaEstrela}`);
    setHits((anterior) => anterior + 1);
    setAcertosPorEstrela((anterior) =>
      anterior.map((acertos, indice) =>
        indice === indiceDaEstrela ? acertos + 1 : acertos
      )
    );
  };
```

Substituir a linha de `activeStars` por:

```tsx
  const estrelasAtivas = POSICOES_ESTRELAS_CALIBRACAO.map((posicao, indice) => ({
    posicao,
    indice,
  })).filter(({ indice }) => acertosPorEstrela[indice] < MAX_HITS_PER_STAR);
```

Substituir o bloco de renderização das estrelas por:

```tsx
          {estrelasAtivas.map(({ posicao, indice }) => (
            <StarCalibration
              key={indice}
              top={posicao.top}
              left={posicao.left}
              onHit={() => {}}
              onError={() => console.error("Erro com estrela", indice)}
              onClick={(event: React.MouseEvent) => handleStarClick(event, indice)}
            />
          ))}
```

Adicionar ao `handleRestart`:

```tsx
    setAcertosPorEstrela(POSICOES_ESTRELAS_CALIBRACAO.map(() => 0));
```

- [ ] **Step 3: Impedir que a calibração de um paciente contamine a do próximo**

Em `src/context/EyeTrackingContext.tsx`, na cadeia de configuração do WebGazer dentro de `startTracking`, trocar:

```tsx
            .saveDataAcrossSessions(true) //Em prod podemos deixar true para salvar a calibração no navegador para próximos usos
```

por:

```tsx
            // Falso de propósito: com persistência ligada, o paciente seguinte herdava
            // o modelo de regressão do anterior no mesmo equipamento, o que invalida
            // a medida. Calibrar a cada sessão é o comportamento correto aqui.
            .saveDataAcrossSessions(false)
```

- [ ] **Step 4: Verificar que o projeto compila**

Run: `npx next build`
Expected: build conclui sem erros. Nenhum arquivo deve mais importar `stars` de `calibrationStar`.

Run: `grep -rn "from \"@/constants/calibrationStar\"" src/`
Expected: somente `src/app/calibration/page.tsx`, importando os nomes novos.

- [ ] **Step 5: Commit**

```bash
git add src/constants/calibrationStar.tsx src/app/calibration/page.tsx src/context/EyeTrackingContext.tsx
git commit -m "fix: permite recalibrar e isola calibracao entre pacientes

handleRestart zerava hits e clickLog mas nao totalHits, que era estado
mutavel em escopo de modulo: recalibrar deixava a tela sem nenhuma
estrela. O contador passa a ser estado do componente, que e a origem real
do bug.

saveDataAcrossSessions persistia o modelo de regressao entre pacientes no
mesmo equipamento. Desligado.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

## Task 4: Filtro one-euro (front, puro)

**Files:**
- Create: `src/lib/gaze/filtroOneEuro.ts`
- Create: `src/lib/gaze/filtroOneEuro.test.ts`

**Interfaces:**
- Consumes: nada.
- Produces: `ConfigOneEuro`, `CONFIG_ONE_EURO_PADRAO`, `EstadoFiltro`, `criarEstadoFiltro()`, `filtrarPonto(estado, ponto, timestamp, config)` retornando `{ ponto, estado }`.

- [ ] **Step 1: Escrever os testes que falham**

Criar `src/lib/gaze/filtroOneEuro.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  CONFIG_ONE_EURO_PADRAO,
  criarEstadoFiltro,
  filtrarPonto,
} from "./filtroOneEuro";

const PERIODO_MS = 33;

/** Gerador determinístico, para o teste não depender de Math.random. */
const criarRuido = (semente: number) => {
  let estado = semente;
  return () => {
    estado = (estado * 1103515245 + 12345) % 2147483648;
    return estado / 2147483648 - 0.5;
  };
};

const desvioPadrao = (valores: number[]) => {
  const media = valores.reduce((soma, valor) => soma + valor, 0) / valores.length;
  const variancia =
    valores.reduce((soma, valor) => soma + (valor - media) ** 2, 0) / valores.length;
  return Math.sqrt(variancia);
};

describe("filtrarPonto", () => {
  it("devolve a primeira amostra sem alteração, por não ter histórico", () => {
    const { ponto } = filtrarPonto(
      criarEstadoFiltro(),
      { x: 100, y: 200 },
      1000,
      CONFIG_ONE_EURO_PADRAO
    );

    expect(ponto.x).toBeCloseTo(100, 6);
    expect(ponto.y).toBeCloseTo(200, 6);
  });

  /** Roda o filtro sobre ruído branco e devolve os desvios padrão de entrada e saída. */
  const medirReducaoDeRuido = (config: typeof CONFIG_ONE_EURO_PADRAO) => {
    const ruido = criarRuido(42);
    let estado = criarEstadoFiltro();

    const entradas: number[] = [];
    const saidas: number[] = [];

    for (let indice = 0; indice < 200; indice += 1) {
      const valorRuidoso = 500 + ruido() * 60;
      const resultado = filtrarPonto(
        estado,
        { x: valorRuidoso, y: 500 },
        1000 + indice * PERIODO_MS,
        config
      );
      estado = resultado.estado;

      // descarta o transiente inicial do filtro
      if (indice < 50) continue;
      entradas.push(valorRuidoso);
      saidas.push(resultado.ponto.x);
    }

    return { entrada: desvioPadrao(entradas), saida: desvioPadrao(saidas) };
  };

  it("reduz o ruído de um sinal parado em pelo menos 2x quando beta é zero", () => {
    // Com beta zero o filtro é um passa-baixa puro: é o piso de suavização que
    // o mincutoff garante, sem a adaptação à velocidade interferindo.
    const { entrada, saida } = medirReducaoDeRuido({
      ...CONFIG_ONE_EURO_PADRAO,
      beta: 0,
    });

    expect(saida).toBeLessThan(entrada / 2);
  });

  it("ainda reduz o ruído com a configuração padrão, apesar da adaptação", () => {
    // Com beta > 0, a derivada do próprio ruído eleva o corte e afrouxa a
    // suavização. A redução é menor de propósito — é o preço de não atrasar a
    // sacada — mas precisa continuar existindo.
    const { entrada, saida } = medirReducaoDeRuido(CONFIG_ONE_EURO_PADRAO);

    expect(saida).toBeLessThan(entrada / 1.4);
  });

  it("acompanha um degrau dentro de um limite de atraso", () => {
    let estado = criarEstadoFiltro();
    let timestamp = 1000;

    for (let indice = 0; indice < 40; indice += 1) {
      estado = filtrarPonto(
        estado,
        { x: 100, y: 100 },
        timestamp,
        CONFIG_ONE_EURO_PADRAO
      ).estado;
      timestamp += PERIODO_MS;
    }

    let ultimoX = 0;
    for (let indice = 0; indice < 15; indice += 1) {
      const resultado = filtrarPonto(
        estado,
        { x: 900, y: 100 },
        timestamp,
        CONFIG_ONE_EURO_PADRAO
      );
      estado = resultado.estado;
      ultimoX = resultado.ponto.x;
      timestamp += PERIODO_MS;
    }

    // ~500ms após o degrau, o filtro precisa ter percorrido a maior parte da distância
    expect(ultimoX).toBeGreaterThan(700);
  });

  it("não altera o sinal quando ele já é constante", () => {
    let estado = criarEstadoFiltro();
    let ultimo = { x: 0, y: 0 };

    for (let indice = 0; indice < 30; indice += 1) {
      const resultado = filtrarPonto(
        estado,
        { x: 250, y: 400 },
        1000 + indice * PERIODO_MS,
        CONFIG_ONE_EURO_PADRAO
      );
      estado = resultado.estado;
      ultimo = resultado.ponto;
    }

    expect(ultimo.x).toBeCloseTo(250, 3);
    expect(ultimo.y).toBeCloseTo(400, 3);
  });

  it("ignora amostras com timestamp não crescente em vez de dividir por zero", () => {
    let estado = criarEstadoFiltro();
    estado = filtrarPonto(estado, { x: 10, y: 10 }, 1000, CONFIG_ONE_EURO_PADRAO).estado;

    const resultado = filtrarPonto(
      estado,
      { x: 900, y: 900 },
      1000,
      CONFIG_ONE_EURO_PADRAO
    );

    expect(Number.isFinite(resultado.ponto.x)).toBe(true);
    expect(Number.isFinite(resultado.ponto.y)).toBe(true);
  });
});
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `npm test`
Expected: FAIL — `Failed to resolve import "./filtroOneEuro"`.

- [ ] **Step 3: Implementar `src/lib/gaze/filtroOneEuro.ts`**

```ts
export type PontoGaze = {
  x: number;
  y: number;
};

export type ConfigOneEuro = {
  /** Corte mínimo em Hz. Menor = mais suave com o olho parado. */
  mincutoff: number;
  /** Quanto o corte sobe conforme a velocidade. Maior = menos atraso na sacada. */
  beta: number;
  /** Corte do filtro aplicado à própria derivada. */
  dcutoff: number;
};

export const CONFIG_ONE_EURO_PADRAO: ConfigOneEuro = {
  mincutoff: 1.0,
  beta: 0.007,
  dcutoff: 1.0,
};

type EstadoEixo = {
  valorFiltrado: number | null;
  derivadaFiltrada: number;
};

export type EstadoFiltro = {
  eixoX: EstadoEixo;
  eixoY: EstadoEixo;
  timestampAnterior: number | null;
};

export function criarEstadoFiltro(): EstadoFiltro {
  return {
    eixoX: { valorFiltrado: null, derivadaFiltrada: 0 },
    eixoY: { valorFiltrado: null, derivadaFiltrada: 0 },
    timestampAnterior: null,
  };
}

const calcularAlpha = (periodoSegundos: number, cutoffHz: number) => {
  const tau = 1 / (2 * Math.PI * cutoffHz);
  return 1 / (1 + tau / periodoSegundos);
};

const suavizar = (valorAtual: number, valorAnterior: number, alpha: number) =>
  alpha * valorAtual + (1 - alpha) * valorAnterior;

const filtrarEixo = (
  estado: EstadoEixo,
  valor: number,
  periodoSegundos: number,
  config: ConfigOneEuro
): { valor: number; estado: EstadoEixo } => {
  if (estado.valorFiltrado === null) {
    return { valor, estado: { valorFiltrado: valor, derivadaFiltrada: 0 } };
  }

  const derivadaBruta = (valor - estado.valorFiltrado) / periodoSegundos;
  const alphaDerivada = calcularAlpha(periodoSegundos, config.dcutoff);
  const derivadaFiltrada = suavizar(
    derivadaBruta,
    estado.derivadaFiltrada,
    alphaDerivada
  );

  // O coração do one-euro: quanto mais rápido o olho se move, mais alto o corte,
  // e portanto menos atraso. Com o olho parado o corte cai e a suavização domina.
  const cutoff = config.mincutoff + config.beta * Math.abs(derivadaFiltrada);
  const alphaValor = calcularAlpha(periodoSegundos, cutoff);
  const valorFiltrado = suavizar(valor, estado.valorFiltrado, alphaValor);

  return { valor: valorFiltrado, estado: { valorFiltrado, derivadaFiltrada } };
};

export function filtrarPonto(
  estado: EstadoFiltro,
  ponto: PontoGaze,
  timestamp: number,
  config: ConfigOneEuro = CONFIG_ONE_EURO_PADRAO
): { ponto: PontoGaze; estado: EstadoFiltro } {
  const timestampAnterior = estado.timestampAnterior;

  // Timestamp repetido ou fora de ordem produziria divisão por zero na derivada.
  // Devolver o último valor filtrado é mais honesto do que inventar um número.
  if (timestampAnterior !== null && timestamp <= timestampAnterior) {
    return {
      ponto: {
        x: estado.eixoX.valorFiltrado ?? ponto.x,
        y: estado.eixoY.valorFiltrado ?? ponto.y,
      },
      estado,
    };
  }

  const periodoSegundos =
    timestampAnterior === null ? 1 / 30 : (timestamp - timestampAnterior) / 1000;

  const resultadoX = filtrarEixo(estado.eixoX, ponto.x, periodoSegundos, config);
  const resultadoY = filtrarEixo(estado.eixoY, ponto.y, periodoSegundos, config);

  return {
    ponto: { x: resultadoX.valor, y: resultadoY.valor },
    estado: {
      eixoX: resultadoX.estado,
      eixoY: resultadoY.estado,
      timestampAnterior: timestamp,
    },
  };
}
```

- [ ] **Step 4: Rodar os testes e confirmar que passam**

Run: `npm test`
Expected: PASS — todos os testes, incluindo os da Task 1.

- [ ] **Step 5: Commit**

```bash
git add src/lib/gaze/filtroOneEuro.ts src/lib/gaze/filtroOneEuro.test.ts
git commit -m "feat: adiciona filtro one-euro para o fluxo de gaze

Media movel introduziria atraso fixo igual ao tamanho da janela, e atraso
fixo corrompe tempo de reacao, que e metrica clinica do exame. O one-euro
e adaptativo: suaviza forte com o olho parado e solta na sacada.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

## Task 5: Janela de amostras e indicador de qualidade (front, puro)

**Files:**
- Create: `src/lib/gaze/janelaAmostras.ts`
- Create: `src/lib/gaze/janelaAmostras.test.ts`

**Interfaces:**
- Consumes: `AmostraGaze` de `@/lib/gaze/erroValidacao`; `medianaDe` de `@/lib/gaze/erroValidacao`.
- Produces: `QualidadeGaze`, `JANELA_QUALIDADE_MS`, `adicionarNaJanela(janela, amostra, agora)`, `avaliarQualidade(janela, agora)`.

- [ ] **Step 1: Escrever os testes que falham**

Criar `src/lib/gaze/janelaAmostras.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { adicionarNaJanela, avaliarQualidade } from "./janelaAmostras";
import type { AmostraGaze } from "./erroValidacao";

const janelaCom = (quantidade: number, inicio: number, periodo: number) => {
  let janela: AmostraGaze[] = [];
  for (let indice = 0; indice < quantidade; indice += 1) {
    const timestamp = inicio + indice * periodo;
    janela = adicionarNaJanela(janela, { x: 500, y: 500, timestamp }, timestamp);
  }
  return janela;
};

describe("adicionarNaJanela", () => {
  it("descarta amostras mais velhas que a janela", () => {
    const janela = janelaCom(100, 0, 100); // 100 amostras espaçadas de 100ms = 10s
    const ultimoTimestamp = 99 * 100;

    const todasSaoRecentes = janela.every(
      (amostra) => ultimoTimestamp - amostra.timestamp <= 1000
    );

    expect(todasSaoRecentes).toBe(true);
    expect(janela.length).toBeLessThan(100);
  });

  it("preserva a ordem de chegada", () => {
    const janela = janelaCom(5, 0, 50);
    const timestamps = janela.map((amostra) => amostra.timestamp);

    expect(timestamps).toEqual([...timestamps].sort((a, b) => a - b));
  });
});

describe("avaliarQualidade", () => {
  it("reporta taxa próxima de 30 Hz para amostras de 33ms", () => {
    const janela = janelaCom(31, 0, 33);
    const qualidade = avaliarQualidade(janela, 30 * 33);

    expect(qualidade.taxaHz).toBeGreaterThan(25);
    expect(qualidade.taxaHz).toBeLessThan(35);
  });

  it("marca como sem dado quando a janela está vazia", () => {
    const qualidade = avaliarQualidade([], 1000);

    expect(qualidade.temDado).toBe(false);
    expect(qualidade.taxaHz).toBe(0);
  });

  it("marca como sem dado quando a última amostra está velha demais", () => {
    const janela = janelaCom(10, 0, 33);
    const qualidade = avaliarQualidade(janela, 9 * 33 + 900);

    expect(qualidade.temDado).toBe(false);
  });

  it("mede dispersão maior para nuvem espalhada que para nuvem concentrada", () => {
    const concentrada: AmostraGaze[] = [
      { x: 500, y: 500, timestamp: 0 },
      { x: 502, y: 499, timestamp: 33 },
      { x: 501, y: 501, timestamp: 66 },
    ];
    const espalhada: AmostraGaze[] = [
      { x: 400, y: 500, timestamp: 0 },
      { x: 600, y: 500, timestamp: 33 },
      { x: 500, y: 620, timestamp: 66 },
    ];

    const qualidadeConcentrada = avaliarQualidade(concentrada, 66);
    const qualidadeEspalhada = avaliarQualidade(espalhada, 66);

    expect(qualidadeEspalhada.dispersaoPx).toBeGreaterThan(
      qualidadeConcentrada.dispersaoPx
    );
  });
});
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `npm test`
Expected: FAIL — `Failed to resolve import "./janelaAmostras"`.

- [ ] **Step 3: Implementar `src/lib/gaze/janelaAmostras.ts`**

```ts
import { medianaDe, type AmostraGaze } from "./erroValidacao";

export const JANELA_QUALIDADE_MS = 1000;

/** Sem amostra nova por mais que isto, o tracking é considerado perdido. */
const MS_SEM_AMOSTRA_PARA_PERDER = 400;

export type QualidadeGaze = {
  temDado: boolean;
  taxaHz: number;
  /** Espalhamento das amostras recentes em torno da mediana, em pixels. */
  dispersaoPx: number;
  amostrasNaJanela: number;
};

export function adicionarNaJanela(
  janela: AmostraGaze[],
  amostra: AmostraGaze,
  agora: number
): AmostraGaze[] {
  const comNova = [...janela, amostra];
  return comNova.filter((item) => agora - item.timestamp <= JANELA_QUALIDADE_MS);
}

export function avaliarQualidade(
  janela: AmostraGaze[],
  agora: number
): QualidadeGaze {
  if (janela.length === 0) {
    return { temDado: false, taxaHz: 0, dispersaoPx: 0, amostrasNaJanela: 0 };
  }

  const ultimaAmostra = janela[janela.length - 1];
  const temDado = agora - ultimaAmostra.timestamp <= MS_SEM_AMOSTRA_PARA_PERDER;

  const primeiraAmostra = janela[0];
  const duracaoSegundos =
    (ultimaAmostra.timestamp - primeiraAmostra.timestamp) / 1000;
  const taxaHz = duracaoSegundos <= 0 ? 0 : (janela.length - 1) / duracaoSegundos;

  const medianaX = medianaDe(janela.map((amostra) => amostra.x));
  const medianaY = medianaDe(janela.map((amostra) => amostra.y));
  const desvios = janela.map((amostra) =>
    Math.sqrt((amostra.x - medianaX) ** 2 + (amostra.y - medianaY) ** 2)
  );

  return {
    temDado,
    taxaHz,
    dispersaoPx: medianaDe(desvios),
    amostrasNaJanela: janela.length,
  };
}
```

- [ ] **Step 4: Rodar os testes e confirmar que passam**

Run: `npm test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/gaze/janelaAmostras.ts src/lib/gaze/janelaAmostras.test.ts
git commit -m "feat: adiciona janela de amostras e indicador de qualidade do gaze

Permite distinguir 'olhou para outro lugar' de 'perdemos o rastreamento',
que hoje sao indistinguiveis porque ambos simplesmente nao geram evento.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

## Task 6: Integrar filtro e qualidade no EyeTrackingContext

**Files:**
- Modify: `src/context/EyeTrackingContext.tsx`

**Interfaces:**
- Consumes: `filtrarPonto`, `criarEstadoFiltro`, `CONFIG_ONE_EURO_PADRAO`, `EstadoFiltro` de `@/lib/gaze/filtroOneEuro`; `adicionarNaJanela`, `avaliarQualidade`, `QualidadeGaze` de `@/lib/gaze/janelaAmostras`; `AmostraGaze` de `@/lib/gaze/erroValidacao`.
- Produces: o contexto ganha os campos `gazeFiltrado: GazeData | null` e `qualidadeGaze: QualidadeGaze`. `lastGazeData` continua existindo e passa a carregar o valor filtrado, para não quebrar os consumidores atuais.

- [ ] **Step 1: Adicionar imports e refs**

Em `src/context/EyeTrackingContext.tsx`, adicionar aos imports:

```tsx
import type { AmostraGaze } from "@/lib/gaze/erroValidacao";
import {
  CONFIG_ONE_EURO_PADRAO,
  criarEstadoFiltro,
  filtrarPonto,
  type EstadoFiltro,
} from "@/lib/gaze/filtroOneEuro";
import {
  adicionarNaJanela,
  avaliarQualidade,
  type QualidadeGaze,
} from "@/lib/gaze/janelaAmostras";
import { useRef } from "react";
```

(`useRef` entra na lista de imports de `react` já existente.)

- [ ] **Step 2: Estender o tipo do contexto**

Em `interface EyeTrackingContextType`, adicionar:

```tsx
  gazeFiltrado: GazeData | null;
  qualidadeGaze: QualidadeGaze;
```

- [ ] **Step 3: Filtrar dentro de `updateGazeData`**

Adicionar, junto aos outros estados do provider:

```tsx
  const [qualidadeGaze, setQualidadeGaze] = useState<QualidadeGaze>({
    temDado: false,
    taxaHz: 0,
    dispersaoPx: 0,
    amostrasNaJanela: 0,
  });

  const estadoFiltroRef = useRef<EstadoFiltro>(criarEstadoFiltro());
  const janelaBrutaRef = useRef<AmostraGaze[]>([]);
```

Substituir `updateGazeData` inteiro por:

```tsx
  const updateGazeData = useCallback((data: dataType) => {
    if (data === null || data === undefined) return;
    if (data.x === null || data.y === null) return;

    const timestamp = Date.now();

    janelaBrutaRef.current = adicionarNaJanela(
      janelaBrutaRef.current,
      { x: data.x, y: data.y, timestamp },
      timestamp
    );
    setQualidadeGaze(avaliarQualidade(janelaBrutaRef.current, timestamp));

    const resultado = filtrarPonto(
      estadoFiltroRef.current,
      { x: data.x, y: data.y },
      timestamp,
      CONFIG_ONE_EURO_PADRAO
    );
    estadoFiltroRef.current = resultado.estado;

    setLastGazeData({
      x: resultado.ponto.x,
      y: resultado.ponto.y,
      timestamp,
    });
  }, []);
```

- [ ] **Step 4: Zerar o filtro ao parar o rastreamento**

Em `stopTracking` e em `fullStopTracking`, junto de `setLastGazeData(null)`, adicionar:

```tsx
      estadoFiltroRef.current = criarEstadoFiltro();
      janelaBrutaRef.current = [];
```

- [ ] **Step 5: Expor os campos novos**

No objeto `value`, adicionar:

```tsx
    gazeFiltrado: lastGazeData,
    qualidadeGaze,
```

- [ ] **Step 6: Verificar que compila**

Run: `npx next build`
Expected: build conclui sem erros.

- [ ] **Step 7: Commit**

```bash
git add src/context/EyeTrackingContext.tsx
git commit -m "feat: aplica filtro one-euro ao fluxo de gaze do WebGazer

O contexto guardava apenas a ultima amostra crua. Passa a filtrar o fluxo
inteiro e a manter uma janela para medir taxa efetiva e dispersao.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

## Task 7: Emitir a 10 Hz e enviar os centros dos alvos

**Files:**
- Modify: `src/app/fase/1/GameScreen.tsx`

**Interfaces:**
- Consumes: `qualidadeGaze` do `useEyeTracking`.
- Produces: o evento `gaze_data_fase1` passa a carregar `{ x, y, rawX, rawY, timestamp, temDado }`; o evento `fase_1_alvos_configuracao` passa a carregar, em cada alvo, `centro_x` e `centro_y`.

- [ ] **Step 1: Subir a taxa de emissão**

Em `src/app/fase/1/GameScreen.tsx`, trocar:

```tsx
const GAZE_EMIT_INTERVAL_MS = 1000;
```

por:

```tsx
// 10 Hz. A 1 Hz, um dwell de 5s dependia de 5 amostras cruas consecutivas e uma
// unica amostra ruidosa zerava o bloco de foco.
const GAZE_EMIT_INTERVAL_MS = 100;
```

- [ ] **Step 2: Incluir o centro de cada alvo na configuração**

Em `computeRelativeCoordinates`, substituir o `return` por:

```tsx
  return {
    x_min: Math.max(0, normalizedX - TOLERANCE_X),
    x_max: Math.min(1, normalizedX + TOLERANCE_X),
    y_min: Math.max(0, normalizedY - TOLERANCE_Y),
    y_max: Math.min(1, normalizedY + TOLERANCE_Y),
    centro_x: normalizedX,
    centro_y: normalizedY,
  };
```

No tipo do alvo declarado no topo do arquivo, adicionar os campos:

```tsx
  centro_x: number;
  centro_y: number;
```

- [ ] **Step 3: Enviar a flag de dado presente**

Substituir a desestruturação do contexto por uma que inclua a qualidade:

```tsx
  const {
    stopTracking,
    isWebGazerLoaded,
    startTracking,
    lastGazeData,
    isTracking,
    qualidadeGaze,
  } = useEyeTracking();
```

Adicionar, junto aos outros refs:

```tsx
  const qualidadeRef = useRef(qualidadeGaze);

  useEffect(() => {
    qualidadeRef.current = qualidadeGaze;
  }, [qualidadeGaze]);
```

No `socket.emit` dentro do intervalo de emissão, adicionar o campo:

```tsx
        temDado: qualidadeRef.current.temDado,
```

- [ ] **Step 4: Remover o descarte por igualdade**

A 10 Hz, duas amostras filtradas consecutivas quase nunca são idênticas, mas quando são isso significa que o WebGazer parou de produzir — e o backend precisa saber disso. Substituir:

```tsx
      const isNewData = hasGazeChanged(gaze, lastSentGazeRef.current);

      if (isNewData === false) return;
```

por:

```tsx
      // Antes, amostra repetida era descartada em silencio, o que o backend nao
      // conseguia distinguir de "olhou para outro lugar". Agora ela segue, com
      // temDado marcando a diferenca.
```

E remover a função `hasGazeChanged`, que fica sem uso.

- [ ] **Step 5: Verificar que compila**

Run: `npx next build`
Expected: build conclui sem erros.

Run: `grep -n "hasGazeChanged" src/app/fase/1/GameScreen.tsx`
Expected: nenhuma ocorrência.

- [ ] **Step 6: Commit**

```bash
git add src/app/fase/1/GameScreen.tsx
git commit -m "feat: emite gaze da fase 1 a 10 Hz e envia centros dos alvos

A 1 Hz o front descartava a maior parte das amostras que o WebGazer
produz, justamente a evidencia que permite achar o centro da nuvem de
ruido. Os centros dos alvos passam a viajar na configuracao para a
classificacao por proximidade do backend.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

## Task 8: Classificação por proximidade (backend, puro)

A partir daqui o trabalho é no repositório `backend-rastreamento-ocular`.

**Files:**
- Create: `src/fase1/gaze/classificacaoAlvo.js`
- Create: `tests/fase1/classificacaoAlvo.test.js`

**Interfaces:**
- Consumes: nada.
- Produces: `CONFIG_CLASSIFICACAO_PADRAO`, `classificarOlhar(olhar, alvos, config)` retornando `{ alvoId, classificacao, distancia, distanciaSegundo, razaoMargem }`, com `classificacao` em `"DENTRO" | "FORA_DE_ALCANCE" | "INDETERMINADO" | "SEM_ALVOS"`.

- [ ] **Step 1: Escrever os testes que falham**

Criar `tests/fase1/classificacaoAlvo.test.js`:

```js
import {
  classificarOlhar,
  CONFIG_CLASSIFICACAO_PADRAO,
} from "../../src/fase1/gaze/classificacaoAlvo.js";

const ALVOS = [
  { id: "a", centro_x: 0.2, centro_y: 0.2 },
  { id: "b", centro_x: 0.8, centro_y: 0.2 },
  { id: "c", centro_x: 0.5, centro_y: 0.8 },
];

test("elege o alvo mais proximo quando o olhar esta claramente sobre ele", () => {
  const resultado = classificarOlhar({ x: 0.21, y: 0.19 }, ALVOS, CONFIG_CLASSIFICACAO_PADRAO);

  expect(resultado.alvoId).toBe("a");
  expect(resultado.classificacao).toBe("DENTRO");
});

test("reporta FORA_DE_ALCANCE quando o olhar esta longe de todos os alvos", () => {
  const resultado = classificarOlhar({ x: 0.99, y: 0.99 }, ALVOS, CONFIG_CLASSIFICACAO_PADRAO);

  expect(resultado.classificacao).toBe("FORA_DE_ALCANCE");
});

test("reporta INDETERMINADO quando o olhar fica entre dois alvos", () => {
  // ponto medio exato entre 'a' e 'b'
  const resultado = classificarOlhar({ x: 0.5, y: 0.2 }, ALVOS, {
    ...CONFIG_CLASSIFICACAO_PADRAO,
    raioMaximo: 0.5,
  });

  expect(resultado.classificacao).toBe("INDETERMINADO");
});

test("vies comum a todos os alvos nao muda o vencedor", () => {
  const semVies = classificarOlhar({ x: 0.2, y: 0.2 }, ALVOS, CONFIG_CLASSIFICACAO_PADRAO);
  const comVies = classificarOlhar({ x: 0.27, y: 0.27 }, ALVOS, CONFIG_CLASSIFICACAO_PADRAO);

  expect(comVies.alvoId).toBe(semVies.alvoId);
});

test("funciona com um unico alvo, sem segundo colocado para comparar", () => {
  const resultado = classificarOlhar(
    { x: 0.21, y: 0.21 },
    [ALVOS[0]],
    CONFIG_CLASSIFICACAO_PADRAO,
  );

  expect(resultado.alvoId).toBe("a");
  expect(resultado.classificacao).toBe("DENTRO");
  expect(resultado.distanciaSegundo).toBeNull();
});

test("reporta SEM_ALVOS quando a lista esta vazia", () => {
  const resultado = classificarOlhar({ x: 0.5, y: 0.5 }, [], CONFIG_CLASSIFICACAO_PADRAO);

  expect(resultado.classificacao).toBe("SEM_ALVOS");
  expect(resultado.alvoId).toBeNull();
});

test("ignora alvos sem centro numerico em vez de quebrar", () => {
  const alvosComLixo = [...ALVOS, { id: "d", centro_x: undefined, centro_y: null }];
  const resultado = classificarOlhar({ x: 0.21, y: 0.19 }, alvosComLixo, CONFIG_CLASSIFICACAO_PADRAO);

  expect(resultado.alvoId).toBe("a");
});
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `cd /home/arthur/fatec/PI/backend-rastreamento-ocular && npm test -- classificacaoAlvo`
Expected: FAIL — `Cannot find module '../../src/fase1/gaze/classificacaoAlvo.js'`.

- [ ] **Step 3: Implementar `src/fase1/gaze/classificacaoAlvo.js`**

```js
export const CONFIG_CLASSIFICACAO_PADRAO = {
  // Distancia maxima, em fracao da tela, para considerar que o olhar esta sobre
  // algum alvo. Pode ser generoso: seu papel e absorver vies, nao discriminar.
  raioMaximo: 0.15,
  // O segundo colocado precisa estar ao menos 25% mais longe que o primeiro.
  // Abaixo disso a escolha seria sorteio, e sorteio nao entra em prontuario.
  razaoMargemMinima: 1.25,
};

const temCentroValido = (alvo) =>
  alvo !== null &&
  alvo !== undefined &&
  Number.isFinite(Number(alvo.centro_x)) &&
  Number.isFinite(Number(alvo.centro_y));

const distanciaAte = (olhar, alvo) => {
  const deltaX = olhar.x - Number(alvo.centro_x);
  const deltaY = olhar.y - Number(alvo.centro_y);
  return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
};

const semResultado = (classificacao) => ({
  alvoId: null,
  classificacao,
  distancia: null,
  distanciaSegundo: null,
  razaoMargem: null,
});

export function classificarOlhar(
  olhar,
  alvos,
  config = CONFIG_CLASSIFICACAO_PADRAO,
) {
  const alvosValidos = Array.isArray(alvos) ? alvos.filter(temCentroValido) : [];
  if (alvosValidos.length === 0) return semResultado("SEM_ALVOS");

  const ordenados = alvosValidos
    .map((alvo) => ({ alvo, distancia: distanciaAte(olhar, alvo) }))
    .sort((primeiro, segundo) => primeiro.distancia - segundo.distancia);

  const vencedor = ordenados[0];
  const segundo = ordenados.length > 1 ? ordenados[1] : null;
  const distanciaSegundo = segundo === null ? null : segundo.distancia;

  // Com distancia zero a razao seria infinita; tratar como margem folgada e
  // correto, porque o olhar esta exatamente sobre o alvo.
  const razaoMargem =
    distanciaSegundo === null
      ? null
      : vencedor.distancia === 0
        ? Infinity
        : distanciaSegundo / vencedor.distancia;

  const base = {
    alvoId: vencedor.alvo.id,
    distancia: vencedor.distancia,
    distanciaSegundo,
    razaoMargem,
  };

  if (vencedor.distancia > config.raioMaximo) {
    return { ...base, classificacao: "FORA_DE_ALCANCE" };
  }

  if (razaoMargem !== null && razaoMargem < config.razaoMargemMinima) {
    return { ...base, classificacao: "INDETERMINADO" };
  }

  return { ...base, classificacao: "DENTRO" };
}
```

- [ ] **Step 4: Rodar os testes e confirmar que passam**

Run: `npm test -- classificacaoAlvo`
Expected: PASS — 7 testes.

- [ ] **Step 5: Commit**

```bash
cd /home/arthur/fatec/PI/backend-rastreamento-ocular
git add src/fase1/gaze/classificacaoAlvo.js tests/fase1/classificacaoAlvo.test.js
git commit -m "feat: adiciona classificacao de olhar por proximidade

Contencao em caixa absoluta e fragil a vies, e vies e exatamente o que o
desvio de pose da cabeca produz. Comparar distancias entre alvos cancela
o componente comum do erro. A razao de margem evita registrar palpite
quando o olhar fica entre dois alvos.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

## Task 9: Máquina de foco com histerese (backend, puro)

> **Bloqueio a resolver antes de começar.** A branch 17 documenta a ausência de janela de tolerância como decisão deliberada, em `src/fase1/handler/fase1.handler.js`:
> ```js
> // Não existe janela de tolerância: qualquer amostra fora da hitbox
> // encerra imediatamente o bloco de foco atual.
> ```
> Esta task inverte essa decisão. Confirmar com o autor da branch 17 antes de implementar. Se ele tiver um motivo que não conhecemos, esta task muda ou sai.

**Files:**
- Create: `src/fase1/gaze/maquinaFoco.js`
- Create: `tests/fase1/maquinaFoco.test.js`

**Interfaces:**
- Consumes: as classificações produzidas pela Task 8.
- Produces: `CONFIG_FOCO_PADRAO`, `estadoInicialDeFoco()`, `avancarFoco(estado, entrada, config)` retornando `{ estado, tipoEvento, statusFoco }`.
  `entrada` tem a forma `{ classificacao, alvoId, alvoAtualId, distancia, temDado, timestamp }`.

- [ ] **Step 1: Escrever os testes que falham**

Criar `tests/fase1/maquinaFoco.test.js`:

```js
import {
  avancarFoco,
  CONFIG_FOCO_PADRAO,
  estadoInicialDeFoco,
} from "../../src/fase1/gaze/maquinaFoco.js";

const DWELL_MS = 5000;
const config = { ...CONFIG_FOCO_PADRAO, dwellRequeridoMs: DWELL_MS };

const entradaDentro = (timestamp, distancia = 0.05) => ({
  classificacao: "DENTRO",
  alvoId: "alvo-1",
  alvoAtualId: "alvo-1",
  distancia,
  temDado: true,
  timestamp,
});

const entradaFora = (timestamp) => ({
  classificacao: "FORA_DE_ALCANCE",
  alvoId: "alvo-1",
  alvoAtualId: "alvo-1",
  distancia: 0.9,
  temDado: true,
  timestamp,
});

const reproduzir = (entradas) => {
  let estado = estadoInicialDeFoco();
  let ultimo = null;
  for (const entrada of entradas) {
    ultimo = avancarFoco(estado, entrada, config);
    estado = ultimo.estado;
  }
  return ultimo;
};

test("inicia o bloco de foco na primeira amostra dentro do alvo", () => {
  const resultado = reproduzir([entradaDentro(1000)]);

  expect(resultado.tipoEvento).toBe("FOCANDO");
  expect(resultado.estado.inicioFocoTs).toBe(1000);
});

test("conclui o foco quando o dwell requerido e atingido", () => {
  const entradas = [];
  for (let ms = 0; ms <= DWELL_MS; ms += 100) entradas.push(entradaDentro(1000 + ms));

  const resultado = reproduzir(entradas);

  expect(resultado.tipoEvento).toBe("FOCO_FINALIZADO");
});

test("uma unica amostra fora nao quebra o dwell", () => {
  const resultado = reproduzir([
    entradaDentro(1000),
    entradaDentro(1100),
    entradaFora(1200),
    entradaDentro(1300),
  ]);

  expect(resultado.estado.inicioFocoTs).toBe(1000);
  expect(resultado.tipoEvento).toBe("FOCANDO");
});

test("tres amostras consecutivas fora quebram o dwell", () => {
  const resultado = reproduzir([
    entradaDentro(1000),
    entradaFora(1100),
    entradaFora(1200),
    entradaFora(1300),
  ]);

  expect(resultado.tipoEvento).toBe("DESVIO_COMISSAO");
  expect(resultado.estado.inicioFocoTs).toBe(0);
});

test("manter o foco tolera distancia maior do que a exigida para inicia-lo", () => {
  const raioDeSaida = config.raioMaximo * config.fatorRaioSaida;
  const distanciaIntermediaria = (config.raioMaximo + raioDeSaida) / 2;

  const semFoco = reproduzir([
    { ...entradaDentro(1000, distanciaIntermediaria), classificacao: "FORA_DE_ALCANCE" },
  ]);
  expect(semFoco.estado.inicioFocoTs).toBe(0);

  const comFoco = reproduzir([
    entradaDentro(1000),
    { ...entradaDentro(1100, distanciaIntermediaria), classificacao: "FORA_DE_ALCANCE" },
  ]);
  expect(comFoco.estado.inicioFocoTs).toBe(1000);
});

test("olhar mais perto de outro alvo quebra o foco na hora, sem tolerancia", () => {
  const resultado = reproduzir([
    entradaDentro(1000),
    { ...entradaDentro(1100), alvoId: "alvo-2" },
  ]);

  expect(resultado.tipoEvento).toBe("DESVIO_COMISSAO");
  expect(resultado.estado.inicioFocoTs).toBe(0);
});

test("ausencia de dado nao conta como desvio de atencao", () => {
  const resultado = reproduzir([
    entradaDentro(1000),
    { ...entradaFora(1100), temDado: false },
    { ...entradaFora(1200), temDado: false },
    { ...entradaFora(1300), temDado: false },
  ]);

  expect(resultado.tipoEvento).toBe("SEM_DADO");
  expect(resultado.estado.inicioFocoTs).toBe(1000);
});

test("olhar ambiguo entre dois alvos nao inicia foco nem conta como desvio", () => {
  const resultado = reproduzir([
    { ...entradaDentro(1000), classificacao: "INDETERMINADO" },
  ]);

  expect(resultado.tipoEvento).toBe("INDETERMINADO");
  expect(resultado.estado.inicioFocoTs).toBe(0);
});

test("acumula omissao enquanto o paciente nunca olhou para o alvo", () => {
  const entradas = [];
  for (let indice = 0; indice < 5; indice += 1) entradas.push(entradaFora(1000 + indice * 100));

  const resultado = reproduzir(entradas);

  expect(resultado.estado.foraConsecutivo).toBeGreaterThanOrEqual(4);
});
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `npm test -- maquinaFoco`
Expected: FAIL — módulo não encontrado.

- [ ] **Step 3: Implementar `src/fase1/gaze/maquinaFoco.js`**

```js
export const CONFIG_FOCO_PADRAO = {
  dwellRequeridoMs: 5000,
  raioMaximo: 0.15,
  // Manter um foco tolera mais distancia do que inicia-lo. Sem isso, o ruido
  // normal do WebGazer derruba o bloco de foco a cada poucas amostras.
  fatorRaioSaida: 1.3,
  // A 10 Hz isso e ~300ms, que cobre a duracao tipica de uma piscada.
  amostrasForaParaQuebrar: 3,
  amostrasParaOmissao: 4,
};

export function estadoInicialDeFoco() {
  return {
    inicioFocoTs: 0,
    ultimoFocoTs: 0,
    focoConsecutivo: 0,
    foraConsecutivo: 0,
    amostrasForaSeguidas: 0,
  };
}

const temFocoAtivo = (estado) => estado.inicioFocoTs > 0;

const estaDentroParaManter = (entrada, config) => {
  if (entrada.distancia === null || entrada.distancia === undefined) return false;
  return entrada.distancia <= config.raioMaximo * config.fatorRaioSaida;
};

const quebrarFoco = (estado) => ({
  ...estado,
  inicioFocoTs: 0,
  ultimoFocoTs: 0,
  focoConsecutivo: 0,
  amostrasForaSeguidas: 0,
  foraConsecutivo: estado.foraConsecutivo + 1,
});

export function avancarFoco(estado, entrada, config = CONFIG_FOCO_PADRAO) {
  // Sem dado nao e o mesmo que olhar para outro lugar. Congelar o estado evita
  // registrar desatencao quando na verdade perdemos o rosto de vista.
  if (entrada.temDado === false) {
    return { estado, tipoEvento: "SEM_DADO", statusFoco: "SEM_DADO" };
  }

  const olhouParaOutroAlvo =
    entrada.classificacao === "DENTRO" && entrada.alvoId !== entrada.alvoAtualId;

  // Mudanca de alvo e decisao do paciente, nao ruido: quebra na hora.
  if (olhouParaOutroAlvo === true) {
    if (temFocoAtivo(estado) === false) {
      return {
        estado: { ...estado, foraConsecutivo: estado.foraConsecutivo + 1 },
        tipoEvento: "DESFOCANDO",
        statusFoco: "DESFOCADO",
      };
    }
    return {
      estado: quebrarFoco(estado),
      tipoEvento: "DESVIO_COMISSAO",
      statusFoco: "DESFOCADO",
    };
  }

  if (entrada.classificacao === "INDETERMINADO") {
    return { estado, tipoEvento: "INDETERMINADO", statusFoco: "INDETERMINADO" };
  }

  const acertouAlvoAtual =
    entrada.classificacao === "DENTRO" && entrada.alvoId === entrada.alvoAtualId;

  if (acertouAlvoAtual === true) {
    const jaTinhaFoco = temFocoAtivo(estado);
    const inicioFocoTs = jaTinhaFoco === true ? estado.inicioFocoTs : entrada.timestamp;

    const novoEstado = {
      ...estado,
      inicioFocoTs,
      ultimoFocoTs: entrada.timestamp,
      focoConsecutivo: estado.focoConsecutivo + 1,
      foraConsecutivo: 0,
      amostrasForaSeguidas: 0,
    };

    const tempoFocadoMs = entrada.timestamp - inicioFocoTs;
    if (tempoFocadoMs >= config.dwellRequeridoMs) {
      return {
        estado: novoEstado,
        tipoEvento: "FOCO_FINALIZADO",
        statusFoco: "CONCLUIDO",
      };
    }

    return { estado: novoEstado, tipoEvento: "FOCANDO", statusFoco: "FOCANDO" };
  }

  // A partir daqui o olhar esta fora do alvo atual.
  if (temFocoAtivo(estado) === true && estaDentroParaManter(entrada, config) === true) {
    return {
      estado: { ...estado, ultimoFocoTs: entrada.timestamp },
      tipoEvento: "FOCANDO",
      statusFoco: "FOCANDO",
    };
  }

  if (temFocoAtivo(estado) === true) {
    const amostrasForaSeguidas = estado.amostrasForaSeguidas + 1;

    if (amostrasForaSeguidas < config.amostrasForaParaQuebrar) {
      return {
        estado: { ...estado, amostrasForaSeguidas },
        tipoEvento: "FOCANDO",
        statusFoco: "FOCANDO",
      };
    }

    return {
      estado: quebrarFoco(estado),
      tipoEvento: "DESVIO_COMISSAO",
      statusFoco: "DESFOCADO",
    };
  }

  const foraConsecutivo = estado.foraConsecutivo + 1;
  const tipoEvento =
    foraConsecutivo === config.amostrasParaOmissao ? "DESVIO_OMISSAO" : "DESFOCANDO";

  return {
    estado: { ...estado, foraConsecutivo },
    tipoEvento,
    statusFoco: "DESFOCADO",
  };
}
```

- [ ] **Step 4: Rodar os testes e confirmar que passam**

Run: `npm test -- maquinaFoco`
Expected: PASS — 9 testes.

- [ ] **Step 5: Commit**

```bash
git add src/fase1/gaze/maquinaFoco.js tests/fase1/maquinaFoco.test.js
git commit -m "feat: adiciona maquina de foco com histerese e tolerancia a piscada

Uma unica amostra fora zerava o bloco de foco. Com dwell de 5s e ruido
normal do WebGazer, concluir um alvo dependia de sorte. Passa a exigir
tres amostras seguidas fora, e manter o foco tolera mais distancia do que
inicia-lo. Ausencia de dado deixa de contar como desatencao.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

## Task 10: Integrar classificação e máquina de foco no handler da fase 1

**Files:**
- Modify: `src/fase1/handler/fase1.handler.js`
- Modify: `src/fase1/service/fase1Service.js` (apenas se `salvarAlvosFase1Redis` descartar campos desconhecidos)

**Interfaces:**
- Consumes: `classificarOlhar` e `CONFIG_CLASSIFICACAO_PADRAO` da Task 8; `avancarFoco`, `estadoInicialDeFoco` e `CONFIG_FOCO_PADRAO` da Task 9.
- Produces: nenhuma interface nova; o evento `fase1_foco_status` ganha o campo `classificacao`.

- [ ] **Step 1: Confirmar que os centros sobrevivem à ida ao Redis**

Run: `grep -n "salvarAlvosFase1Redis" -A 12 src/fase1/service/fase1Service.js`
Expected: a função serializa o array recebido inteiro. Se ela montar um objeto campo a campo, incluir `centro_x` e `centro_y` nessa montagem.

- [ ] **Step 2: Adicionar os imports no handler**

Em `src/fase1/handler/fase1.handler.js`, adicionar após os imports existentes:

```js
import {
  classificarOlhar,
  CONFIG_CLASSIFICACAO_PADRAO,
} from "../gaze/classificacaoAlvo.js";
import { avancarFoco, CONFIG_FOCO_PADRAO } from "../gaze/maquinaFoco.js";
import { getAlvoFase1 } from "../../database/redis/redisHandlers.js";
```

- [ ] **Step 3: Substituir o miolo do listener de gaze**

Dentro do `socket.on` que trata `gaze_data_fase1`, substituir todo o trecho que vai de `const estaFocando =` até o fechamento do último `else` da cadeia de eventos por:

```js
      const todosOsAlvos = await getAlvoFase1(socket.data.experimentoId);

      const classificacao = classificarOlhar(
        { x, y },
        todosOsAlvos,
        CONFIG_CLASSIFICACAO_PADRAO,
      );

      const configFoco = {
        ...CONFIG_FOCO_PADRAO,
        dwellRequeridoMs: DWELL_REQUIRED_MS,
      };

      const resultado = avancarFoco(
        {
          inicioFocoTs: estado.inicioFocoTs,
          ultimoFocoTs: estado.ultimoFocoTs,
          focoConsecutivo: estado.focoConsecutivo,
          foraConsecutivo: estado.foraConsecutivo,
          amostrasForaSeguidas: Number(estado.amostrasForaSeguidas) || 0,
        },
        {
          classificacao: classificacao.classificacao,
          alvoId: classificacao.alvoId,
          alvoAtualId: alvo?.id ?? null,
          distancia: classificacao.distancia,
          temDado: data?.temDado !== false,
          timestamp: currDate,
        },
        configFoco,
      );

      Object.assign(estado, resultado.estado);

      const tipoEvento = resultado.tipoEvento;
      const focoConsiderado = resultado.statusFoco === "FOCANDO" ||
        resultado.statusFoco === "CONCLUIDO";
      const statusFoco = resultado.statusFoco;
```

- [ ] **Step 4: Incluir a classificação no evento de status**

Em `emitirStatusFoco`, adicionar o parâmetro `classificacao` ao final da assinatura e incluí-lo no payload:

```js
const emitirStatusFoco = (socket, alvo, estado, status, timestamp, classificacao) => {
  const inicioFocoTs = Number(estado?.inicioFocoTs) || 0;
  const tempoFocoMs = inicioFocoTs > 0
    ? Math.max(0, timestamp - inicioFocoTs)
    : 0;

  socket.emit(FASE1_FOCUS_STATUS_EVENT, {
    fase: 1,
    alvo: alvo?.id ?? estado?.alvoAtual,
    status,
    timestamp,
    inicio_foco_ts: inicioFocoTs || null,
    tempo_foco_ms: tempoFocoMs,
    classificacao: classificacao ?? null,
  });
};
```

E atualizar a chamada:

```js
      emitirStatusFoco(
        socket,
        alvo,
        estado,
        statusFoco,
        currDate,
        classificacao.classificacao,
      );
```

- [ ] **Step 5: Persistir o contador de amostras fora**

Em `src/database/redis/redisHandlers.js`, na função `salvarEstadoExperimentoFase1`, adicionar ao objeto passado para `redis.hset`:

```js
    amostrasForaSeguidas: 0,
```

E em `getEstadoExperimentoFase1ByExpId`, adicionar ao objeto retornado:

```js
    amostrasForaSeguidas: toNumber(estado.amostrasForaSeguidas),
```

- [ ] **Step 6: Rodar a suíte inteira**

Run: `cd /home/arthur/fatec/PI/backend-rastreamento-ocular && npm test`
Expected: PASS — os testes das Tasks 8 e 9 mais os 7 testes que já existiam.

- [ ] **Step 7: Commit**

```bash
git add src/fase1/handler/fase1.handler.js src/database/redis/redisHandlers.js
git commit -m "feat: usa classificacao por proximidade e histerese na fase 1

O handler passa a delegar a decisao para os modulos puros testados, em
vez de decidir com um teste de contencao em caixa sobre uma unica amostra
crua. O evento de status ganha a classificacao, o que torna visivel a
diferenca entre desatencao, ambiguidade e perda de rastreamento.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

## Task 11: Investigar acesso aos landmarks (spike)

Esta task produz uma **resposta**, não código que fica. É o ponto de risco registrado na seção 4.7 da spec.

**Files:**
- Create: `docs/superpowers/notas/<hoje>-acesso-landmarks-webgazer.md`, onde `<hoje>` vem de
  `date +%F` no dia da execução (por exemplo `2026-09-24-acesso-landmarks-webgazer.md`).

- [ ] **Step 1: Verificar o que o WebGazer expõe**

Com o app rodando (`npm run dev`) e a calibração aberta, no console do navegador:

```js
const tracker = webgazer.getTracker();
console.log(Object.keys(tracker));
console.log(typeof tracker.getPositions === "function");
console.log(tracker.getPositions?.()?.length);
```

- [ ] **Step 2: Registrar o achado**

Escrever a nota com: o que foi encontrado, se os landmarks estão acessíveis, e a recomendação entre monitor de pose (plano A) e sondagem de validação entre fases (plano B da spec, seção 4.7).

- [ ] **Step 3: Commit**

```bash
git add docs/superpowers/notas/
git commit -m "docs: registra investigacao de acesso aos landmarks do WebGazer

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

- [ ] **Step 4: Parar e decidir com o Arthur**

O monitor de deriva só é planejado em detalhe depois desta resposta. Não implementar às cegas.

---

## Task 12: Ajuste empírico dos parâmetros

Não é código: é o ciclo que dá sentido a tudo que veio antes. Executado pelo Arthur, com câmera e rosto reais.

- [ ] **Step 1: Medir a linha de base**

Calibrar e anotar o erro médio e a dispersão reportados pela validação da Task 2, **antes** de mexer em qualquer parâmetro. Repetir três vezes para ter noção da variação entre sessões.

- [ ] **Step 2: Ajustar o filtro**

Variar `mincutoff` e `beta` em `CONFIG_ONE_EURO_PADRAO` e repetir a medição. O alvo é dispersão menor sem que o erro médio suba — erro subindo significa que o filtro está atrasando demais e arrastando a mediana.

- [ ] **Step 3: Apertar a tolerância**

Só agora. Com o erro médio medido em `E`, definir `raioMaximo` em `CONFIG_CLASSIFICACAO_PADRAO` e `TOLERANCE_X`/`TOLERANCE_Y` do front com folga sobre `E`, não abaixo dele. Ajustar `LIMIAR_APROVACAO_CALIBRACAO` de acordo.

- [ ] **Step 4: Registrar os valores finais**

Atualizar a seção de valores iniciais da spec com os valores medidos e a justificativa, e commitar.

---

## Auto-revisão

**Cobertura da spec:**

| Seção da spec | Task |
|---|---|
| 4.1 Régua de acurácia | 1, 2 |
| 4.2 Filtragem no front | 4, 6 |
| 4.3 Taxa de emissão | 7 |
| 4.4 Classificação por proximidade | 8, 10 |
| 4.5 Histerese no dwell | 9 (com bloqueio a resolver) |
| 4.6 Portão de calibração e isolamento | 2, 3 |
| 4.7 Monitor de deriva e aperto | 11, 12 |
| 6 Tratamento de erro — amostras ausentes | 5, 7, 9 |
| 6 Tratamento de erro — olhar ambíguo | 8, 9 |
| 7 Testes | 1, 4, 5, 8, 9 |

**Consistência de tipos:** `AmostraGaze` é definido na Task 1 e reusado nas Tasks 5 e 6. `QualidadeGaze` nasce na Task 5 e é consumido nas Tasks 6 e 7. `centro_x`/`centro_y` nascem na Task 7 e são consumidos na Task 8. A forma de estado de `avancarFoco` (Task 9) casa com os campos persistidos no Redis na Task 10, Step 5.
