"use client";

type Props = {
  text: string;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  isLoading?: boolean;
  type?: "button" | "submit" | "reset";
  variant?: "primary" | "gray";
  form?: string;
};

const DEFAULT_SIZE_CLASS = "px-[4.25rem] py-2.5" as const;
const DISABLED_CLASS = "opacity-50 cursor-not-allowed" as const;
const LOADING_LABEL = "Carregando..." as const;

const getVariantClass = (variant: "primary" | "gray") => {
  if (variant === "gray") {
    return "bg-gray-200 text-gray-700 hover:bg-gray-300";
  }
  return "bg-[var(--primary)] text-[var(--white)] button-glow";
};

const getDisabledClass = (isDisabled: boolean) => {
  if (isDisabled === true) return DISABLED_CLASS;
  return "";
};

const getSizeClass = (className: string | undefined) => {
  if (className === undefined) return DEFAULT_SIZE_CLASS;
  return className;
};

const getButtonLabel = (text: string, isLoading: boolean) => {
  if (isLoading === true) return LOADING_LABEL;
  return text;
};

export const Button = ({
  text,
  onClick,
  className,
  disabled,
  isLoading = false,
  type = "button",
  variant = "primary",
  form,
}: Props) => {
  const isDisabled = disabled === true || isLoading === true;
  const disabledClass = getDisabledClass(isDisabled);
  const sizeClass = getSizeClass(className);
  const variantClass = getVariantClass(variant);
  const buttonClassName = `font-orbitron ${disabledClass} ${sizeClass} rounded-xl transition-all duration-300 ${variantClass}`;
  const label = getButtonLabel(text, isLoading);

  return (
    <button
      type={type}
      onClick={onClick}
      className={buttonClassName}
      disabled={isDisabled}
      form={form}
    >
      {label}
    </button>
  );
};
