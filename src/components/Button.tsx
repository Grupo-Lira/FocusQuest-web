"use client";
interface ButtonProps {
  text: string;
  href: string;
}

export const Button = ({ text, href }: ButtonProps) => {
    return (
      <button
        onClick={() => window.location.href = href}
        className="
        bg-[var(--primary)] text-[var(--white)] font-orbitron text-xl px-[4.25rem] py-2.5 rounded-xl button-glow transition-all duration-300"
      >
        {text}
      </button>
    );
};