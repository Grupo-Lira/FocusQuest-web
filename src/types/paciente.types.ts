export namespace Paciente {
  export type Profile = {
    nome: string;
    dataNascimento?: string;
    sexo?: "M" | "F";
    escolaridade?: string;
    observacoes?: string;
    criadoEm?: string;
  };

  export namespace CreatePaciente {
    export type Body = {
      nome: string;
      data_nascimento?: string;
      sexo?: "M" | "F";
      escolaridade?: string;
      observacoes?: string;
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
