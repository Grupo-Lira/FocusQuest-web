# Desenvolvimento

Este guia reúne configuração local, comandos, Docker e limitações das ferramentas.
Para a organização interna, consulte [ARCHITECTURE.md](ARCHITECTURE.md).

## Requisitos

- Node.js 20 recomendado.
- npm compatível com `package-lock.json` lockfile v3.
- Backend FocusQuest acessível por HTTP e WebSocket.
- Navegador moderno; para Eye Tracking, câmera e HTTPS ou `localhost`.

`package.json` não declara `engines`. Node 20 é a referência porque ambos os
Dockerfiles partem de imagens Node 20.

## Gerenciador de pacotes

O repositório contém `package-lock.json` e `yarn.lock`, mas Docker e os comandos
abaixo usam npm. Para uma instalação reproduzível:

```bash
npm ci
```

Não altere os dois lockfiles automaticamente em uma mudança não relacionada. Se a
equipe decidir manter somente um gerenciador, essa decisão deve ser feita em uma
alteração própria.

## Variáveis de ambiente

Comece pelo exemplo:

```bash
cp .env.example .env.local
```

Nunca versione credenciais. Variáveis com prefixo `NEXT_PUBLIC_` são incorporadas ao
bundle do cliente e não podem conter segredos.

### Consumidas pelo código

| Variável | Escopo | Uso |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | Cliente e configuração do Next | Origem pública do backend, URL do Socket.IO e fallback dos rewrites. |
| `BACKEND_INTERNAL_URL` | Servidor Next.js | Destino interno dos rewrites `/api` e `/eyetracking`. |

Quando `BACKEND_INTERNAL_URL` não é informada, `next.config.ts` usa a URL pública.
Quando `NEXT_PUBLIC_API_URL` também não é informada, existe um fallback remoto no
código.

### Declaradas, mas sem consumidor atual

- `SOCKET_URL`
- `NEXT_PUBLIC_WS_URL`
- `NEXT_PUBLIC_ENV`
- `NEXT_PUBLIC_GA_ID`
- `NEXT_PUBLIC_SENTRY_DSN`
- `NEXT_PUBLIC_ENABLE_ANALYTICS`
- `NEXT_PUBLIC_ENABLE_ERROR_TRACKING`
- `NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING`

`SOCKET_URL` aparece nos arquivos locais e no `Dockerfile`, mas o hook Socket.IO usa
`NEXT_PUBLIC_API_URL`. As variáveis de analytics/Sentry do exemplo de produção não
possuem integração correspondente no código.

## Desenvolvimento local

```bash
npm run dev
```

O Next.js usa a porta 3000 por padrão. O tráfego HTTP dos services vai para `/api` na
mesma origem e é encaminhado pelo rewrite do Next. O Socket.IO conecta diretamente à
origem derivada de `NEXT_PUBLIC_API_URL`.

Se as chamadas HTTP funcionarem, mas o Socket.IO não:

1. confirme `NEXT_PUBLIC_API_URL` no momento em que o frontend foi iniciado;
2. confirme suporte a WebSocket no proxy/backend;
3. verifique CORS/origin no backend;
4. observe `connect_error` no console;
5. lembre que o hook força `transports: ["websocket"]` e não usa polling como fallback.

## Build e execução

```bash
npm run build
npm run start
```

`next.config.ts` contém:

```text
eslint.ignoreDuringBuilds = true
typescript.ignoreBuildErrors = true
```

Logo, uma build concluída não comprova que lint e TypeScript estejam corretos. Rode
as verificações separadamente. Erros de parsing ou compilação do módulo ainda podem
impedir a build mesmo com essas flags.

Na validação da nova fase 1, a build encontrou o import duplicado preexistente de
`PatientSelectModal` em `src/app/fase/2/GameScreen.tsx`, que impede o parsing dessa
rota. A rota da fase 1 compilou e foi exercitada separadamente no servidor de
desenvolvimento.

O uso de `next/font/google` pode exigir acesso às fontes durante o processo de build,
dependendo do cache e do comportamento da versão do Next.

## Lint

O script declarado é:

```bash
npm run lint
```

No estado documentado, ele falha antes de analisar o código:

```text
Unexpected identifier 'semi'
```

A causa é o token inválido em `eslint.config.mjs`, no início do objeto `rules`. Isso
é uma falha preexistente; não considere o lint validado até que a configuração seja
corrigida e o comando seja executado novamente.

## TypeScript

Não existe script `typecheck`. Use o binário local sem criar o cache incremental:

```bash
./node_modules/.bin/tsc --noEmit --incremental false
```

Erros conhecidos no estado documentado:

1. `PatientSelectModal` é importado duas vezes em `src/app/fase/2/GameScreen.tsx`.
2. `src/app/fichas/criar/page.tsx` passa props que não existem em `PacienteForm`.
3. `ResultsTable` espera IDs numéricos, mas recebe objetos `{ id: number }` das
   métricas de planetas.

Ao trabalhar em outra área, diferencie essas falhas de novos erros introduzidos.

## Formatação

Existe `.prettierrc.json` e integração sugerida no VS Code, mas não há:

- dependência direta de Prettier em `package.json`;
- script `format` ou `format:check`;
- workflow de formatação confirmado.

A opção `doubleQuote` presente no arquivo não é uma opção padrão conhecida do
Prettier. Não faça reformatação ampla até a configuração ser validada.

## Testes

Não foi identificada infraestrutura de testes automatizados.

Não há script `test`, arquivos de teste ou configuração de Jest, Vitest, React
Testing Library, Playwright ou Cypress. Puppeteer está instalado como dependência,
mas não possui uso ou configuração no repositório.

Até existir uma suíte, registre validações manuais proporcionais à alteração:

- autenticação: cadastro, login, proteção de rota e logout;
- HTTP: sucesso, erro e expiração/rejeição do token;
- pacientes: CRUD, métricas e download do PDF;
- WebGazer: permissão, calibração, pause/resume e saída da rota;
- fase 1: início, gaze, timeout e conclusão de alvos;
- fase 2: duas rodadas e ambos os controles;
- fase 3: alternância, pause/resume, timeout e resultado;
- navegação: `Link`, hard reload e retorno ao menu.

### Validação da nova dinâmica da fase 1

Foi realizada uma verificação pontual em Chromium/Puppeteer com WebGazer, câmera,
paciente e servidor Socket.IO simulados localmente, sem bancos ou produção:

- caixas visuais iguais às transmitidas em 1366×768, 768×1024 e 390×844;
- detecção de olhar dentro/fora, descarte de samples antigos e emissão em 1 Hz;
- pausa/retomada do contador e envio, sem limpar a calibração;
- carga limitada a 95% até o evento de conclusão real;
- cinco conquistas, duplicação de eventos e transição para resultado;
- câmera negada sem início do experimento;
- desconexão sem retomada de experimento antigo;
- timeout emitido uma vez e motivo `TEMPO` sem contar conquista.
- três trajetórias de visitantes, congelamento durante a pausa e movimento reduzido.

Essa verificação não equivale a uma suíte permanente nem valida precisão ocular.
Antes de utilizar com participantes, testar câmera real após calibração, regiões de
canto/centro, conforto das distrações e navegação. Comparações com resultados de
versões anteriores devem considerar que a área aceita de foco foi ampliada.
O dwell do backend durante pausas/lacunas tem a limitação descrita em
[docs/EYE_TRACKING.md](docs/EYE_TRACKING.md).

## Docker

### `Dockerfile`

- Imagem `node:20-alpine`.
- Build multi-stage.
- Instala com `npm ci`.
- Executa `npm prune --omit=dev` antes do runtime.
- Expõe a porta 3000.
- Possui healthcheck HTTP.
- Aceita `NEXT_PUBLIC_API_URL`, `SOCKET_URL` e `BACKEND_INTERNAL_URL` como args.

`SOCKET_URL` não é consumida pelo código atual.

### `Dockerfile.local`

- Imagem `node:20-bookworm-slim`.
- Build multi-stage.
- Reinstala dependências de produção no runner.
- Define `NODE_ENV`, `PORT` e `HOSTNAME`.
- Aceita `NEXT_PUBLIC_API_URL` e `BACKEND_INTERNAL_URL` no build.

Valores `NEXT_PUBLIC_*` usados pelo cliente são definidos no build do Next. Alterar
somente a variável do container em runtime pode não alterar o bundle já gerado.

Não existe Docker Compose neste repositório. A composição com backend, MongoDB e
Redis pertence a um ambiente externo/monorepo e deve ser validada separadamente.

## Deploy

`.gcloudignore` indica uso previsto com Google Cloud, e o README anterior mencionava
Cloud Run. Porém, não existem `cloudbuild.yaml`, manifesto de serviço, configuração
Terraform ou script de deploy neste repositório. O procedimento e a URL ativos não
podem ser determinados apenas pelo código local.

Não execute deploy como parte de uma alteração comum sem instrução explícita.

## Assets e build estático

- Imagens ficam em `public/img` e usam paths absolutos `/img/...`.
- Áudios ficam em `public/audio` e são escolhidos pelo número da fase.
- Face Mesh fica em `public/mediapipe/face_mesh`, mas não possui consumidor atual.
- `AnimatedElement` usa `<img>`; os demais componentes usam majoritariamente
  `next/image`.
- Orbitron e Poppins são configuradas por `next/font/google`.

O middleware exclui `/img` do controle de cookie, mas não exclui `/audio` e
`/mediapipe` explicitamente.

## Checklist antes de entregar uma mudança

1. Confira `git diff` e preserve mudanças preexistentes do usuário.
2. Execute o typecheck e identifique falhas novas versus conhecidas.
3. Execute o lint quando a configuração estiver funcional.
4. Para código executável, rode `npm run build` quando seguro.
5. Valide manualmente o fluxo alterado.
6. Para Socket.IO, verifique listeners, cleanup e reconexão.
7. Para Eye Tracking, verifique câmera ativa após navegar.
8. Atualize a documentação proprietária do contrato alterado.
9. Não registre `.env`, tokens, gaze contínuo ou dados pessoais.

## Problemas comuns

### WebGazer não carrega

- Verifique bloqueio do CDN, CSP e conectividade.
- O provider só verifica o objeto global uma vez; não há retry automático.
- Consulte [docs/EYE_TRACKING.md](docs/EYE_TRACKING.md).

### Câmera não abre

- Use HTTPS ou `localhost`.
- Verifique permissão do site e disponibilidade de `navigator.mediaDevices`.
- Recarregue após alterar a permissão; o contexto não monitora revogação.

### Fase inicia sem eventos

- Confirme `isConnected` antes de iniciar.
- O frontend não reenvia automaticamente o evento inicial após uma conexão tardia.
- Confira os nomes em [docs/SOCKET_IO.md](docs/SOCKET_IO.md).

### Estado incorreto ao trocar de fase

- `GameContext` vive no layout raiz.
- Navegação client-side pode preservar fase, timer, pause e `audioGameStarted`.
- O paciente também persiste em `localStorage`.
