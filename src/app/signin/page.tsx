"use client";

import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { InputPassword } from "@/components/InputPassword";
import Image from "next/image";
import Link from "next/link";

export default function SignInPage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="bg-[var(--white)] px-[4.5rem] py-12 rounded-4xl flex flex-col gap-4 items-center">
        <p className="text-4xl text-[var(--primary)] font-orbitron">Criar Conta</p>
        <div className="flex flex-col gap-4 items-center">
          <Input
            type="email"
            placeholder="Email"
            name="email"
            onChange={(e) => console.log(e.target.value)}
          />
          <InputPassword
            placeholder="Senha"
            name="senha"
            onChange={(e) => console.log(e.target.value)}
          />
          <InputPassword
            placeholder="Confirmar Senha"
            name="senha"
            onChange={(e) => console.log(e.target.value)}
          />
          <div className="flex flex-col items-center">
            <p>
              Já possui uma conta?{" "}
              <Link className="text-[var(--primary)] font-bold" href="/">
                Login
              </Link>
            </p>
          </div>
        </div>
        <Button text="Cadastrar" onClick={() => (window.location.href = "/")} />
        <div className="flex items-center justify-center w-full">
          <hr className="flex-grow border-t border-gray-300" />
          <span className="mx-5">ou</span>
          <hr className="flex-grow border-t border-gray-300" />
        </div>
        <div className="flex gap-10">
          <button>
            <Image
              src="/img/google.svg"
              alt="Entrar com Google"
              width={50}
              height={50}
              className="drop-shadow-lg"
            />
          </button>
          <button>
            <Image
              src="/img/facebook.svg"
              alt="Entrar com Facebook"
              width={50}
              height={50}
              className="drop-shadow-lg"
            />
          </button>
          <button>
            <Image
              src="/img/apple.svg"
              alt="Entrar com Apple"
              width={50}
              height={50}
              className="drop-shadow-lg"
            />
          </button>
        </div>
      </div>
    </div>
  );
}
