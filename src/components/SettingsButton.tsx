import { Bolt } from "lucide-react";
import { useT } from "@/i18n/client";

type Props = {
  readonly onClick: () => void;
};

export function SettingsButton({ onClick }: Props) {
  const t = useT();
  return (
    <button
      type="button"
      aria-label={t("Configurações")}
      className="bg-[var(--primary)] z-20 w-11 h-11 rounded-full absolute flex items-center justify-center button-glow transition-all duration-300 top-5 right-5"
      onClick={onClick}
    >
      <Bolt color="white" />
    </button>
  );
}
