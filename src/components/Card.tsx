interface CardProps {
  title: string;
  children?: React.ReactNode;
  buttons?: React.ReactNode;
}

export function Card({ title, children, buttons }: CardProps) {
  return (
    <div className="bg-[var(--white)] px-[4.5rem] py-12 rounded-4xl flex flex-col gap-4 items-center">
      <p className="text-4xl text-[var(--primary)] font-orbitron">{title}</p>
      <div className="flex flex-col gap-4">
        {children}
        {buttons && <div className="flex justify-center">{buttons}</div>}
      </div>
    </div>
  );
}
