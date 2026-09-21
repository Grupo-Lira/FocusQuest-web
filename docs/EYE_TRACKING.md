# Eye Tracking e WebGazer

Este documento descreve o rastreamento ocular implementado no frontend. A área é
sensível porque combina um singleton global, câmera, dados persistidos no navegador,
navegação entre rotas e envio periódico de coordenadas.

## Componentes envolvidos

| Arquivo | Responsabilidade |
| --- | --- |
| `src/app/layout.tsx` | Carrega o script remoto do WebGazer. |
| `src/context/EyeTrackingContext.tsx` | Controla câmera, WebGazer e último gaze. |
| `src/app/calibration/page.tsx` | Coordena o tutorial e os cliques de calibração. |
| `src/components/Calibration/StarCalibration.tsx` | Renderiza cada ponto de calibração. |
| `src/app/fase/1/GameScreen.tsx` | Inicializa tracking e envia gaze a 1 Hz. |
| `src/app/fase/3/GameScreen.tsx` | Inicializa tracking e envia gaze a 4 Hz. |
| `src/app/services/eyeTracking.ts` | Polling HTTP legado/sem consumidor. |
| `public/mediapipe/face_mesh/` | Cópia local do Face Mesh, sem consumidor confirmado. |

## Carregamento

O layout injeta:

```text
https://webgazer.cs.brown.edu/webgazer.js
```

com `next/script` e estratégia `beforeInteractive`. O provider verifica
`globalThis.webgazer` uma vez, em seu primeiro efeito, e define
`isWebGazerLoaded`.

Não há `onLoad`, retry, timeout ou fallback local. Se o CDN falhar, for bloqueado ou
o objeto global não estiver pronto quando o efeito rodar, o estado pode permanecer
como não carregado durante toda a sessão.

## Configuração atual

Ao iniciar uma sessão nova, o contexto encadeia:

```text
setRegression("ridge")
setTracker("clmtrackr")
saveDataAcrossSessions(true)
showVideo(false)
showFaceOverlay(false)
showFaceFeedbackBox(false)
applyKalmanFilter(true)
setGazeListener(...)
showPredictionPoints(true)
begin()
```

Essa é a configuração do working tree atual. Antes de modificá-la, verifique se há
alterações locais pendentes: tracker e regression afetam diretamente a compatibilidade
com modelos/assets, a calibração e a precisão.

O gaze listener converte cada sample válido em:

```ts
{
  x: number;
  y: number;
  timestamp: Date.now();
}
```

e mantém apenas o último sample no React Context.

## Permissão e câmera

Na primeira chamada a `startTracking`, o contexto executa:

```ts
navigator.mediaDevices.getUserMedia({ video: true })
```

O navegador normalmente exige HTTPS ou `localhost`. Em caso de recusa, o contexto
define o erro `Permissão de câmera negada.` e não inicia o WebGazer.

O `MediaStream` devolvido por `getUserMedia` não é armazenado. Portanto, esse stream
não possui um `track.stop()` explícito no frontend. O WebGazer também administra sua
própria captura. Ao alterar esse fluxo, teste se existe abertura duplicada da câmera
e se todos os tracks são encerrados ao sair do experimento.

## API do contexto

### `startTracking(trackWithMouse, isTutorial)`

Se o contexto está pausado:

1. chama `webgazer.resume()`;
2. remove mouse listeners quando `trackWithMouse` é falso;
3. chama `clearData()` quando `isTutorial` é verdadeiro;
4. atualiza os flags do contexto.

Se ainda não iniciou:

1. opcionalmente chama `clearData()`;
2. configura regression, tracker, visualização e listener;
3. chama `begin()`;
4. remove mouse listeners quando necessário.

### `stopTracking()`

Chama `webgazer.pause()`, marca o contexto como pausado e apaga o último gaze. É
usado no fim da calibração, ao pausar/terminar fases e ao abrir configurações nas
fases com Eye Tracking.

`pause()` permite retomar o modelo e não representa, por si só, garantia de que a
câmera física foi encerrada.

### `fullStopTracking()`

Chama `webgazer.end()` e limpa flags/dados. A função existe, mas não possui consumidor
no código atual. Também não há um cleanup do provider que a execute automaticamente.

## Calibração

A rota `/calibration` apresenta instruções e nove estrelas nas posições:

```text
topo:     esquerda, centro, direita
centro:   esquerda, centro, direita
inferior: esquerda, centro, direita
```

Cada estrela precisa ser clicada cinco vezes, totalizando 45 cliques. O início usa:

```ts
startTracking(true, true)
```

Isso preserva os mouse listeners do WebGazer e chama `clearData()` para iniciar uma
calibração nova. Apesar de `saveDataAcrossSessions(true)`, abrir uma nova calibração
apaga os dados anteriores.

Em cada clique, a página registra localmente:

- coordenadas do clique;
- último gaze disponível;
- timestamp;
- estrela clicada;
- distância euclidiana em pixels, quando existe gaze.

As estatísticas são impressas no console e não são enviadas ao backend nem
persistidas pela aplicação. A persistência útil fica sob responsabilidade interna do
WebGazer.

`StarCalibration` possui uma função `checkGazePosition`, com resolução fixa de
1560x1024, mas nenhum efeito ou callback fornece gaze a ela. No fluxo atual, a
calibração avança pelo clique; o olhar é usado apenas no modelo do WebGazer e no log
comparativo da página.

O array de estrelas é criado no escopo do módulo e seu `totalHits` é mutado. O botão
de reiniciar zera o estado da página, mas não esses contadores. Uma alteração futura
deve considerar esse comportamento para não terminar com uma tela sem estrelas.

## Uso nas fases

### Fase 1

A fase chama `startTracking(false, false)`, removendo os mouse listeners. As caixas
dos cinco alvos são calculadas a partir do centro visual de cada estrela e
normalizadas pelo viewport.

Cada caixa possui tolerância de 0,15 em X e Y:

```ts
{
  id,
  x_min,
  x_max,
  y_min,
  y_max
}
```

O último gaze é lido a cada 1.000 ms. Um sample só é enviado quando difere do último
sample transmitido:

```ts
{
  x,          // normalizado e limitado a [0, 1]
  y,          // normalizado e limitado a [0, 1]
  rawX,       // pixels do WebGazer
  rawY,       // pixels do WebGazer
  timestamp
}
```

O backend decide brilho e conclusão dos alvos. O polling ocular existente em
`Star.tsx` está desativado e não deve ser confundido com o envio real.

### Fase 2

A fase 2 não acessa `EyeTrackingContext`, não inicia WebGazer e não envia gaze. A
interação ocorre por mouse ou controle externo, apesar de o tutorial usar linguagem
de foco visual.

### Fase 3

A fase também usa `startTracking(false, false)`. Ela cria duas caixas, na ordem
estrela e radar, e as envia ao iniciar a fase. As caixas usam a mesma tolerância 0,15.

O gaze é consultado a cada 250 ms e enviado somente quando mudou:

```ts
{
  x,             // normalizado e limitado a [0, 1]
  y,             // normalizado e limitado a [0, 1]
  timestamp,
  larguraTela
}
```

Pause e resume chamam WebGazer e também emitem eventos específicos ao backend.

## Normalização

As fases normalizam assim:

```text
normalizedX = gaze.x / window.innerWidth
normalizedY = gaze.y / window.innerHeight
```

e limitam o resultado a `[0,1]`. Isso pressupõe que as coordenadas devolvidas pelo
WebGazer estão no mesmo sistema do viewport usado para calcular as caixas.

Calibração e componentes antigos ainda contêm comparações em pixels e dimensões
fixas. Não reutilize essas constantes nas fases sem validar zoom, device pixel ratio,
scroll, fullscreen e redimensionamento.

## MediaPipe e assets locais

`public/mediapipe/face_mesh` contém a distribuição `@mediapipe/face_mesh` versão
0.4.1633559619, incluindo WASM e dados empacotados. O código atual não:

- importa `@mediapipe/face_mesh`;
- instancia `FaceMesh`;
- configura `locateFile`;
- referencia `/mediapipe/face_mesh`;
- usa o tracker `TFFacemesh` no working tree.

Assim, não há dependência runtime confirmada desses paths. O arquivo
`face_mesh_solution_simd_wasm_bin.data` está vazio. Antes de remover ou reativar
esses assets, confirme o tracker escolhido e como o script do WebGazer resolve seus
modelos.

## Navegação e cleanup

O provider fica no layout raiz. Navegação client-side pode preservar:

- instância global do WebGazer;
- estado pausado;
- permissão registrada pelo contexto;
- listener configurado;
- dados de calibração do WebGazer.

Os intervalos de emissão das fases possuem cleanup. Entretanto, as telas não chamam
`fullStopTracking()` no unmount e o provider não remove explicitamente o gaze
listener. Hard reloads ocultam parte desse risco porque recriam toda a página.

## Checklist para alterações

- Confirmar que o script carregou antes de iniciar.
- Tratar permissão concedida, negada e revogada.
- Garantir no máximo um `begin()` e um gaze listener ativos.
- Decidir explicitamente entre `pause()`, `resume()` e `end()`.
- Armazenar e encerrar streams abertos diretamente por `getUserMedia`.
- Não chamar `clearData()` fora de uma intenção explícita de recalibrar.
- Verificar se `saveDataAcrossSessions` deve permanecer habilitado.
- Parar intervalos e tracking ao abandonar uma fase.
- Validar navegação via `Link` e hard reload.
- Validar tamanhos de viewport diferentes e redimensionamento.
- Confirmar frequência e payload com o backend antes de alterá-los.
- Não registrar continuamente coordenadas, imagens da câmera ou dados pessoais.
- Testar em navegador real; mocks não cobrem permissão, câmera e precisão.

## Problemas conhecidos

- Ausência de fallback/retry para o CDN.
- Stream explícito de `getUserMedia` sem cleanup.
- `fullStopTracking` sem uso.
- Calibração orientada a clique, com callback visual de gaze desconectado.
- Reinício da calibração não reseta o array global de hits.
- Assets Face Mesh locais sem consumidor.
- Resoluções fixas em código auxiliar.
- Não há testes automatizados para câmera ou gaze.
