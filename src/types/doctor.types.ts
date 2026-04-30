export namespace Doctor {
  export type Profile = {
    nome: string;
    telefone: string;
    especialidade: string;
    email?: string;
  };

  export namespace CreateProfile {
    export type Body = {
      nome: Doctor.Profile['nome'];
      telefone: Doctor.Profile['telefone'];
      especialidade: Doctor.Profile['especialidade'];
    };

    export type Response = {
      data: Profile;
    };
  }

  export namespace UpdateProfile {
    export type Body = Partial<Profile>;

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
