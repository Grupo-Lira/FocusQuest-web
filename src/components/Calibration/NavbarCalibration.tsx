import { SettingsButton } from "../SettingsButton";
import { calibrationTargets } from "@/constants/calibrationStar";

type Props = Readonly<{
  setIsModalOpen: (isOpen: boolean) => void;
  currentTarget?: number;
  totalTargets?: number;
  clicksOnTarget?: number;
  clicksRequired?: number;
}>;

const INSTRUCTION_LABEL = "OLHE PARA A ESTRELA DOURADA E CLIQUE NELA" as const;

export function NavbarCalibration({
  setIsModalOpen,
  currentTarget = 0,
  totalTargets = 9,
  clicksOnTarget = 0,
  clicksRequired = 5,
}: Props) {
  const onOpenSettings = () => setIsModalOpen(true);
  const charges = Array.from({ length: clicksRequired }, (_, index) => index < clicksOnTarget);
  const getMapTargetClass = (targetIndex: number) => {
    if (targetIndex < currentTarget) return "bg-[#76D872] shadow-[0_0_7px_rgba(118,216,114,0.85)]";
    if (targetIndex === currentTarget) return "bg-[#FFB000] shadow-[0_0_8px_rgba(255,176,0,1)]";
    return "bg-[#D9D9D9]";
  };

  return (
    <div className="relative z-20 flex justify-center px-4 pt-6">
      <div className="flex min-h-[70px] w-full max-w-4xl flex-wrap items-center justify-center gap-x-8 gap-y-2 rounded-3xl bg-[var(--white)] px-5 py-3 shadow-lg md:rounded-full md:px-7">
        <div className="flex flex-col items-center gap-1 text-center">
          <p id="calibration-target-instruction" className="font-semibold font-orbitron text-[var(--primary)]">
            {INSTRUCTION_LABEL}
          </p>
          <p className="text-xs font-semibold text-[var(--text)]">
            Região {Math.min(currentTarget + 1, totalTargets)} de {totalTargets}
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-full bg-[#FFF4E6] px-3 py-1.5">
          <span className="text-xs font-bold text-[var(--text)]">
            Energia {clicksOnTarget}/{clicksRequired}
          </span>
          <span className="flex gap-1" aria-label={`${clicksOnTarget} de ${clicksRequired} cargas preenchidas`}>
            {charges.map((isCharged, index) => (
              <span
                key={index}
                aria-hidden="true"
                className={`h-2.5 w-2.5 rounded-full ${
                  isCharged ? "bg-[#FFB000] shadow-[0_0_7px_rgba(255,176,0,0.95)]" : "bg-[#D9D9D9]"
                }`}
              />
            ))}
          </span>
        </div>

        <div
          className="grid grid-cols-3 gap-1 rounded-xl bg-[#07152A] px-2 py-1.5"
          aria-label={`Mapa estelar: ${currentTarget} de ${totalTargets} regiões concluídas`}
        >
          {calibrationTargets.map((target, targetIndex) => (
            <span
              key={target.id}
              aria-hidden="true"
              className={`h-2.5 w-2.5 rounded-full ${getMapTargetClass(targetIndex)}`}
              style={{ gridRow: target.row, gridColumn: target.column }}
            />
          ))}
        </div>
      </div>
      <SettingsButton onClick={onOpenSettings} />
    </div>
  );
}
