"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { InputPassword } from "@/components/InputPassword";
import { login } from "@/services/auth.service";
import { saveAuthToken } from "@/utils/authStorage";

const SOCIAL_PROVIDERS = [
  { src: "/img/google.svg", alt: "Entrar com Google" },
  { src: "/img/facebook.svg", alt: "Entrar com Facebook" },
  { src: "/img/apple.svg", alt: "Entrar com Apple" },
] as const;

const AFTER_LOGIN_PATH = "/apresentation" as const;

type FormState = {
  email: string;
  senha: string;
};

const INITIAL_FORM_STATE: FormState = { email: "", senha: "" };

const isFormValid = (form: FormState) => {
  return form.email.length > 0 && form.senha.length > 0;
};

const redirectAfterLogin = () => {
  globalThis.location.href = AFTER_LOGIN_PATH;
};

const SocialLoginButtons = () => {
  const buttons = SOCIAL_PROVIDERS.map((provider) => (
    <button key={provider.src} type="button">
      <Image
        src={provider.src}
        alt={provider.alt}
        width={50}
        height={50}
        className="drop-shadow-lg"
      />
    </button>
  ));

  return <div className="flex gap-10">{buttons}</div>;
};

export default function Home() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM_STATE);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const onChangeField = (field: keyof FormState) => {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: event.target.value }));
    };
  };

  const onSubmit = async () => {
    if (isFormValid(form) === false) {
      setErrorMessage("Informe e-mail e senha.");
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);
    const { data, error } = await login(form);
    setIsLoading(false);

    if (error !== null || data === null) {
      setErrorMessage(error ?? "Falha ao realizar login.");
      return;
    }

    saveAuthToken(data.token);
    redirectAfterLogin();
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="bg-[var(--white)] px-[4.5rem] py-12 rounded-4xl flex flex-col gap-4 items-center">
        <p className="text-4xl text-[var(--primary)] font-orbitron">Fazer Login</p>
        <div className="flex flex-col gap-4 items-center">
          <Input
            type="email"
            placeholder="Email"
            name="email"
            value={form.email}
            onChange={onChangeField("email")}
          />
          <InputPassword
            placeholder="Senha"
            name="senha"
            value={form.senha}
            onChange={onChangeField("senha")}
          />
          <div className="flex flex-col items-center">
            <p>
              Ainda não possui uma conta?{" "}
              <Link className="text-[var(--primary)] font-bold" href="/signin/">
                Crie uma
              </Link>
            </p>
            <button type="button" className="text-[var(--primary)] font-bold">
              Esqueci minha senha
            </button>
          </div>
          {errorMessage === null ? null : (
            <p className="text-red-600 font-semibold text-sm">{errorMessage}</p>
          )}
        </div>
        <Button text="Login" onClick={onSubmit} isLoading={isLoading} />
        <div className="flex items-center justify-center w-full">
          <hr className="flex-grow border-t border-gray-300" />
          <span className="mx-5">ou</span>
          <hr className="flex-grow border-t border-gray-300" />
        </div>
        <SocialLoginButtons />
      </div>
    </div>
  );
}
