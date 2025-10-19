export type StepProps = {
    id: number;
    description: string;
    isFinal?: boolean;
    isTheLast?: boolean;
}

export const steps: StepProps[] = [
  { id: 1, description: "CHEGOU A HORA DE APRENDER A JOGAR!" },
  { id: 2, description: "OLÁ ASTROUNATA, TEMOS UMA MISSÃO PARA VOCÊ!" },
  { id: 3, description: "PRECISAMOS QUE VOCÊ CLIQUE EM CADA UMA DAS ESTRELAS 5 VEZES" },
  {
    id: 4,
    description: "MAS SE LEMBRE DE MANTER O OLHAR NA ESTRELA QUE VOCÊ ESTIVER CLICANDO!",
  },
  { id: 5, description: "TUDO PRONTO? VAMOS NESSA!", isFinal: true },
  { id: 6, description: "VOCÊ ESTA INDO SUPER BEM! AGORA FALTA FOCAR NESSA ULTIMA ESTRELA", isTheLast: true },
];

export const fase1Steps: StepProps[] = [
  { id: 1, description: "Seja bem-vindo ao seu primeiro desafio, astronauta." },
  { id: 2, description: "Prepare-se para testar sua concentração." },
  { id: 3, description: "Na tela, aparecerão cinco estrelas." },
  { id: 4, description: "Fixe os olhos em cada uma delas até sumirem." },
  { id: 5, description: "Você terá 1 minuto para completar a missão." },
  { id: 6, description: "Seja rápido e mantenha o foco." },
  {
    id: 7,
    description: "Evite olhar para as distrações — elas tiram seus pontos!",
  },
  {
    id: 8,
    description: "Boa sorte, astronauta. Que sua visão seja precisa!",
    isFinal: true,
  },
];

export const fase2Steps: StepProps[] = [
  { id: 1, description: "Ótimo trabalho no primeiro desafio!" },
  { id: 2, description: "Agora, vamos aumentar a dificuldade." },
  { id: 3, description: "Desta vez, as estrelas brilharão aleatoriamente." },
  { id: 4, description: "Seu objetivo é focar na estrela que estiver brilhando." },
  { id: 5, description: "Você terá 3 rodadas para completar a missão." },
  { id: 6, description: "Cada rodada terá 10 segundos para focar na estrela." },
  { id: 7, description: "Evite olhar para as distrações — elas tiram seus pontos!" },
  {
    id: 8,
    description: "Prepare-se para o desafio, astronauta. Mantenha o foco!",
    isFinal: true,
  },
];
