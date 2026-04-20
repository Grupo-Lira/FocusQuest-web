import { Bolt } from "lucide-react";

type Props = {
  readonly onClick: () => void;
};

export function SettingsButton({ onClick }: Props) {
  return (
    <button
      type="button"
      aria-label="Open settings"
      className="bg-[var(--primary)] z-20 w-11 h-11 rounded-full absolute flex items-center justify-center button-glow transition-all duration-300 top-5 right-5"
      onClick={onClick}
    >
      <Bolt color="white" />
    </button>
  );
}
