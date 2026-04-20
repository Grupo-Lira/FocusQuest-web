"use client";

type Props = {
  text: string;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
};

const DEFAULT_SIZE_CLASS = "px-[4.25rem] py-2.5" as const;
const DISABLED_CLASS = "opacity-50 cursor-not-allowed" as const;

const getDisabledClass = (disabled: boolean | undefined) => {
  if (disabled === true) return DISABLED_CLASS;
  return "";
};

const getSizeClass = (className: string | undefined) => {
  if (className === undefined) return DEFAULT_SIZE_CLASS;
  return className;
};

export const Button = ({ text, onClick, className, disabled }: Props) => {
  const disabledClass = getDisabledClass(disabled);
  const sizeClass = getSizeClass(className);
  const buttonClassName = `bg-[var(--primary)] text-[var(--white)] font-orbitron text-xl ${disabledClass} ${sizeClass} rounded-xl button-glow transition-all duration-300`;

  return (
    <button
      type="button"
      onClick={onClick}
      className={buttonClassName}
      disabled={disabled}
    >
      {text}
    </button>
  );
};
