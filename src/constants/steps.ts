export type StepProps = {
    id: number;
    description: string;
    isFinal?: boolean;
    isTheLast?: boolean;
}

export const steps: StepProps[] = [
  { id: 1, description: "CHEGOU A HORA DE APRENDER A JOGAR!" },
  { id: 2, description: "OLÁ ASTRONAUTA, TEMOS UMA MISSÃO PARA VOCÊ!" },
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
  { id: 2, description: "Uma região da tela vai receber uma estrela." },
  { id: 3, description: "Olhe para a estrela dentro da área destacada." },
  { id: 4, description: "Mantenha o olhar por 5 segundos. Não precisa clicar." },
  { id: 5, description: "A área muda de lugar a cada estrela conquistada." },
  { id: 6, description: "Você terá 1 minuto para completar a missão." },
  { id: 7, description: "Evite olhar para as distrações durante o desafio." },
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
  { id: 5, description: "Você terá 2 rodadas para completar a missão." },
  { id: 6, description: "Cada rodada terá 15 segundos para focar na estrela." },
  { id: 7, description: "Evite olhar para as distrações — elas tiram seus pontos!" },
  {
    id: 8,
    description: "Prepare-se para o desafio, astronauta. Mantenha o foco!",
    isFinal: true,
  },
];

export const fase3Steps: StepProps[] = [
  { id: 1, description: "Excelente progresso, astronauta!" },
  { id: 2, description: "Agora, vamos testar sua atenção alternada." },
  { id: 3, description: "Foque na única estrela como antes." },
  { id: 4, description: "Quando o sinalizador acender, olhe para ele." },
  { id: 5, description: "Quando o sinalizador apagar, volte a focar na estrela." },
  { id: 6, description: "A rodada terá 30 segundos para focar na estrela e no sinalizador." },
  { id: 7, description: "Evite olhar para as distrações — elas tiram seus pontos!" },
  {    id: 8,
    description: "Prepare-se para o desafio final, astronauta. Mantenha o foco!",
    isFinal: true,
  },
];
