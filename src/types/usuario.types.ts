export namespace User {
  export type Profile = {
    id: string;
    nome: string;
    telefone: string;
    especialidade: string;
    email: string;
    pacientesIds: string[];
  };

  export namespace UpdateProfile {
    export type Body = {
      nome?: string;
      telefone?: string;
      especialidade?: string;
      email?: string;
    };

    export type Response = {
      data: Profile;
    };
  }

  export namespace GetMyProfile {
    export type Response = {
      data: Profile;
    };
  }
}
