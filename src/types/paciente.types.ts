export type DadoComparativo = {
  idade: number;
  mediaAcertos: number;
};

export type Metricas = {
  tempoReacao?: string;
  variabilidadeTemporalRespostas?: string;
  acertos?: number;
  errosOmissao?: number;
  errosComissao?: number;
  observacoes?: string;
  dadosComparativos?: DadoComparativo[];
};

export namespace Paciente {
  export type Profile = {
    id: string;
    nome: string;
    rg?: string;
    dataNascimento?: string;
    dataAvaliacao?: string;
    sexo?: "M" | "F";
    escolaridade?: string;
    motivoAvaliacao?: string;
    observacoes?: string;
    criado_em?: string;
    metrica_final?: string;
    metricas?: Metricas;
  };

  export type Record = {
    id: Paciente.Profile["id"];
    nome: Paciente.Profile["nome"];
    dataNascimento: Paciente.Profile["dataNascimento"];
    escolaridade: Paciente.Profile["escolaridade"];
    metrica_final: Paciente.Profile["metrica_final"];
  };

  export namespace CreatePaciente {
    export type Body = {
      nome: Paciente.Profile['nome'];
      rg: Paciente.Profile['rg'];
      dataNascimento?: Paciente.Profile['dataNascimento'];
      dataAvaliacao?: Paciente.Profile['dataAvaliacao'];
      sexo?: Paciente.Profile['sexo'];
      escolaridade?: Paciente.Profile['escolaridade'];
      motivoAvaliacao?: Paciente.Profile['motivoAvaliacao'];
    };

    export type Response = {
      data: Profile;
    };
  }

  export namespace ListPacientes {
    export type Response = {
      data: Profile[];
    };
  }

  export namespace GetPaciente {
    export type Response = {
      data: Profile;
    };
  }

  export namespace UpdatePaciente {
    export type Body = Partial<CreatePaciente.Body>;

    export type Response = {
      data: Profile;
    };
  }
}
