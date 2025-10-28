"use client";

interface ButtonProps {
  text: string;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

export const Button = ({ text, onClick, className, disabled }: ButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={`
        bg-[var(--primary)] text-[var(--white)] font-orbitron text-xl ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${
          className || "px-[4.25rem] py-2.5"
        } rounded-xl button-glow transition-all duration-300`}
      disabled={disabled}
    >
      {text}
    </button>
  );
};
