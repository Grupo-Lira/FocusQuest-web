import { SettingsButton } from "../SettingsButton";

type NavbarCalibrationProps = Readonly<{
  setIsModalOpen: (isOpen: boolean) => void;
}>;

export function NavbarCalibration({ setIsModalOpen }: NavbarCalibrationProps) {
  return (
    <div className="pt-6 flex justify-center">
      <div className="bg-[var(--white)] px-6 py-3 flex w-fit rounded-full gap-40 h-[70px]">
        <div className="flex gap-5 items-center">
          <p className="font-semibold font-orbitron text-[var(--primary)]">
            PRESSIONE CADA ESTRELA 5 VEZES ENQUANTO OLHA PARA A ESTRELA
          </p>
        </div>
      </div>
      <SettingsButton onClick={() => setIsModalOpen(true)} />
    </div>
  );
}
