"use client";

interface ButtonProps {
  text: string;
  onClick?: () => void;
}

export const Button = ({ text, onClick }: ButtonProps) => {
    return (
      <button
        onClick={onClick}
        className="
        bg-[var(--primary)] text-[var(--white)] font-orbitron text-xl px-[4.25rem] py-2.5 rounded-xl button-glow transition-all duration-300"
      >
        {text}
      </button>
    );
};