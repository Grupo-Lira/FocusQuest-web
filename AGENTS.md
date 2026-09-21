# AGENTS.md

## Escopo

Este repositório contém o frontend do FocusQuest: autenticação, fichas de pacientes,
calibração ocular, três fases do experimento e visualização de métricas. Antes de
alterar fluxos ou estado global, leia [ARCHITECTURE.md](ARCHITECTURE.md). Antes de
alterar WebGazer ou câmera, leia [docs/EYE_TRACKING.md](docs/EYE_TRACKING.md). Antes
de alterar eventos, leia [docs/SOCKET_IO.md](docs/SOCKET_IO.md).

## Stack e inicialização

- Next.js 15.2.4 com App Router, React 19 e TypeScript.
- Tailwind CSS 4 via `@tailwindcss/postcss` e `src/app/globals.css`.
- Socket.IO Client 4 e WebGazer carregado por script externo.
- Node.js 20 é a referência dos Dockerfiles.
- Use `npm ci` e preserve `package-lock.json`; o projeto também contém um
  `yarn.lock`, mas o fluxo Docker usa npm.

## Onde alterar

- `src/app/`: rotas, layout e orquestração das fases.
- `src/components/`: UI compartilhada e componentes de domínio.
- `src/context/`: estado global e integrações com browser APIs.
- `src/hooks/`: conexão Socket.IO e comportamentos auxiliares.
- `src/services/`: chamadas HTTP por meio de `BRequest`.
- `src/constants/` e `src/config/`: conteúdo e configuração visual.
- `public/`: imagens, áudio e arquivos locais do MediaPipe.

## Comandos confirmados

```bash
npm ci
npm run dev
npm run build
npm run start
npm run lint
./node_modules/.bin/tsc --noEmit --incremental false
```

Não há scripts de teste, formatação ou typecheck. O lint e o typecheck têm falhas
preexistentes registradas em [DEVELOPMENT.md](DEVELOPMENT.md).

## Convenções observadas

- Use imports pelo alias `@/` quando atravessar diretórios.
- Componentes usam PascalCase; hooks usam prefixo `use`.
- Preserve as fronteiras de Client Components ao usar estado, contexts,
  `localStorage`, câmera, áudio ou Socket.IO.
- Props normalmente ficam próximas do componente e frequentemente usam
  `readonly`.
- A UI usa Tailwind, CSS global, estilos inline para coordenadas e Framer Motion
  apenas onde já adotado.
- Campos de payload e métricas misturam camelCase e snake_case por contrato; não os
  renomeie sem verificar frontend e backend.

## Regras para alterações

- Não trate o nome de uma pasta ou hook como prova de uso; confirme os consumidores.
- Preserve o fluxo `service -> BRequest -> /api -> rewrite do Next`.
- Não coloque segredos em variáveis `NEXT_PUBLIC_*`.
- Não assuma que `usuarioId` representa o profissional: nas fases ele recebe o ID
  do paciente selecionado.
- Não altere nomes ou payloads Socket.IO sem atualizar todos os emissores,
  listeners e `docs/SOCKET_IO.md`.
- Cada uso de `socket.on` deve ter cleanup simétrico com o mesmo evento e handler.
- O hook Socket.IO atual cria uma conexão por tela; evite conexões ou listeners
  duplicados.
- Estado do `GameContext` vive no layout raiz e pode sobreviver à navegação do App
  Router. Resete explicitamente o que uma fase não pode herdar.
- A fase 3 depende do paciente salvo no `localStorage`; considere também logout e
  troca de paciente ao alterar esse fluxo.
- WebGazer é singleton global. Evite múltiplos `begin`, gaze listeners concorrentes
  e streams de câmera sem cleanup.
- Diferencie `pause()` de `end()` e preserve a calibração ao usar `clearData()`.
- Não presuma que `public/mediapipe` está ativo: não existe consumidor confirmado
  no código atual.
- Não amplie logs de gaze, tokens ou dados pessoais.
- Não misture correções funcionais com reorganização ou reformatação ampla.

## Validação esperada

- Mudança de UI: execute typecheck e lint, separando falhas preexistentes.
- Mudança HTTP: valide sucesso, erro e presença do Bearer token.
- Mudança de fase/Socket.IO: valide conexão, cleanup, timeout, pause e navegação.
- Mudança ocular: valide permissão negada, calibração, navegação, câmera e envio de
  coordenadas em navegador real.
- Mudança de build/ambiente: execute `npm run build` e valide o container aplicável.

Não existe cobertura automatizada; registre no handoff quais fluxos foram validados
manualmente.
