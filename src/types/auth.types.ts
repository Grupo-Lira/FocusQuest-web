export namespace Auth {
  export type Credentials = {
    email: string;
    senha: string;
  };

  export namespace Login {
    export type Body = Credentials;

    export type Response = {
      token: string;
    };
  }

  export namespace Register {
    export type Body = Credentials;
  }
}
