# Comunicação Socket.IO

Este documento registra somente eventos e payloads observáveis no frontend. Campos
que o código não lê são marcados como não determinados. A semântica completa deve
ser confirmada com a implementação do backend antes de mudar contratos.

## Conexão

`src/hooks/useWebSocket.ts` cria a conexão com `socket.io-client` quando a tela de
fase é montada. Cada uso do hook cria uma instância própria; não existe provider ou
singleton de Socket.IO.

A URL é derivada de `NEXT_PUBLIC_API_URL`, removendo um eventual sufixo `/api` e
barras finais. Quando a variável não existe, o código usa seu fallback público.

Configuração:

```ts
{
  transports: ["websocket"],
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5,
  auth: {
    id: "ID DO USUARIO",
    email: "EMAIL"
  }
}
```

O bloco `auth` contém placeholders literais. O JWT salvo no cookie não é enviado no
handshake. IDs incluídos posteriormente nos payloads também vêm do cliente e não
devem ser considerados prova de identidade.

O hook acompanha `connect`, `connect_error` e `disconnect`. No unmount, chama
`socketInstance.disconnect()`.

## Convenções de payload

- `usuarioId` recebe, na implementação atual, o ID do paciente selecionado.
- Coordenadas de gaze transmitidas em `x` e `y` são normalizadas para `[0,1]`.
- Métricas usam campos snake_case, mas o contrato varia por fase.
- Ausência de tipo explícito significa que somente os campos acessados pelo frontend
  estão documentados.

## Fase 1

Origem: `src/app/fase/1/GameScreen.tsx` e `src/hooks/usePhaseOneGaze.ts`.

### Frontend -> Backend

| Evento                  | Payload conhecido                              | Finalidade                                            |
| ----------------------- | ---------------------------------------------- | ----------------------------------------------------- |
| `iniciar_fase1`         | `{ fase1: TargetConfig[], usuarioId: string }` | Inicia a fase com paciente e caixas dos cinco alvos.  |
| `gaze_data_fase1`       | `{ x, y, rawX, rawY, timestamp }`              | Envia novo sample de gaze, no máximo a cada 1.000 ms. |
| `fase_1_tempo_excedido` | Sem payload                                    | Informa que o timer local chegou a zero.              |

`TargetConfig`:

```ts
{
  id: number;
  x_min: number;
  x_max: number;
  y_min: number;
  y_max: number;
}
```

As coordenadas são números normalizados. As cinco caixas representam quatro regiões
de canto e uma central; só a caixa ativa é desenhada e avaliada. A geometria visual
usa exatamente a configuração transmitida. O envio ocular mantém 1 Hz, descarta
samples duplicados/antigos/inválidos e para quando a fase não está em execução,
está pausada, sem conexão ou sem tracking.

### Backend -> Frontend

| Evento                  | Campos utilizados              | Efeito no frontend                                |
| ----------------------- | ------------------------------ | ------------------------------------------------- |
| `fase1_iniciada`        | `data.alvo`                    | Acende o alvo informado.                          |
| `brilhar_estrela`       | `data.alvo`                    | Acende o alvo informado.                          |
| `fase1_foco_status`     | `data.status` | Ativa ou remove o realce do quadrante conforme o backend. |
| `alvo_fase1_concluido`  | `data.alvo`, `data.motivo_termino` | Conquista a estrela somente com motivo `FOCOU`. |
| `fase_concluida`        | `data.metricas`, `data.motivo` | Pausa tracking e abre resultado quando aplicável. |

Inspeção do backend local confirmou que `alvo` normalmente tem o formato
`TargetConfig`, mas na conclusão pode ser o índice numérico. `motivo_termino` é
`FOCOU` ou `TEMPO`. `fase_concluida` inclui `fase: 1` e `metricas`, sem `motivo` no
caminho atual; o frontend guarda explicitamente o timeout local para distinguir os
resultados. Eventos com `fase` diferente de 1 são ignorados.

O backend local não emite `gaze_status` nem `experimento_concluido` na fase 1. Os
listeners antigos de diagnóstico foram removidos. `FOCANDO` ativa o realce do
quadrante; `DESFOCADO` remove o realce imediatamente. A conclusão continua dependendo
de `alvo_fase1_concluido` com motivo `FOCOU`.

Cada caixa retornada pelo backend é a mesma caixa normalizada e avaliada pelo servidor;
o frontend desenha esses limites sem aplicar fallback ou expansão local.

### Cleanup conhecido

Todos os listeners usam handlers com cleanup simétrico por evento e referência.
`disconnect` interrompe uma tentativa ativa, pausa tracking/música e oferece
reinício explícito. A reconexão do transporte não retoma automaticamente um
experimento que o backend já limpou. O contador começa após `fase1_iniciada`; falta
de confirmação por 15 segundos interrompe a preparação e desconecta a tentativa.

## Fase 2

Origem: `src/app/fase/2/GameScreen.tsx`.

### Frontend -> Backend

| Evento                      | Payload conhecido                      | Finalidade                                                   |
| --------------------------- | -------------------------------------- | ------------------------------------------------------------ |
| `iniciar_fase2`             | `{ fase: 2, usuarioId, controleJogo }` | Inicia a fase e informa paciente/controle.                   |
| `click_planeta_selecionado` | `{ planetaId: number }`                | Envia seleção feita pelo mouse.                              |
| `aguardando_iot`            | Sem payload                            | Informa fim do timer e espera respostas do controle externo. |
| `aguardando_mouse`          | Sem payload                            | Informa fim do timer e espera respostas por mouse.           |
| `fase_atual_finalizada`     | Sem payload                            | Solicita o fechamento da fase após a segunda rodada.         |

`controleJogo` assume:

```text
CONTROLE_ARDUINO
CONTROLE_MOUSE
```

Não há no frontend conexão direta com Arduino; essa integração depende do backend
ou de outro sistema não determinado aqui.

### Backend -> Frontend

| Evento                       | Payload conhecido                       | Efeito no frontend                                          |
| ---------------------------- | --------------------------------------- | ----------------------------------------------------------- |
| `resposta_planeta`           | `{ planeta: number, correto: boolean }` | Marca a resposta e habilita continuação após três retornos. |
| `fase_2_rodada_1_finalizada` | Payload não utilizado                   | Fecha o formulário e agenda o início da segunda rodada.     |
| `fase_atual_finalizada`      | Tratado como objeto de métricas         | Preenche a tela de resultados.                              |

O mesmo nome `fase_atual_finalizada` é emitido e recebido. Preserve a distinção de
direção na documentação e nos testes.

### Cleanup

Os três listeners usam handlers nomeados no escopo do efeito e são removidos com o
mesmo evento e referência.

## Fase 3

Origem: `src/app/fase/3/GameScreen.tsx`.

### Frontend -> Backend

| Evento                  | Payload conhecido                                                 | Finalidade                                  |
| ----------------------- | ----------------------------------------------------------------- | ------------------------------------------- |
| `iniciar_fase3`         | `{ usuarioId, alvoInicialNome: "ESTRELA", fase3: BoundingBox[] }` | Inicia a alternância entre estrela e radar. |
| `gaze_data_fase3`       | `{ x, y, timestamp, larguraTela }`                                | Envia novo sample, no máximo a cada 250 ms. |
| `fase_3_pause`          | Sem payload                                                       | Pausa a fase no backend.                    |
| `fase_3_resume`         | Sem payload                                                       | Retoma a fase no backend.                   |
| `fase_3_tempo_excedido` | Sem payload                                                       | Informa que o timer local chegou a zero.    |

`BoundingBox`:

```ts
{
  x_min: number;
  x_max: number;
  y_min: number;
  y_max: number;
}
```

O array `fase3` é criado na ordem estrela, radar. O payload não inclui um nome por
caixa; a associação por ordem é uma inferência do frontend e deve ser confirmada no
backend antes de mudar.

### Backend -> Frontend

| Evento               | Campos utilizados                                          | Efeito no frontend                                                                    |
| -------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `brilhar_alvo_fase3` | `data.alvo`                                                | Mostra radar quando o valor, em maiúsculas, é `RADAR`; caso contrário mostra estrela. |
| `fase_concluida`     | `metricas`, `motivo`, `avaliacao_final`, `avaliacao_score` | Pausa tracking e exibe métricas/avaliação.                                            |

Outros valores possíveis de `alvo` e campos adicionais da conclusão não são
determinados pelo frontend.

### Cleanup

`brilhar_alvo_fase3` usa um handler nomeado e cleanup simétrico. `fase_concluida`
usa callback anônimo e `off("fase_concluida")`, que remove listeners do evento na
instância dessa tela.

## Lifecycle e estado

O Socket.IO não é compartilhado entre fases. Uma navegação normal desmonta o hook,
desconecta a instância e limpa os intervalos de envio de gaze. Ainda assim:

- efeitos devem tolerar `socket === null` e desconexões;
- iniciar o jogo antes de conectar pode atualizar o estado local sem emitir o evento
  inicial;
- não há fila ou retry explícito dos eventos de início;
- a fase 1 envia configuração apenas quando já está conectada;
- a fase 2 usa optional chaining e pode não emitir se ainda não conectou;
- a fase 3 também depende de conexão ativa para enviar configuração.

O timer principal é local. Quando chega a zero, o frontend emite um evento e altera
sua UI sem aguardar confirmação. O backend também mantém estado suficiente para
acender alvos, validar respostas e produzir métricas.

## Checklist para alterações

- Confirmar o contrato no backend antes de renomear evento ou campo.
- Manter tabela de direção, origem, consumidor e payload atualizada.
- Usar handlers nomeados e `off` simétrico.
- Evitar `on` duplicado após rerender ou reconexão.
- Decidir o comportamento quando o botão iniciar é usado antes de `connect`.
- Validar reconexão durante uma fase em andamento.
- Validar timeout e conclusão concorrentes.
- Sincronizar pause local e backend onde necessário.
- Não usar IDs enviados pelo cliente como autenticação.
- Não incluir token, gaze bruto ou dados pessoais em logs novos.
- Testar cada tipo de controle da fase 2 separadamente.
