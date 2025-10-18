import { Bolt } from "lucide-react";

type NavbarCalibrationProps = {
  setIsModalOpen: (isOpen: boolean) => void;
};

export default function NavbarCalibration({ setIsModalOpen }: NavbarCalibrationProps) {
  return (
    <div className="pt-6 flex justify-center">
      <div className="bg-[var(--white)] px-6 py-3 flex w-fit rounded-full gap-40 h-[70px]">
        <div className="flex gap-5 items-center">
          <p className="font-semibold font-orbitron text-[var(--primary)]">
            PRESSIONE CADA ESTRELA 5 VEZES ENQUANTO OLHA PARA A ESTRELA
          </p>
        </div>
      </div>
      <div
        className="bg-[var(--primary)] z-20 w-11 h-11 rounded-full absolute flex items-center justify-center button-glow transition-all duration-300 top-9 right-9"
        onClick={() => {
          setIsModalOpen(true);
        }}
      >
        <Bolt color="white" />
      </div>
    </div>
  );
}
