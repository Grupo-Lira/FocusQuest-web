"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { InputPassword } from "@/components/InputPassword";
import { login, register } from "@/services/authService";
import { saveAuthToken } from "@/utils/authStorage";

const SOCIAL_PROVIDERS = [
  { src: "/img/google.svg", alt: "Entrar com Google" },
  { src: "/img/facebook.svg", alt: "Entrar com Facebook" },
  { src: "/img/apple.svg", alt: "Entrar com Apple" },
] as const;

const AFTER_REGISTER_PATH = "/apresentation" as const;
const MIN_PASSWORD_LENGTH = 6;

type FormState = {
  email: string;
  senha: string;
  confirmarSenha: string;
};

const INITIAL_FORM_STATE: FormState = { email: "", senha: "", confirmarSenha: "" };

const validateForm = (form: FormState) => {
  if (form.email.length === 0) return "Informe um e-mail.";
  if (form.senha.length < MIN_PASSWORD_LENGTH) {
    return `A senha deve ter ao menos ${MIN_PASSWORD_LENGTH} caracteres.`;
  }
  if (form.senha !== form.confirmarSenha) return "As senhas não coincidem.";
  return null;
};

const redirectAfterRegister = () => {
  globalThis.location.href = AFTER_REGISTER_PATH;
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

export default function SignInPage() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM_STATE);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const onChangeField = (field: keyof FormState) => {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: event.target.value }));
    };
  };

  const onSubmit = async () => {
    const validationError = validateForm(form);
    if (validationError !== null) {
      setErrorMessage(validationError);
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);

    const credentials = { email: form.email, senha: form.senha };
    const registerResult = await register(credentials);

    if (registerResult.error !== null) {
      setIsLoading(false);
      setErrorMessage(registerResult.error);
      return;
    }

    const loginResult = await login(credentials);
    setIsLoading(false);

    if (loginResult.error !== null || loginResult.data === null) {
      setErrorMessage(loginResult.error ?? "Falha ao autenticar após cadastro.");
      return;
    }

    saveAuthToken(loginResult.data.token);
    redirectAfterRegister();
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="bg-[var(--white)] px-[4.5rem] py-12 rounded-4xl flex flex-col gap-4 items-center">
        <p className="text-4xl text-[var(--primary)] font-orbitron">Criar Conta</p>
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
          <InputPassword
            placeholder="Confirmar Senha"
            name="confirmarSenha"
            value={form.confirmarSenha}
            onChange={onChangeField("confirmarSenha")}
          />
          <div className="flex flex-col items-center">
            <p>
              Já possui uma conta?{" "}
              <Link className="text-[var(--primary)] font-bold" href="/">
                Login
              </Link>
            </p>
          </div>
          {errorMessage === null ? null : (
            <p className="text-red-600 font-semibold text-sm">{errorMessage}</p>
          )}
        </div>
        <Button text="Cadastrar" onClick={onSubmit} isLoading={isLoading} />
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
