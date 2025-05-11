"use client";

interface ButtonProps {
  text: string;
  onClick?: () => void;
  className?: string;
}

export const Button = ({ text, onClick, className }: ButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={`
        bg-[var(--primary)] text-[var(--white)] font-orbitron text-xl ${
          className ? className : "px-[4.25rem] py-2.5"
        } rounded-xl button-glow transition-all duration-300`}
    >
      {text}
    </button>
  );
};
