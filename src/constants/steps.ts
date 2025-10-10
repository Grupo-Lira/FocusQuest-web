type StepProps = {
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