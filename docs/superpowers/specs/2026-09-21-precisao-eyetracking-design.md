# Precisão do eye tracking — desenho técnico

**Data:** 2026-09-21
**Branches:** `feat/precisao-eyetracking` em `FocusQuest-web` e em `backend-rastreamento-ocular`, ambas baseadas na `17-melhorarsimplificar-fase-1-para-garantir-eficácia-do-eyetracking`
**Escopo:** abordagem A (medir, filtrar, apertar com evidência) + abordagem C (classificação por proximidade)

---

## 1. Problema

O sistema funciona e raramente perde o foco, mas a medida não é confiável. Sintomas relatados:

- o ponto de gaze treme e orbita o alvo em vez de coincidir com ele;
- a calibração só vale se o paciente ficar exatamente na mesma posição;
- outra pessoa não consegue usar sem recalibrar do zero.

### 1.1 O que a investigação encontrou

**A tolerância é maior que o erro do sensor.** `TOLERANCE_X = TOLERANCE_Y = 0.15`
(`src/app/fase/1/GameScreen.tsx`) define uma caixa de aceitação de ±15% da tela por eixo. A ~60 cm
de um monitor comum isso equivale a algo na ordem de ±7-8° de ângulo visual. O erro típico do
WebGazer bem calibrado é ~4-5°. O acerto acontece porque a caixa é maior que o erro, não porque o
olhar foi medido corretamente.

Consequência: `FOCANDO` não prova que o paciente olhou para o alvo — prova que olhou para cerca de
um terço da tela. Qualquer conclusão clínica extraída daí herda essa folga, e a falha é invisível
no relatório.

**A fase 1 descarta a maior parte das amostras.** `GAZE_EMIT_INTERVAL_MS = 1000`. O WebGazer produz
dezenas de amostras por segundo; o front guarda apenas a última (`EyeTrackingContext.lastGazeData`)
e envia uma por segundo. Ruído de média zero cai com a raiz do número de amostras — juntar ~9
amostras corta o tremor em ~3x. Hoje esse ganho é descartado antes de ser usado.

**A calibração mede erro de treino.** `src/app/calibration/page.tsx` calcula a distância entre o
clique e o gaze no instante do clique, mas é esse mesmo clique que treina a regressão do WebGazer.
O rótulo "Precisão: Excelente" mede ajuste aos dados de treino, não generalização, e tende a
parecer melhor do que a realidade. Não existe limiar de reprovação: após 45 cliques a calibração
sempre passa.

**A deriva de pose é absorvida silenciosamente.** O WebGazer mapeia aparência do olho na imagem →
coordenada de tela, sem nenhuma representação explícita de onde a cabeça está. Mover a cabeça muda
a aparência sem mudar o alvo, e o mapa passa a errar de forma sistemática. Hoje esse erro é
absorvido pelo ±15% e nunca reportado.

### 1.2 Dois bugs de calibração

- `handleRestart` zera `hits` e `clickLog` mas não zera `stars[].totalHits`, que é estado mutável
  em escopo de módulo (`src/constants/calibrationStar.tsx`). Como `activeStars` filtra por
  `totalHits < MAX_HITS_PER_STAR`, recalibrar deixa a tela sem nenhuma estrela. Só volta com
  reload da página — na prática, ninguém recalibra.
- `saveDataAcrossSessions(true)` com `clearData()` condicionado a `isTutorial` faz o modelo de
  regressão persistir no navegador entre pacientes. Num equipamento compartilhado, o paciente B
  herda a calibração do paciente A.

---

## 2. Objetivo

**Validade da medida.** Que `FOCANDO` signifique de fato "olhou para o alvo", com margem de erro
conhecida e reportada.

**Desejável, não obrigatório:** resolução espacial suficiente para alvos menores ou mais próximos.

### 2.1 Fora de escopo

- **Compensação de pose de cabeça.** Alimentar pose na regressão ou construir um pipeline próprio
  sobre landmarks de íris é trabalho de semanas com risco real de não fechar. Fica como dívida
  consciente e registrada (seção 7).
- **CI do repositório web.** Vai em branch separada, por decisão do Arthur, para não misturar dois
  assuntos no mesmo PR.
- **Divergência `main` ↔ `develop`** e limpeza de `.gitignore` do backend. Assuntos independentes.

---

## 3. Abordagem

Duas frentes que atacam componentes diferentes do mesmo erro:

**A — reduzir o erro aleatório.** Aproveitar as amostras hoje descartadas, filtrar, e só então
apertar a tolerância, guiado por medição.

**C — neutralizar o erro sistemático.** Trocar o teste de contenção absoluta ("o olhar está dentro
da caixa deste alvo?") por classificação relativa ("de qual alvo o olhar está mais perto, e com
que margem?").

C é a peça que dá validade barata. Erro sistemático — que é exatamente o que a pose produz —
desloca todos os pontos na mesma direção e **se cancela** numa diferença entre distâncias. Um viés
que estouraria qualquer caixa absoluta pode não alterar qual alvo é o mais próximo.

**Trade-off assumido:** C só funciona com alvos bem separados. Ele entrega o objetivo (1) ao preço
de não servir para o objetivo (2). No dia que houver dois estímulos vizinhos, C não ajuda e o
caminho passa a ser compensação de pose.

---

## 4. Componentes

Em ordem de dependência. Cada um existe porque o seguinte precisa dele.

### 4.1 Régua de acurácia

Uma fase de **validação** após os 45 cliques de treino: 5 pontos em posições **não treinadas**,
apresentados um por vez, onde o paciente apenas fixa o olhar sem clicar. O erro de cada ponto é a
distância entre a mediana das amostras da janela estável e a posição verdadeira.

Pontos de validação (% da tela, `left`/`top`): `(20,20)`, `(80,20)`, `(50,60)`, `(20,80)`,
`(80,80)`. Nenhum coincide com os pontos de treino, que ocupam `left ∈ {3,50,95}` ×
`top ∈ {5,50,90}`. O conjunto inclui posições próximas das bordas de propósito: é onde o WebGazer é
pior, e validar só no interior superestimaria a qualidade.

**Unidade: porcentagem da tela.** O navegador não conhece o tamanho físico do monitor nem a
distância do paciente, então reportar graus seria estimativa disfarçada de medida. Porcentagem da
tela é também a unidade em que a tolerância já está escrita, o que torna os dois números
diretamente comparáveis. Converter para graus exige medir a distância do paciente por fora, e fica
registrado como limitação.

Saída: erro médio, erro por ponto, e dispersão dentro de cada ponto (tremor separado de viés).

### 4.2 Filtragem no front

`EyeTrackingContext` passa a manter uma janela deslizante das amostras recentes e a aplicar um
**filtro one-euro** ao fluxo.

Por que one-euro e não média móvel: média móvel introduz atraso fixo igual ao tamanho da janela, e
atraso fixo corrompe tempo de reação, que é métrica clínica do exame. O one-euro é adaptativo —
suaviza forte quando o olho está parado (fixação, onde o tremor incomoda) e solta quando o olho
move (sacada, onde o atraso incomoda). O Kalman interno do WebGazer já está ligado e é
evidentemente insuficiente, além de não ser ajustável de fora.

Valores iniciais: `mincutoff = 1.0`, `beta = 0.007`, `dcutoff = 1.0`. São pontos de partida da
literatura, a serem ajustados contra a régua da seção 4.1 — não valores finais.

O contexto passa a expor, além do ponto filtrado, um indicador de qualidade: taxa de amostragem
efetiva e dispersão na janela recente.

### 4.3 Taxa de emissão

Fase 1 de 1000 ms para 100 ms (10 Hz). Fase 3 de 250 ms para 100 ms. 10 Hz dá granularidade de
100 ms, suficiente para dwells de 3-5 s e para tempo de reação, sem saturar o socket.

**Decisão de arquitetura: o backend continua dono da decisão.** A alternativa seria detectar
fixação no front, que tem a taxa nativa de ~30 Hz, e enviar apenas eventos prontos. Descartada
porque num instrumento clínico o servidor precisa poder auditar e recalcular a partir do dado
recebido, e a máquina de estados já vive no backend.

Custo dessa escolha: perde-se resolução temporal de ~30 Hz para 10 Hz. Aceitável para dwells de
segundos; seria errado se o objetivo incluísse microssacadas.

### 4.4 Classificação por proximidade

Substitui o teste de contenção em `src/fase1/handler/fase1.handler.js`:

```js
const estaFocando =
  x >= alvo.x_min && x <= alvo.x_max &&
  y >= alvo.y_min && y <= alvo.y_max;
```

Passa a calcular a distância do olhar ao centro de **todos** os alvos configurados, e aplicar três
testes:

1. **Vencedor** — o alvo mais próximo é o alvo atual?
2. **Raio máximo** — a distância ao vencedor está abaixo de um limite absoluto? (senão o paciente
   está olhando para fora de qualquer alvo)
3. **Margem** — o segundo colocado está suficientemente mais longe que o primeiro?

O teste de margem é o que produz confiança. Olhar equidistante entre dois alvos é sorteio; nesse
caso o evento registrado é `INDETERMINADO`, não um palpite.

O raio máximo pode permanecer generoso, porque seu papel é apenas absorver viés; quem discrimina é
a margem. É daí que vem a robustez a erro sistemático.

Valores iniciais: raio máximo `0.15` (equivalente à tolerância atual, para não mudar duas variáveis
ao mesmo tempo), razão de margem `1.25` — o segundo colocado precisa estar ao menos 25% mais longe
que o primeiro.

**Aplicação a outras fases.** A fase 3 usa o mesmo teste de contenção em
`src/fase3/handler/fase3.handler.js` e se beneficiaria ainda mais da classificação por proximidade,
já que alterna entre exatamente dois alvos e a pergunta literal é "olhou para qual dos dois". Ainda
assim, esta iteração altera **apenas a fase 1**. Motivo: os parâmetros das seções 4.4 e 4.5 precisam
ser ajustados contra medição, e ajustar duas fases ao mesmo tempo impede isolar o efeito de cada
mudança. A fase 3 entra depois que a fase 1 estiver validada, reaproveitando os parâmetros já
calibrados.

O front já emite `fase_1_alvos_configuracao` com todos os alvos; o backend passa a guardar também o
centro de cada um, não apenas os limites da caixa.

### 4.5 Histerese no dwell

Hoje uma única amostra fora encerra o bloco de foco. Passa a haver:

- **raio de entrada** mais apertado que o **raio de saída** (fator inicial 1.3);
- exigência de **3 amostras consecutivas fora** a 10 Hz (≈300 ms) para quebrar o dwell.

A histerese incide sobre o **raio máximo** da seção 4.4: iniciar um dwell exige distância abaixo de
`raioMaximo`; mantê-lo tolera até `raioMaximo × 1.3`. O teste de vencedor e o de margem não têm
histerese — se o olhar passa a estar mais perto de outro alvo, isso é mudança de alvo, não ruído, e
deve encerrar o bloco imediatamente.

Piscadas produzem 100-300 ms de dado ausente ou ruidoso e não podem contar como desvio de atenção.
A tolerância de 3 amostras cobre isso sem precisar detectar piscada explicitamente.

**Conflito a resolver antes de implementar:** a branch 17 documenta a ausência de tolerância como
decisão deliberada —

```js
// Não existe janela de tolerância: qualquer amostra fora da hitbox
// encerra imediatamente o bloco de foco atual.
```

Esta seção inverte essa decisão. Confirmar com o autor da branch 17 antes de alterar. Indício de
que a decisão era temporária: a variável `focoConsiderado` é atribuída e nunca diverge de
`estaFocando`, o que parece ser uma costura preparada para exatamente esta lógica.

### 4.6 Portão de calibração e isolamento por paciente

A validação da seção 4.1 passa a **reprovar**: erro médio acima do limiar bloqueia o início do
exame e oferece recalibração. Limiar inicial: 0.10 (10% da tela), a ser ajustado contra a medição
real.

Junto:

- `handleRestart` passa a zerar `totalHits`. O estado mutável em escopo de módulo sai de
  `constants/calibrationStar.tsx` e vira estado de componente — a origem do bug é o dado global,
  não o reset esquecido.
- `clearData()` passa a ser disparado pela troca de paciente, não por `isTutorial`.
- `saveDataAcrossSessions` desligado.

Consequência aceita: cada sessão exige calibração. É o comportamento correto para um instrumento
clínico e é o preço de não contaminar um paciente com o modelo de outro.

### 4.7 Monitor de deriva e aperto da tolerância

Captura da pose da cabeça no momento da calibração e comparação contínua durante o exame. Ao passar
do limite, o sistema avisa e marca o trecho como suspeito. Não compensa — **declara inválido**, que
é o que rastreadores comerciais fazem. Dado marcado como inválido vale mais que dado errado
apresentado como bom.

**Risco técnico, e o único ponto do plano que pode não fechar como desenhado.** É preciso obter os
landmarks do WebGazer. Se ele não os expuser, a alternativa é uma instância própria do MediaPipe
(já vendorizado em `public/mediapipe/face_mesh/`), o que custa CPU — e CPU a menos derruba a taxa de
amostragem do WebGazer, justamente o que a seção 4.3 tenta aumentar.

**Plano B, caso isso se confirme:** sondagem de validação nas transições entre fases — repetir um
ponto de validação em momentos naturais do exame e verificar se o erro cresceu. Mede acurácia
diretamente em vez de pose (que é apenas um proxy) e não custa CPU contínua. O preço é detectar a
deriva mais tarde.

**O aperto da tolerância é a última etapa**, e o valor sai da régua da seção 4.1, não de escolha a
priori. Escolher o número antes de medir seria repetir exatamente o erro que este trabalho corrige.

---

## 5. Fluxo de dados

```
WebGazer (~30 Hz)
  → one-euro + janela deslizante          [front, EyeTrackingContext]
  → emissão a 10 Hz {x, y, timestamp, qualidade}
  → classificação por proximidade         [backend, fase1.handler]
  → histerese + acúmulo de dwell
  → eventos + histórico auditável (Redis → Mongo)
```

## 6. Tratamento de erro

- **Amostras ausentes** (rosto fora de quadro, tracking perdido): hoje simplesmente não geram
  evento, o que é indistinguível de "olhou para outro lugar". Passam a ser marcadas explicitamente
  como ausência de dado, e o backend não as conta como desvio de atenção.
- **Calibração reprovada:** bloqueia o exame, com o erro medido visível ao operador.
- **Deriva de pose detectada:** trecho marcado como suspeito no histórico e aviso ao operador.
- **Olhar ambíguo entre dois alvos:** registrado como `INDETERMINADO`.

## 7. Testes

**Backend** — classificação por proximidade, máquina de histerese e acúmulo de dwell são funções
puras. Jest e CI já existem no repositório.

**Front** — o filtro one-euro é função pura: alimentado com sinal sintético de ruído conhecido,
permite afirmar redução de ruído e limite superior de atraso.

**Empírico** — a régua da seção 4.1, executada pelo Arthur com câmera e rosto reais. É o único teste
que valida o resultado final, e nenhum modelo pode executá-lo.

## 8. Riscos e dívida registrada

| Item | Natureza |
|---|---|
| Compensação de pose não feita | O exame **exige** paciente parado. O sistema passa a dizer isso em voz alta em vez de esconder. |
| Objetivo (2) fora de alcance | Classificação por proximidade precisa de alvos separados. Alvos vizinhos exigem o caminho de compensação de pose. |
| Landmarks podem não estar acessíveis | Plano B na seção 4.7. |
| Parâmetros do filtro e limiares | Valores iniciais definidos; os finais saem da medição. |
| Base é a branch 17, não mergeada | Se a 17 mudar ou for rejeitada, este trabalho herda a consequência. |
| `ml/.venv` (381 MB) fora do `.gitignore` | Independente deste trabalho, mas um `git add .` distraído inutiliza o repositório. |
