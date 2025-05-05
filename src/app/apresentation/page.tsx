import { Button } from "@/components/Button";

export default function ApresentationPage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="bg-[var(--white)] px-[4.5rem] py-12 rounded-4xl flex flex-col gap-4 items-center">
        <p className="text-4xl text-[var(--primary)] font-orbitron">
          Bem-vindo ao FocusQuest!
        </p>
        <div className="max-w-[31.25rem] font-semibold text-[var(--text)] text-center flex flex-col gap-4.5">
          <p>
            Embarque numa missão intergaláctica que vai testar sua atenção, foco e
            precisão.
          </p>
          <p>
            Explore 3 planetas, cada um com desafios progressivos inspirados no <a className="text-[var(--primary)]">Teste de
            Desempenho Contínuo Roosevelt.</a>
          </p>
          <p>
            Use apenas o poder do seu olhar para vencer as distrações e conquistar seu
            lugar no ranking da galáxia!
          </p>
        </div>
        <Button text="Iniciar Jornada" href="/menu"/>
      </div>
    </div>
  );
}
