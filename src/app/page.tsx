"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { InputPassword } from "@/components/InputPassword";

const SOCIAL_PROVIDERS = [
  { src: "/img/google.svg", alt: "Entrar com Google" },
  { src: "/img/facebook.svg", alt: "Entrar com Facebook" },
  { src: "/img/apple.svg", alt: "Entrar com Apple" },
] as const;

const logInputValue = (event: React.ChangeEvent<HTMLInputElement>) => {
  console.log(event.target.value);
};

const redirectToApresentation = () => {
  globalThis.location.href = "/apresentation";
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
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="bg-[var(--white)] px-[4.5rem] py-12 rounded-4xl flex flex-col gap-4 items-center">
        <p className="text-4xl text-[var(--primary)] font-orbitron">Fazer Login</p>
        <div className="flex flex-col gap-4 items-center">
          <Input type="email" placeholder="Email" name="email" onChange={logInputValue} />
          <InputPassword placeholder="Senha" name="senha" onChange={logInputValue} />
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
        </div>
        <Button text="Login" onClick={redirectToApresentation} />
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
