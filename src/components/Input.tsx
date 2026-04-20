type Props = {
  type: string;
  placeholder: string;
  name: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

const INPUT_CLASS =
  "bg-[var(--input-bg)] rounded-2xl w-96 text-[var(--text)] p-3 focus:outline-none font-semibold" as const;

export const Input = ({ type, placeholder, name, onChange }: Readonly<Props>) => {
  return (
    <input
      type={type}
      placeholder={placeholder}
      onChange={onChange}
      name={name}
      className={INPUT_CLASS}
    />
  );
};
