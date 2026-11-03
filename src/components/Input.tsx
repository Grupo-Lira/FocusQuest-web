import { useT } from "@/i18n/client";

type Props = {
  type: string;
  placeholder: string;
  name: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  value?: string;
};

const INPUT_CLASS =
  "bg-[var(--input-bg)] rounded-2xl w-96 text-[var(--text)] p-3 focus:outline-none font-semibold" as const;

export const Input = ({ type, placeholder, name, onChange, value }: Readonly<Props>) => {
  const t = useT();
  return (
    <input
      type={type}
      placeholder={t(placeholder)}
      onChange={onChange}
      name={name}
      value={value}
      className={INPUT_CLASS}
    />
  );
};
