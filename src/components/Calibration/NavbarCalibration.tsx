import { SettingsButton } from "../SettingsButton";

type Props = Readonly<{
  setIsModalOpen: (isOpen: boolean) => void;
}>;

const INSTRUCTION_LABEL =
  "PRESSIONE CADA ESTRELA 5 VEZES ENQUANTO OLHA PARA A ESTRELA" as const;

export function NavbarCalibration({ setIsModalOpen }: Props) {
  const onOpenSettings = () => setIsModalOpen(true);

  return (
    <div className="pt-6 flex justify-center">
      <div className="bg-[var(--white)] px-6 py-3 flex w-fit rounded-full gap-40 h-[70px]">
        <div className="flex gap-5 items-center">
          <p className="font-semibold font-orbitron text-[var(--primary)]">
            {INSTRUCTION_LABEL}
          </p>
        </div>
      </div>
      <SettingsButton onClick={onOpenSettings} />
    </div>
  );
}
