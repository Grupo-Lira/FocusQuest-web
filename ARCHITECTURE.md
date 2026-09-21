# Arquitetura do frontend

Este documento descreve a implementação observada no código. Ele não representa
necessariamente o comportamento pretendido pelo produto. Contratos detalhados de
WebGazer e Socket.IO ficam, respectivamente, em
[docs/EYE_TRACKING.md](docs/EYE_TRACKING.md) e
[docs/SOCKET_IO.md](docs/SOCKET_IO.md).

## Visão geral

O FocusQuest usa Next.js 15 com App Router. O layout raiz instala providers React que
permanecem ativos durante navegações client-side. As telas de autenticação e fichas
consomem a API REST; cada tela de fase abre sua própria conexão Socket.IO. O
WebGazer é um singleton global carregado antes da hidratação e compartilhado pelo
`EyeTrackingContext`.

```text
Browser
├─ App Router
│  ├─ páginas e componentes
│  └─ middleware de presença do cookie
├─ providers no layout raiz
│  ├─ ToastContext
│  ├─ EyeTrackingContext -> WebGazer/câmera
│  ├─ GameContext -> fase, timer e placar local
│  ├─ PatientContext -> localStorage
│  └─ AudioContext -> HTMLAudioElement
├─ HTTP -> /api -> rewrite do Next -> backend
└─ Socket.IO -> backend -> estado e métricas das fases
```

## App Router e layouts

Existe apenas `src/app/layout.tsx`. Ele:

- configura Orbitron e Poppins com `next/font/google`;
- adiciona `<base href="/">`;
- carrega WebGazer de `https://webgazer.cs.brown.edu/webgazer.js` com
  `beforeInteractive`;
- registra todos os providers globais;
- importa `globals.css`.

Não existem layouts aninhados, Route Handlers, Server Actions, arquivos `loading`,
`error` ou `not-found` próprios.

Páginas interativas usam `"use client"`. As rotas das três fases possuem um
`page.tsx` mínimo, que funciona como Server Component e renderiza o `GameScreen`
cliente.

## Rotas

| Rota | Responsabilidade | HTTP | Socket.IO / Eye Tracking |
| --- | --- | --- | --- |
| `/` | Login | `POST /auth/login` | Não |
| `/signin` | Cadastro seguido de login | `POST /auth/register`, `POST /auth/login` | Não |
| `/apresentation` | Apresentação e configurações iniciais | Não | Não |
| `/menu` | Seleção de fase e navegação | Perfil pela navbar | Não |
| `/calibration` | Calibração por nove estrelas | Não | WebGazer local; não envia ao backend |
| `/fase/1` | Cinco alvos com gaze | Lista pacientes | Socket.IO e WebGazer |
| `/fase/2` | Memória visual em duas rodadas | Lista pacientes | Socket.IO; sem WebGazer |
| `/fase/3` | Atenção alternada estrela/radar | Não | Socket.IO e WebGazer |
| `/fichas` | Lista e ações de pacientes | Lista, exclusão, PDF | Não |
| `/fichas/criar` | Criação de paciente | Criação | Não |
| `/fichas/editar/[id]` | Edição, métricas e exclusão | Consulta, edição, exclusão | Não |
| `/settings` | Controles de áudio | Perfil pela navbar | Não |

`src/middleware.ts` libera apenas `/` e `/signin`. Nas demais rotas, verifica a
presença do cookie `focusquest.authToken` e redireciona para `/` se estiver ausente.
O middleware não valida o JWT. Recursos sob `/img` são excluídos do matcher, mas
`/audio` e `/mediapipe` não são excluídos explicitamente.

## Fluxo de navegação

Cadastro e login terminam em `/apresentation`; a apresentação encaminha para
`/menu`. A partir do menu, calibração, fichas e qualquer fase podem ser acessadas.

O campo `disabled` dos níveis 2 e 3 existe na configuração do menu, mas o componente
renderiza todos os níveis como habilitados. Também não há estado que registre uma
calibração concluída. Logo, a ordem das fases é sugerida pela UI, não imposta pelo
roteamento.

Após as telas de resultado:

- fase 1 encaminha à fase 2;
- fase 2 encaminha à fase 3;
- fase 3 atualmente renderiza `SuccessScreen` com `fase={1}` e, por isso, oferece
  navegação de volta à fase 1. Esse comportamento deve ser tratado como problema
  conhecido, não como contrato desejado.

## Providers e estado

### Ordem

```text
ToastProvider
└─ EyeTrackingProvider
   └─ GameProvider
      └─ PatientProvider
         └─ AudioProvider
```

### GameContext

Mantém `phase`, `hits`, `errors`, `timeLeft`, `isPaused`, `isGameActive` e
`audioGameStarted`. Os tempos locais são 60, 15 e 30 segundos para as fases 1, 2 e
3. O contador para quando a fase está inativa, pausada ou chega a zero.

Como o provider pertence ao layout raiz, seus valores podem sobreviver a uma
navegação com `Link`. Somente as fases 2 e 3 definem explicitamente `phase`; contagem,
placar e flags não possuem um reset central entre rotas.

### PatientContext

Persiste `selectedPacienteId` em `localStorage`. As fases 1 e 2 apresentam um modal
e atualizam esse valor. A fase 3 exige um valor existente e redireciona para fichas
caso ele esteja vazio. O paciente não é limpo automaticamente no logout.

### AudioContext

Cria um `HTMLAudioElement` com `/audio/fase{phase}.mp3`, em loop. A referência é
substituída quando a fase muda e destruída no cleanup do efeito. O contexto mantém o
volume da música e oferece play/pause. O segundo slider de `SettingsModal` é apenas
estado local e não está conectado a um elemento de áudio.

### ToastContext

Mantém uma lista de mensagens de sucesso/erro e renderiza `Toast` ao final da árvore.
Cada toast agenda sua própria remoção.

### EyeTrackingContext

Mantém disponibilidade, tracking, pause, erro de câmera e último gaze. Ele integra
browser APIs e WebGazer, mas não se comunica diretamente com o backend. As páginas
das fases fazem o envio Socket.IO. Consulte [docs/EYE_TRACKING.md](docs/EYE_TRACKING.md).

## Estado compartilhado com o backend

O estado de uma fase não possui uma única fonte de verdade:

| Estado | Frontend | Backend observado pelo frontend |
| --- | --- | --- |
| Paciente | `PatientContext` e `localStorage` | Recebe `usuarioId` ao iniciar a fase |
| Timer | `GameContext.timeLeft` | Recebe eventos de tempo excedido e produz conclusão |
| Alvo ativo | Estado local de brilho | Envia eventos que acendem/concluem alvos |
| Pause | `GameContext.isPaused` | Só a fase 3 recebe eventos explícitos de pause/resume |
| Métricas | Exibição local | Calculadas e devolvidas em eventos de conclusão |
| Planetas da fase 2 | Agendamento visual local | Avalia respostas e controla fechamento da rodada |

Mudanças nessas áreas devem considerar dessincronização. Nas fases 1 e 2, abrir
configurações pausa o contador/animação local sem um evento equivalente confirmado
para o backend.

## HTTP

`src/services/BRequest.ts` centraliza as requisições. Ele:

- usa a base relativa `/api`;
- inclui cookies com `credentials: "include"`;
- lê `focusquest.authToken` de `document.cookie`;
- adiciona `Authorization: Bearer ...` quando o token existe;
- serializa corpos como JSON;
- devolve JSON ou texto conforme `Content-Type`;
- para downloads, devolve um `Blob`;
- transforma respostas não OK preferencialmente a partir de `{ error }`.

`next.config.ts` reescreve `/api/:path*` para `BACKEND_INTERNAL_URL`, ou para
`NEXT_PUBLIC_API_URL` quando a URL interna não está definida.

Services existentes:

- `auth.service.ts`: login, registro e logout;
- `usuario.service.ts`: consulta e edição do perfil;
- `paciente.service.ts`: CRUD de pacientes;
- `relatorio.service.ts`: download de PDF.

`src/app/services/eyeTracking.ts` faz polling direto de `/eyetracking`, mas não tem
consumidor. Não o trate como caminho ativo sem confirmar uma nova integração.

## Fases

### Fase 1

`GameScreen` seleciona o paciente, inicia o WebGazer, calcula caixas normalizadas
para cinco estrelas e emite `iniciar_fase1`. Depois envia apenas novos samples de
gaze, no máximo uma vez por segundo. O backend informa qual estrela deve brilhar e
quando um alvo foi concluído.

O componente `Star` contém um polling ocular local desativado e renderiza apenas um
`FixedStar`. Por isso, não se deve presumir que seu `useStarBehavior` seja a fonte
atual de conclusão dos alvos.

### Fase 2

A tela seleciona paciente e controle (`CONTROLE_MOUSE` ou `CONTROLE_ARDUINO`). Cada
rodada dura 15 segundos. `usePlanets` agenda três planetas aos 4, 8 e 12 segundos,
enquanto as estrelas brilham aleatoriamente como estímulo visual. Depois, o frontend
solicita três respostas, que são validadas pelo backend. A fase não inicializa nem
envia dados do WebGazer.

### Fase 3

A tela calcula caixas para uma estrela e um radar, inicia o WebGazer e envia novos
samples a cada 250 ms. O backend alterna o alvo por `brilhar_alvo_fase3`. Pause e
resume são enviados ao backend e também pausam/retomam o WebGazer.

## Componentes e estilo

Componentes de formulário, cards, navegação, modais, feedback e resultados ficam na
raiz de `src/components`. `Calibration/` e `fase2/` concentram componentes exclusivos
desses fluxos. Não há pasta específica para componentes das fases 1 e 3; sua
orquestração fica nos respectivos `GameScreen`.

Tailwind concentra a maior parte do layout. `globals.css` define cores, fundos das
fases, radar, termômetro e animações menores. `AnimatedElements.css` contém keyframes
de distrações. Framer Motion é usado nos planetas da fase 2. Quase todas as imagens
usam `next/image`; `AnimatedElement` usa `<img>` para as animações CSS.

## Contratos e tipos

Há tipos em `src/types`, interfaces de context em `src/interface` e tipos locais nos
componentes. Não existe geração automática a partir do backend. Métricas de
resultado da fase e métricas persistidas do paciente possuem tipos diferentes.

Campos HTTP usam principalmente camelCase, enquanto métricas e eventos também usam
snake_case. Essa mistura reflete contratos existentes e não deve ser normalizada sem
verificação do backend.

## Limitações conhecidas

- Não há infraestrutura de testes automatizados.
- Lint e typecheck falham no estado atual; consulte `DEVELOPMENT.md`.
- O build ignora erros de ESLint e TypeScript.
- Hooks/serviços sem consumidor: `useShiningStars`, `fase/3/useGameLogic` e o polling
  HTTP ocular.
- A busca de pacientes e a paginação visual não filtram/recortam os registros.
- Botões de autenticação social e recuperação de senha não possuem ação funcional.
- Não existe rota de ranking.
- O estado global não tem reset central na troca de fase.
